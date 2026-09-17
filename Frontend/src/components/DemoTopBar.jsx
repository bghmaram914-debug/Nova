import React from 'react';
import { GraduationCap, Users, Stethoscope, LogOut, HeartHandshake, Clock, UserCheck, Sparkles } from 'lucide-react';

const ROLE_MAP = {
  ENSEIGNANT:   { label: 'Espace Enseignant', color: '#1d4ed8', bg: '#eff6ff', icon: GraduationCap },
  FAMILLE:      { label: 'Espace Famille',   color: '#7c3aed', bg: '#f5f3ff', icon: Users },
  SPECIALISTE:  { label: 'Pédopsychiatrie',  color: '#0d9488', bg: '#f0fdfa', icon: Stethoscope },
};

export default function DemoTopBar({ activeRole, activeChild, currentUser, onLogout, onOpenInscription, remainingSeconds }) {
  const roleInfo = ROLE_MAP[activeRole] || { label: 'Espace Sécurisé', color: '#2563eb', bg: '#eff6ff', icon: HeartHandshake };
  const Icon = roleInfo.icon;

  const formatHoursMinutes = (secs) => {
    if (secs == null) return null;
    const hours = Math.floor(secs / 3600);
    const minutes = Math.floor((secs % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes.toString().padStart(2, '0')}m`;
    const seconds = secs % 60;
    return `${minutes}m ${seconds.toString().padStart(2, '0')}s`;
  };

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      background: '#ffffff',
      borderBottom: '1px solid #e2e8f0',
      boxShadow: '0 2px 8px rgba(15,23,42,.03)',
    }}>
      <div className="container" style={{
        padding: '10px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        minHeight: 60,
      }}>
        {/* Logo & Patient sélectionné */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(37,99,235,.2)',
              flexShrink: 0,
            }}>
              <HeartHandshake size={20} color="white" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-.03em' }}>NOVA</span>
                <span style={{ fontSize: '.65rem', fontWeight: 800, color: '#0284c7', background: '#e0f2fe', padding: '1px 6px', borderRadius: 6 }}>TUNISIE</span>
              </div>
            </div>
          </div>

          <div style={{ width: 1, height: 26, background: '#e2e8f0' }} />

          {/* Badge Enfant Actif */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: '#f8fafc', border: '1px solid #e2e8f0',
            padding: '4px 12px', borderRadius: 10,
          }}>
            <UserCheck size={15} color="#2563eb" />
            <span style={{ fontSize: '.84rem', fontWeight: 700, color: '#1e293b' }}>
              {activeChild?.prenom || 'Youssef'} {activeChild?.nom_anonyme || ''}
            </span>
            <span style={{ fontSize: '.75rem', color: '#64748b' }}>
              ({activeChild?.age || 7} ans · {activeChild?.code_identifiant || 'TN-NOVA-2026-084'})
            </span>
          </div>
        </div>

        {/* Contrôles droits (Session, Rôle, Inscription, Déconnexion) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Compteur de session */}
          {remainingSeconds != null && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              background: '#f1f5f9',
              border: '1px solid #e2e8f0',
              color: '#475569',
              padding: '5px 10px',
              borderRadius: 8,
              fontWeight: 600,
              fontSize: '.75rem',
            }}>
              <Clock size={13} color="#2563eb" />
              <span>Session : {formatHoursMinutes(remainingSeconds)}</span>
            </div>
          )}

          {/* Bouton Inscrire un enfant */}
          {onOpenInscription && (
            <button
              onClick={onOpenInscription}
              style={{
                display: 'flex', alignItems: 'center', gap: '5px',
                background: '#ecfdf5', border: '1px solid #a7f3d0',
                color: '#059669', padding: '6px 12px', borderRadius: 8,
                fontSize: '.8rem', fontWeight: 700, cursor: 'pointer',
              }}
            >
              <Sparkles size={13} color="#059669" /> + Inscrire un enfant
            </button>
          )}

          {/* Badge Rôle utilisateur */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: roleInfo.bg,
            border: `1px solid ${roleInfo.color}30`,
            padding: '5px 12px', borderRadius: 8,
          }}>
            <Icon size={14} color={roleInfo.color} />
            <span style={{ fontSize: '.8rem', fontWeight: 700, color: roleInfo.color }}>
              {currentUser?.nom || roleInfo.label}
            </span>
          </div>

          {/* Déconnexion */}
          <button
            onClick={onLogout}
            style={{
              display: 'flex', alignItems: 'center', gap: '5px',
              background: 'white', border: '1px solid #cbd5e1',
              color: '#64748b', padding: '6px 12px', borderRadius: 8,
              fontSize: '.8rem', fontWeight: 700, cursor: 'pointer',
              transition: 'all .15s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = '#dc2626'; e.currentTarget.style.borderColor = '#fca5a5'; e.currentTarget.style.background = '#fef2f2'; }}
            onMouseLeave={e => { e.currentTarget.style.color = '#64748b'; e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.background = 'white'; }}
          >
            <LogOut size={13} /> Déconnexion
          </button>
        </div>
      </div>
    </header>
  );
}
