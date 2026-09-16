import React from 'react';
import { 
  GraduationCap, 
  HeartHandshake, 
  Gamepad2, 
  Stethoscope, 
  ShieldCheck, 
  Sparkles,
  RefreshCw,
  UserCheck
} from 'lucide-react';

export default function DemoTopBar({ activeRole, setActiveRole, activeChild, onResetDemo }) {
  const roles = [
    {
      id: 'ENSEIGNANT',
      label: 'Espace Enseignant',
      sublabel: 'Mme Dupuis (École)',
      icon: GraduationCap,
      color: '#2563eb',
      bgActive: '#eff6ff',
      borderActive: '#3b82f6'
    },
    {
      id: 'PARENT',
      label: 'Espace Parent',
      sublabel: 'Sophie M. (Maison)',
      icon: HeartHandshake,
      color: '#059669',
      bgActive: '#ecfdf5',
      borderActive: '#10b981'
    },
    {
      id: 'ENFANT',
      label: 'Espace Enfant',
      sublabel: 'Léo (Jeu adaptatif)',
      icon: Gamepad2,
      color: '#d97706',
      bgActive: '#fffbeb',
      borderActive: '#f59e0b'
    },
    {
      id: 'SPECIALISTE',
      label: 'Espace Spécialiste',
      sublabel: 'Dr. Laurent (Synthèse)',
      icon: Stethoscope,
      color: '#7c3aed',
      bgActive: '#f5f3ff',
      borderActive: '#8b5cf6'
    }
  ];

  return (
    <header style={{
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(10px)',
      borderBottom: '1px solid #e2e8f0',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
    }}>
      {/* Bandeau Hackathon Pitch */}
      <div style={{
        background: 'linear-gradient(90deg, #1e293b 0%, #0f172a 100%)',
        color: 'white',
        padding: '6px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '0.8rem',
        letterSpacing: '0.02em'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ 
            background: 'linear-gradient(135deg, #38bdf8, #818cf8)', 
            padding: '2px 8px', 
            borderRadius: '4px', 
            fontWeight: 800, 
            fontSize: '0.75rem',
            color: '#0f172a'
          }}>
            HACKATHON DEMO
          </span>
          <span style={{ color: '#cbd5e1' }}>
            Scénario Démo Jury : <strong>Enseignant ➔ Parent ➔ Enfant (Jeu) ➔ Spécialiste (Profil Explicable)</strong>
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#86efac' }}>
            <ShieldCheck size={15} />
            <span>Consentement RGPD Actif</span>
          </div>
          <button 
            onClick={onResetDemo}
            title="Réinitialiser le cas démo"
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: '#e2e8f0',
              padding: '2px 8px',
              borderRadius: '6px',
              fontSize: '0.75rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <RefreshCw size={12} />
            Recharger Cas Démo
          </button>
        </div>
      </div>

      {/* Main Header & Role Switcher */}
      <div className="container" style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '15px' }}>
        {/* Brand & Active Child */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              boxShadow: '0 4px 12px rgba(37,99,235,0.3)'
            }}>
              <Sparkles size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.1 }}>NOVA</h1>
                <span style={{ fontSize: '0.7rem', color: '#2563eb', background: '#eff6ff', padding: '1px 6px', borderRadius: '10px', fontWeight: 700 }}>v1.0</span>
              </div>
              <p style={{ fontSize: '0.75rem', color: '#64748b' }}>Détection précoce & collaborative</p>
            </div>
          </div>

          <div style={{
            height: '32px',
            width: '1px',
            background: '#e2e8f0',
            margin: '0 4px'
          }} />

          {/* Enfant Actif Badge */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            padding: '6px 12px',
            borderRadius: '10px'
          }}>
            <UserCheck size={16} color="#2563eb" />
            <div style={{ fontSize: '0.85rem' }}>
              <span style={{ fontWeight: 700, color: '#1e293b' }}>{activeChild?.prenom || 'Léo'} {activeChild?.nom_anonyme ? `(${activeChild.nom_anonyme})` : 'M.'}</span>
              <span style={{ color: '#64748b', marginLeft: '6px' }}>• {activeChild?.age || 7} ans, {activeChild?.niveau_scolaire || 'CE1'}</span>
            </div>
          </div>
        </div>

        {/* 4 Multi-Actor Switcher Buttons */}
        <div style={{
          display: 'flex',
          background: '#f1f5f9',
          padding: '4px',
          borderRadius: '14px',
          gap: '4px',
          border: '1px solid #e2e8f0'
        }}>
          {roles.map((role) => {
            const Icon = role.icon;
            const isActive = activeRole === role.id;
            return (
              <button
                key={role.id}
                onClick={() => setActiveRole(role.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 14px',
                  borderRadius: '10px',
                  border: isActive ? `1px solid ${role.borderActive}` : '1px solid transparent',
                  background: isActive ? '#ffffff' : 'transparent',
                  boxShadow: isActive ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  textAlign: 'left'
                }}
              >
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '8px',
                  background: isActive ? role.bgActive : '#e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Icon size={16} color={isActive ? role.color : '#64748b'} />
                </div>
                <div>
                  <div style={{
                    fontSize: '0.82rem',
                    fontWeight: isActive ? 700 : 600,
                    color: isActive ? '#0f172a' : '#475569'
                  }}>
                    {role.label}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                    {role.sublabel}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
