import React from 'react';
import { GraduationCap, Users, Stethoscope, ShieldCheck, Sparkles, LogOut, UserCheck, HeartHandshake } from 'lucide-react';

const ROLE_MAP = {
  ENSEIGNANT:   { label: 'Espace Éducatif & Enseignant', color: '#1d4ed8', bg: '#eff6ff', icon: GraduationCap },
  FAMILLE:      { label: 'Espace Parental & Entourage',  color: '#7c3aed', bg: '#f5f3ff', icon: Users },
  SPECIALISTE:  { label: 'Espace Pédopsychiatrique & Clinique', color: '#0d9488', bg: '#f0fdfa', icon: Stethoscope },
};

export default function DemoTopBar({ activeRole, activeChild, currentUser, onLogout }) {
  const roleInfo = ROLE_MAP[activeRole] || {};
  const Icon = roleInfo.icon;

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      background: 'rgba(255,255,255,.98)',
      backdropFilter: 'blur(14px)',
      borderBottom: '1px solid #e2e8f0',
      boxShadow: '0 4px 12px rgba(15,23,42,.04)',
    }}>
      {/* Bandeau Institutionnel République Tunisienne */}
      <div style={{
        background: 'linear-gradient(90deg, #0f172a 0%, #1e1b4b 100%)',
        color: 'white',
        padding: '6px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '.78rem' }}>
          <span style={{
            background: 'linear-gradient(135deg, #e11d48, #be123c)',
            color: 'white',
            padding: '2px 9px',
            borderRadius: '4px',
            fontWeight: 800,
            fontSize: '.72rem',
            letterSpacing: '.04em',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
          }}>
            🇹🇳 RÉPUBLIQUE TUNISIENNE
          </span>
          <span style={{ color: '#cbd5e1', fontWeight: 500 }}>
            Ministère de la Santé Publique & Ministère de l'Éducation · <strong style={{ color: 'white' }}>Observatoire des Troubles Neurodéveloppementaux (TND)</strong>
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '.78rem' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#6ee7b7', fontWeight: 600 }}>
            <ShieldCheck size={14} /> Cadre Légal INADP (Loi 2004-63)
          </span>
          <span style={{ color: '#94a3b8', fontSize: '.75rem' }}>
            Portail National de Santé Infantile
          </span>
        </div>
      </div>

      {/* Barre de navigation principale */}
      <div className="container" style={{ padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
        {/* Logo & Identité Visuelle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12,
              background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(37,99,235,.25)',
              flexShrink: 0,
            }}>
              <HeartHandshake size={22} color="white" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-.03em' }}>NOVA</span>
                <span style={{ fontSize: '.68rem', fontWeight: 800, color: '#0284c7', background: '#e0f2fe', padding: '2px 8px', borderRadius: 99 }}>TUNISIE</span>
              </div>
              <div style={{ fontSize: '.72rem', color: '#64748b', fontWeight: 500, lineHeight: 1 }}>Détection précoce & Pédopsychologie collaborative</div>
            </div>
          </div>

          <div style={{ width: 1, height: 32, background: '#e2e8f0', margin: '0 4px' }} />

          {/* Badge Élève / Enfant suivi */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '9px',
            background: '#f8fafc', border: '1.5px solid #e2e8f0',
            padding: '6px 14px', borderRadius: 12,
          }}>
            <UserCheck size={16} color="#2563eb" />
            <div>
              <span style={{ fontSize: '.84rem', fontWeight: 800, color: '#1e293b' }}>
                {activeChild?.prenom || 'Youssef'} {activeChild?.nom_anonyme || ''}
              </span>
              <span style={{ fontSize: '.76rem', color: '#64748b', marginLeft: 6 }}>
                · {activeChild?.age || 7} ans, {activeChild?.niveau_scolaire || '2ème Année Primaire'}
              </span>
            </div>
          </div>
        </div>

        {/* Côté droit: Rôle actif & Déconnexion */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {Icon && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              background: roleInfo.bg,
              border: `1.5px solid ${roleInfo.color}35`,
              padding: '6px 14px', borderRadius: 12,
            }}>
              <div style={{
                width: 28, height: 28, borderRadius: 8,
                background: roleInfo.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: `0 2px 6px ${roleInfo.color}40`,
              }}>
                <Icon size={15} color="white" />
              </div>
              <div>
                <div style={{ fontSize: '.82rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>{roleInfo.label}</div>
                <div style={{ fontSize: '.7rem', color: '#64748b', fontWeight: 600 }}>{currentUser?.nom || 'Session sécurisée'}</div>
              </div>
            </div>
          )}

          <button
            onClick={onLogout}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              background: '#white', border: '1.5px solid #cbd5e1',
              color: '#475569', padding: '8px 14px', borderRadius: 10,
              fontSize: '.82rem', fontWeight: 700, cursor: 'pointer',
              transition: 'all .18s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = '#dc2626'; e.currentTarget.style.borderColor = '#fca5a5'; e.currentTarget.style.background = '#fef2f2'; }}
            onMouseLeave={e => { e.currentTarget.style.color = '#475569'; e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.background = 'white'; }}
          >
            <LogOut size={14} /> Déconnexion
          </button>
        </div>
      </div>
    </header>
  );
}
