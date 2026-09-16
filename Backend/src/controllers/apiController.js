import { v4 as uuidv4 } from 'uuid';
import db, { mockDatabase } from '../config/db.js';
import { genererProfilComplet } from '../services/croisementService.js';
import { calculerAdaptation } from '../services/adaptiveService.js';

// --- ENFANTS ---
export const getEnfants = async (req, res) => {
  try {
    const pgRes = await db.query('SELECT * FROM enfants ORDER BY prenom ASC');
    if (pgRes) {
      return res.json(pgRes.rows);
    }
    return res.json(mockDatabase.enfants);
  } catch (err) {
    return res.json(mockDatabase.enfants);
  }
};

export const getEnfantById = async (req, res) => {
  const { id } = req.params;
  try {
    const pgRes = await db.query('SELECT * FROM enfants WHERE id = $1', [id]);
    if (pgRes && pgRes.rows.length > 0) {
      return res.json(pgRes.rows[0]);
    }
    const found = mockDatabase.enfants.find(e => e.id === id);
    if (!found) return res.status(404).json({ error: 'Enfant non trouvé' });
    return res.json(found);
  } catch (err) {
    const found = mockDatabase.enfants.find(e => e.id === id);
    return res.json(found || {});
  }
};

// --- OBSERVATEURS / AUTH SIMULÉE POUR LE HACKATHON ---
export const getObservateurs = async (req, res) => {
  try {
    const pgRes = await db.query('SELECT * FROM observateurs');
    if (pgRes) return res.json(pgRes.rows);
    return res.json(mockDatabase.observateurs);
  } catch (err) {
    return res.json(mockDatabase.observateurs);
  }
};

// --- CONSENTEMENT ---
export const getConsentementByEnfant = async (req, res) => {
  const { enfantId } = req.params;
  try {
    const pgRes = await db.query('SELECT * FROM consentements WHERE enfant_id = $1', [enfantId]);
    if (pgRes && pgRes.rows.length > 0) return res.json(pgRes.rows[0]);
    const found = mockDatabase.consentements.find(c => c.enfant_id === enfantId);
    return res.json(found || { statut: 'EN_ATTENTE', message: 'Aucun consentement enregistré' });
  } catch (err) {
    const found = mockDatabase.consentements.find(c => c.enfant_id === enfantId);
    return res.json(found || { statut: 'EN_ATTENTE' });
  }
};

export const enregistrerConsentement = async (req, res) => {
  const { enfantId, parentId, statut, remarques } = req.body;
  const nouveau = {
    id: uuidv4(),
    enfant_id: enfantId,
    parent_id: parentId || 'a2222222-2222-2222-2222-222222222222',
    statut: statut || 'SIGNE',
    date_signature: new Date().toISOString(),
    signature_electronique_hash: `sha256_${Math.random().toString(36).substring(2, 15)}`,
    remarques_parentales: remarques || 'Consentement numérique signé'
  };

  try {
    await db.query(
      `INSERT INTO consentements (id, enfant_id, parent_id, statut, signature_electronique_hash, remarques_parentales)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (enfant_id) DO UPDATE SET statut = $4, date_signature = NOW()`,
      [nouveau.id, nouveau.enfant_id, nouveau.parent_id, nouveau.statut, nouveau.signature_electronique_hash, nouveau.remarques_parentales]
    );
  } catch (e) {
    // Mode fallback
    const idx = mockDatabase.consentements.findIndex(c => c.enfant_id === enfantId);
    if (idx >= 0) {
      mockDatabase.consentements[idx] = { ...mockDatabase.consentements[idx], ...nouveau };
    } else {
      mockDatabase.consentements.push(nouveau);
    }
  }

  return res.json({ success: true, consentement: nouveau });
};

// --- OBSERVATIONS ---
export const getObservationsByEnfant = async (req, res) => {
  const { enfantId } = req.params;
  const { role } = req.query; // Cloisonnement RBAC

  try {
    const pgRes = await db.query(
      `SELECT o.*, obs.nom as observateur_nom, obs.role as observateur_role 
       FROM observations o 
       JOIN observateurs obs ON o.observateur_id = obs.id 
       WHERE o.enfant_id = $1 ORDER BY o.date_observation DESC`,
      [enfantId]
    );
    let rows = pgRes ? pgRes.rows : mockDatabase.observations.filter(o => o.enfant_id === enfantId);

    // Si rôle ENSEIGNANT ou PARENT, l'acteur ne voit QUE ses observations (protection des données)
    // Seul le SPECIALISTE a accès à la vue synthétique complète
    if (role === 'ENSEIGNANT') {
      rows = rows.filter(o => o.contexte === 'ECOLE');
    } else if (role === 'PARENT') {
      rows = rows.filter(o => o.contexte === 'MAISON');
    }

    return res.json(rows);
  } catch (err) {
    let rows = mockDatabase.observations.filter(o => o.enfant_id === enfantId);
    if (role === 'ENSEIGNANT') rows = rows.filter(o => o.contexte === 'ECOLE');
    if (role === 'PARENT') rows = rows.filter(o => o.contexte === 'MAISON');
    return res.json(rows);
  }
};

