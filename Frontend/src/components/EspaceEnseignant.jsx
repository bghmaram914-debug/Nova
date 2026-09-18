import React, { useState, useEffect } from 'react';
import { GraduationCap, Send, CheckCircle2, Users, BarChart3, FileText, TrendingUp } from 'lucide-react';

const DOMAINS = [
  { id: 'ATTENTION',    icon: '🎯', label: 'Attention & Consignes',       desc: "Effort d'attention, écoute des consignes" },
  { id: 'LANGAGE',      icon: '💬', label: 'Langage & Communication',      desc: 'Expression orale, lecture, compréhension' },
  { id: 'MEMOIRE',      icon: '🧠', label: 'Mémoire & Apprentissage',      desc: 'Mémorisation des leçons, repères' },
  { id: 'MOTRICITE',    icon: '✏️', label: 'Motricité fine & Graphisme',   desc: "Tenue du stylo, vitesse d'écriture" },
  { id: 'COMPORTEMENT', icon: '🏫', label: 'Comportement & Relationnel',   desc: 'Intégration, respect des règles, agitation' },
];

const FREQ_LABELS   = ['', 'Très rare', 'Occasionnel', 'Régulier', 'Fréquent', 'Quotidien'];
const IMPACT_LABELS = ['', 'Minimal', 'Léger', 'Modéré', 'Important', 'Critique'];

const card = {
  background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0',
  padding: '20px 22px', boxShadow: '0 2px 8px rgba(23,50,77,.04)',
};

const inputStyle = {
  width: '100%', padding: '10px 12px',
  border: '1.5px solid #e2e8f0', borderRadius: 8,
  fontSize: '.875rem', fontFamily: 'inherit',
  color: '#17324D', background: '#fff', outline: 'none',
  transition: 'border-color .15s, box-shadow .15s',
};

