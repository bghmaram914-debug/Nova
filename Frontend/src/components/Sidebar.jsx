import React, { useState, useRef, useEffect } from 'react';
import {
  GraduationCap, Users, Stethoscope, LogOut, HeartHandshake,
  Clock, UserCheck, Sparkles, ChevronDown, Check, Shield,
} from 'lucide-react';

const ROLE_META = {
  ENSEIGNANT:  { label: 'Enseignant',   color: '#17324D', bg: 'rgba(23,50,77,.08)',    icon: GraduationCap },
  FAMILLE:     { label: 'Famille',      color: '#58B6A9', bg: 'rgba(88,182,169,.10)',  icon: Users },
  SPECIALISTE: { label: 'Spécialiste',  color: '#3d9b8e', bg: 'rgba(61,155,142,.10)', icon: Stethoscope },
};

function formatChildName(child) {
  if (!child) return 'Enfant';
  const prenom = child.prenom || '';
  const nom    = child.nom_anonyme || '';
  return nom.toLowerCase().startsWith(prenom.toLowerCase()) ? nom : `${prenom} ${nom}`.trim();
}

function formatTime(secs) {
  if (secs == null) return null;
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  return h > 0 ? `${h}h ${String(m).padStart(2,'0')}m` : `${m}m ${String(s).padStart(2,'0')}s`;
}

