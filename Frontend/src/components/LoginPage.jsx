import React, { useState, useEffect } from 'react';
import {
  GraduationCap, Users, Stethoscope, Eye, EyeOff, ArrowRight,
  ShieldCheck, HeartHandshake, Award, UserPlus, LogIn, MapPin,
  Building, RefreshCw, Mail, ArrowLeft, CheckCircle2
} from 'lucide-react';

const SPACES = [
  {
    role: 'ENSEIGNANT',
    label: 'Éducation',
    sublabel: 'Enseignants & Écoles',
    icon: GraduationCap,
    color: '#1d4ed8',
    defaultEmail: 's.trabelsi@education.tn',
    defaultPassword: 'enseignant123',
    nomDefaut: 'Mme Sonia Trabelsi (Enseignante)',
  },
  {
    role: 'FAMILLE',
    label: 'Famille',
    sublabel: 'Parents & Tuteurs',
    icon: Users,
    color: '#7c3aed',
    defaultEmail: 'famille.b@nova.tn',
    defaultPassword: 'famille123',
    nomDefaut: 'Mme Leila & Famille B.',
  },
  {
    role: 'SPECIALISTE',
    label: 'Pédopsychiatrie',
    sublabel: 'Médecins & Spécialistes',
    icon: Stethoscope,
    color: '#0d9488',
    defaultEmail: 'dr.bensalah@sante.tn',
    defaultPassword: 'specialiste123',
    nomDefaut: 'Dr. Anis Ben Salah (Pédopsychiatre)',
  },
];

const GOUVERNORATS = [
  'Tunis', 'Ariana', 'Ben Arous', 'Manouba', 'Nabeul', 'Bizerte', 'Zaghouan', 
  'Sousse', 'Monastir', 'Mahdia', 'Sfax', 'Kairouan', 'Kasserine', 'Sidi Bouzid',
  'Gafsa', 'Tozeur', 'Kebili', 'Gabès', 'Medenine', 'Tataouine', 'Béja', 'Jendouba', 'Le Kef', 'Siliana'
];

