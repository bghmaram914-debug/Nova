import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

let pool = null;
let isConnectedToPostgres = false;

// Données initiales en mémoire (seed) en cas d'absence de PostgreSQL actif
export const mockDatabase = {
  enfants: [
    {
      id: 'e1111111-1111-1111-1111-111111111111',
      prenom: 'Youssef',
      nom_anonyme: 'Youssef B.',
      code_identifiant: 'TN-NOVA-2026-084',
      age: 7,
      niveau_scolaire: '2ème Année Primaire',
      etablissement: 'École Primaire Habib Bourguiba - Tunis',
      created_at: new Date().toISOString()
    },
    {
      id: 'e2222222-2222-2222-2222-222222222222',
      prenom: 'Sarra',
      nom_anonyme: 'Sarra K.',
      code_identifiant: 'TN-NOVA-2026-112',
      age: 6,
      niveau_scolaire: '1ère Année Primaire',
      etablissement: 'École Primaire Ibn Khaldoun - Sousse',
      created_at: new Date().toISOString()
    }
  ],
  observateurs: [
    {
      id: 'a1111111-1111-1111-1111-111111111111',
      nom: 'Mme Sonia Trabelsi',
      role: 'ENSEIGNANT',
      email: 's.trabelsi@education.tn',
      mot_de_passe: 'enseignant123',
      etablissement: 'École Primaire Habib Bourguiba - Tunis',
      specialite: 'Enseignante Référente 2ème Année Primaire'
    },
    {
      id: 'a2222222-2222-2222-2222-222222222222',
      nom: 'Mme Leila & Famille B.',
      role: 'FAMILLE',
      email: 'famille.b@nova.tn',
      mot_de_passe: 'famille123',
      etablissement: 'Domicile familial (Tunis)',
      specialite: 'Tuteurs légaux & Entourage familial'
    },
    {
      id: 'a3333333-3333-3333-3333-333333333333',
      nom: 'Dr. Anis Ben Salah',
      role: 'SPECIALISTE',
      email: 'dr.bensalah@sante.tn',
      mot_de_passe: 'specialiste123',
      etablissement: 'Centre de Pédopsychiatrie & Neuropsychologie (Tunis)',
      specialite: 'Pédopsychiatre & Spécialiste des TND'
    }
  ],
  consentements: [
    {
      id: 'c1111111-1111-1111-1111-111111111111',
      enfant_id: 'e1111111-1111-1111-1111-111111111111',
      parent_id: 'a2222222-2222-2222-2222-222222222222',
      statut: 'SIGNE',
      date_signature: new Date().toISOString(),
      signature_electronique_hash: 'sha256_tn_e8293bc842918df92a01bf78e',
      remarques_parentales: 'Accord signé selon la loi n° 2004-63 (INADP Tunisie) pour suivi collaboratif.'
    }
  ],
  observations: [
    {
      id: 'o1111111-1111-1111-1111-111111111111',
      enfant_id: 'e1111111-1111-1111-1111-111111111111',
      observateur_id: 'a1111111-1111-1111-1111-111111111111',
      observateur_nom: 'Mme Sonia Trabelsi (Enseignante)',
      domaine: 'ATTENTION',
      contexte: 'ECOLE',
      frequence_difficulte: 4,
      impact_quotidien: 4,
      reponse_detaillee: 'Difficulté persistante à maintenir son attention sur une double consigne écrite ou lors des exercices individuels de plus de 10 minutes.',
      exemples_concrets: 'Regarde souvent par la fenêtre, oublie la seconde étape des consignes doubles.',
      date_observation: new Date(Date.now() - 86400000 * 3).toISOString()
    },
    {
      id: 'o2222222-2222-2222-2222-222222222222',
      enfant_id: 'e1111111-1111-1111-1111-111111111111',
      observateur_id: 'a1111111-1111-1111-1111-111111111111',
      observateur_nom: 'Mme Sonia Trabelsi (Enseignante)',
      domaine: 'MOTRICITE',
      contexte: 'ECOLE',
      frequence_difficulte: 3,
      impact_quotidien: 2,
      reponse_detaillee: 'Tenue du crayon un peu crispée, lenteur pour copier les devoirs au tableau en écriture cursive arabe et française.',
      exemples_concrets: 'Prend 5 minutes de plus que ses camarades pour copier la date au tableau.',
      date_observation: new Date(Date.now() - 86400000 * 2).toISOString()
    },
    {
      id: 'o3333333-3333-3333-3333-333333333333',
      enfant_id: 'e1111111-1111-1111-1111-111111111111',
      observateur_id: 'a2222222-2222-2222-2222-222222222222',
      observateur_nom: 'Mme Leila & Famille B. (Maison)',
      domaine: 'ATTENTION',
      contexte: 'MAISON',
      frequence_difficulte: 4,
      impact_quotidien: 4,
      reponse_detaillee: 'Au moment des devoirs, la moindre distraction sonore coupe totalement son fil de pensée. Fatigue mentale rapide.',
      exemples_concrets: 'Se lève fréquemment, a besoin d un rappel constant pour terminer 3 phrases.',
      date_observation: new Date(Date.now() - 86400000 * 2).toISOString()
    },
    {
      id: 'o4444444-4444-4444-4444-444444444444',
      enfant_id: 'e1111111-1111-1111-1111-111111111111',
      observateur_id: 'a2222222-2222-2222-2222-222222222222',
      observateur_nom: 'Mme Leila & Famille B. (Entourage)',
      domaine: 'COMPORTEMENT',
      contexte: 'FAMILLE',
      frequence_difficulte: 3,
      impact_quotidien: 2,
      reponse_detaillee: 'Très affectueux et enthousiaste, mais peut réagir vivement en cas de frustration imprévue avec ses cousins.',
      exemples_concrets: 'A besoin d un temps de retour au calme à l écart pour réguler son excitation.',
      date_observation: new Date(Date.now() - 86400000 * 1).toISOString()
    },
    {
      id: 'o5555555-5555-5555-5555-555555555555',
      enfant_id: 'e1111111-1111-1111-1111-111111111111',
      observateur_id: 'a2222222-2222-2222-2222-222222222222',
      observateur_nom: 'Mme Leila & Famille B. (Maison)',
      domaine: 'LANGAGE',
      contexte: 'MAISON',
      frequence_difficulte: 1,
      impact_quotidien: 1,
      reponse_detaillee: 'Excellente communication orale en arabe et français, vocabulaire riche, très curieux.',
      exemples_concrets: 'Pose beaucoup de questions, comprend très bien le sens des histoires récitees.',
      date_observation: new Date(Date.now() - 86400000 * 1).toISOString()
    }
  ],
  activites: [
    {
      id: 'act11111-1111-1111-1111-111111111111',
      enfant_id: 'e1111111-1111-1111-1111-111111111111',
      type_jeu: 'ATTENTION_FOCUS',
      niveau_atteint: 4,
      temps_reponse_ms: 780,
      taux_reussite: 64.0,
      variabilite_attention: 220.5,
      date_session: new Date().toISOString()
    },
    {
      id: 'act22222-2222-2222-2222-222222222222',
      enfant_id: 'e1111111-1111-1111-1111-111111111111',
      type_jeu: 'SEQUENCE_MEMOIRE',
      niveau_atteint: 5,
      temps_reponse_ms: 540,
      taux_reussite: 90.0,
      variabilite_attention: 85.0,
      date_session: new Date().toISOString()
    }
  ],
  profils: []
};

