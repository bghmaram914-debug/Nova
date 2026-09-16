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
      prenom: 'Léo',
      nom_anonyme: 'Léo M.',
      code_identifiant: 'NOVA-2026-084',
      age: 7,
      niveau_scolaire: 'CE1',
      etablissement: 'École Primaire Jules Ferry',
      created_at: new Date().toISOString()
    },
    {
      id: 'e2222222-2222-2222-2222-222222222222',
      prenom: 'Maya',
      nom_anonyme: 'Maya K.',
      code_identifiant: 'NOVA-2026-112',
      age: 6,
      niveau_scolaire: 'CP',
      etablissement: 'École Maternelle & Élémentaire Jean Jaurès',
      created_at: new Date().toISOString()
    }
  ],
  observateurs: [
    {
      id: 'a1111111-1111-1111-1111-111111111111',
      nom: 'Mme Dupuis',
      role: 'ENSEIGNANT',
      email: 'c.dupuis@ecole-julesferry.fr',
      etablissement: 'École Primaire Jules Ferry',
      specialite: 'Professeure des écoles CE1'
    },
    {
      id: 'a2222222-2222-2222-2222-222222222222',
      nom: 'Sophie M.',
      role: 'PARENT',
      email: 'sophie.m@parent-nova.fr',
      etablissement: 'Domicile familial',
      specialite: 'Mère de Léo'
    },
    {
      id: 'a3333333-3333-3333-3333-333333333333',
      nom: 'Dr. Claire Laurent',
      role: 'SPECIALISTE',
      email: 'c.laurent@reseau-sante.fr',
      etablissement: 'Centre de Diagnostic Pédiatrique',
      specialite: 'Neuropsychologue & Médecin coordonnateur'
    }
  ],
  consentements: [
    {
      id: 'c1111111-1111-1111-1111-111111111111',
      enfant_id: 'e1111111-1111-1111-1111-111111111111',
      parent_id: 'a2222222-2222-2222-2222-222222222222',
      statut: 'SIGNE',
      date_signature: new Date().toISOString(),
      signature_electronique_hash: 'sha256_e8293bc842918df92a01bf78e',
      remarques_parentales: 'Accord donné pour observation croisée et mini-jeux ludiques.'
    }
  ],
  observations: [
    {
      id: 'o1111111-1111-1111-1111-111111111111',
      enfant_id: 'e1111111-1111-1111-1111-111111111111',
      observateur_id: 'a1111111-1111-1111-1111-111111111111',
      observateur_nom: 'Mme Dupuis (Enseignante)',
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
      observateur_id: 'a2222222-2222-2222-2222-222222222222',
      observateur_nom: 'Sophie M. (Parent)',
      domaine: 'ATTENTION',
      contexte: 'MAISON',
      frequence_difficulte: 4,
      impact_quotidien: 4,
      reponse_detaillee: 'Au moment des devoirs, la moindre distraction sonore coupe totalement son fil de pensée. Fatigue mentale rapide.',
      exemples_concrets: 'Se lève fréquemment, a besoin d un rappel constant pour terminer 3 phrases.',
      date_observation: new Date(Date.now() - 86400000 * 2).toISOString()
    },
    {
      id: 'o3333333-3333-3333-3333-333333333333',
      enfant_id: 'e1111111-1111-1111-1111-111111111111',
      observateur_id: 'a1111111-1111-1111-1111-111111111111',
      observateur_nom: 'Mme Dupuis (Enseignante)',
      domaine: 'MOTRICITE',
      contexte: 'ECOLE',
      frequence_difficulte: 3,
      impact_quotidien: 2,
      reponse_detaillee: 'Tenue du stylo crispée, fatigue musculaire lors des longues sessions d écriture.',
      exemples_concrets: 'Secoue souvent la main droite après quelques lignes copiées.',
      date_observation: new Date(Date.now() - 86400000 * 1).toISOString()
    },
    {
      id: 'o4444444-4444-4444-4444-444444444444',
      enfant_id: 'e1111111-1111-1111-1111-111111111111',
      observateur_id: 'a2222222-2222-2222-2222-222222222222',
      observateur_nom: 'Sophie M. (Parent)',
      domaine: 'LANGAGE',
      contexte: 'MAISON',
      frequence_difficulte: 1,
      impact_quotidien: 1,
      reponse_detaillee: 'Excellente communication orale, vocabulaire riche, très curieux.',
      exemples_concrets: 'Pose beaucoup de questions, comprend très bien le sens des histoires.',
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
        console.warn('⚠️ Attention: Impossible de se connecter à PostgreSQL, mode Fallback Mémoire actif :', err.message);
        isConnectedToPostgres = false;
      } else {
        console.log('✅ Connecté avec succès à PostgreSQL:', res.rows[0].now);
        isConnectedToPostgres = true;
      }
    });
  } catch (error) {
    console.warn('⚠️ Erreur initialisation pool PostgreSQL, fallback mémoire actif:', error.message);
  }
} else {
  console.log('ℹ️ DATABASE_URL non définie. Démarrage en mode mémoire local pour le Hackathon (Prêt pour la démo immédiate).');
}

export const query = async (text, params) => {
  if (isConnectedToPostgres && pool) {
    return pool.query(text, params);
  }
  return null;
};

export const getStatus = () => ({
  postgresConnected: isConnectedToPostgres,
  mode: isConnectedToPostgres ? 'PostgreSQL Database' : 'In-Memory Mock Database'
});

export default {
  query,
  getStatus,
  mockDatabase
};
