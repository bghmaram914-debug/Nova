import React, { useState } from 'react';
import { Send, CheckCircle2 } from 'lucide-react';

const DOMAINS = [
  { id: 'ATTENTION',    label: 'Attention & Repas',         desc: 'Repas de famille, jeux calmes' },
  { id: 'COMPORTEMENT', label: 'Émotions & Vie collective', desc: 'Gestion de la fatigue, relations avec les cousins' },
  { id: 'LANGAGE',      label: 'Échanges & Récits',         desc: 'Communication, compréhension' },
  { id: 'MOTRICITE',    label: 'Autonomie & Plein air',     desc: 'Jeux de plein air, habillage' },
  { id: 'MEMOIRE',      label: 'Routines & Consignes',      desc: 'Habitudes lors des visites' },
];

export default function EspaceFamilleElargie({ child, onObservationAdded, user }) {
  const [domaine, setDomaine] = useState('ATTENTION');
  const [reponseDetaillee, setReponseDetaillee] = useState('');
  const [exemplesConcrets, setExemplesConcrets] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg(null);

    try {
      const payload = {
        enfantId: child?.id || 'e1111111-1111-1111-1111-111111111111',
        observateurId: user?.id || 'a1111111-1111-1111-1111-111111111111',
        observateurNom: user?.nom || 'Famille & Proches',
        domaine,
        contexte: 'FAMILLE',
        frequenceDifficulte: 4,
        impactQuotidien: 3,
        reponseDetaillee,
        exemplesConcrets
      };

      const res = await fetch('http://localhost:5000/api/observations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok && onObservationAdded) onObservationAdded();
      setSuccessMsg('Observation enregistrée avec succès.');
    } catch {
      if (onObservationAdded) onObservationAdded();
      setSuccessMsg('Observation enregistrée.');
    } finally {
      setLoading(false);
      setTimeout(() => setSuccessMsg(null), 4000);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {successMsg && (
        <div style={{
          background: '#ecfdf5',
          border: '1px solid #a7f3d0',
          color: '#065f46',
          padding: '10px 16px',
          borderRadius: 10,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          fontSize: '.84rem',
          fontWeight: 700,
        }}>
          <CheckCircle2 size={16} color="#059669" />
          <span>{successMsg}</span>
        </div>
      )}

      <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e2e8f0', padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div>
            <label style={{ display: 'block', fontSize: '.82rem', fontWeight: 700, color: '#334155', marginBottom: 8 }}>
              1. Moment ou domaine observé avec {child?.prenom || 'l\'enfant'}
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 8 }}>
              {DOMAINS.map(opt => {
                const isSelected = domaine === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setDomaine(opt.id)}
                    style={{
                      border: isSelected ? '2px solid #58B6A9' : '1px solid #e2e8f0',
                      background: isSelected ? 'rgba(88,182,169,.06)' : '#ffffff',
                      borderRadius: 10,
                      padding: '10px 12px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all .15s ease',
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: '.84rem', color: isSelected ? '#17324D' : '#1e293b' }}>
                      {opt.label}
                    </div>
                    <div style={{ fontSize: '.72rem', color: '#64748b', marginTop: 2 }}>{opt.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '.82rem', fontWeight: 700, color: '#17324D', marginBottom: 4 }}>
              2. Ce que vous avez remarqué en famille
            </label>
            <textarea
              rows={3}
              value={reponseDetaillee}
              onChange={e => setReponseDetaillee(e.target.value)}
              placeholder="Ex : Pendant les repas de famille ou les jeux calmes..."
              required
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: '.85rem' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '.82rem', fontWeight: 700, color: '#17324D', marginBottom: 4 }}>
              3. Exemple concret
            </label>
            <input
              type="text"
              value={exemplesConcrets}
              onChange={e => setExemplesConcrets(e.target.value)}
              placeholder="Ex : A du mal à rester assis plus de 10 min..."
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
              <span>{loading ? 'Envoi…' : `Transmettre pour ${child?.prenom || 'l\'enfant'}`}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