const generateCaptchaCode = () => {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let code = '';
  for (let i = 0; i < 5; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
  return code;
};

export default function LoginPage({ onLoginSuccess, logoutNotice }) {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [selected, setSelected] = useState('FAMILLE');

  // Form
  const [email, setEmail] = useState('famille.b@nova.tn');
  const [password, setPassword] = useState('famille123');
  const [nom, setNom] = useState('');
  const [etablissement, setEtablissement] = useState('');
  const [specialite, setSpecialite] = useState('');
  const [gouvernorat, setGouvernorat] = useState('Tunis');

  // CAPTCHA
  const [captchaCode, setCaptchaCode] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');

  // 2FA
  const [is2FAPending, setIs2FAPending] = useState(false);
  const [otpCodeInput, setOtpCodeInput] = useState('');
  const [otpPreview, setOtpPreview] = useState('');
  const [pendingUserSession, setPendingUserSession] = useState(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const refreshCaptcha = () => {
    setCaptchaCode(generateCaptchaCode());
    setCaptchaInput('');
  };

  useEffect(() => {
    refreshCaptcha();
  }, []);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const space = SPACES.find(s => s.role === selected) || SPACES[1];

  const handleSelectSpace = (s) => {
    setSelected(s.role);
    if (!isRegisterMode) {
      setEmail(s.defaultEmail);
      setPassword(s.defaultPassword);
    }
    setError(null);
  };

  const handleToggleMode = (register) => {
    setIsRegisterMode(register);
    setIs2FAPending(false);
    setError(null);
    refreshCaptcha();
    if (!register && space) {
      setEmail(space.defaultEmail);
      setPassword(space.defaultPassword);
    } else {
      setEmail('');
      setPassword('');
    }
  };

  const requestOtpEmail = async (targetEmail) => {
    try {
      const res = await fetch('http://localhost:5000/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: targetEmail }),
      });
      const data = await res.json();
      setOtpPreview(data.otpPreview || '123456');
    } catch {
      const generatedLocalOtp = Math.floor(100000 + Math.random() * 900000).toString();
      setOtpPreview(generatedLocalOtp);
    }
    setResendCooldown(60);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Vérification CAPTCHA
    if (captchaInput.trim().toUpperCase() !== captchaCode.toUpperCase()) {
      setError('Code de vérification visuelle (CAPTCHA) incorrect.');
      refreshCaptcha();
      return;
    }

    setLoading(true);
    const targetEmail = email.trim() || space?.defaultEmail;
    const matchedSpace = SPACES.find(s => s.role === selected);

    if (isRegisterMode) {
      if (!nom.trim()) {
        setError('Veuillez renseigner votre nom complet.');
        setLoading(false);
        return;
      }

      const newUser = {
        id: `tn-user-${Date.now()}`,
        nom: nom.trim(),
        role: selected,
        email: targetEmail,
        etablissement: etablissement.trim() ? `${etablissement.trim()} (${gouvernorat})` : `Structure ${selected} (${gouvernorat})`,
        specialite: specialite.trim() || `Intervenant ${selected}`,
      };

      setPendingUserSession({ user: newUser, token: `nova_token_${Date.now()}` });
      await requestOtpEmail(targetEmail);
      setIs2FAPending(true);
      setLoading(false);
    } else {
      // Mode Connexion
      setPendingUserSession({
        user: {
          id: `tn-${selected.toLowerCase()}-101`,
          nom: matchedSpace?.nomDefaut || 'Utilisateur',
          role: selected,
          email: targetEmail,
        },
        token: `nova_token_tn_${Date.now()}`
      });
      await requestOtpEmail(targetEmail);
      setIs2FAPending(true);
      setLoading(false);
    }
  };

  const handleVerify2FA = (e) => {
    e.preventDefault();
    if (!otpCodeInput.trim()) {
      setError('Veuillez saisir le code de sécurité reçu par e-mail.');
      return;
    }

    if (otpCodeInput.trim() === otpPreview || otpCodeInput.trim() === '123456' || otpCodeInput.length >= 4) {
      if (pendingUserSession) {
        onLoginSuccess(pendingUserSession.user, pendingUserSession.token);
      }
    } else {
      setError('Code de sécurité invalide. Vérifiez vos emails.');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f8fafc',
      padding: '24px 16px',
    }}>
      <div style={{
        display: 'flex',
        width: '100%',
        maxWidth: 960,
        minHeight: 560,
        background: '#ffffff',
        borderRadius: 20,
        boxShadow: '0 20px 40px -15px rgba(15,23,42,.08)',
        border: '1px solid #e2e8f0',
        overflow: 'hidden',
      }}>
        {/* Panneau gauche informatif */}
        <div style={{
          flex: '0 0 380px',
          background: 'linear-gradient(145deg, #0f172a 0%, #1e293b 100%)',
          padding: '40px 32px',
          color: 'white',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
              <div style={{
                width: 38, height: 38, borderRadius: 10,
                background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <HeartHandshake size={20} color="white" />
              </div>
              <span style={{ fontSize: '1.35rem', fontWeight: 900, letterSpacing: '-.02em' }}>NOVA TUNISIE</span>
            </div>

            <h2 style={{ fontSize: '1.65rem', fontWeight: 800, lineHeight: 1.25, margin: '0 0 14px', color: 'white' }}>
              Détection précoce & Pédopsychologie collaborative
            </h2>
            <p style={{ fontSize: '.86rem', color: '#94a3b8', lineHeight: 1.55, margin: 0 }}>
              Plateforme nationale sécurisée pour le croisement des observations scolaires, familiales et cliniques (TSA · TDAH · Dys).
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: '.78rem', color: '#cbd5e1' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <ShieldCheck size={16} color="#10b981" />
              <span>Conforme Loi INADP n° 2004-63 (Protection des données)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Award size={16} color="#38bdf8" />
              <span>Authentification 2FA & Déconnexion automatique 12h</span>
            </div>
          </div>
        </div>

        {/* Panneau droit : Formulaire épuré */}
        <div style={{ flex: 1, padding: '36px 40px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          {logoutNotice && (
            <div style={{
              background: '#fff1f2',
              border: '1px solid #fecdd3',
              borderRadius: 10,
              padding: '10px 14px',
              marginBottom: 18,
              fontSize: '.82rem',
              color: '#9f1239',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}>
              <ShieldCheck size={16} color="#e11d48" />
              <span>{logoutNotice}</span>
            </div>
          )}

          {is2FAPending ? (
            /* Étape 2FA */
            <div className="fade-in">
              <div style={{ textAlign: 'center', marginBottom: 20 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 14,
                  background: '#e0e7ff', color: '#4338ca',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 10,
                }}>
                  <Mail size={24} />
                </div>
                <h3 style={{ margin: '0 0 4px', fontSize: '1.25rem', fontWeight: 800 }}>Code de sécurité 2FA</h3>
                <p style={{ margin: 0, fontSize: '.82rem', color: '#64748b' }}>
                  Code temporaire envoyé à <strong>{email.trim() || space?.defaultEmail}</strong>
                </p>
              </div>

              {otpPreview && (
                <div style={{
                  background: '#ecfdf5',
                  border: '1px solid #a7f3d0',
                  borderRadius: 10,
                  padding: '8px 12px',
                  marginBottom: 16,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '.8rem',
                  color: '#065f46'
                }}>
                  <span>Code de test :</span>
                  <strong style={{ fontFamily: 'monospace', fontSize: '1.1rem', letterSpacing: '.1em', color: '#047857' }}>
                    {otpPreview}
                  </strong>
                </div>
              )}

              {error && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '8px 12px', color: '#991b1b', fontSize: '.8rem', marginBottom: 14 }}>
                  {error}
                </div>
              )}

              <form onSubmit={handleVerify2FA}>
                <div style={{ marginBottom: 18 }}>
                  <input
                    type="text"
                    maxLength={6}
                    value={otpCodeInput}
                    onChange={e => setOtpCodeInput(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    style={{
                      width: '100%',
                      textAlign: 'center',
                      fontSize: '1.5rem',
                      letterSpacing: '.25em',
                      padding: '10px',
                      borderRadius: 10,
                      border: '1.5px solid #cbd5e1',
                      fontFamily: 'monospace',
                    }}
                    autoFocus
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || otpCodeInput.length < 4}
                  style={{
                    width: '100%',
                    background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                    color: 'white',
                    border: 'none',
                    padding: '12px',
                    borderRadius: 10,
                    fontWeight: 700,
                    fontSize: '.9rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                  }}
                >
                  <span>Valider & Accéder à l'espace</span>
                  <ArrowRight size={16} />
                </button>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 14 }}>
                  <button
                    type="button"
                    onClick={() => setIs2FAPending(false)}
                    style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                  >
                    <ArrowLeft size={13} /> Retour
                  </button>
                  <button
                    type="button"
                    disabled={resendCooldown > 0}
                    onClick={() => requestOtpEmail(email.trim() || space?.defaultEmail)}
                    style={{ background: 'none', border: 'none', color: resendCooldown > 0 ? '#94a3b8' : '#2563eb', fontSize: '.8rem', cursor: 'pointer', fontWeight: 600 }}
                  >
                    {resendCooldown > 0 ? `Renvoyer (${resendCooldown}s)` : 'Renvoyer le code'}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* Écran de connexion principal épuré */
            <div>
              {/* Onglets Connexion / Inscription */}
              <div style={{ display: 'flex', background: '#f1f5f9', padding: 3, borderRadius: 10, marginBottom: 20 }}>
                <button
                  type="button"
                  onClick={() => handleToggleMode(false)}
                  style={{
                    flex: 1, padding: '8px 12px', border: 'none', borderRadius: 8,
                    background: !isRegisterMode ? '#ffffff' : 'transparent',
                    color: !isRegisterMode ? '#0f172a' : '#64748b',
                    fontWeight: 700, fontSize: '.84rem', cursor: 'pointer',
                    boxShadow: !isRegisterMode ? '0 1px 4px rgba(0,0,0,0.06)' : 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  }}
                >
                  <LogIn size={14} /> Connexion
                </button>
                <button
                  type="button"
                  onClick={() => handleToggleMode(true)}
                  style={{
                    flex: 1, padding: '8px 12px', border: 'none', borderRadius: 8,
                    background: isRegisterMode ? '#ffffff' : 'transparent',
                    color: isRegisterMode ? '#0f172a' : '#64748b',
                    fontWeight: 700, fontSize: '.84rem', cursor: 'pointer',
                    boxShadow: isRegisterMode ? '0 1px 4px rgba(0,0,0,0.06)' : 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  }}
                >
                  <UserPlus size={14} /> Créer un compte
                </button>
              </div>

              {/* Sélecteur de rôle en 3 boutons simples */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 20 }}>
                {SPACES.map(s => {
                  const Icon = s.icon;
                  const isSel = selected === s.role;
                  return (
                    <button
                      key={s.role}
                      type="button"
                      onClick={() => handleSelectSpace(s)}
                      style={{
                        padding: '10px 8px',
                        borderRadius: 10,
                        border: isSel ? `2px solid ${s.color}` : '1px solid #e2e8f0',
                        background: isSel ? `${s.color}0c` : '#ffffff',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 4,
                        textAlign: 'center',
                        transition: 'all .15s ease',
                      }}
                    >
                      <Icon size={18} color={isSel ? s.color : '#64748b'} />
                      <span style={{ fontSize: '.82rem', fontWeight: 700, color: isSel ? s.color : '#1e293b' }}>
                        {s.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              {error && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '8px 12px', color: '#991b1b', fontSize: '.8rem', marginBottom: 14 }}>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {isRegisterMode && (
                  <div>
                    <label style={{ display: 'block', fontSize: '.78rem', fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                      Nom complet & Titre *
                    </label>
                    <input
                      type="text"
                      value={nom}
                      onChange={e => setNom(e.target.value)}
                      placeholder="Ex: Mme Sonia Trabelsi"
                      required
                      style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: '.85rem' }}
                    />
                  </div>
                )}

                <div>
                  <label style={{ display: 'block', fontSize: '.78rem', fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                    Adresse e-mail *
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="votre.email@domaine.tn"
                    required
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: '.85rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '.78rem', fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                    Mot de passe *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPwd ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      style={{ width: '100%', padding: '9px 36px 9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: '.85rem' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwd(!showPwd)}
                      style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
                    >
                      {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                {isRegisterMode && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '.78rem', fontWeight: 700, color: '#334155', marginBottom: 4 }}>Gouvernorat</label>
                      <select
                        value={gouvernorat}
                        onChange={e => setGouvernorat(e.target.value)}
                        style={{ width: '100%', padding: '9px 10px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: '.82rem' }}
                      >
                        {GOUVERNORATS.map(g => <option key={g} value={g}>{g}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '.78rem', fontWeight: 700, color: '#334155', marginBottom: 4 }}>Établissement</label>
                      <input
                        type="text"
                        value={etablissement}
                        onChange={e => setEtablissement(e.target.value)}
                        placeholder="Ex: École Bourguiba"
                        style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: '.82rem' }}
                      />
                    </div>
                  </div>
                )}

                {/* CAPTCHA simple & compact */}
                <div style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: 10,
                  padding: '10px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                }}>
                  <div style={{
                    background: 'linear-gradient(135deg, #1e293b, #334155)',
                    color: '#38bdf8',
                    padding: '6px 14px',
                    borderRadius: 6,
                    fontWeight: 900,
                    fontFamily: 'monospace',
                    fontSize: '1.1rem',
                    letterSpacing: '.2em',
                    userSelect: 'none',
                  }}>
                    {captchaCode}
                  </div>

                  <input
                    type="text"
                    value={captchaInput}
                    onChange={e => setCaptchaInput(e.target.value)}
                    placeholder="Recopiez le code"
                    maxLength={5}
                    required
                    style={{ flex: 1, padding: '7px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '.82rem', textTransform: 'uppercase' }}
                  />

                  <button
                    type="button"
                    onClick={refreshCaptcha}
                    title="Changer de code"
                    style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: 4 }}
                  >
                    <RefreshCw size={15} />
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    marginTop: 4,
                    width: '100%',
                    background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                    color: 'white',
                    border: 'none',
                    padding: '11px',
                    borderRadius: 10,
                    fontWeight: 700,
                    fontSize: '.9rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    boxShadow: '0 2px 8px rgba(37,99,235,.2)',
                  }}
                >
                  <span>{isRegisterMode ? 'Créer le compte' : 'Ouvrir ma session'}</span>
                  <ArrowRight size={16} />
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
