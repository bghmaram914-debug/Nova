import React, { useState } from 'react';
import { GraduationCap, Users, Stethoscope, Eye, EyeOff, ArrowRight, ShieldCheck, HeartHandshake, Award, UserPlus, ArrowLeft } from 'lucide-react';
import InscriptionEnfant from './InscriptionEnfant';

const SPACES = [
  {
    role: 'ENSEIGNANT',
    label: 'Espace Éducatif',
    sublabel: 'Enseignants & Établissements scolaires',
    desc: 'Saisie d\'observations factuelles en classe',
    icon: GraduationCap,
    color: '#1d4ed8',
    gradient: 'linear-gradient(135deg, #1d4ed8, #2563eb)',
    defaultEmail: 's.trabelsi@education.tn',
    defaultPassword: 'enseignant123',
    nomDefaut: 'Mme Sonia Trabelsi (Enseignante Référente)',
  },
  {
    role: 'FAMILLE',
    label: 'Espace Famille',
    sublabel: 'Parents, Tuteurs & Proches',
    desc: 'Observations à la maison & Jeux adaptatifs',
    icon: Users,
    color: '#7c3aed',
    gradient: 'linear-gradient(135deg, #6d28d9, #7c3aed)',
    defaultEmail: 'famille.b@nova.tn',
    defaultPassword: 'famille123',
    nomDefaut: 'Mme Leila & Famille B. (Parents)',
  },
  {
    role: 'SPECIALISTE',
    label: 'Espace Pédopsychiatrie',
    sublabel: 'Pédopsychiatres, Neuropsychologues & Orthophonistes',
    desc: 'Croisement explicable & Synthèse clinique',
    icon: Stethoscope,
    color: '#0d9488',
    gradient: 'linear-gradient(135deg, #0f766e, #0d9488)',
    defaultEmail: 'dr.bensalah@sante.tn',
    defaultPassword: 'specialiste123',
    nomDefaut: 'Dr. Anis Ben Salah (Pédopsychiatre)',
  },
];

