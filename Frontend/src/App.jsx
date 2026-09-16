import React, { useState, useEffect } from 'react';
import DemoTopBar from './components/DemoTopBar';
import EspaceEnseignant from './components/EspaceEnseignant';
import EspaceParent from './components/EspaceParent';
import EspaceEnfant from './components/EspaceEnfant';
import EspaceSpecialiste from './components/EspaceSpecialiste';
import { Sparkles, Shield, HeartHandshake, Database } from 'lucide-react';

export default function App() {
  // Rôle actif pour la démo jury : 'ENSEIGNANT' | 'PARENT' | 'ENFANT' | 'SPECIALISTE'
  const [activeRole, setActiveRole] = useState('SPECIALISTE');
  const [activeChild, setActiveChild] = useState({
    id: 'e1111111-1111-1111-1111-111111111111',
    prenom: 'Léo',
    nom_anonyme: 'Léo M.',
    code_identifiant: 'NOVA-2026-084',
    age: 7,
    niveau_scolaire: 'CE1',
    etablissement: 'École Primaire Jules Ferry'
  });
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [backendStatus, setBackendStatus] = useState(null);

  useEffect(() => {
    // Vérifier l'état de l'API Backend
    fetch('http://localhost:5000/api/health')
      .then(res => res.json())
      .then(data => setBackendStatus(data))
      .catch(err => {
        console.warn('Backend non joignable :', err);
        setBackendStatus({ status: 'offline' });
      });
  }, [refreshTrigger]);

  const handleDataChanged = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleResetDemo = () => {
    fetch('http://localhost:5000/api/demo/reset', { method: 'POST' })
      .then(() => {
        handleDataChanged();
        setActiveRole('SPECIALISTE');
      })
      .catch(console.error);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Barre Démo Hackathon */}
      <DemoTopBar 
        activeRole={activeRole} 
        setActiveRole={setActiveRole} 
        activeChild={activeChild}
        onResetDemo={handleResetDemo}
      />

      {/* Contenu principal selon le rôle sélectionné */}
      <main className="container" style={{ flex: 1, paddingTop: '30px', paddingBottom: '30px' }}>
        {activeRole === 'ENSEIGNANT' && (
          <EspaceEnseignant 
            child={activeChild} 
            onObservationAdded={handleDataChanged}
            refreshTrigger={refreshTrigger}
          />
        )}

        {activeRole === 'PARENT' && (
          <EspaceParent 
            child={activeChild} 
            onObservationAdded={handleDataChanged}
            refreshTrigger={refreshTrigger}
          />
        )}

        {activeRole === 'ENFANT' && (
          <EspaceEnfant 
            child={activeChild} 
            onActivityCompleted={handleDataChanged}
          />
        )}

        {activeRole === 'SPECIALISTE' && (
          <EspaceSpecialiste 
            child={activeChild} 
            refreshTrigger={refreshTrigger}
          />
        )}
      </main>

      {/* Pied de page */}
      <footer style={{
        background: '#ffffff',
        borderTop: '1px solid #e2e8f0',
        padding: '20px 0',
        fontSize: '0.85rem',
        color: '#64748b'
      }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontWeight: 800, color: '#2563eb' }}>NOVA</span>
            <span>• Détection Précoce Collaborative & Explicable (TSA, TDAH, Dys)</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Shield size={14} color="#10b981" /> Respect RGPD & Consentement
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Database size={14} color="#2563eb" /> {backendStatus?.database?.mode || 'PostgreSQL'}
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
