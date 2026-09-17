-- ==========================================================
-- NOVA Platform - PostgreSQL Database Schema
-- Détection Précoce et Collaborative des Troubles Neurodéveloppementaux
-- ==========================================================

-- Extension pour UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: ENFANTS
CREATE TABLE IF NOT EXISTS enfants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prenom VARCHAR(100) NOT NULL,
    nom_anonyme VARCHAR(100) NOT NULL, -- Ex: "Léo M." pour anonymisation
    code_identifiant VARCHAR(50) UNIQUE NOT NULL, -- Ex: "NOVA-2026-084"
    age INT NOT NULL,
    niveau_scolaire VARCHAR(50) NOT NULL, -- Ex: "CP", "CE1", "CE2"
    etablissement VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: OBSERVATEURS (Utilisateurs avec RBAC)
-- Rôles : 'ENSEIGNANT', 'FAMILLE', 'SPECIALISTE'
CREATE TABLE IF NOT EXISTS observateurs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nom VARCHAR(150) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('ENSEIGNANT', 'FAMILLE', 'SPECIALISTE')),
    email VARCHAR(255) UNIQUE NOT NULL,
    mot_de_passe VARCHAR(255) NOT NULL DEFAULT 'demo123',
    etablissement VARCHAR(255),
    specialite VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: CONSENTEMENTS (1-1 Enfant - Parent)
-- RGPD & Éthique : Aucune observation exploitable sans consentement actif
CREATE TABLE IF NOT EXISTS consentements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    enfant_id UUID NOT NULL REFERENCES enfants(id) ON DELETE CASCADE,
    parent_id UUID NOT NULL REFERENCES observateurs(id) ON DELETE CASCADE,
    date_signature TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    statut VARCHAR(50) NOT NULL DEFAULT 'SIGNE' CHECK (statut IN ('SIGNE', 'EN_ATTENTE', 'REFUSE')),
    signature_electronique_hash VARCHAR(255),
    remarques_parentales TEXT,
    CONSTRAINT unique_enfant_consentement UNIQUE (enfant_id)
);

-- Table: OBSERVATIONS (Formulaires indépendants des acteurs)
-- Domaines : 'ATTENTION', 'LANGAGE', 'MEMOIRE', 'MOTRICITE', 'COMPORTEMENT'
-- Contextes : 'MAISON', 'FAMILLE', 'CABINET'
CREATE TABLE IF NOT EXISTS observations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    enfant_id UUID NOT NULL REFERENCES enfants(id) ON DELETE CASCADE,
    observateur_id UUID NOT NULL REFERENCES observateurs(id) ON DELETE CASCADE,
    domaine VARCHAR(50) NOT NULL CHECK (domaine IN ('ATTENTION', 'LANGAGE', 'MEMOIRE', 'MOTRICITE', 'COMPORTEMENT')),
    contexte VARCHAR(50) NOT NULL CHECK (contexte IN ('ECOLE', 'MAISON', 'FAMILLE', 'CABINET')),
    frequence_difficulte INT NOT NULL CHECK (frequence_difficulte BETWEEN 1 AND 5), -- 1: Jamais, 3: Parfois, 5: Très fréquent
    impact_quotidien INT NOT NULL CHECK (impact_quotidien BETWEEN 1 AND 5),
    reponse_detaillee TEXT NOT NULL,
    exemples_concrets TEXT,
    date_observation TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: ACTIVITES (Télémétrie des mini-jeux adaptatifs de l'enfant)
-- Types : 'ATTENTION_FOCUS', 'SEQUENCE_MEMOIRE', 'INHIBITION_MOTRICE'
CREATE TABLE IF NOT EXISTS activites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    enfant_id UUID NOT NULL REFERENCES enfants(id) ON DELETE CASCADE,
    type_jeu VARCHAR(50) NOT NULL CHECK (type_jeu IN ('ATTENTION_FOCUS', 'SEQUENCE_MEMOIRE', 'INHIBITION_MOTRICE')),
    niveau_atteint INT NOT NULL DEFAULT 1,
    temps_reponse_ms INT NOT NULL, -- Temps moyen de réaction
    taux_reussite NUMERIC(5,2) NOT NULL, -- Ex: 85.50 %
    variabilite_attention NUMERIC(5,2), -- Écart-type des temps de réponse
    date_session TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: PROFILS (Résultats du Moteur de Croisement Explicable)
-- Niveau signal : 'PAS_DE_SIGNAL', 'SIGNAL_CONTEXTUEL', 'DIVERGENCE_DETECTEE', 'SIGNAL_FORT'
CREATE TABLE IF NOT EXISTS profils (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    enfant_id UUID NOT NULL REFERENCES enfants(id) ON DELETE CASCADE,
    domaine VARCHAR(50) NOT NULL CHECK (domaine IN ('ATTENTION', 'LANGAGE', 'MEMOIRE', 'MOTRICITE', 'COMPORTEMENT')),
    niveau_signal VARCHAR(50) NOT NULL CHECK (niveau_signal IN ('PAS_DE_SIGNAL', 'SIGNAL_CONTEXTUEL', 'DIVERGENCE_DETECTEE', 'SIGNAL_FORT')),
    justification TEXT NOT NULL,
    sources_croisees JSONB NOT NULL DEFAULT '[]'::jsonb, -- Stocke les IDs et résumés des observations d'origine (Bouton Pourquoi)
    recommandation TEXT,
    date_analyse TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index pour accélérer les requêtes d'analyse
CREATE INDEX IF NOT EXISTS idx_observations_enfant_domaine ON observations(enfant_id, domaine);
CREATE INDEX IF NOT EXISTS idx_activites_enfant ON activites(enfant_id);
CREATE INDEX IF NOT EXISTS idx_profils_enfant ON profils(enfant_id);
