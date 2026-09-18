import React, { useState, useRef, useEffect } from 'react';
import { GraduationCap, Users, Stethoscope, LogOut, HeartHandshake, Clock, UserCheck, Sparkles, ChevronDown, Check } from 'lucide-react';

const ROLE_MAP = {
  ENSEIGNANT:   { label: 'Espace Enseignant', color: '#17324D', bg: 'rgba(23,50,77,.07)',   icon: GraduationCap },
  FAMILLE:      { label: 'Espace Famille',    color: '#58B6A9', bg: 'rgba(88,182,169,.08)', icon: Users },
  SPECIALISTE:  { label: 'Pédopsychiatrie',   color: '#3d9b8e', bg: 'rgba(61,155,142,.08)', icon: Stethoscope },
};

function formatChildName(child) {
  if (!child) return 'Enfant';
  const prenom = child.prenom || '';
  const nom = child.nom_anonyme || '';
  if (nom.toLowerCase().startsWith(prenom.toLowerCase())) return nom;
  return `${prenom} ${nom}`.trim();
}

export default function DemoTopBar({ activeRole, activeChild, enfantsList = [], onSelectChild, currentUser, onLogout, onOpenInscription, remainingSeconds }) {
  const roleInfo = ROLE_MAP[activeRole] || { label: 'Espace Sécurisé', color: '#17324D', bg: 'rgba(23,50,77,.07)', icon: HeartHandshake };
  const Icon = roleInfo.icon;
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const formatHoursMinutes = (secs) => {
    if (secs == null) return null;
    const hours = Math.floor(secs / 3600);
    const minutes = Math.floor((secs % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes.toString().padStart(2, '0')}m`;
    const seconds = secs % 60;
    return `${minutes}m ${seconds.toString().padStart(2, '0')}s`;
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

  const handleSelect = (child) => {
    onSelectChild?.(child);
    setDropdownOpen(false);
  };

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      background: '#ffffff',
      borderBottom: '1px solid #e2e8f0',
      boxShadow: '0 1px 6px rgba(23,50,77,.05)',
    }}>
      <div className="container" style={{
        padding: '10px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        minHeight: 60,
      }}>

        {/* ── Gauche : Logo + Enfant sélecteur ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>

          {/* Logo NOVA */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'linear-gradient(135deg, #58B6A9 0%, #B9DDF2 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(88,182,169,.3)',
              flexShrink: 0,
            }}>
              <HeartHandshake size={20} color="white" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '1.15rem', fontWeight: 900, color: '#17324D', letterSpacing: '-.03em' }}>NOVA</span>
                <span style={{ fontSize: '.62rem', fontWeight: 800, color: '#58B6A9', background: 'rgba(88,182,169,.10)', padding: '1px 6px', borderRadius: 6 }}>TUNISIE</span>
              </div>
            </div>
          </div>

          <div style={{ width: 1, height: 26, background: '#e2e8f0' }} />

          {/* Sélecteur enfant actif */}
          <div ref={dropdownRef} style={{ position: 'relative' }}>
            <button
              onClick={() => enfantsList.length > 0 && setDropdownOpen(o => !o)}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                background: dropdownOpen ? '#f1f5f9' : 'rgba(23,50,77,.03)',
                border: dropdownOpen ? '1px solid #58B6A9' : '1px solid #e2e8f0',
                padding: '5px 10px 5px 12px', borderRadius: 10,
                cursor: enfantsList.length > 0 ? 'pointer' : 'default',
                transition: 'all .15s ease',
              }}
              onMouseEnter={e => { if (!dropdownOpen) e.currentTarget.style.borderColor = '#58B6A9'; }}
              onMouseLeave={e => { if (!dropdownOpen) e.currentTarget.style.borderColor = '#e2e8f0'; }}
            >
              <UserCheck size={15} color="#58B6A9" />
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '.84rem', fontWeight: 700, color: '#17324D', lineHeight: 1.2 }}>
                  {formatChildName(activeChild)}
                </div>
                <div style={{ fontSize: '.72rem', color: '#64748b', lineHeight: 1.2 }}>
                  {activeChild?.age || '—'} ans · {activeChild?.code_identifiant || '—'}
                </div>
              </div>
              {enfantsList.length > 0 && (
                <ChevronDown
                  size={14}
                  color="#64748b"
                  style={{ transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform .2s ease', marginLeft: 2 }}
                />
              )}
            </button>

            {/* Dropdown */}
            {dropdownOpen && (
              <div style={{
                position: 'absolute',
                top: 'calc(100% + 6px)',
                left: 0,
                minWidth: 220,
                background: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: 12,
                boxShadow: '0 8px 24px rgba(23,50,77,.12)',
                zIndex: 200,
                overflow: 'hidden',
                animation: 'fadeIn .12s ease',
              }}>
                {enfantsList.length === 0 ? (
                  <div style={{ padding: '12px 16px', fontSize: '.82rem', color: '#94a3b8' }}>Aucun enfant inscrit</div>
                ) : (
                  enfantsList.map(child => {
                    const isActive = child.id === activeChild?.id;
                    return (
                      <button
                        key={child.id}
                        onClick={() => handleSelect(child)}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          width: '100%', padding: '10px 14px',
                          background: isActive ? 'rgba(88,182,169,.08)' : 'transparent',
                          border: 'none',
                          borderBottom: '1px solid #f1f5f9',
                          cursor: 'pointer', textAlign: 'left',
                          transition: 'background .1s ease',
                          fontFamily: 'inherit',
                        }}
                        onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = '#f8fafc'; }}
                        onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                      >
                        <div>
                          <div style={{ fontSize: '.84rem', fontWeight: 700, color: isActive ? '#58B6A9' : '#17324D', lineHeight: 1.3 }}>
                            {formatChildName(child)}
                          </div>
                          <div style={{ fontSize: '.72rem', color: '#64748b', lineHeight: 1.3 }}>
                            {child.age} ans · {child.code_identifiant}
                          </div>
                        </div>
                        {isActive && <Check size={14} color="#58B6A9" />}
                      </button>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Droite : Session, Inscription, Rôle, Déconnexion ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>

          {/* Compteur session */}
          {remainingSeconds != null && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '5px',
              background: '#f1f5f9', border: '1px solid #e2e8f0',
              color: '#475569', padding: '5px 10px', borderRadius: 8,
              fontWeight: 600, fontSize: '.75rem',
            }}>
              <Clock size={13} color="#58B6A9" />
              <span>Session : {formatHoursMinutes(remainingSeconds)}</span>
            </div>
          )}

          {/* Inscrire enfant — FAMILLE uniquement */}
          {onOpenInscription && (
            <button
              onClick={onOpenInscription}
              style={{
                display: 'flex', alignItems: 'center', gap: '5px',
                background: 'rgba(88,182,169,.10)', border: '1px solid rgba(88,182,169,.3)',
                color: '#3d9b8e', padding: '6px 12px', borderRadius: 8,
                fontSize: '.8rem', fontWeight: 700, cursor: 'pointer',
                transition: 'all .15s ease', fontFamily: 'inherit',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(88,182,169,.18)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(88,182,169,.10)'; }}
            >
              <Sparkles size={13} color="#3d9b8e" /> + Inscrire un enfant
            </button>
          )}

          {/* Badge rôle */}
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
              transition: 'all .15s ease', fontFamily: 'inherit',
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
