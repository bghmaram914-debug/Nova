import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle, RefreshCw, LogOut, ShieldAlert, X } from 'lucide-react';

export default function SessionExpiryNotifier({ remainingSeconds, onExtendSession, onLogout }) {
  const [isMinimized, setIsMinimized] = useState(false);

  // Formater les secondes restantes en MM:SS
  const formatTime = (secs) => {
    const minutes = Math.floor(Math.max(0, secs) / 60);
    const seconds = Math.floor(Math.max(0, secs) % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  if (remainingSeconds <= 0) return null;

  if (isMinimized) {
    return (
      <aside 
        aria-label="Avertissement d'expiration de session"
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 9999,
          background: '#b91c1c',
          color: 'white',
          padding: '10px 18px',
          borderRadius: 30,
          boxShadow: '0 8px 24px rgba(185, 28, 28, 0.4)',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          cursor: 'pointer',
          animation: 'pulse 2s infinite',
          border: '2px solid #fca5a5',
          fontFamily: 'inherit',
        }}
        onClick={() => setIsMinimized(false)}
      >
        <AlertTriangle size={18} />
        <span style={{ fontWeight: 800, fontSize: '.88rem' }}>
          Session expire dans : {formatTime(remainingSeconds)}
        </span>
        <span style={{ fontSize: '.75rem', background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: 12 }}>
          Agrandir
        </span>
      </aside>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(6px)',
      zIndex: 99999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16,
    }}>
      <div 
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="session-warning-title"
        aria-describedby="session-warning-desc"
        style={{
          background: 'white',
          borderRadius: 20,
          maxWidth: 520,
          width: '100%',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          border: '2px solid #ef4444',
          overflow: 'hidden',
          animation: 'scaleIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Header d'alerte */}
        <div style={{
          background: 'linear-gradient(135deg, #b91c1c 0%, #dc2626 100%)',
          color: 'white',
          padding: '20px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              background: 'rgba(255,255,255,0.2)',
              padding: 10,
              borderRadius: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <ShieldAlert size={26} color="white" />
            </div>
            <div>
              <h2 id="session-warning-title" style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, letterSpacing: '-0.01em' }}>
                Sécurité & Expiration de Session
              </h2>
              <p style={{ margin: 0, fontSize: '.78rem', color: '#fecaca', fontWeight: 500 }}>
                Conformité INADP Loi 2004-63 · Déconnexion automatique (12h)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsMinimized(true)}
            aria-label="Réduire l'alerte d'expiration"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              padding: 6,
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: 0.8,
            }}
            title="Réduire l'alerte"
          >
            <X size={20} />
          </button>
        </div>

        {/* Corps de l'alerte */}
        <div style={{ padding: '24px' }}>
          {/* Compteur animé */}
          <div style={{
            background: '#fef2f2',
            border: '1.5px solid #fecaca',
            borderRadius: 16,
            padding: '16px 20px',
            textAlign: 'center',
            marginBottom: 20,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, color: '#991b1b', marginBottom: 6 }}>
              <Clock size={20} className="animate-spin-slow" />
              <span style={{ fontSize: '.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Temps restant avant déconnexion
              </span>
            </div>
            <div style={{
              fontSize: '2.5rem',
              fontWeight: 900,
              color: '#dc2626',
              fontFamily: 'monospace',
              letterSpacing: '2px',
            }}>
              {formatTime(remainingSeconds)}
            </div>
            <div style={{ fontSize: '.8rem', color: '#7f1d1d', marginTop: 4, fontWeight: 500 }}>
              Moins de 5 minutes avant la clôture automatique de votre session.
            </div>
          </div>

          <p id="session-warning-desc" style={{ color: '#334155', fontSize: '.9rem', lineHeight: 1.5, margin: '0 0 24px' }}>
            Par mesure de sécurité médicale et de protection des données de santé infantile, toute session active est automatiquement fermée après <strong>12 heures</strong> consécutives.
            <br /><br />
            Pour continuer à travailler sans interruption et préserver vos saisies en cours, cliquez sur <strong>« Prolonger ma session »</strong>.
          </p>

          {/* Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button
              type="button"
              onClick={onExtendSession}
              style={{
                background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                color: 'white',
                border: 'none',
                padding: '14px 20px',
                borderRadius: 12,
                fontWeight: 800,
                fontSize: '.95rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                boxShadow: '0 4px 14px rgba(37,99,235,0.3)',
                transition: 'all 0.18s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <RefreshCw size={18} /> Prolonger ma session de 12 heures
            </button>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                type="button"
                onClick={() => setIsMinimized(true)}
                style={{
                  flex: 1,
                  background: '#f1f5f9',
                  color: '#475569',
                  border: '1px solid #cbd5e1',
                  padding: '11px 16px',
                  borderRadius: 10,
                  fontWeight: 600,
                  fontSize: '.85rem',
                  cursor: 'pointer',
                }}
              >
                Réduire (Me rappeler)
              </button>
              
              <button
                type="button"
                onClick={onLogout}
                style={{
                  flex: 1,
                  background: '#fff1f2',
                  color: '#be123c',
                  border: '1px solid #fecdd3',
                  padding: '11px 16px',
                  borderRadius: 10,
                  fontWeight: 700,
                  fontSize: '.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                }}
              >
                <LogOut size={15} /> Déconnexion
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
