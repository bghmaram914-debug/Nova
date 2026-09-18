import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import LoginPage from './components/LoginPage';
import EspaceEnseignant from './components/EspaceEnseignant';
import EspaceFamille from './components/EspaceFamille';
import EspaceSpecialiste from './components/EspaceSpecialiste';
import InscriptionEnfant from './components/InscriptionEnfant';
import SessionExpiryNotifier from './components/SessionExpiryNotifier';
import { ArrowLeft } from 'lucide-react';

const DEFAULT_CHILDREN = [
  {
    id: 'e1111111-1111-1111-1111-111111111111',
    prenom: 'Youssef',
    nom_anonyme: 'B.',
    code_identifiant: 'TN-NOVA-2026-084',
    age: 7,
    niveau_scolaire: '2ème Année Primaire',
    etablissement: 'École Primaire Habib Bourguiba - Tunis'
  },
  {
    id: 'e2222222-2222-2222-2222-222222222222',
    prenom: 'Sarra',
    nom_anonyme: 'M.',
    code_identifiant: 'TN-NOVA-2026-085',
    age: 9,
    niveau_scolaire: '4ème Année Primaire',
    etablissement: 'École Primaire Ibn Khaldoun - Sfax'
  },
];

// Durée de session maximale : 12 Heures (en millisecondes)
const SESSION_DURATION_MS = 12 * 60 * 60 * 1000;
// Avertissement de pré-expiration : 5 Minutes avant la fin (en millisecondes)
const SESSION_WARNING_MS = 5 * 60 * 1000;

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('nova_user');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });

  const [enfantsList, setEnfantsList] = useState(DEFAULT_CHILDREN);
  const [activeChild, setActiveChild] = useState(DEFAULT_CHILDREN[0]);
  const [isRegisteringChild, setIsRegisteringChild] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Charger la liste des enfants depuis l'API
  useEffect(() => {
    if (!currentUser) return;
    fetch('/api/enfants', {
      headers: { Authorization: `Bearer ${localStorage.getItem('nova_token') || ''}` }
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setEnfantsList(data);
          setActiveChild(prev => data.find(e => e.id === prev?.id) || data[0]);
        }
      })
      .catch(() => {/* fallback sur DEFAULT_CHILDREN */});
  }, [currentUser, refreshTrigger]);

  // Gestion de la session (12h auto-logout & alerte 5 min avant)
  const [remainingSeconds, setRemainingSeconds] = useState(null);
  const [showWarning, setShowWarning] = useState(false);
  const [logoutNotice, setLogoutNotice] = useState(null);

  const activeRole = currentUser?.role || null;

  const handleDataChanged = () => setRefreshTrigger(p => p + 1);

  const handleLoginSuccess = (user, token) => {
    setCurrentUser(user);
    setLogoutNotice(null);
    const now = Date.now();
    try {
      localStorage.setItem('nova_user', JSON.stringify(user));
      localStorage.setItem('nova_token', token);
      localStorage.setItem('nova_session_start', now.toString());
    } catch (e) { console.error(e); }
    setRemainingSeconds(Math.floor(SESSION_DURATION_MS / 1000));
    setShowWarning(false);
  };

  const handleLogout = (reason = null) => {
    setCurrentUser(null);
    setIsRegisteringChild(false);
    setShowWarning(false);
    setRemainingSeconds(null);
    try {
      localStorage.removeItem('nova_user');
      localStorage.removeItem('nova_token');
      localStorage.removeItem('nova_session_start');
    } catch (e) { console.error(e); }

    if (reason === 'SESSION_EXPIRED') {
      setLogoutNotice('Votre session a expiré après 12 heures d\'activité continue. Vous avez été déconnecté automatiquement conformément aux règles de protection des données de santé (INADP Loi 2004-63). Veuillez vous ré-authentifier.');
    } else {
      setLogoutNotice(null);
    }
  };

  // Prolonger la session de 12 heures
  const handleExtendSession = () => {
    const now = Date.now();
    try {
      localStorage.setItem('nova_session_start', now.toString());
    } catch (e) { console.error(e); }
    setRemainingSeconds(Math.floor(SESSION_DURATION_MS / 1000));
    setShowWarning(false);
  };

  // Surveillance continue du délai de session (12h et avertissement 5 min)
  useEffect(() => {
    if (!currentUser) return;

    const checkSession = () => {
      let sessionStart = parseInt(localStorage.getItem('nova_session_start') || '0', 10);
      if (!sessionStart) {
        sessionStart = Date.now();
        localStorage.setItem('nova_session_start', sessionStart.toString());
      }

      const elapsed = Date.now() - sessionStart;
      const remainingMs = SESSION_DURATION_MS - elapsed;

      if (remainingMs <= 0) {
        // Expiration atteinte (12h écoulées) -> Déconnexion automatique
        handleLogout('SESSION_EXPIRED');
      } else {
        const secsLeft = Math.floor(remainingMs / 1000);
        setRemainingSeconds(secsLeft);

        // Avertissement déclenché si le temps restant est inférieur ou égal à 5 minutes (300 secondes)
        if (remainingMs <= SESSION_WARNING_MS) {
          setShowWarning(true);
        } else {
          setShowWarning(false);
        }
      }
    };

    // Exécuter immédiatement puis toutes les secondes
    checkSession();
    const interval = setInterval(checkSession, 1000);

    return () => clearInterval(interval);
  }, [currentUser]);

  if (!currentUser) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} logoutNotice={logoutNotice} />;
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#F7FAFC' }}>
      {/* Alerte flottante & modale 5 minutes avant la déconnexion automatique (12h) */}
      {showWarning && remainingSeconds !== null && (
        <SessionExpiryNotifier
          remainingSeconds={remainingSeconds}
          onExtendSession={handleExtendSession}
          onLogout={() => handleLogout()}
        />
      )}

      <Sidebar
        activeRole={activeRole}
        activeChild={activeChild}
        enfantsList={enfantsList}
        onSelectChild={setActiveChild}
        currentUser={currentUser}
        onLogout={() => handleLogout()}
        onOpenInscription={activeRole === 'FAMILLE' ? () => setIsRegisteringChild(true) : undefined}
        remainingSeconds={remainingSeconds}
      />

      <main style={{ flex: 1, padding: '32px 40px 48px', overflowY: 'auto', minHeight: '100vh' }}>
          {isRegisteringChild ? (
            <div style={{ maxWidth: 840, margin: '0 auto' }} className="fade-in">
              <div style={{ marginBottom: 16 }}>
                <button
                  type="button"
                  onClick={() => setIsRegisteringChild(false)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    background: 'white',
                    border: '1.5px solid #cbd5e1',
                    borderRadius: 10,
                    padding: '8px 16px',
                    color: '#1e293b',
                    fontWeight: 700,
                    fontSize: '.85rem',
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                    transition: 'all .18s ease'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#2563eb'; e.currentTarget.style.color = '#2563eb'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.color = '#1e293b'; }}
                >
                  <ArrowLeft size={16} /> ← Retour à mon espace
                </button>
              </div>
              <InscriptionEnfant
                onEnfantAjoute={(newChild) => {
                  setActiveChild(newChild);
                  handleDataChanged();
                  setTimeout(() => setIsRegisteringChild(false), 2000);
                }}
              />
            </div>
          ) : (
            <>
              {activeRole === 'ENSEIGNANT' && (
                <EspaceEnseignant
                  child={activeChild}
                  onObservationAdded={handleDataChanged}
                  refreshTrigger={refreshTrigger}
                  user={currentUser}
                />
              )}
              {activeRole === 'FAMILLE' && (
                <EspaceFamille
                  child={activeChild}
                  onObservationAdded={handleDataChanged}
                  refreshTrigger={refreshTrigger}
                  user={currentUser}
                  onEnfantAjoute={(newChild) => {
                    setActiveChild(newChild);
                    handleDataChanged();
                  }}
                />
              )}
              {activeRole === 'SPECIALISTE' && (
                <EspaceSpecialiste
                  child={activeChild}
                  refreshTrigger={refreshTrigger}
                  user={currentUser}
                />
              )}
            </>
          )}
      </main>
    </div>
  );
}
