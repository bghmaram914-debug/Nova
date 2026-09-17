import React, { useState } from 'react';
import DemoTopBar from './components/DemoTopBar';
import LoginPage from './components/LoginPage';
import EspaceEnseignant from './components/EspaceEnseignant';
import EspaceFamille from './components/EspaceFamille';
import EspaceSpecialiste from './components/EspaceSpecialiste';
import InscriptionEnfant from './components/InscriptionEnfant';
import { ArrowLeft } from 'lucide-react';

const ACTIVE_CHILD = {
  id: 'e1111111-1111-1111-1111-111111111111',
  prenom: 'Youssef',
  nom_anonyme: 'Youssef B.',
  code_identifiant: 'TN-NOVA-2026-084',
  age: 7,
  niveau_scolaire: '2ème Année Primaire',
  etablissement: 'École Primaire Habib Bourguiba - Tunis'
};

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('nova_user');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });

  const [activeChild, setActiveChild] = useState(ACTIVE_CHILD);
  const [isRegisteringChild, setIsRegisteringChild] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const activeRole = currentUser?.role || null;

  const handleDataChanged = () => setRefreshTrigger(p => p + 1);

  const handleLoginSuccess = (user, token) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('nova_user', JSON.stringify(user));
      localStorage.setItem('nova_token', token);
    } catch (e) { console.error(e); }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsRegisteringChild(false);
    try {
      localStorage.removeItem('nova_user');
      localStorage.removeItem('nova_token');
    } catch (e) { console.error(e); }
  };

  if (!currentUser) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <DemoTopBar
        activeRole={activeRole}
        activeChild={activeChild}
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenInscription={() => setIsRegisteringChild(true)}
      />

      <main style={{ flex: 1, padding: '28px 0 48px' }}>
        <div className="container">
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
        </div>
      </main>

      <footer style={{
        borderTop: '1px solid var(--border)',
        padding: '18px 0',
        background: 'var(--surface)',
      }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <span style={{ fontSize: '.82rem', color: 'var(--text-sub)' }}>
            <strong style={{ color: '#1d4ed8', fontWeight: 800 }}>NOVA TUNISIE</strong>
            {' '}· Observatoire National & Suivi Pédopsychologique — TSA · TDAH · Dys
          </span>
          <span style={{ fontSize: '.78rem', color: 'var(--text-muted)' }}>
            Conforme Loi INADP n° 2004-63 (Tunisie) · Protection des Données Personnelles
          </span>
        </div>
      </footer>
    </div>
  );
}

