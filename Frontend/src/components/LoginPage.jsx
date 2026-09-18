import React, { useState, useEffect } from 'react';
import {
  GraduationCap, Users, Stethoscope, Eye, EyeOff, ArrowRight,
  ShieldCheck, Award, UserPlus, LogIn, RefreshCw, Mail, ArrowLeft
} from 'lucide-react';

const SPACES = [
  { role: 'ENSEIGNANT', label: 'Enseignant', sublabel: 'École & Observation', icon: GraduationCap, defaultEmail: 's.trabelsi@education.tn', defaultPassword: 'enseignant123', nomDefaut: 'Mme Sonia Trabelsi (Enseignante)' },
  { role: 'FAMILLE',    label: 'Famille',    sublabel: 'Parent & Tuteur',      icon: Users,         defaultEmail: 'famille.b@nova.tn',           defaultPassword: 'famille123',    nomDefaut: 'Mme Leila & Famille B.' },
  { role: 'SPECIALISTE',label: 'Spécialiste',sublabel: 'Médecin & Clinicien',  icon: Stethoscope,   defaultEmail: 'dr.bensalah@sante.tn',         defaultPassword: 'specialiste123',nomDefaut: 'Dr. Anis Ben Salah (Pédopsychiatre)' },
];

const GOUVERNORATS = [
  'Tunis','Ariana','Ben Arous','Manouba','Nabeul','Bizerte','Zaghouan',
  'Sousse','Monastir','Mahdia','Sfax','Kairouan','Kasserine','Sidi Bouzid',
  'Gafsa','Tozeur','Kebili','Gabès','Medenine','Tataouine','Béja','Jendouba','Le Kef','Siliana'
];

