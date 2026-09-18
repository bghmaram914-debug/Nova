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
    },
    {
      id: 'e3333333-3333-3333-3333-333333333333',
      prenom: 'Mehdi',
      nom_anonyme: 'Mehdi A.',
      code_identifiant: 'TN-NOVA-2026-203',
      age: 9,
      niveau_scolaire: '4ème Année Primaire',
      etablissement: 'École Primaire Farhat Hached - Sfax',
      created_at: new Date().toISOString()
    }
  ],
  observateurs: [
    {
      id: 'a1111111-1111-1111-1111-111111111111',
      nom: 'Mme Sonia Trabelsi',
      role: 'ENSEIGNANT',
      email: 's.trabelsi@education.tn',
      mot_de_passe: '$2b$10$qMTjjIn6gxcP79sDEXaxHeWaAE19Xq.u2or5sk1P9B2PjHOZM2C8C', // enseignant123
      etablissement: 'École Primaire Habib Bourguiba - Tunis',
      specialite: 'Enseignante Référente 2ème Année Primaire'
    },
    {
      id: 'a2222222-2222-2222-2222-222222222222',
      nom: 'Mme Leila & Famille B.',
      role: 'FAMILLE',
      email: 'famille.b@nova.tn',
      mot_de_passe: '$2b$10$RdNcrr/hDGKwoHkn0jGCJulrZiB1krDp1Ewltv.h6oJsPn4znFcAu', // famille123
      etablissement: 'Domicile familial (Tunis)',
      specialite: 'Tuteurs légaux & Entourage familial'
    },
    {
      id: 'a3333333-3333-3333-3333-333333333333',
      nom: 'Dr. Anis Ben Salah',
      role: 'SPECIALISTE',
      email: 'dr.bensalah@sante.tn',
      mot_de_passe: '$2b$10$unlsfbXXRaRmhuypASV7aO6TtNJ4pSvUmhFPMOSee.iFqxIJ3DeOi', // specialiste123
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
      signature_electronique_hash: 'a3f8c2e1b4d9e7f0a1c3b5d2e8f4a7c9b1d6e3f0a2c4b7d1e9f5a8c2b4d0e6f3',
      remarques_parentales: 'Accord signé selon la loi n° 2004-63 (INADP Tunisie) pour suivi collaboratif.'
    },
    {
      id: 'c2222222-2222-2222-2222-222222222222',
      enfant_id: 'e2222222-2222-2222-2222-222222222222',
      parent_id: 'a2222222-2222-2222-2222-222222222222',
      statut: 'SIGNE',
      date_signature: new Date(Date.now() - 86400000 * 5).toISOString(),
      signature_electronique_hash: 'b7e2f4a9c1d5e8f3b2c6d0e4f7a1b5c9d3e6f0a4b8c2d5e9f1a3b6c0d4e7f2a8',
      remarques_parentales: 'Consentement parental pour Sarra - Suivi NOVA Sousse.'
    },
    {
      id: 'c3333333-3333-3333-3333-333333333333',
      enfant_id: 'e3333333-3333-3333-3333-333333333333',
      parent_id: 'a2222222-2222-2222-2222-222222222222',
      statut: 'SIGNE',
      date_signature: new Date(Date.now() - 86400000 * 10).toISOString(),
      signature_electronique_hash: 'c9d1e5f2a6b0c4d8e3f7a2b5c8d2e6f0a4b7c1d5e9f3a7b0c3d7e1f4a8b2c6d0',
      remarques_parentales: 'Accord pour Mehdi - Suivi TND à Sfax, signé par les deux parents.'
    }
  ],
  observations: [
    // ── Youssef B. — profil TDAH probable (attention + impulsivité) ──
    {
      id: 'o1111111-1111-1111-1111-111111111111',
      enfant_id: 'e1111111-1111-1111-1111-111111111111',
      observateur_id: 'a1111111-1111-1111-1111-111111111111',
      observateur_nom: 'Mme Sonia Trabelsi (Enseignante)',
      domaine: 'ATTENTION',
      contexte: 'ECOLE',
      frequence_difficulte: 4,
      impact_quotidien: 4,
      reponse_detaillee: 'Difficulté persistante à maintenir son attention sur une double consigne écrite. Perd le fil après 10 minutes d exercice individuel.',
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
      reponse_detaillee: 'Tenue du crayon crispée, lenteur notable pour copier les devoirs au tableau.',
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
      observateur_nom: 'Mme Leila & Famille B. (Maison)',
      domaine: 'COMPORTEMENT',
      contexte: 'MAISON',
      frequence_difficulte: 3,
      impact_quotidien: 2,
      reponse_detaillee: 'Très affectueux, mais réagit vivement aux frustrations imprévues. Se calme seul après 10 minutes.',
      exemples_concrets: 'Pleure si son jeu est interrompu brusquement.',
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
      reponse_detaillee: 'Excellente communication orale en arabe et français, vocabulaire très riche pour son âge.',
      exemples_concrets: 'Pose des questions complexes, comprend les histoires à plusieurs niveaux de sens.',
      date_observation: new Date(Date.now() - 86400000 * 1).toISOString()
    },

    // ── Sarra K. — profil DYS probable (lecture / mémoire verbale) ──
    {
      id: 'o6666666-6666-6666-6666-666666666666',
      enfant_id: 'e2222222-2222-2222-2222-222222222222',
      observateur_id: 'a1111111-1111-1111-1111-111111111111',
      observateur_nom: 'Mme Sonia Trabelsi (Enseignante)',
      domaine: 'LANGAGE',
      contexte: 'ECOLE',
      frequence_difficulte: 4,
      impact_quotidien: 5,
      reponse_detaillee: 'Confond fréquemment b/d et p/q à l écrit. Grandes difficultés à associer sons et lettres lors de la lecture à voix haute.',
      exemples_concrets: 'Lit "bal" pour "dal", hésite longuement devant les syllabes inversées.',
      date_observation: new Date(Date.now() - 86400000 * 4).toISOString()
    },
    {
      id: 'o7777777-7777-7777-7777-777777777777',
      enfant_id: 'e2222222-2222-2222-2222-222222222222',
      observateur_id: 'a1111111-1111-1111-1111-111111111111',
      observateur_nom: 'Mme Sonia Trabelsi (Enseignante)',
      domaine: 'MEMOIRE',
      contexte: 'ECOLE',
      frequence_difficulte: 3,
      impact_quotidien: 3,
      reponse_detaillee: 'Oublie fréquemment les mots appris la veille malgré la répétition. Mémorisation lente des comptines.',
      exemples_concrets: 'A besoin de 3x plus de répétitions que ses camarades pour retenir le même contenu.',
      date_observation: new Date(Date.now() - 86400000 * 3).toISOString()
    },
    {
      id: 'o8888888-8888-8888-8888-888888888888',
      enfant_id: 'e2222222-2222-2222-2222-222222222222',
      observateur_id: 'a2222222-2222-2222-2222-222222222222',
      observateur_nom: 'Famille K. (Maison)',
      domaine: 'LANGAGE',
      contexte: 'MAISON',
      frequence_difficulte: 4,
      impact_quotidien: 4,
      reponse_detaillee: 'N aime plus lire à voix haute depuis les moqueries de son frère. Préfère raconter les histoires qu elle a mémorisées.',
      exemples_concrets: 'Évite les livres avec du texte, préfère regarder les images seules.',
      date_observation: new Date(Date.now() - 86400000 * 2).toISOString()
    },
    {
      id: 'o9999999-9999-9999-9999-999999999999',
      enfant_id: 'e2222222-2222-2222-2222-222222222222',
      observateur_id: 'a2222222-2222-2222-2222-222222222222',
      observateur_nom: 'Famille K. (Maison)',
      domaine: 'COMPORTEMENT',
      contexte: 'MAISON',
      frequence_difficulte: 2,
      impact_quotidien: 2,
      reponse_detaillee: 'Très sociable et joueuse, aime cuisiner avec sa mère et dessiner. Le contexte familial est serein malgré le stress scolaire.',
      exemples_concrets: 'Rit beaucoup en famille, invente des histoires avec ses poupées.',
      date_observation: new Date(Date.now() - 86400000 * 1).toISOString()
    },

    // ── Mehdi A. — profil TSA léger probable (communication sociale + routines) ──
    {
      id: 'oaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      enfant_id: 'e3333333-3333-3333-3333-333333333333',
      observateur_id: 'a1111111-1111-1111-1111-111111111111',
      observateur_nom: 'Mme Sonia Trabelsi (Enseignante)',
      domaine: 'COMPORTEMENT',
      contexte: 'ECOLE',
      frequence_difficulte: 4,
      impact_quotidien: 4,
      reponse_detaillee: 'Préfère jouer seul à la récréation. Réagit avec détresse lors des changements imprévus de programme scolaire.',
      exemples_concrets: 'A eu une crise de pleurs quand la salle de classe a changé un matin. Refuse les jeux de groupe.',
      date_observation: new Date(Date.now() - 86400000 * 5).toISOString()
    },
    {
      id: 'obbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
      enfant_id: 'e3333333-3333-3333-3333-333333333333',
      observateur_id: 'a1111111-1111-1111-1111-111111111111',
      observateur_nom: 'Mme Sonia Trabelsi (Enseignante)',
      domaine: 'LANGAGE',
      contexte: 'ECOLE',
      frequence_difficulte: 3,
      impact_quotidien: 3,
      reponse_detaillee: 'Vocabulaire académique très développé mais difficulté à initier des échanges sociaux. Répond souvent à côté des questions non-académiques.',
      exemples_concrets: 'Peut expliquer le système solaire en détail, mais dit "je ne sais pas" si on lui demande comment il va.',
      date_observation: new Date(Date.now() - 86400000 * 4).toISOString()
    },
    {
      id: 'occccccc-cccc-cccc-cccc-cccccccccccc',
      enfant_id: 'e3333333-3333-3333-3333-333333333333',
      observateur_id: 'a2222222-2222-2222-2222-222222222222',
      observateur_nom: 'Famille A. (Maison)',
      domaine: 'ROUTINES',
      contexte: 'MAISON',
      frequence_difficulte: 5,
      impact_quotidien: 5,
      reponse_detaillee: 'Routines très strictes : même ordre pour s habiller, même place à table, même rituel du coucher. Tout écart déclenche une grande anxiété.',
      exemples_concrets: 'Refuse de manger si la cuillère habituelle n est pas disponible. Compte ses pas en montant l escalier.',
      date_observation: new Date(Date.now() - 86400000 * 3).toISOString()
    },
    {
      id: 'oddddddd-dddd-dddd-dddd-dddddddddddd',
      enfant_id: 'e3333333-3333-3333-3333-333333333333',
      observateur_id: 'a2222222-2222-2222-2222-222222222222',
      observateur_nom: 'Famille A. (Maison)',
      domaine: 'ATTENTION',
      contexte: 'MAISON',
      frequence_difficulte: 1,
      impact_quotidien: 1,
      reponse_detaillee: 'Concentration extraordinaire sur ses centres d intérêt. Peut rester 2 heures concentré sur un puzzle de 500 pièces.',
      exemples_concrets: 'A mémorisé toutes les capitales du monde à 9 ans. Lit des livres documentaires seul.',
      date_observation: new Date(Date.now() - 86400000 * 2).toISOString()
    }
  ],
  activites: [
    // Youssef — attention faible, mémoire moyenne
    {
      id: 'act11111-1111-1111-1111-111111111111',
      enfant_id: 'e1111111-1111-1111-1111-111111111111',
      type_jeu: 'ATTENTION_FOCUS',
      niveau_atteint: 3,
      temps_reponse_ms: 850,
      taux_reussite: 58.0,
      variabilite_attention: 310.0,
      date_session: new Date(Date.now() - 86400000 * 2).toISOString()
    },
    {
      id: 'act22222-2222-2222-2222-222222222222',
      enfant_id: 'e1111111-1111-1111-1111-111111111111',
      type_jeu: 'SEQUENCE_MEMOIRE',
      niveau_atteint: 4,
      temps_reponse_ms: 620,
      taux_reussite: 72.0,
      variabilite_attention: 145.0,
      date_session: new Date(Date.now() - 86400000 * 1).toISOString()
    },
    // Sarra — bonne attention, mémoire verbale faible
    {
      id: 'act33333-3333-3333-3333-333333333333',
      enfant_id: 'e2222222-2222-2222-2222-222222222222',
      type_jeu: 'ATTENTION_FOCUS',
      niveau_atteint: 4,
      temps_reponse_ms: 510,
      taux_reussite: 80.0,
      variabilite_attention: 90.0,
      date_session: new Date(Date.now() - 86400000 * 3).toISOString()
    },
    {
      id: 'act44444-4444-4444-4444-444444444444',
      enfant_id: 'e2222222-2222-2222-2222-222222222222',
      type_jeu: 'SEQUENCE_MEMOIRE',
      niveau_atteint: 2,
      temps_reponse_ms: 1100,
      taux_reussite: 40.0,
      variabilite_attention: 220.0,
      date_session: new Date(Date.now() - 86400000 * 2).toISOString()
    },
    // Mehdi — hyper-focus, attention et mémoire excellentes
    {
      id: 'act55555-5555-5555-5555-555555555555',
      enfant_id: 'e3333333-3333-3333-3333-333333333333',
      type_jeu: 'ATTENTION_FOCUS',
      niveau_atteint: 5,
      temps_reponse_ms: 390,
      taux_reussite: 95.0,
      variabilite_attention: 40.0,
      date_session: new Date(Date.now() - 86400000 * 4).toISOString()
    },
    {
      id: 'act66666-6666-6666-6666-666666666666',
      enfant_id: 'e3333333-3333-3333-3333-333333333333',
      type_jeu: 'SEQUENCE_MEMOIRE',
      niveau_atteint: 5,
      temps_reponse_ms: 420,
      taux_reussite: 93.0,
      variabilite_attention: 35.0,
      date_session: new Date(Date.now() - 86400000 * 3).toISOString()
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