export default function Sidebar({
  activeRole, activeChild, enfantsList = [], onSelectChild,
  currentUser, onLogout, onOpenInscription, remainingSeconds,
}) {
  const meta = ROLE_META[activeRole] || { label: 'NOVA', color: '#17324D', bg: 'rgba(23,50,77,.08)', icon: HeartHandshake };
  const RoleIcon = meta.icon;
  const [childOpen, setChildOpen] = useState(false);
  const dropRef = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setChildOpen(false); };
    if (childOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [childOpen]);

  const warningTime = remainingSeconds != null && remainingSeconds <= 300;

  return (
    <aside style={{
      width: 260,
      minWidth: 260,
      height: '100vh',
      position: 'sticky',
      top: 0,
      background: '#17324D',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* ── Logo ── */}
      <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid rgba(255,255,255,.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: 'linear-gradient(135deg, #58B6A9 0%, #B9DDF2 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(88,182,169,.35)', flexShrink: 0,
          }}>
            <HeartHandshake size={20} color="#17324D" />
          </div>
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#fff', letterSpacing: '-.02em', lineHeight: 1 }}>NOVA</div>
            <div style={{ fontSize: '.58rem', color: '#B9DDF2', letterSpacing: '.12em', fontWeight: 700 }}>TUNISIE · SANTÉ</div>
          </div>
        </div>
      </div>

      {/* ── Espace actif (rôle) ── */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,.06)' }}>
        <div style={{ fontSize: '.65rem', color: '#64748b', fontWeight: 700, letterSpacing: '.08em', marginBottom: 8, textTransform: 'uppercase' }}>Espace actif</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: 'rgba(88,182,169,.12)', borderRadius: 10, border: '1px solid rgba(88,182,169,.2)' }}>
          <RoleIcon size={16} color="#58B6A9" />
          <div>
            <div style={{ fontSize: '.84rem', fontWeight: 800, color: '#fff' }}>{meta.label}</div>
            <div style={{ fontSize: '.7rem', color: '#94a3b8' }}>{currentUser?.nom || 'Utilisateur'}</div>
          </div>
        </div>
      </div>

      {/* ── Sélecteur enfant ── */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,.06)' }} ref={dropRef}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ fontSize: '.65rem', color: '#94a3b8', fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase' }}>Enfant suivi</span>
          {enfantsList.length > 1 && (
            <span style={{ fontSize: '.62rem', background: 'rgba(255,255,255,.08)', padding: '1px 6px', borderRadius: 6, color: '#B9DDF2' }}>
              {enfantsList.length} profils
            </span>
          )}
        </div>

        <button
          onClick={() => enfantsList.length > 0 && setChildOpen(o => !o)}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 10,
            background: 'rgba(255,255,255,.06)',
            border: `1px solid ${childOpen ? 'rgba(88,182,169,.6)' : 'rgba(255,255,255,.1)'}`,
            borderRadius: 12, padding: '9px 12px',
            cursor: enfantsList.length > 0 ? 'pointer' : 'default',
            fontFamily: 'inherit', transition: 'all .18s ease',
            boxShadow: childOpen ? '0 0 0 3px rgba(88,182,169,.15)' : 'none'
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,.09)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,.06)'; }}
        >
          <div style={{
            width: 32, height: 32, borderRadius: 10,
            background: 'linear-gradient(135deg, #58B6A9 0%, #17324D 100%)',
            border: '1px solid rgba(88,182,169,.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#FFFF66', fontWeight: 900, fontSize: '.9rem',
            flexShrink: 0
          }}>
            {activeChild?.prenom ? activeChild.prenom.charAt(0).toUpperCase() : 'E'}
          </div>

          <div style={{ flex: 1, textAlign: 'left', minWidth: 0 }}>
            <div style={{ fontSize: '.86rem', fontWeight: 800, color: '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {formatChildName(activeChild)}
            </div>
            <div style={{ fontSize: '.7rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 4 }}>
              <span>{activeChild?.age ? `${activeChild.age} ans` : '—'}</span>
              <span>•</span>
              <span style={{ fontFamily: 'var(--font-mono)', color: '#B9DDF2' }}>{activeChild?.code_identifiant?.slice(-7) || '—'}</span>
            </div>
          </div>
          {enfantsList.length > 0 && (
            <ChevronDown size={14} color="#94a3b8" style={{ flexShrink: 0, transform: childOpen ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} />
          )}
        </button>

        {/* Dropdown enfants */}
        {childOpen && (
          <div style={{
            marginTop: 8, background: '#0d1e30', border: '1px solid rgba(88,182,169,.3)',
            borderRadius: 12, overflow: 'hidden',
            boxShadow: '0 12px 30px rgba(0,0,0,.45)',
            animation: 'fadeIn .14s ease',
          }}>
            {enfantsList.map(child => {
              const isActive = child.id === activeChild?.id;
              return (
                <button key={child.id} onClick={() => { onSelectChild?.(child); setChildOpen(false); }}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    width: '100%', padding: '10px 14px', border: 'none',
                    borderBottom: '1px solid rgba(255,255,255,.05)',
                    background: isActive ? 'rgba(88,182,169,.15)' : 'transparent',
                    cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
                    transition: 'background .1s',
                  }}
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,.06)'; }}
                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 26, height: 26, borderRadius: 8,
                      background: isActive ? '#58B6A9' : 'rgba(255,255,255,.1)',
                      color: isActive ? '#17324D' : '#ffffff',
                      fontWeight: 800, fontSize: '.75rem',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      {child.prenom ? child.prenom.charAt(0).toUpperCase() : 'E'}
                    </div>
                    <div>
                      <div style={{ fontSize: '.82rem', fontWeight: 700, color: isActive ? '#58B6A9' : '#e2e8f0' }}>{formatChildName(child)}</div>
                      <div style={{ fontSize: '.68rem', color: '#64748b' }}>{child.age} ans · {child.code_identifiant}</div>
                    </div>
                  </div>
                  {isActive && <Check size={14} color="#58B6A9" />}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Actions ── */}
      <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {onOpenInscription && (
          <button
            onClick={onOpenInscription}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              background: 'linear-gradient(135deg, rgba(88,182,169,.2) 0%, rgba(185,221,242,.12) 100%)',
              border: '1.5px solid rgba(88,182,169,.4)',
              color: '#B9DDF2', padding: '10px 14px', borderRadius: 12,
              fontSize: '.84rem', fontWeight: 800, cursor: 'pointer',
              fontFamily: 'inherit', transition: 'all .2s ease', width: '100%',
              boxShadow: '0 4px 12px rgba(0,0,0,.15)'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'linear-gradient(135deg, rgba(88,182,169,.32) 0%, rgba(185,221,242,.2) 100%)';
              e.currentTarget.style.borderColor = 'rgba(88,182,169,.7)';
              e.currentTarget.style.color = '#ffffff';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'linear-gradient(135deg, rgba(88,182,169,.2) 0%, rgba(185,221,242,.12) 100%)';
              e.currentTarget.style.borderColor = 'rgba(88,182,169,.4)';
              e.currentTarget.style.color = '#B9DDF2';
              e.currentTarget.style.transform = 'none';
            }}
          >
            <Sparkles size={15} color="#FFFF66" /> Inscrire un enfant
          </button>
        )}
      </div>

      {/* ── Spacer ── */}
      <div style={{ flex: 1 }} />

      {/* ── Bas : Session + Déconnexion ── */}
      <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,.08)', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {remainingSeconds != null && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px',
            background: warningTime ? 'rgba(220,38,38,.15)' : 'rgba(255,255,255,.05)',
            border: `1px solid ${warningTime ? 'rgba(220,38,38,.3)' : 'rgba(255,255,255,.08)'}`,
            borderRadius: 10,
          }}>
            <Clock size={14} color={warningTime ? '#f87171' : '#58B6A9'} />
            <div>
              <div style={{ fontSize: '.7rem', color: '#64748b' }}>Session active</div>
              <div style={{ fontSize: '.82rem', fontWeight: 700, color: warningTime ? '#f87171' : '#e2e8f0' }}>{formatTime(remainingSeconds)}</div>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px' }}>
          <Shield size={12} color="#475569" />
          <span style={{ fontSize: '.65rem', color: '#475569' }}>INADP Loi 2004-63</span>
        </div>

        <button onClick={onLogout} style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'transparent', border: '1px solid rgba(255,255,255,.1)',
          color: '#94a3b8', padding: '9px 14px', borderRadius: 10,
          fontSize: '.82rem', fontWeight: 600, cursor: 'pointer',
          fontFamily: 'inherit', transition: 'all .15s ease', width: '100%',
        }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(220,38,38,.1)'; e.currentTarget.style.color = '#f87171'; e.currentTarget.style.borderColor = 'rgba(220,38,38,.3)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.borderColor = 'rgba(255,255,255,.1)'; }}
        >
          <LogOut size={14} /> Déconnexion
        </button>
      </div>
    </aside>
  );
}