// Initialisation de la connexion PostgreSQL
if (process.env.DATABASE_URL) {
  try {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_URL.includes('localhost') ? false : { rejectUnauthorized: false }
    });

    pool.query('SELECT NOW()', (err, res) => {
      if (err) {
        console.warn('⚠️ Attention: PostgreSQL non joint, fonctionnement en mode mémoire local (Tunisie) :', err.message);
        isConnectedToPostgres = false;
      } else {
        console.log('✅ Connecté avec succès à PostgreSQL:', res.rows[0].now);
        isConnectedToPostgres = true;
      }
    });
  } catch (error) {
    console.warn('⚠️ Erreur initialisation pool PostgreSQL, mode mémoire local actif:', error.message);
  }
} else {
  console.log('ℹ️ DATABASE_URL non définie. Démarrage en mode mémoire local pour la plateforme NOVA Tunisie.');
}

export const query = async (text, params) => {
  if (isConnectedToPostgres && pool) {
    return pool.query(text, params);
  }
  return null;
};

export const getStatus = () => ({
  postgresConnected: isConnectedToPostgres,
  mode: isConnectedToPostgres ? 'PostgreSQL Database' : 'In-Memory Local Database (Tunisie)'
});

export default {
  query,
  getStatus,
  mockDatabase
};

