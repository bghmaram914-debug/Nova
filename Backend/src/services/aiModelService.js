/**
 * NOVA — Modèle IA en JavaScript pur (aucun Python nécessaire)
 * ================================================================
 * Emplacement recommandé : Backend/src/services/aiModelService.js
 *
 * Ce fichier refait EXACTEMENT le même calcul que le modèle Python
 * entraîné (régression logistique multinomiale / softmax), à partir
 * des coefficients exportés dans nova_model.json.
 *
 * Aucune installation supplémentaire : juste ce fichier + le JSON.
 *
 * IMPORTANT — Place dans NOVA :
 *   Ce module est un COMPLÉMENT au moteur de règles (croisementService.js),
 *   jamais un remplacement. Le moteur de règles reste la source de vérité,
 *   intégralement traçable. Ce modèle sert seulement à hiérarchiser les
 *   profils probables, à titre indicatif, à côté du "Pourquoi ?".
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const MODELE = JSON.parse(
  readFileSync(join(__dirname, '..', '..', 'ml', 'nova_model.json'), 'utf-8')
);

/**
 * Normalise un tableau d'observations (format DB/mockDatabase)
 * vers l'objet structuré attendu par le modèle :
 * { enseignant: {domaine: score}, parent: {...}, specialiste: {...} }
 */
function normaliserObservations(obsInput) {
  if (!obsInput) return {};
  if (!Array.isArray(obsInput)) return obsInput;

  const result = { enseignant: {}, parent: {}, specialiste: {} };

  for (const obs of obsInput) {
    const role = (obs.observateur_role || obs.role || '').toUpperCase();
    let acteur = 'enseignant';
    if (role === 'ENSEIGNANT' || obs.contexte === 'ECOLE') {
      acteur = 'enseignant';
    } else if (role === 'PARENT' || obs.contexte === 'MAISON') {
      acteur = 'parent';
    } else if (role === 'SPECIALISTE' || obs.contexte === 'CABINET') {
      acteur = 'specialiste';
    }

    const domaineRaw = (obs.domaine || '').toLowerCase();
    let domaine = domaineRaw;
    if (domaineRaw.includes('attention')) domaine = 'attention';
    else if (domaineRaw.includes('memoire') || domaineRaw.includes('mémoire')) domaine = 'memoire';
    else if (domaineRaw.includes('langage')) domaine = 'langage';
    else if (domaineRaw.includes('motricite') || domaineRaw.includes('motricité')) domaine = 'motricite_fine';
    else if (domaineRaw.includes('social') || domaineRaw.includes('comportement')) domaine = 'social';

    let score = obs.score;
    if (score === undefined || score === null) {
      const freq = Number(obs.frequence_difficulte);
      if (!Number.isNaN(freq)) {
        score = freq <= 1 ? 0 : freq <= 3 ? 1 : 2;
      } else {
        score = 0;
      }
    }

    if (domaine) {
      result[acteur][domaine] = score;
    }
  }

  return result;
}

/**
 * Construit le vecteur de features dans le MÊME ORDRE que l'entraînement.
 * observations attendu : { enseignant: {domaine: score}, parent: {...}, specialiste: {...} }
 * ou un tableau d'observations brutes
 * scores attendus sur l'échelle 0 (Non) - 1 (Parfois) - 2 (Oui)
 */
function construireFeatures(obsRaw) {
  const observations = normaliserObservations(obsRaw);
  const { domaines, acteurs, feature_cols } = MODELE;
  const valeurs = {};

  // Scores bruts par acteur x domaine
  for (const acteur of acteurs) {
    for (const domaine of domaines) {
      const v = observations?.[acteur]?.[domaine];
      valeurs[`${acteur}_${domaine}`] = (v === undefined || v === null) ? NaN : v;
    }
  }

  // Indices de croisement (convergence, divergence, intensité) — identiques
  // à ceux calculés côté entraînement Python
  for (const domaine of domaines) {
    const scores = acteurs
      .map((a) => valeurs[`${a}_${domaine}`])
      .filter((v) => !Number.isNaN(v));

    const scoresValides = scores.length > 0 ? scores : [0];
    valeurs[`convergence_${domaine}`] = scoresValides.filter((v) => v > 1.0).length;
    valeurs[`divergence_${domaine}`] = Math.max(...scoresValides) - Math.min(...scoresValides);
    valeurs[`intensite_${domaine}`] =
      scoresValides.reduce((a, b) => a + b, 0) / scoresValides.length;
  }

  // Imputation simple des valeurs manquantes par 0 (les indices de
  // croisement ci-dessus gèrent déjà l'essentiel de l'information)
  return feature_cols.map((col) => (Number.isNaN(valeurs[col]) ? 0 : valeurs[col]));
}

/** Standardisation identique au StandardScaler de scikit-learn */
function standardiser(vecteur) {
  const { mean, scale } = MODELE.scaler;
  return vecteur.map((v, i) => (v - mean[i]) / scale[i]);
}

/** Softmax numériquement stable */
function softmax(scores) {
  const max = Math.max(...scores);
  const exps = scores.map((s) => Math.exp(s - max));
  const somme = exps.reduce((a, b) => a + b, 0);
  return exps.map((e) => e / somme);
}

/**
 * Calcule les probabilités par profil pour un enfant donné.
 * Reproduit exactement predict_proba() de scikit-learn (LogisticRegression,
 * solver lbfgs, multinomial) — vérifié numériquement contre le modèle Python.
 */
function predireProbabilites(observations) {
  const x = standardiser(construireFeatures(observations));
  const { coef, intercept } = MODELE.logistic_regression;

  const scoresLineaires = coef.map(
    (ligne, classeIdx) =>
      ligne.reduce((somme, poids, i) => somme + poids * x[i], 0) + intercept[classeIdx]
  );
  const probas = softmax(scoresLineaires);

  return MODELE.classes.map((classe, i) => ({
    profil: classe,
    probabilite: Math.round(probas[i] * 1000) / 1000,
  })).sort((a, b) => b.probabilite - a.probabilite);
}

export { predireProbabilites, MODELE };