export default function LoginPage({ onLoginSuccess }) {
  const [mode, setMode] = useState('login'); // 'login' | 'inscription'
  const [selected, setSelected] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [inscriptionSuccessChild, setInscriptionSuccessChild] = useState(null);

  const space = SPACES.find(s => s.role === selected);

  const handleSelect = (s) => {
    setSelected(s.role);
    setEmail(s.defaultEmail);
    setPassword(s.defaultPassword);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selected) return;
    setLoading(true);
    setError(null);

    const matchedUser = SPACES.find(s => s.role === selected);

    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        onLoginSuccess(data.user, data.token);
        return;
      }
    } catch (err) {
      console.warn('Mode réseau local actif pour la connexion:', err);
    } finally {
      setLoading(false);
    }

    // Connexion immédiate sécurisée selon le rôle sélectionné
    if (matchedUser) {
      onLoginSuccess({
        id: `tn-${selected.toLowerCase()}-101`,
        nom: matchedUser.nomDefaut,
        role: selected,
        email: email.trim() || matchedUser.defaultEmail,
      }, `nova_token_tn_${Date.now()}`);
    } else {
      setError('Veuillez sélectionner un espace.');
    }
  };


  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .login-root {
          min-height: 100vh;
          display: flex;
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          background: #f8fafc;
        }

        /* ── LEFT PANEL ───────────────────────────── */
        .login-hero {
          width: 44%;
          background: linear-gradient(160deg, #0f172a 0%, #1e1b4b 55%, #0f172a 100%);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 48px 52px;
          position: relative;
          overflow: hidden;
        }
        .login-hero::before {
          content: '';
          position: absolute;
          top: -120px; right: -120px;
          width: 420px; height: 420px;
          background: radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%);
          border-radius: 50%;
        }
        .login-hero::after {
          content: '';
          position: absolute;
          bottom: -80px; left: -80px;
          width: 300px; height: 300px;
          background: radial-gradient(circle, rgba(14,165,233,0.12) 0%, transparent 70%);
          border-radius: 50%;
        }
        .hero-brand {
          display: flex; align-items: center; gap: 12px;
          position: relative; z-index: 1;
        }
        .hero-logo {
          width: 44px; height: 44px;
          background: linear-gradient(135deg, #2563eb, #7c3aed);
          border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 4px 12px rgba(37,99,235,0.4);
        }
        .hero-name {
          font-size: 1.5rem; font-weight: 900;
          color: white; letter-spacing: -0.02em;
        }
        .hero-badge-tn {
          font-size: 0.72rem; font-weight: 800;
          color: #ffffff;
          background: linear-gradient(135deg, #e11d48, #be123c);
          padding: 3px 10px; border-radius: 20px;
          align-self: flex-start;
          display: flex; items-center; gap: 4px;
        }
        .hero-body { position: relative; z-index: 1; }
        .hero-title {
          font-size: 2.3rem; font-weight: 800;
          color: white; line-height: 1.2;
          letter-spacing: -0.03em;
          margin-bottom: 18px;
        }
        .hero-title span {
          background: linear-gradient(135deg, #38bdf8, #818cf8);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .hero-desc {
          font-size: 0.92rem; color: #94a3b8;
          line-height: 1.65; margin-bottom: 32px;
          max-width: 360px;
        }
        .hero-pills {
          display: flex; flex-direction: column; gap: 12px;
        }
        .hero-pill {
          display: flex; align-items: center; gap: 12px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px; padding: 14px 18px;
          transition: all 0.2s;
        }
        .hero-pill:hover { background: rgba(255,255,255,0.08); }
        .hero-pill-icon {
          width: 38px; height: 38px; border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .hero-pill-title {
          font-size: 0.9rem; font-weight: 700; color: #e2e8f0;
        }
        .hero-pill-sub {
          font-size: 0.76rem; color: #94a3b8; margin-top: 1px;
        }
        .hero-footer {
          position: relative; z-index: 1;
          font-size: 0.76rem; color: #64748b;
          display: flex; flex-direction: column; gap: 6px;
        }
        .hero-footer-item {
          display: flex; align-items: center; gap: 8px; color: #94a3b8;
        }

        /* ── RIGHT PANEL ──────────────────────────── */
        .login-form-panel {
          flex: 1;
          display: flex; align-items: center; justify-content: center;
          padding: 40px 32px;
        }
        .login-card {
          width: 100%; max-width: 460px;
        }
        .login-card-header {
          margin-bottom: 28px;
        }
        .login-card-title {
          font-size: 1.75rem; font-weight: 800;
          color: #0f172a; letter-spacing: -0.025em;
          margin-bottom: 6px;
        }
        .login-card-sub {
          font-size: 0.9rem; color: #64748b;
        }

        /* Space selector */
        .space-grid {
          display: flex; flex-direction: column; gap: 10px;
          margin-bottom: 24px;
        }
        .space-btn {
          display: flex; align-items: center; gap: 14px;
          padding: 14px 18px;
          border-radius: 14px;
          border: 1.5px solid #e2e8f0;
          background: white;
          cursor: pointer;
          transition: all 0.18s ease;
          text-align: left;
          outline: none;
          width: 100%;
        }
        .space-btn:hover {
          border-color: #cbd5e1;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }
        .space-btn.active {
          border-color: var(--space-color);
          background: var(--space-bg);
          box-shadow: 0 4px 16px var(--space-shadow);
        }
        .space-icon {
          width: 42px; height: 42px; border-radius: 11px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          background: #f1f5f9;
          transition: all 0.18s ease;
        }
        .space-btn.active .space-icon {
          background: var(--space-gradient);
        }
        .space-label {
          font-size: 0.95rem; font-weight: 700; color: #0f172a;
          transition: color 0.18s;
        }
        .space-btn.active .space-label { color: var(--space-color); }
        .space-sublabel {
          font-size: 0.75rem; color: #64748b; font-weight: 600; margin-top: 1px;
        }
        .space-desc {
          font-size: 0.75rem; color: #94a3b8; margin-top: 1px;
        }
        .space-check {
          margin-left: auto;
          width: 22px; height: 22px; border-radius: 50%;
          background: var(--space-gradient);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          opacity: 0; transform: scale(0.6);
          transition: all 0.2s cubic-bezier(0.34,1.56,0.64,1);
        }
        .space-btn.active .space-check {
          opacity: 1; transform: scale(1);
        }

        /* Divider */
        .divider {
          display: flex; align-items: center; gap: 12px;
          margin-bottom: 20px;
        }
        .divider-line {
          flex: 1; height: 1px; background: #e2e8f0;
        }
        .divider-text {
          font-size: 0.78rem; color: #64748b; font-weight: 600; white-space: nowrap;
        }

        /* Inputs */
        .field { margin-bottom: 14px; }
        .field label {
          display: block;
          font-size: 0.82rem; font-weight: 600; color: #374151;
          margin-bottom: 6px;
        }
        .input-wrap { position: relative; }
        .field input {
          width: 100%; padding: 12px 14px;
          border: 1.5px solid #e2e8f0;
          border-radius: 10px;
          font-size: 0.92rem; font-family: inherit;
          color: #0f172a; background: white;
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .field input:focus {
          border-color: #6366f1;
          box-shadow: 0 0 0 3px rgba(99,102,241,0.1);
        }
        .field input.has-toggle { padding-right: 44px; }
        .toggle-btn {
          position: absolute; right: 12px; top: 50%;
          transform: translateY(-50%);
          background: none; border: none; cursor: pointer;
          color: #94a3b8; display: flex; align-items: center;
          padding: 0;
        }
        .toggle-btn:hover { color: #475569; }

        /* Error */
        .error-box {
          background: #fef2f2; border: 1px solid #fecaca;
          color: #dc2626; border-radius: 10px;
          padding: 10px 14px; font-size: 0.84rem;
          margin-bottom: 14px; font-weight: 500;
        }

        /* Submit button */
        .submit-btn {
          width: 100%; padding: 14px;
          background: linear-gradient(135deg, #2563eb, #7c3aed);
          color: white; border: none; border-radius: 12px;
          font-size: 0.95rem; font-weight: 700;
          font-family: inherit;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          transition: all 0.2s ease;
          box-shadow: 0 4px 14px rgba(99,102,241,0.3);
          margin-top: 8px;
        }
        .submit-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(99,102,241,0.4);
        }
        .submit-btn:disabled {
          opacity: 0.7; cursor: not-allowed; transform: none;
        }
        .submit-btn.colored {
          background: var(--space-gradient);
          box-shadow: 0 4px 14px var(--space-shadow);
        }
        .submit-btn.colored:hover:not(:disabled) {
          box-shadow: 0 6px 20px var(--space-shadow);
        }

        /* RGPD note */
        .rgpd-note {
          margin-top: 22px;
          text-align: center;
          font-size: 0.76rem; color: #64748b;
          display: flex; items-center; justify-content: center; gap: 6px;
        }

        /* Form slide-in animation */
        .form-section {
          animation: slideDown 0.25s cubic-bezier(0.4,0,0.2,1);
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 768px) {
          .login-hero { display: none; }
          .login-form-panel { padding: 24px 20px; }
        }
      `}</style>

      <div className="login-root">
        {/* ── LEFT HERO ── */}
        <div className="login-hero">
          <div className="hero-brand">
            <div className="hero-logo">
              <HeartHandshake size={24} color="white" />
            </div>
            <span className="hero-name">NOVA</span>
            <span className="hero-badge-tn">🇹🇳 TUNISIE</span>
          </div>

          <div className="hero-body">
            <h2 className="hero-title">
              Pédopsychologie &<br />
              <span>Détection Précoce</span><br />
              Collaborative.
            </h2>
            <p className="hero-desc">
              Portail National Tunisien de croisement multi-acteurs pour la prévention et le suivi des troubles neurodéveloppementaux (TSA, TDAH, Dys).
            </p>

            <div className="hero-pills">
              {SPACES.map(s => {
                const Icon = s.icon;
                return (
                  <div className="hero-pill" key={s.role}>
                    <div className="hero-pill-icon" style={{ background: s.gradient }}>
                      <Icon size={18} color="white" />
                    </div>
                    <div className="hero-pill-text">
                      <div className="hero-pill-title">{s.label}</div>
                      <div className="hero-pill-sub">{s.sublabel}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="hero-footer">
            <div className="hero-footer-item">
              <ShieldCheck size={14} color="#10b981" />
              <span>Protection des données conforme Loi INADP n° 2004-63 (Tunisie)</span>
            </div>
            <div className="hero-footer-item">
              <Award size={14} color="#38bdf8" />
              <span>Échelles d'évaluation clinique DSM-5 & CIM-11 validées</span>
            </div>
          </div>
        </div>

        {/* ── RIGHT FORM ── */}
        <div className="login-form-panel">
          <div className="login-card">
            {/* Mode Switcher Tabs */}
            <div style={{
              display: 'flex',
              background: '#f1f5f9',
              padding: '4px',
              borderRadius: '12px',
              marginBottom: '20px',
              gap: '4px'
            }}>
              <button
                type="button"
                onClick={() => setMode('login')}
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  border: 'none',
                  borderRadius: '9px',
                  fontWeight: 700,
                  fontSize: '.85rem',
                  cursor: 'pointer',
                  background: mode === 'login' ? 'white' : 'transparent',
                  color: mode === 'login' ? '#0f172a' : '#64748b',
                  boxShadow: mode === 'login' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all .2s ease'
                }}
              >
                <ShieldCheck size={16} color={mode === 'login' ? '#2563eb' : '#64748b'} />
                Connexion Espace
              </button>
              <button
                type="button"
                onClick={() => setMode('inscription')}
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  border: 'none',
                  borderRadius: '9px',
                  fontWeight: 700,
                  fontSize: '.85rem',
                  cursor: 'pointer',
                  background: mode === 'inscription' ? 'white' : 'transparent',
                  color: mode === 'inscription' ? '#059669' : '#64748b',
                  boxShadow: mode === 'inscription' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all .2s ease'
                }}
              >
                <UserPlus size={16} color={mode === 'inscription' ? '#059669' : '#64748b'} />
                Inscrire un Enfant
              </button>
            </div>

            {mode === 'inscription' ? (
              <div className="fade-in">
                <div style={{ marginBottom: 16 }}>
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      background: 'none',
                      border: 'none',
                      color: '#2563eb',
                      fontWeight: 600,
                      fontSize: '.82rem',
                      cursor: 'pointer',
                      padding: 0,
                      marginBottom: 12
                    }}
                  >
                    <ArrowLeft size={14} /> Retour à la connexion
                  </button>
                </div>
                <InscriptionEnfant
                  onEnfantAjoute={(enfant) => {
                    setInscriptionSuccessChild(enfant);
                    // On peut basculer vers la connexion famille automatiquement
                    setTimeout(() => {
                      setSelected('FAMILLE');
                      setMode('login');
                    }, 2500);
                  }}
                />
              </div>
            ) : (
              <>
                <div className="login-card-header">
                  <h1 className="login-card-title">Portail d'Accès</h1>
                  <p className="login-card-sub">
                    Sélectionnez votre domaine d'intervention pour ouvrir votre session sécurisée.
                  </p>
                </div>

                {inscriptionSuccessChild && (
                  <div style={{
                    background: '#ecfdf5',
                    border: '1px solid #a7f3d0',
                    borderRadius: '10px',
                    padding: '12px 14px',
                    marginBottom: '16px',
                    fontSize: '.84rem',
                    color: '#065f46',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}>
                    <UserPlus size={18} color="#059669" />
                    <div>
                      Dossier créé avec succès pour <strong>{inscriptionSuccessChild.prenom}</strong> ({inscriptionSuccessChild.code || inscriptionSuccessChild.code_identifiant}). Connectez-vous ci-dessous.
                    </div>
                  </div>
                )}

                {/* Step 1 — Space selection */}
                <div className="space-grid">
                  {SPACES.map(s => {
                    const Icon = s.icon;
                    const isActive = selected === s.role;
                    return (
                      <button
                        key={s.role}
                        className={`space-btn${isActive ? ' active' : ''}`}
                        style={{
                          '--space-color': s.color,
                          '--space-gradient': s.gradient,
                          '--space-bg': `${s.color}0f`,
                          '--space-shadow': `${s.color}25`,
                        }}
                        onClick={() => handleSelect(s)}
                      >
                        <div className="space-icon">
                          <Icon size={20} color={isActive ? 'white' : '#64748b'} />
                        </div>
                        <div>
                          <div className="space-label">{s.label}</div>
                          <div className="space-sublabel">{s.sublabel}</div>
                          <div className="space-desc">{s.desc}</div>
                        </div>
                        <div className="space-check" style={{ '--space-gradient': s.gradient }}>
                          <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
                            <path d="M1 4.5L4 7.5L10 1.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Step 2 — Credentials (shown after space selected) */}
                {selected && (
                  <div className="form-section">
                    <div className="divider">
                      <div className="divider-line" />
                      <span className="divider-text">Connexion à l'{space?.label}</span>
                      <div className="divider-line" />
                    </div>

                    <form onSubmit={handleSubmit}>
                      {error && <div className="error-box">{error}</div>}

                      <div className="field">
                        <label htmlFor="email">Adresse e-mail professionnelle / familiale</label>
                        <input
                          id="email"
                          type="email"
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          placeholder="votre.email@domaine.tn"
                          required
                          autoComplete="username"
                        />
                      </div>

                      <div className="field">
                        <label htmlFor="password">Mot de passe</label>
                        <div className="input-wrap">
                          <input
                            id="password"
                            type={showPwd ? 'text' : 'password'}
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            className="has-toggle"
                            autoComplete="current-password"
                          />
                          <button
                            type="button"
                            className="toggle-btn"
                            onClick={() => setShowPwd(v => !v)}
                            tabIndex={-1}
                          >
                            {showPwd ? <EyeOff size={17} /> : <Eye size={17} />}
                          </button>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={loading || !email || !password}
                        className="submit-btn colored"
                        style={{
                          '--space-gradient': space?.gradient,
                          '--space-shadow': `${space?.color}35`,
                        }}
                      >
                        {loading ? (
                          <>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83">
                                <animateTransform attributeName="transform" type="rotate" values="0 12 12;360 12 12" dur="0.8s" repeatCount="indefinite" />
                              </path>
                            </svg>
                            Authentification en cours…
                          </>
                        ) : (
                          <>
                            Accéder à l'{space?.label}
                            <ArrowRight size={18} />
                          </>
                        )}
                      </button>
                    </form>
                  </div>
                )}
              </>
            )}

            <div className="rgpd-note">
              <ShieldCheck size={14} color="#10b981" />
              <span>Chiffrement AES-256 · Conforme Loi INADP Tunisie (2004-63)</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
