import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import db from './config/db.js';
import {
  loginUser,
  registerUser,
  sendOtpEmail,
  verifyOtpCode,
  getEnfants,
  getEnfantById,
  creerEnfant,
  getObservateurs,
  getConsentementByEnfant,
  enregistrerConsentement,
  getObservationsByEnfant,
  creerObservation,
  getActivitesByEnfant,
  enregistrerActivite,
  adapterDifficulteJeu,
  getProfilExplicable,
  getModelInfo,
  predireProfilIA,
  resetDemoData
} from './controllers/apiController.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Routes de Santé et Statut
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'NOVA Backend API',
    timestamp: new Date().toISOString(),
    database: db.getStatus()
  });
});

// Routes Authentification, Inscription & 2FA (3 rôles)
app.post('/api/auth/login', loginUser);
app.post('/api/auth/register', registerUser);
app.post('/api/auth/send-otp', sendOtpEmail);
app.post('/api/auth/verify-otp', verifyOtpCode);



// Routes Enfants & Observateurs
app.get('/api/enfants', getEnfants);
app.post('/api/enfants', creerEnfant);
app.get('/api/enfants/:id', getEnfantById);
app.get('/api/observateurs', getObservateurs);

// Routes Consentements (RGPD)
app.get('/api/consentements/:enfantId', getConsentementByEnfant);
app.post('/api/consentements', enregistrerConsentement);

// Routes Observations (Multi-acteurs)
app.get('/api/observations/:enfantId', getObservationsByEnfant);
app.post('/api/observations', creerObservation);

// Routes Activités & Mini-jeux adaptatifs
app.get('/api/activites/:enfantId', getActivitesByEnfant);
app.post('/api/activites', enregistrerActivite);
app.post('/api/activites/adapter', adapterDifficulteJeu);

// Route Cœur : Moteur de Croisement Explicable (Bouton Pourquoi ?)
app.get('/api/profil-explicable/:enfantId', getProfilExplicable);

// Routes Modèle IA Embarqué (v4 - Entraîné sur 2 135 cohortes)
app.get('/api/ai/model-info', getModelInfo);
app.post('/api/ai/predict', predireProfilIA);

// Réinitialisation démo
app.post('/api/demo/reset', resetDemoData);

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur NOVA Backend en écoute sur http://localhost:${PORT}`);
  console.log(`📊 Mode base de données: ${db.getStatus().mode}`);
});