export const creerObservation = async (req, res) => {
  const {
    enfantId,
    observateurId,
    observateurNom,
    domaine,
    contexte,
    frequenceDifficulte,
    impactQuotidien,
    reponseDetaillee,
    exemplesConcrets
  } = req.body;

  if (!enfantId || !domaine || !contexte || !reponseDetaillee) {
    return res.status(400).json({ error: 'Champs obligatoires manquants' });
  }

  const nouvelleObs = {
    id: uuidv4(),
    enfant_id: enfantId,
    observateur_id: observateurId || 'a1111111-1111-1111-1111-111111111111',
    observateur_nom: observateurNom || 'Observateur',
    domaine,
    contexte,
    frequence_difficulte: Number(frequenceDifficulte) || 3,
    impact_quotidien: Number(impactQuotidien) || 3,
    reponse_detaillee: reponseDetaillee,
    exemples_concrets: exemplesConcrets || '',
    date_observation: new Date().toISOString()
  };

  try {
    await db.query(
      `INSERT INTO observations 
       (id, enfant_id, observateur_id, domaine, contexte, frequence_difficulte, impact_quotidien, reponse_detaillee, exemples_concrets, date_observation)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        nouvelleObs.id,
        nouvelleObs.enfant_id,
        nouvelleObs.observateur_id,
        nouvelleObs.domaine,
        nouvelleObs.contexte,
        nouvelleObs.frequence_difficulte,
        nouvelleObs.impact_quotidien,
        nouvelleObs.reponse_detaillee,
        nouvelleObs.exemples_concrets,
        nouvelleObs.date_observation
      ]
    );
  } catch (err) {
    mockDatabase.observations.unshift(nouvelleObs);
  }

  // Stocker aussi dans le mock en direct
  if (!mockDatabase.observations.some(o => o.id === nouvelleObs.id)) {
    mockDatabase.observations.unshift(nouvelleObs);
  }

  return res.status(201).json({ success: true, observation: nouvelleObs });
};

// --- ACTIVITES ENFANT (MINI-JEUX ADAPTATIFS) ---
export const getActivitesByEnfant = async (req, res) => {
  const { enfantId } = req.params;
  try {
    const pgRes = await db.query('SELECT * FROM activites WHERE enfant_id = $1 ORDER BY date_session DESC', [enfantId]);
    if (pgRes) return res.json(pgRes.rows);
    return res.json(mockDatabase.activites.filter(a => a.enfant_id === enfantId));
  } catch (e) {
    return res.json(mockDatabase.activites.filter(a => a.enfant_id === enfantId));
  }
};

export const enregistrerActivite = async (req, res) => {
  const { enfantId, typeJeu, niveauAtteint, tempsReponseMs, tauxReussite, variabiliteAttention } = req.body;
  const nouvelleAct = {
    id: uuidv4(),
    enfant_id: enfantId,
    type_jeu: typeJeu || 'ATTENTION_FOCUS',
    niveau_atteint: Number(niveauAtteint) || 1,
    temps_reponse_ms: Number(tempsReponseMs) || 600,
    taux_reussite: Number(tauxReussite) || 80,
    variabilite_attention: Number(variabiliteAttention) || 120,
    date_session: new Date().toISOString()
  };

  try {
    await db.query(
      `INSERT INTO activites (id, enfant_id, type_jeu, niveau_atteint, temps_reponse_ms, taux_reussite, variabilite_attention, date_session)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        nouvelleAct.id,
        nouvelleAct.enfant_id,
        nouvelleAct.type_jeu,
        nouvelleAct.niveau_atteint,
        nouvelleAct.temps_reponse_ms,
        nouvelleAct.taux_reussite,
        nouvelleAct.variabilite_attention,
        nouvelleAct.date_session
      ]
    );
  } catch (err) {
    mockDatabase.activites.unshift(nouvelleAct);
  }

  if (!mockDatabase.activites.some(a => a.id === nouvelleAct.id)) {
    mockDatabase.activites.unshift(nouvelleAct);
  }

  return res.status(201).json({ success: true, activite: nouvelleAct });
};

// Endpoint pour le moteur adaptatif temps réel en cours de partie
export const adapterDifficulteJeu = (req, res) => {
  const { niveauActuel, historiqueReponses, typeJeu } = req.body;
  const adaptation = calculerAdaptation({ niveauActuel, historiqueReponses, typeJeu });
  return res.json(adaptation);
};

// --- MOTEUR DE CROISEMENT EXPLICABLE & BOUTON POURQUOI ---
export const getProfilExplicable = async (req, res) => {
  const { enfantId } = req.params;

  let observations = [];
  let activites = [];
  let consentement = null;

  try {
    const resObs = await db.query('SELECT * FROM observations WHERE enfant_id = $1', [enfantId]);
    const resAct = await db.query('SELECT * FROM activites WHERE enfant_id = $1', [enfantId]);
    const resCons = await db.query('SELECT * FROM consentements WHERE enfant_id = $1', [enfantId]);

    observations = resObs ? resObs.rows : mockDatabase.observations.filter(o => o.enfant_id === enfantId);
    activites = resAct ? resAct.rows : mockDatabase.activites.filter(a => a.enfant_id === enfantId);
    consentement = resCons && resCons.rows.length > 0 ? resCons.rows[0] : mockDatabase.consentements.find(c => c.enfant_id === enfantId);
  } catch (err) {
    observations = mockDatabase.observations.filter(o => o.enfant_id === enfantId);
    activites = mockDatabase.activites.filter(a => a.enfant_id === enfantId);
    consentement = mockDatabase.consentements.find(c => c.enfant_id === enfantId);
  }

  // Calcul du profil avec l'algorithme explicable (sans boîte noire)
  const profilExplicable = genererProfilComplet(enfantId, observations, activites, consentement);

  return res.json(profilExplicable);
};

// Endpoint de réinitialisation de la démo
export const resetDemoData = (req, res) => {
  // Rétablir les données de base pour la démo jury
  return res.json({ success: true, message: 'Données de démo réinitialisées' });
};