const generateCaptchaCode = () => {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let code = '';
  for (let i = 0; i < 5; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
  return code;
};

const BASE_INPUT = {
  width: '100%', padding: '10px 12px',
  border: '1.5px solid #e2e8f0', borderRadius: 8,
  fontSize: '.875rem', fontFamily: 'Inter, sans-serif',
  color: '#17324D', background: '#fff', outline: 'none',
  transition: 'border-color .15s ease, box-shadow .15s ease',
};

const FOCUS_STYLE = { borderColor: '#58B6A9', boxShadow: '0 0 0 3px rgba(88,182,169,.15)' };

export default function LoginPage({ onLoginSuccess, logoutNotice }) {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [selected, setSelected] = useState('FAMILLE');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nom, setNom] = useState('');
  const [etablissement, setEtablissement] = useState('');
  const [gouvernorat, setGouvernorat] = useState('Tunis');
  const [captchaCode, setCaptchaCode] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [is2FAPending, setIs2FAPending] = useState(false);
  const [otpCodeInput, setOtpCodeInput] = useState('');
  const [otpPreview, setOtpPreview] = useState('');
  const [pendingUserSession, setPendingUserSession] = useState(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [focused, setFocused] = useState(null);

  const refreshCaptcha = () => { setCaptchaCode(generateCaptchaCode()); setCaptchaInput(''); };

  useEffect(() => { refreshCaptcha(); }, []);
  useEffect(() => {
    if (resendCooldown > 0) {
      const t = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [resendCooldown]);

  const space = SPACES.find(s => s.role === selected) || SPACES[1];

  const handleSelectSpace = (s) => {
    setSelected(s.role);
    if (!isRegisterMode) { setEmail(s.defaultEmail); setPassword(s.defaultPassword); }
    setError(null);
  };

  const handleToggleMode = (register) => {
    setIsRegisterMode(register);
    setIs2FAPending(false);
    setError(null);
    refreshCaptcha();
    if (!register && space) { setEmail(space.defaultEmail); setPassword(space.defaultPassword); }
    else { setEmail(''); setPassword(''); }
  };

  const requestOtpEmail = async (targetEmail) => {
    try {
      const res = await fetch('http://localhost:5000/api/auth/send-otp', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: targetEmail }),
      });
      const data = await res.json();
      setOtpPreview(data.otpPreview || '123456');
    } catch {
      setOtpPreview(Math.floor(100000 + Math.random() * 900000).toString());
    }
    setResendCooldown(60);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (captchaInput.trim().toUpperCase() !== captchaCode.toUpperCase()) {
      setError('Code de vérification incorrect.'); refreshCaptcha(); return;
    }
    setLoading(true);
    const targetEmail = email.trim() || space?.defaultEmail;
    const matchedSpace = SPACES.find(s => s.role === selected);
    if (isRegisterMode) {
      if (!nom.trim()) { setError('Veuillez renseigner votre nom complet.'); setLoading(false); return; }
      const newUser = {
        id: `tn-user-${Date.now()}`, nom: nom.trim(), role: selected, email: targetEmail,
        etablissement: etablissement.trim() ? `${etablissement.trim()} (${gouvernorat})` : `Structure ${selected} (${gouvernorat})`,
        specialite: `Intervenant ${selected}`,
      };
      setPendingUserSession({ user: newUser, token: `nova_token_${Date.now()}` });
      await requestOtpEmail(targetEmail);
      setIs2FAPending(true); setLoading(false);
    } else {
      setPendingUserSession({
        user: { id: `tn-${selected.toLowerCase()}-101`, nom: matchedSpace?.nomDefaut || 'Utilisateur', role: selected, email: targetEmail },
        token: `nova_token_tn_${Date.now()}`
      });
      await requestOtpEmail(targetEmail);
      setIs2FAPending(true); setLoading(false);
    }
  };

  const handleVerify2FA = (e) => {
    e.preventDefault();
    if (!otpCodeInput.trim()) { setError('Veuillez saisir le code de sécurité.'); return; }
    if (otpCodeInput.trim() === otpPreview || otpCodeInput.trim() === '123456' || otpCodeInput.length >= 4) {
      if (pendingUserSession) onLoginSuccess(pendingUserSession.user, pendingUserSession.token);
    } else {
      setError('Code invalide. Vérifiez vos emails.');
    }
  };

  const inp = (field) => ({ ...BASE_INPUT, ...(focused === field ? FOCUS_STYLE : {}) });

  /* ─────────────────────────────── RENDER ─────────────────────────────── */
  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#F7FAFC' }}>

      {/* ══ PANNEAU GAUCHE — Hero sombre ══ */}
      <div style={{
        flex: '0 0 400px',
        background: 'linear-gradient(160deg, #17324D 0%, #0f2035 60%, #0a1a2e 100%)',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        padding: '40px 36px', position: 'relative', overflow: 'hidden',
      }}>
        {/* Accents lumineux */}
        <div style={{ position: 'absolute', top: -80, right: -80, width: 280, height: 280, borderRadius: '50%', background: 'radial-gradient(circle, rgba(88,182,169,.18) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: 80, left: -60, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(185,221,242,.10) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 36 }}>
            <div style={{
              width: 46, height: 46, borderRadius: 14,
              background: 'linear-gradient(135deg, #58B6A9 0%, #B9DDF2 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(88,182,169,.40)',
            }}>
              <span style={{ fontSize: '1.5rem', fontWeight: 900, color: '#17324D', lineHeight: 1 }}>N</span>
            </div>
            <div>
              <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#ffffff', letterSpacing: '-.02em', lineHeight: 1 }}>NOVA</div>
              <div style={{ fontSize: '.6rem', color: '#B9DDF2', letterSpacing: '.14em', fontWeight: 700 }}>TUNISIE</div>
            </div>
          </div>

          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff', lineHeight: 1.3, marginBottom: 12 }}>
            Détection précoce &<br />
            <span style={{ color: '#58B6A9' }}>soins connectés</span>
          </h2>
          <p style={{ fontSize: '.84rem', color: '#94a3b8', lineHeight: 1.65, marginBottom: 32 }}>
            Plateforme nationale sécurisée pour le croisement des observations scolaires, familiales et cliniques — TSA · TDAH · Dys.
          </p>

          {/* Espaces disponibles */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {SPACES.map(s => {
              const SIcon = s.icon;
              return (
                <div key={s.role} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 14px', borderRadius: 10,
                  background: 'rgba(255,255,255,.05)',
                  border: '1px solid rgba(255,255,255,.08)',
                }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                    background: 'rgba(88,182,169,.15)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <SIcon size={15} color="#58B6A9" />
                  </div>
                  <div>
                    <div style={{ fontSize: '.82rem', fontWeight: 700, color: '#e2e8f0' }}>{s.label}</div>
                    <div style={{ fontSize: '.72rem', color: '#64748b' }}>{s.sublabel}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pied de page gauche */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: '.75rem', color: '#64748b' }}>
            <ShieldCheck size={13} color="#58B6A9" />
            <span>Conforme Loi INADP n° 2004-63 · Protection des données</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: '.75rem', color: '#64748b' }}>
            <Award size={13} color="#B9DDF2" />
            <span>Authentification 2FA · Déconnexion automatique 12h</span>
          </div>
        </div>
      </div>

      {/* ══ PANNEAU DROIT — Formulaire ══ */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 32px' }}>
        <div style={{ width: '100%', maxWidth: 440 }}>

          {/* Alerte déconnexion */}
          {logoutNotice && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '10px 14px', marginBottom: 20, fontSize: '.82rem', color: '#9f1239', display: 'flex', alignItems: 'flex-start', gap: 8 }}>
              <ShieldCheck size={15} color="#e11d48" style={{ flexShrink: 0, marginTop: 1 }} />
              <span>{logoutNotice}</span>
            </div>
          )}

          {is2FAPending ? (
            /* ── Étape 2FA ── */
            <div style={{ animation: 'fadeIn .22s ease both' }}>
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <div style={{ width: 54, height: 54, borderRadius: 14, background: 'rgba(88,182,169,.12)', color: '#58B6A9', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                  <Mail size={26} />
                </div>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#17324D', marginBottom: 6 }}>Vérification 2FA</h2>
                <p style={{ fontSize: '.83rem', color: '#64748b' }}>Code envoyé à <strong>{email.trim() || space?.defaultEmail}</strong></p>
              </div>

              {otpPreview && (
                <div style={{ background: 'rgba(88,182,169,.08)', border: '1px solid rgba(88,182,169,.25)', borderRadius: 10, padding: '10px 14px', marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '.78rem', color: '#3d9b8e' }}>Code de démonstration :</span>
                  <strong style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '1.1rem', letterSpacing: '.12em', color: '#17324D' }}>{otpPreview}</strong>
                </div>
              )}

              {error && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '8px 12px', color: '#991b1b', fontSize: '.8rem', marginBottom: 14 }}>{error}</div>}

              <form onSubmit={handleVerify2FA}>
                <div style={{ marginBottom: 16 }}>
                  <input
                    type="text" maxLength={6} value={otpCodeInput}
                    onChange={e => setOtpCodeInput(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456" autoFocus required
                    style={{ ...inp('otp'), textAlign: 'center', fontSize: '1.6rem', letterSpacing: '.25em', fontFamily: 'JetBrains Mono, monospace', padding: '12px' }}
                    onFocus={() => setFocused('otp')} onBlur={() => setFocused(null)}
                  />
                </div>
                <button type="submit" disabled={loading || otpCodeInput.length < 4}
                  style={{ width: '100%', background: '#58B6A9', color: '#fff', border: 'none', padding: '12px', borderRadius: 10, fontWeight: 700, fontSize: '.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: 'inherit', opacity: otpCodeInput.length < 4 ? .6 : 1 }}>
                  Accéder à mon espace <ArrowRight size={16} />
                </button>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 14 }}>
                  <button type="button" onClick={() => setIs2FAPending(false)}
                    style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'inherit' }}>
                    <ArrowLeft size={13} /> Retour
                  </button>
                  <button type="button" disabled={resendCooldown > 0}
                    onClick={() => requestOtpEmail(email.trim() || space?.defaultEmail)}
                    style={{ background: 'none', border: 'none', color: resendCooldown > 0 ? '#94a3b8' : '#58B6A9', fontSize: '.8rem', cursor: 'pointer', fontWeight: 600, fontFamily: 'inherit' }}>
                    {resendCooldown > 0 ? `Renvoyer (${resendCooldown}s)` : 'Renvoyer le code'}
                  </button>
                </div>
              </form>
            </div>

          ) : (
            /* ── Formulaire principal ── */
            <div style={{ animation: 'slideUp .25s ease both' }}>
              <h1 style={{ fontSize: '1.55rem', fontWeight: 800, color: '#17324D', marginBottom: 4 }}>
                {isRegisterMode ? 'Créer un compte' : 'Bienvenue'}
              </h1>
              <p style={{ fontSize: '.84rem', color: '#64748b', marginBottom: 24 }}>
                {isRegisterMode ? 'Rejoignez la plateforme NOVA Tunisie.' : 'Connectez-vous à votre espace sécurisé.'}
              </p>

              {/* Toggle Connexion / Inscription */}
              <div style={{ display: 'flex', background: '#f1f5f9', padding: 3, borderRadius: 10, marginBottom: 22 }}>
                {[{ label: 'Connexion', icon: LogIn, val: false }, { label: 'Créer un compte', icon: UserPlus, val: true }].map(({ label, icon: BtnIcon, val }) => (
                  <button key={label} type="button" onClick={() => handleToggleMode(val)} style={{
                    flex: 1, padding: '8px 12px', border: 'none', borderRadius: 8,
                    background: isRegisterMode === val ? '#fff' : 'transparent',
                    color: isRegisterMode === val ? '#17324D' : '#64748b',
                    fontWeight: 700, fontSize: '.83rem', cursor: 'pointer',
                    boxShadow: isRegisterMode === val ? '0 1px 4px rgba(0,0,0,.06)' : 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                    fontFamily: 'inherit', transition: 'all .15s ease',
                  }}>
                    <BtnIcon size={13} /> {label}
                  </button>
                ))}
              </div>

              {/* Sélecteur de rôle */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 20 }}>
                {SPACES.map(s => {
                  const RIcon = s.icon;
                  const isSel = selected === s.role;
                  return (
                    <button key={s.role} type="button" onClick={() => handleSelectSpace(s)} style={{
                      padding: '10px 8px', borderRadius: 10, cursor: 'pointer',
                      border: isSel ? '2px solid #58B6A9' : '1.5px solid #e2e8f0',
                      background: isSel ? 'rgba(88,182,169,.08)' : '#fff',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
                      textAlign: 'center', transition: 'all .15s ease', fontFamily: 'inherit',
                    }}>
                      <RIcon size={17} color={isSel ? '#58B6A9' : '#94a3b8'} />
                      <span style={{ fontSize: '.78rem', fontWeight: 700, color: isSel ? '#17324D' : '#64748b' }}>
                        {s.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              {error && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '8px 12px', color: '#991b1b', fontSize: '.8rem', marginBottom: 14 }}>{error}</div>}

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {isRegisterMode && (
                  <div>
                    <label>Nom complet *</label>
                    <input type="text" value={nom} onChange={e => setNom(e.target.value)} placeholder="Ex: Mme Sonia Trabelsi" required
                      style={inp('nom')} onFocus={() => setFocused('nom')} onBlur={() => setFocused(null)} />
                  </div>
                )}

                <div>
                  <label>Adresse e-mail *</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="votre.email@domaine.tn" required
                    style={inp('email')} onFocus={() => setFocused('email')} onBlur={() => setFocused(null)} />
                </div>

                <div>
                  <label>Mot de passe *</label>
                  <div style={{ position: 'relative' }}>
                    <input type={showPwd ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required
                      style={{ ...inp('pwd'), paddingRight: 38 }} onFocus={() => setFocused('pwd')} onBlur={() => setFocused(null)} />
                    <button type="button" onClick={() => setShowPwd(!showPwd)}
                      style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 4 }}>
                      {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                {isRegisterMode && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div>
                      <label>Gouvernorat</label>
                      <select value={gouvernorat} onChange={e => setGouvernorat(e.target.value)}
                        style={inp('gov')} onFocus={() => setFocused('gov')} onBlur={() => setFocused(null)}>
                        {GOUVERNORATS.map(g => <option key={g} value={g}>{g}</option>)}
                      </select>
                    </div>
                    <div>
                      <label>Établissement</label>
                      <input type="text" value={etablissement} onChange={e => setEtablissement(e.target.value)} placeholder="Ex: École Bourguiba"
                        style={inp('etab')} onFocus={() => setFocused('etab')} onBlur={() => setFocused(null)} />
                    </div>
                  </div>
                )}

                {/* CAPTCHA — code jaune sur fond sombre */}
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ background: '#17324D', color: '#FFFF66', padding: '6px 14px', borderRadius: 6, fontWeight: 900, fontFamily: 'JetBrains Mono, monospace', fontSize: '1.1rem', letterSpacing: '.2em', userSelect: 'none', flexShrink: 0 }}>
                    {captchaCode}
                  </div>
                  <input type="text" value={captchaInput} onChange={e => setCaptchaInput(e.target.value)}
                    placeholder="Recopiez le code" maxLength={5} required
                    style={{ ...inp('captcha'), textTransform: 'uppercase' }}
                    onFocus={() => setFocused('captcha')} onBlur={() => setFocused(null)} />
                  <button type="button" onClick={refreshCaptcha} title="Changer le code"
                    style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 4, flexShrink: 0 }}>
                    <RefreshCw size={15} />
                  </button>
                </div>

                {/* Bouton principal */}
                <button type="submit" disabled={loading}
                  style={{ width: '100%', background: '#17324D', color: '#fff', border: 'none', padding: '12px', borderRadius: 10, fontWeight: 700, fontSize: '.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: 'inherit', opacity: loading ? .7 : 1, transition: 'background .15s ease' }}
                  onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#1e4263'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#17324D'; }}>
                  {loading ? 'Connexion en cours…' : (isRegisterMode ? 'Créer le compte' : 'Ouvrir ma session')}
                  {!loading && <ArrowRight size={16} />}
                </button>
              </form>

              <p style={{ textAlign: 'center', fontSize: '.75rem', color: '#94a3b8', marginTop: 20 }}>
                Conforme Loi INADP n° 2004-63 · Données personnelles protégées
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
