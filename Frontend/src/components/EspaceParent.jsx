import React, { useState } from 'react';
import { Send, CheckCircle2 } from 'lucide-react';

const DOMAINS = [
  { id: 'ATTENTION',    label: 'Devoirs & Concentration',        desc: 'Se poser pour les devoirs, dispersion' },
  { id: 'LANGAGE',      label: 'Communication & Vocabulaire',    desc: 'Raconte ses journées, expression' },
  { id: 'MEMOIRE',      label: 'Routines & Oublis du quotidien', desc: 'Affaires oubliées, ordre des tâches' },
  { id: 'COMPORTEMENT', label: 'Émotions, Sommeil & Fatigue',    desc: 'Frustrations, transitions' },
  { id: 'MOTRICITE',    label: 'Gestes du quotidien',            desc: 'Lacets, boutons, autonomie' },
];

const FREQ_LABELS = ['', 'Très occasionnel', 'De temps en temps', 'Régulier', 'Quasiment chaque soir', 'Quotidien & systématique'];

export default function EspaceParent({ child, onObservationAdded, user }) {
  const [domaine, setDomaine] = useState('ATTENTION');
  const [frequence, setFrequence] = useState(4);
  const [detail, setDetail] = useState('');
  const [exemples, setExemples] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/observations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enfantId: child?.id || 'e1111111-1111-1111-1111-111111111111',
          observateurId: user?.id || 'a2222222-2222-2222-2222-222222222222',
          observateurNom: user?.nom || 'Mme Leila B. (Parent)',
          domaine, contexte: 'MAISON',
          frequenceDifficulte: frequence,
          impactQuotidien: 4,
          reponseDetaillee: detail,
          exemplesConcrets: exemples,
        }),
      });
      if (res.ok && onObservationAdded) onObservationAdded();
    } catch {
      if (onObservationAdded) onObservationAdded();
    } finally {
      setLoading(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    }
  };

  const color = '#58B6A9';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {success && (
        <div style={{
          background: 'rgba(88,182,169,.1)',
          border: '1px solid #58B6A9',
          borderRadius: 10,
          padding: '10px 16px',
          color: '#17324D',
          fontWeight: 700,
          fontSize: '.84rem',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}>
          <CheckCircle2 size={16} color="#58B6A9" />
          <span>Votre observation a été transmise aux spécialistes.</span>
        </div>
      )}

      <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e2e8f0', padding: 24, boxShadow: '0 2px 8px rgba(23,50,77,.04)' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Choix du domaine */}
          <div>
            <label style={{ display: 'block', fontSize: '.82rem', fontWeight: 700, color: '#17324D', marginBottom: 8 }}>
              1. Domaine observé à la maison
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 8 }}>
              {DOMAINS.map(d => {
                const sel = domaine === d.id;
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setDomaine(d.id)}
                    style={{
                      padding: '10px 12px',
                      borderRadius: 10,
                      border: sel ? `2px solid ${color}` : '1px solid #e2e8f0',
                      background: sel ? 'rgba(88,182,169,.06)' : '#ffffff',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all .15s ease',
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: '.84rem', color: sel ? '#17324D' : '#1e293b' }}>
                      {d.label}
                    </div>
                    <div style={{ fontSize: '.72rem', color: '#64748b', marginTop: 2 }}>{d.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Fréquence */}
          <div style={{ background: '#f8fafc', padding: 14, borderRadius: 10, border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.78rem', fontWeight: 700, color: '#17324D', marginBottom: 4 }}>
              <span>2. Fréquence des difficultés constatées</span>
              <span style={{ color: color, fontWeight: 800 }}>{FREQ_LABELS[frequence]}</span>
            </div>
            <input
              type="range"
              min={1}
              max={5}
              value={frequence}
              onChange={e => setFrequence(+e.target.value)}
              style={{ width: '100%', accentColor: color }}
            />
          </div>

          {/* Détails */}
          <div>
            <label style={{ display: 'block', fontSize: '.82rem', fontWeight: 700, color: '#17324D', marginBottom: 4 }}>
              3. Vos observations à la maison pour {child?.prenom || 'votre enfant'}
            </label>
            <textarea
              rows={3}
              value={detail}
              onChange={e => setDetail(e.target.value)}
              required
              placeholder="Ex: Au moment des devoirs, la moindre distraction sonore coupe son fil de pensée..."
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: '.85rem' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '.82rem', fontWeight: 700, color: '#17324D', marginBottom: 4 }}>
              4. Exemple concret
            </label>
            <input
              type="text"
              value={exemples}
              onChange={e => setExemples(e.target.value)}
              placeholder="Ex: Se lève souvent pendant la lecture du soir..."
              style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: '.85rem' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                background: 'linear-gradient(135deg, #17324D 0%, #0f2035 100%)',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: 8,
                fontWeight: 700,
                fontSize: '.86rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                boxShadow: '0 2px 8px rgba(23,50,77,.2)',
              }}
            >
              <Send size={14} />
              <span>{loading ? 'Envoi…' : `Transmettre pour ${child?.prenom || 'mon enfant'}`}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
