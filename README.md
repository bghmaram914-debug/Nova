# 🌟 NOVA - Détection Précoce & Collaborative des Troubles du Neurodéveloppement

> **Hackathon 2026** • Détection précoce, collaborative et explicable des difficultés d'apprentissage (TDAH, TSA, Troubles Dys) sans jamais réduire l'enfant à une étiquette.

---

## 🎯 Problématique & Solution

- **Le problème** : Des millions d'enfants présentant des signes précoces de troubles neurodéveloppementaux sont repérés trop tard car les observations des adultes (enseignants, parents, orthophonistes, infirmiers) sont éparpillées et non connectées.
- **La solution NOVA** : Une plateforme numérique collaborative qui relie les acteurs autour de l'enfant. Chaque acteur dispose d'un espace dédié et indépendant (protection des données et absence d'influence réciproque).
- **L'innovation clé** : Un **mini-jeu adaptatif en temps réel** ("Mission Astro") où le test s'adapte à l'enfant au lieu de contraindre l'enfant à un test rigide.
- **L'intelligence explicable** : Un moteur de croisement multi-contextes doté du **Bouton « Pourquoi ? »** qui fournit aux professionnels de santé des preuves circonstanciées et transparentes sans jamais poser de diagnostic automatique.

---

## 🏗️ Architecture Technique

```
                              ┌────────────────────────────────────────┐
                              │      FRONTEND (React + Vite) : 5173    │
                              │  - TopBar Démo Jury (Bascule 1-clic)   │
                              │  - Espace Enseignant (Formulaire 5min) │
                              │  - Espace Parent (Consentement RGPD)   │
                              │  - Espace Enfant (Jeu Mission Astro)   │
                              │  - Espace Spécialiste (Bouton Pourquoi)│
                              └───────────────────┬────────────────────┘
                                                  │ API REST (JSON)
                                                  ▼
                              ┌────────────────────────────────────────┐
                              │      BACKEND (Node.js/Express) : 5000  │
                              │  - Auth & Cloisonnement RBAC           │
                              │  - Moteur de Croisement Explicable     │
                              │  - Moteur Adaptatif temps réel (Jeu)   │
                              │  - API Consentements & Observations    │
                              └───────────────────┬────────────────────┘
                                                  │ Pool pg / Fallback
                                                  ▼
                              ┌────────────────────────────────────────┐
                              │     BASE DE DONNÉES (PostgreSQL)       │
                              │  - Tables : enfants, observateurs,     │
                              │    consentements, observations,        │
                              │    activités, profils                  │
                              │  - Cloud : Supabase, Neon ou Local     │
                              └────────────────────────────────────────┘
```

---

## 🚀 Démarrage Rapide

### 1. Prérequis
- **Node.js** (v20+ déjà installé dans le profil utilisateur)
- Navigateur moderne (Chrome, Edge, Firefox)

### 2. Démarrer le Backend (API REST)
```powershell
cd Backend
npm install
npm start
# Le serveur démarre sur http://localhost:5000
```

### 3. Démarrer le Frontend (React + Vite)
Dans un nouveau terminal :
```powershell
cd Frontend
npm install
npm run dev
# L'application est disponible sur http://localhost:5173
```

---

## 🗄️ Configuration PostgreSQL (Supabase / Neon)

Le projet intègre un **double mode** :
1. **Mode Hors-Ligne (In-Memory)** : Actif par défaut, il permet de dérouler toute la démo du hackathon sans avoir besoin de connexion internet ni de base de données locale.
2. **Mode PostgreSQL Cloud (Supabase / Neon)** :
   - Créez un projet gratuit sur [Supabase](https://supabase.com) ou [Neon](https://neon.tech).
   - Exécutez le script SQL `Backend/database/schema.sql` puis `Backend/database/seed.sql` dans l'éditeur SQL de votre console Cloud.
   - Ajoutez votre chaîne de connexion dans `Backend/.env` :
     ```env
     DATABASE_URL=postgresql://postgres.votre_projet:mot_de_passe@aws-0-eu-central-1.pooler.supabase.com:6543/postgres
     ```
   - Redémarrez le backend : la connexion est automatiquement détectée et confirmée !

---

## 🎬 Scénario de Présentation au Jury (Pitch 3 minutes)

Grâce à la **Barre Démo Hackathon** située en haut de l'écran, vous pouvez dérouler le parcours complet en direct :

1. **Étape 1 : Espace Enseignant** (Mme Dupuis)
   - Montrez le questionnaire court (~5 min), conçu avec des critères factuels (sans jargon médical).
   - Montrez la sélection du domaine *Attention & Maintien de l'effort*, ajustez les curseurs et transmettez.
2. **Étape 2 : Espace Parent** (Sophie M.)
   - Cliquez sur **Espace Parent** dans la barre supérieure.
   - Mettez en avant le **badge de consentement parental éclairé (RGPD)** : les parents ont le contrôle total de leurs données.
   - Montrez que le parent remplit son observation de façon **indépendante**, sans être influencé par l'école.
3. **Étape 3 : Espace Enfant** (Mini-jeu "Mission Astro")
   - Cliquez sur **Espace Enfant**.
   - Cliquez sur **« Commencer l'Aventure ! »** et attrapez 2 ou 3 étoiles dorées.
   - **Mettez en avant l'innovation** : le test module sa vitesse et ses distracteurs en temps réel selon les réflexes de l'enfant (évaluation adaptative non frustrante).
4. **Étape 4 : Espace Spécialiste & Le Bouton « Pourquoi ? » (Climax du pitch)**
   - Cliquez sur **Espace Spécialiste** (Dr. Claire Laurent).
   - Montrez la carte du domaine **ATTENTION** passée en **SIGNAL FORT (Rouge)** car validée à travers l'école, la maison et le mini-jeu.
   - Cliquez sur le **Bouton « Pourquoi ? »** : un panneau explicable affiche la chronologie exacte des faits sources.
   - Montrez enfin la section de **Décision du Praticien** : l'IA n'impose rien, le médecin décide en toute souveraineté de proposer un bilan neuropsychologique.

---

## ⚖️ Éthique, RGPD & IA Responsable

- **Pas d'étiquetage automatique** : NOVA ne génère jamais de diagnostic médical, uniquement des signaux explicables.
- **Cloisonnement des données** : L'enseignant ne voit pas le dossier complet de l'enfant ; seul le spécialiste accède à la synthèse transversale.
- **Alignement ODD (SDGs)** : ODD 3 (Santé & Bien-être), ODD 4 (Éducation de qualité), ODD 10 (Inégalités réduites).
