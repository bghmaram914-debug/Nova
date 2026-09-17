-- ==========================================================
-- NOVA Platform - Données de Démonstration (Seed)
-- Cas d'usage : Léo M., 7 ans, CE1 - Détection précoce du signal Attention/Inhibition
-- ==========================================================

-- 1. Insertion de l'enfant
INSERT INTO enfants (id, prenom, nom_anonyme, code_identifiant, age, niveau_scolaire, etablissement)
VALUES (
    'e1111111-1111-1111-1111-111111111111',
    'Léo',
    'Léo M.',
    'NOVA-2026-084',
    7,
    'CE1',
    'École Primaire Jules Ferry'
) ON CONFLICT DO NOTHING;

-- 2. Insertion des observateurs multi-rôles avec mot de passe
INSERT INTO observateurs (id, nom, role, email, mot_de_passe, etablissement, specialite)
VALUES 
(
    'a1111111-1111-1111-1111-111111111111',
    'Marc & Hélène M.',
    'FAMILLE',
    'famille.m@famille-nova.fr',
    'famille123',
    'Cercle familial & Activités',
    'Grands-parents & Proches de Léo'
),
(
    'a2222222-2222-2222-2222-222222222222',
    'Sophie M.',
    'PARENT',
    'sophie.m@parent-nova.fr',
    'parent123',
    'Domicile familial',
    'Mère de Léo'
),
(
    'a3333333-3333-3333-3333-333333333333',
    'Dr. Claire Laurent',
    'SPECIALISTE',
    'c.laurent@reseau-sante.fr',
    'specialiste123',
    'Centre de Diagnostic Pédiatrique',
    'Neuropsychologue & Médecin coordonnateur'
) ON CONFLICT DO NOTHING;

-- 3. Consentement Parental Actif (Éthique & RGPD)
INSERT INTO consentements (enfant_id, parent_id, statut, signature_electronique_hash, remarques_parentales)
VALUES (
    'e1111111-1111-1111-1111-111111111111',
    'a2222222-2222-2222-2222-222222222222',
    'SIGNE',
    'sha256_e8293bc842918df92a01bf78e',
    'Accord donné pour le partage d observations anonymisées et la passation du mini-jeu interactif.'
) ON CONFLICT DO NOTHING;

-- 4. Observations initiales
-- Observation 1 : Famille élargie (Attention & Activités familiales)
INSERT INTO observations (enfant_id, observateur_id, domaine, contexte, frequence_difficulte, impact_quotidien, reponse_detaillee, exemples_concrets)
VALUES 
(
    'e1111111-1111-1111-1111-111111111111',
    'a1111111-1111-1111-1111-111111111111',
    'ATTENTION',
    'FAMILLE',
    4,
    3,
    'Lors des repas de famille et des jeux de société calmes, Léo a du mal à rester assis plus de 10 minutes et passe constamment d une activité à l autre.',
    'Quitte souvent la table avant la fin, commence un puzzle puis abandonne pour courir chercher un autre jeu.'
),
-- Observation 2 : Famille élargie (Comportement & Gestion des émotions)
(
    'e1111111-1111-1111-1111-111111111111',
    'a1111111-1111-1111-1111-111111111111',
    'COMPORTEMENT',
    'FAMILLE',
    3,
    2,
    'Très affectueux et enthousiaste, mais peut réagir vivement en cas de frustration imprévue avec ses cousins.',
    'A besoin d un temps de retour au calme à l écart pour réguler son excitation.'
),
-- Observation 3 : Maman à la maison (Attention et devoirs)
(
    'e1111111-1111-1111-1111-111111111111',
    'a2222222-2222-2222-2222-222222222222',
    'ATTENTION',
    'MAISON',
    4,
    4,
    'Au moment des devoirs, la moindre distraction sonore coupe totalement son fil de pensée. Fatigue mentale rapide.',
    'Se lève plusieurs fois pour aller chercher un objet, a du mal à finir 3 lignes de lecture sans pause.'
),
-- Observation 4 : Maman à la maison (Langage & Communication)
(
    'e1111111-1111-1111-1111-111111111111',
    'a2222222-2222-2222-2222-222222222222',
    'LANGAGE',
    'MAISON',
    1,
    1,
    'Très bonne aisance verbale, vocabulaire riche et varié, adore raconter des histoires.',
    'S exprime avec clarté, aucun problème d articulation.'
);

-- 5. Session d'activité Enfant (Mini-jeu adaptatif "Mission Astro")
INSERT INTO activites (enfant_id, type_jeu, niveau_atteint, temps_reponse_ms, taux_reussite, variabilite_attention)
VALUES 
(
    'e1111111-1111-1111-1111-111111111111',
    'ATTENTION_FOCUS',
    4,
    740,
    62.50,
    215.30
),
(
    'e1111111-1111-1111-1111-111111111111',
    'SEQUENCE_MEMOIRE',
    5,
    580,
    88.00,
    95.10
);