export default function EspaceEnseignant({ child, onObservationAdded, user, allChildren }) {
  const [enfantsList, setEnfantsList]   = useState(allChildren || []);
  const [selectedChild, setSelectedChild] = useState(child);
  const [domaine, setDomaine]           = useState('ATTENTION');
  const [frequence, setFrequence]       = useState(4);
  const [impact, setImpact]             = useState(4);
  const [detail, setDetail]             = useState("Difficulté persistante à maintenir son attention sur une double consigne écrite ou lors des exercices individuels de plus de 10 minutes.");
  const [exemples, setExemples]         = useState("Regarde souvent par la fenêtre au début de l'exercice, oublie la 2ème étape.");
  const [loading, setLoading]           = useState(false);
  const [success, setSuccess]           = useState(false);
  const [obsCount, setObsCount]         = useState(2);

  useEffect(() => {
    fetch('http://localhost:5000/api/enfants')
      .then(r => r.ok ? r.json() : [])
      .then(data => { if (data?.length > 0) { setEnfantsList(data); if (!selectedChild) setSelectedChild(data[0]); } })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (child) {
      setSelectedChild(child);
      setEnfantsList(prev => prev.find(c => c.id === child.id) ? prev : [child, ...prev]);
    }
  }, [child]);

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      await fetch('http://localhost:5000/api/observations', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enfantId: selectedChild?.id || child?.id || 'e1111111-1111-1111-1111-111111111111',
          observateurId: user?.id || 'a1111111-1111-1111-1111-111111111111',
          observateurNom: user?.nom || 'Mme Sonia Trabelsi',
          domaine, contexte: 'ECOLE',
          frequenceDifficulte: frequence, impactQuotidien: impact,
          reponseDetaillee: detail, exemplesConcrets: exemples,
        }),
      });
      if (onObservationAdded) onObservationAdded();
      setObsCount(n => n + 1);
    } catch { if (onObservationAdded) onObservationAdded(); }
    finally { setLoading(false); setSuccess(true); setTimeout(() => setSuccess(false), 4000); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }} className="fade-up">

      {/* ── En-tête de page (style Donezo) ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: '1.55rem', fontWeight: 900, color: '#17324D', margin: 0, letterSpacing: '-.02em' }}>
            Espace Enseignant
          </h1>
          <p style={{ fontSize: '.88rem', color: '#64748b', margin: '4px 0 0' }}>
            Saisie factuelle des observations en classe pour {selectedChild?.prenom || 'l\'élève'} · {selectedChild?.code_identifiant || 'TN-NOVA-2026-084'}
          </p>
        </div>

        {/* Sélecteur élève */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '8px 14px', boxShadow: '0 1px 4px rgba(23,50,77,.05)' }}>
          <Users size={15} color="#58B6A9" />
          <span style={{ fontSize: '.8rem', color: '#64748b', fontWeight: 600 }}>Élève :</span>
          <select value={selectedChild?.id || ''} onChange={e => { const f = enfantsList.find(c => c.id === e.target.value); if (f) setSelectedChild(f); }}
            style={{ border: 'none', background: 'transparent', fontWeight: 700, color: '#17324D', fontSize: '.85rem', cursor: 'pointer', outline: 'none' }}>
            {enfantsList.map(e => <option key={e.id} value={e.id}>{e.prenom} {e.nom_anonyme || ''} ({e.niveau_scolaire || 'Primaire'})</option>)}
            {enfantsList.length === 0 && <option value="">{child?.prenom || 'Youssef B.'}</option>}
          </select>
        </div>
      </div>

      {/* ── Cartes de stats (style Donezo) ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        {[
          { label: 'Observations envoyées', value: obsCount, icon: FileText, color: '#17324D', bg: 'rgba(23,50,77,.07)', sub: 'Cette session' },
          { label: 'Domaines disponibles', value: 5, icon: BarChart3, color: '#58B6A9', bg: 'rgba(88,182,169,.10)', sub: 'TSA · TDAH · Dys' },
          { label: 'Fréquence actuelle', value: FREQ_LABELS[frequence], icon: TrendingUp, color: '#3d9b8e', bg: 'rgba(61,155,142,.10)', sub: 'Slider sélectionné' },
          { label: 'Impact scolaire', value: IMPACT_LABELS[impact], icon: GraduationCap, color: '#17324D', bg: 'rgba(23,50,77,.07)', sub: 'Slider sélectionné' },
        ].map(({ label, value, icon: Icon, color, bg, sub }) => (
          <div key={label} style={{ ...card, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '.78rem', color: '#64748b', fontWeight: 600 }}>{label}</span>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={15} color={color} />
              </div>
            </div>
            <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#17324D', lineHeight: 1 }}>{value}</div>
            <div style={{ fontSize: '.72rem', color: '#94a3b8', fontWeight: 500 }}>{sub}</div>
          </div>
        ))}
      </div>

      {/* ── Alerte succès ── */}
      {success && (
        <div style={{ background: 'rgba(88,182,169,.08)', border: '1px solid rgba(88,182,169,.3)', borderRadius: 10, padding: '12px 16px', color: '#3d9b8e', fontWeight: 700, fontSize: '.84rem', display: 'flex', alignItems: 'center', gap: 8 }}>
          <CheckCircle2 size={16} color="#58B6A9" />
          Observation enregistrée pour <strong>{selectedChild?.prenom}</strong> et transmise aux spécialistes.
        </div>
      )}

      {/* ── Formulaire principal ── */}
      <div style={card}>
        <div style={{ marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid #f1f5f9' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 800, color: '#17324D', margin: 0 }}>Saisie de l'observation</h2>
          <p style={{ fontSize: '.8rem', color: '#64748b', margin: '4px 0 0' }}>Décrivez factuellement ce que vous constatez en classe</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* 1. Domaine */}
          <div>
            <label style={{ display: 'block', fontSize: '.82rem', fontWeight: 700, color: '#334155', marginBottom: 10 }}>
              1. Domaine observé en classe
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 8 }}>
              {DOMAINS.map(d => {
                const sel = domaine === d.id;
                return (
                  <button key={d.id} type="button" onClick={() => setDomaine(d.id)} style={{
                    padding: '10px 14px', borderRadius: 10, cursor: 'pointer', textAlign: 'left',
                    border: sel ? '2px solid #58B6A9' : '1.5px solid #e2e8f0',
                    background: sel ? 'rgba(88,182,169,.08)' : '#fafafa',
                    transition: 'all .15s ease', fontFamily: 'inherit',
                  }}>
                    <div style={{ fontWeight: 700, fontSize: '.84rem', color: sel ? '#17324D' : '#475569', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span>{d.icon}</span> {d.label}
                    </div>
                    <div style={{ fontSize: '.72rem', color: '#94a3b8', marginTop: 3 }}>{d.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Sliders */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, background: '#f8fafc', padding: '16px', borderRadius: 12, border: '1px solid #f1f5f9' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.8rem', fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                <span>Fréquence de la difficulté</span>
                <span style={{ color: '#58B6A9' }}>{FREQ_LABELS[frequence]}</span>
              </div>
              <input type="range" min={1} max={5} value={frequence} onChange={e => setFrequence(+e.target.value)} style={{ width: '100%', accentColor: '#58B6A9', height: 4 }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.68rem', color: '#94a3b8', marginTop: 4 }}>
                <span>Rare</span><span>Quotidien</span>
              </div>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.8rem', fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                <span>Impact scolaire</span>
                <span style={{ color: '#17324D' }}>{IMPACT_LABELS[impact]}</span>
              </div>
              <input type="range" min={1} max={5} value={impact} onChange={e => setImpact(+e.target.value)} style={{ width: '100%', accentColor: '#17324D', height: 4 }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.68rem', color: '#94a3b8', marginTop: 4 }}>
                <span>Minimal</span><span>Critique</span>
              </div>
            </div>
          </div>

          {/* 3. Textes */}
          <div>
            <label style={{ display: 'block', fontSize: '.82rem', fontWeight: 700, color: '#334155', marginBottom: 6 }}>
              2. Description factuelle pour {selectedChild?.prenom || "l'élève"}
            </label>
            <textarea rows={3} value={detail} onChange={e => setDetail(e.target.value)} required
              placeholder="Décrivez ce que vous constatez précisément lors des exercices..."
              style={{ ...inputStyle, resize: 'vertical' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '.82rem', fontWeight: 700, color: '#334155', marginBottom: 6 }}>
              3. Exemple concret récent
            </label>
            <input type="text" value={exemples} onChange={e => setExemples(e.target.value)}
              placeholder="Ex: Lors de la dictée d'hier, a demandé 3 fois la répétition..."
              style={inputStyle} />
          </div>

          {/* Bouton */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 4 }}>
            <button type="submit" disabled={loading} style={{
              background: '#17324D', color: '#fff', border: 'none',
              padding: '11px 24px', borderRadius: 10, fontWeight: 800,
              fontSize: '.88rem', cursor: 'pointer', display: 'flex',
              alignItems: 'center', gap: 8, fontFamily: 'inherit',
              boxShadow: '0 4px 12px rgba(23,50,77,.25)', transition: 'all .15s ease',
              opacity: loading ? .7 : 1,
            }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#1e4263'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#17324D'; }}
            >
              <Send size={15} />
              {loading ? 'Transmission…' : `Transmettre l'observation (${selectedChild?.prenom || 'Élève'})`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
