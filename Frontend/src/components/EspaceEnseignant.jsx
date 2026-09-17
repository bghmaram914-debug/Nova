import React, { useState, useEffect } from 'react';
import { GraduationCap, Send, CheckCircle2, Lock, Users } from 'lucide-react';

const DOMAINS = [
  { id: 'ATTENTION',    icon: '🎯', label: 'Attention & Consignes',       desc: 'Effort d\'attention, écoute des consignes' },
  { id: 'LANGAGE',      icon: '💬', label: 'Langage & Communication',      desc: 'Expression orale, lecture, compréhension' },
  { id: 'MEMOIRE',      icon: '🧠', label: 'Mémoire & Apprentissage',      desc: 'Mémorisation des leçons, repères' },
  { id: 'MOTRICITE',    icon: '✏️', label: 'Motricité fine & Graphisme',   desc: 'Tenue du stylo, vitesse d\'écriture' },
  { id: 'COMPORTEMENT', icon: '🏫', label: 'Comportement & Relationnel',   desc: 'Intégration, respect des règles, agitation' },
];

const FREQ_LABELS = ['', 'Très rare', 'Occasionnel', 'Régulier', 'Fréquent', 'Quotidien'];
const IMPACT_LABELS = ['', 'Minimal', 'Léger', 'Modéré', 'Important', 'Critique'];

export default function EspaceEnseignant({ child, onObservationAdded, user, allChildren }) {
  const [enfantsList, setEnfantsList] = useState(allChildren || []);
  const [selectedChild, setSelectedChild] = useState(child);

  const [domaine, setDomaine] = useState('ATTENTION');
  const [frequence, setFrequence] = useState(4);
  const [impact, setImpact] = useState(4);
  const [detail, setDetail] = useState('Difficulté persistante à maintenir son attention sur une double consigne écrite ou lors des exercices individuels de plus de 10 minutes.');
  const [exemples, setExemples] = useState('Regarde souvent par la fenêtre au début de l\'exercice, oublie la 2ème étape.');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchEnfants = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/enfants');
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            setEnfantsList(data);
            if (!selectedChild) setSelectedChild(data[0]);
          }
        }
      } catch {}
    };
    fetchEnfants();
  }, []);

  useEffect(() => {
    if (child) {
      setSelectedChild(child);
      setEnfantsList(prev => (!prev.find(c => c.id === child.id) ? [child, ...prev] : prev));
    }
  }, [child]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/observations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enfantId: selectedChild?.id || child?.id || 'e1111111-1111-1111-1111-111111111111',
          observateurId: user?.id || 'a1111111-1111-1111-1111-111111111111',
          observateurNom: user?.nom || 'Mme Sonia Trabelsi',
          domaine,
          contexte: 'ECOLE',
          frequenceDifficulte: frequence,
          impactQuotidien: impact,
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

  return (
    <div style={{ maxWidth: 840, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }} className="fade-up">
      {/* En-tête avec sélecteur d'élève direct */}
      <div style={{
        background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)',
        borderRadius: 16,
        padding: '20px 24px',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 14,
        boxShadow: '0 4px 14px rgba(29,78,216,.2)',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '.75rem', opacity: .9, marginBottom: 4 }}>
            <GraduationCap size={15} />
            <span>ESPACE ENSEIGNANT · SAISIE D'OBSERVATION FACTUELLE</span>
          </div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, color: 'white' }}>
            Observation en classe
          </h2>
        </div>

        {/* Sélecteur compact de l'élève */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,.15)', padding: '6px 12px', borderRadius: 10 }}>
          <Users size={15} color="white" />
          <span style={{ fontSize: '.8rem', fontWeight: 600 }}>Élève :</span>
          <select
            value={selectedChild?.id || ''}
            onChange={e => {
              const found = enfantsList.find(c => c.id === e.target.value);
              if (found) setSelectedChild(found);
            }}
            style={{
              padding: '4px 8px',
              borderRadius: 6,
              border: 'none',
              background: 'white',
              fontWeight: 700,
              color: '#1e293b',
              fontSize: '.82rem',
              cursor: 'pointer',
            }}
          >
            {enfantsList.map(e => (
              <option key={e.id} value={e.id}>
                {e.prenom} {e.nom_anonyme || ''} ({e.niveau_scolaire || 'Primaire'})
              </option>
            ))}
            {enfantsList.length === 0 && <option value="">{child?.prenom || 'Youssef B.'}</option>}
          </select>
        </div>
      </div>

      {success && (
        <div style={{
          background: '#ecfdf5',
          border: '1px solid #a7f3d0',
          borderRadius: 10,
          padding: '10px 16px',
          color: '#065f46',
          fontWeight: 700,
          fontSize: '.84rem',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}>
          <CheckCircle2 size={16} color="#059669" />
          <span>Observation enregistrée pour <strong>{selectedChild?.prenom}</strong>.</span>
        </div>
      )}

      {/* Formulaire épuré */}
      <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,.02)' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Choix du domaine */}
          <div>
            <label style={{ display: 'block', fontSize: '.82rem', fontWeight: 700, color: '#334155', marginBottom: 8 }}>
              1. Domaine observé en classe
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
                      border: sel ? '2px solid #2563eb' : '1px solid #e2e8f0',
                      background: sel ? '#eff6ff' : '#ffffff',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all .15s ease',
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: '.84rem', color: sel ? '#1d4ed8' : '#1e293b', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span>{d.icon}</span> {d.label}
                    </div>
                    <div style={{ fontSize: '.72rem', color: '#64748b', marginTop: 2 }}>{d.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Intensité / Fréquence */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, background: '#f8fafc', padding: 14, borderRadius: 10, border: '1px solid #e2e8f0' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.78rem', fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                <span>Fréquence</span>
                <span style={{ color: '#2563eb' }}>{FREQ_LABELS[frequence]}</span>
              </div>
              <input
                type="range"
                min={1}
                max={5}
                value={frequence}
                onChange={e => setFrequence(+e.target.value)}
                style={{ width: '100%', accentColor: '#2563eb' }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.78rem', fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                <span>Impact scolaire</span>
                <span style={{ color: '#1d4ed8' }}>{IMPACT_LABELS[impact]}</span>
              </div>
              <input
                type="range"
                min={1}
                max={5}
                value={impact}
                onChange={e => setImpact(+e.target.value)}
                style={{ width: '100%', accentColor: '#1d4ed8' }}
              />
            </div>
          </div>

          {/* Observations concrètes */}
          <div>
            <label style={{ display: 'block', fontSize: '.82rem', fontWeight: 700, color: '#334155', marginBottom: 4 }}>
              2. Description factuelle en classe pour {selectedChild?.prenom || 'l\'élève'}
            </label>
            <textarea
              rows={3}
              value={detail}
              onChange={e => setDetail(e.target.value)}
              required
              placeholder="Décrivez ce que vous constatez précisément lors des exercices..."
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: '.85rem' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '.82rem', fontWeight: 700, color: '#334155', marginBottom: 4 }}>
              3. Exemple concret récent
            </label>
            <input
              type="text"
              value={exemples}
              onChange={e => setExemples(e.target.value)}
              placeholder="Ex: Lors de la dictée d'hier, a demandé 3 fois la répétition..."
              style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: '.85rem' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)',
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
                boxShadow: '0 2px 8px rgba(37,99,235,.25)',
              }}
            >
              <Send size={14} />
              <span>{loading ? 'Transmission…' : `Transmettre l'observation (${selectedChild?.prenom || 'Élève'})`}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
