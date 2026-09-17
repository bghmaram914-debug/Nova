import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const MODELE = JSON.parse(
  readFileSync(join(__dirname, '..', '..', 'ml', 'nova_model.json'), 'utf-8')
);

function normaliserObservations(obsInput) {
  if (!obsInput) return {};
  if (!Array.isArray(obsInput)) return obsInput;

  const result = { enseignant: {}, parent: {}, specialiste: {} };

  for (const obs of obsInput) {
    const role = (obs.observateur_role || obs.role || '').toUpperCase();
    let acteur = 'enseignant';
    if (role === 'ENSEIGNANT' || obs.contexte === 'ECOLE') {
      acteur = 'enseignant';
    } else if (role === 'PARENT' || role === 'FAMILLE' || obs.contexte === 'MAISON' || obs.contexte === 'FAMILLE') {
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

function construireFeatures(obsRaw) {
  const observations = normaliserObservations(obsRaw);
  const { domaines, acteurs, feature_cols } = MODELE;
  const valeurs = {};

  for (const acteur of acteurs) {
    for (const domaine of domaines) {
      const v = observations?.[acteur]?.[domaine];
      valeurs[`${acteur}_${domaine}`] = (v === undefined || v === null) ? NaN : v;
    }
  }

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

  return feature_cols.map((col) => (Number.isNaN(valeurs[col]) ? 0 : valeurs[col]));
}

function standardiser(vecteur) {
  const { mean, scale } = MODELE.scaler;
  return vecteur.map((v, i) => (v - mean[i]) / scale[i]);
}

function softmax(scores) {
  const max = Math.max(...scores);
  const exps = scores.map((s) => Math.exp(s - max));
  const somme = exps.reduce((a, b) => a + b, 0);
  return exps.map((e) => e / somme);
}

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
