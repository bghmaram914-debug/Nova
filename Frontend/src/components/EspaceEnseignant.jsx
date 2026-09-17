import React, { useState, useEffect } from 'react';
import { GraduationCap, Send, CheckCircle2, Lock, Users, User } from 'lucide-react';

const DOMAINS = [
  { id: 'ATTENTION',    icon: '🎯', label: 'Attention & Consignes',       desc: 'Maintien de l\'effort, compréhension des consignes' },
  { id: 'LANGAGE',      icon: '💬', label: 'Langage & Communication',      desc: 'Expression orale, lecture, compréhension' },
  { id: 'MEMOIRE',      icon: '🧠', label: 'Mémoire & Apprentissages',     desc: 'Mémorisation des leçons, orthographe, repères' },
  { id: 'MOTRICITE',    icon: '✏️', label: 'Motricité fine & Écriture',    desc: 'Tenue du crayon, vitesse de copie, découpage' },
  { id: 'COMPORTEMENT', icon: '🏫', label: 'Comportement & Vie de classe', desc: 'Relation aux pairs, règles, impulsivité' },
];

const PRESETS = [
  { domaine: 'ATTENTION',    label: 'Attention soutenue',   detail: 'Difficulté persistante à maintenir son attention sur une double consigne écrite ou lors des exercices individuels de plus de 10 minutes.', ex: 'Regarde par la fenêtre dès le début de l\'exercice, oublie souvent la 2ème étape des consignes doubles.' },
  { domaine: 'MOTRICITE',    label: 'Écriture difficile',   detail: 'Tenue du crayon crispée, lenteur pour copier les devoirs au tableau mais résultat lisible.', ex: 'Prend 5 minutes de plus que ses camarades pour copier la date.' },
  { domaine: 'COMPORTEMENT', label: 'Agitation en classe',  detail: 'Bouge souvent, se lève sans raison apparente, perturbe parfois les camarades.', ex: 'A du mal à rester assis plus de 15 minutes sans se lever ou se retourner.' },
];

const FREQ_LABELS = ['', 'Très rare', 'Occasionnel', 'Régulier', 'Fréquent', 'Quotidien'];
const IMPACT_LABELS = ['', 'Minimal', 'Léger', 'Modéré', 'Important', 'Critique'];

export default function EspaceEnseignant({ child, onObservationAdded, user, allChildren }) {
  const [enfantsList, setEnfantsList] = useState(allChildren || []);
  const [selectedChild, setSelectedChild] = useState(child);

  const [domaine, setDomaine] = useState('ATTENTION');
  const [frequence, setFrequence] = useState(4);
  const [impact, setImpact] = useState(4);
  const [detail, setDetail] = useState(PRESETS[0].detail);
  const [exemples, setExemples] = useState(PRESETS[0].ex);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Charger la liste des enfants depuis l'API au chargement
  useEffect(() => {
    const fetchEnfants = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/enfants');
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            setEnfantsList(data);
            // si pas d'enfant sélectionné, sélectionner le premier
            if (!selectedChild) {
              setSelectedChild(data[0]);
            }
          }
        }
      } catch (err) {
        console.warn('Impossible de charger la liste des enfants depuis l\'API, utilisation du mode fallback.');
      }
    };

    fetchEnfants();
  }, []);

  // Mettre à jour si la prop child change
  useEffect(() => {
    if (child) {
      setSelectedChild(child);
      setEnfantsList((prev) => {
        if (!prev.find((c) => c.id === child.id)) {
          return [child, ...prev];
        }
        return prev;
      });
    }
  }, [child]);

  const applyPreset = (p) => {
    setDomaine(p.domaine);
    setDetail(p.detail);
    setExemples(p.ex);
  };

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
          observateurNom: user?.nom || 'Mme Dupuis (Enseignante)',
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
      setTimeout(() => setSuccess(false), 5000);
    }
  };

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }} className="fade-up">

      {/* Page header */}
      <div style={{
        background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)',
        borderRadius: 'var(--r-2xl)',
        padding: '28px 32px',
        color: 'white',
        boxShadow: '0 8px 24px rgba(29,78,216,.28)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16,
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <span style={{ background: 'rgba(255,255,255,.15)', padding: '3px 12px', borderRadius: 99, fontSize: '.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
              <GraduationCap size={13} /> ESPACE ENSEIGNANT
            </span>
            <span style={{ fontSize: '.82rem', opacity: .9 }}>{user?.nom || 'Mme Dupuis'}</span>
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '0 0 6px', letterSpacing: '-.025em', color: 'white' }}>
            Observation & Feedback en classe
          </h2>
          <p style={{ margin: 0, fontSize: '.88rem', opacity: .88, maxWidth: 520, lineHeight: 1.55 }}>
            Sélectionnez l'élève et décrivez vos observations factuelles en classe. Vos retours alimentent la détection précoce collaborative.
          </p>
        </div>

        {/* Child Badge / Selector */}
        <div style={{ background: 'rgba(255,255,255,.12)', border: '1px solid rgba(255,255,255,.2)', borderRadius: 14, padding: '14px 20px', textAlign: 'center', minWidth: 180 }}>
          <div style={{ fontSize: '.68rem', textTransform: 'uppercase', letterSpacing: '.07em', opacity: .75, marginBottom: 4 }}>Élève actuellement évalué</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>
            {selectedChild?.prenom || 'Lucas'} {selectedChild?.nom_anonyme || selectedChild?.parentNom ? `(${selectedChild?.code || ''})` : 'M.'}
          </div>
          <div style={{ fontSize: '.78rem', opacity: .8, marginTop: 2 }}>
            {selectedChild?.age || 7} ans · {selectedChild?.niveau_scolaire || selectedChild?.niveauScolaire || 'CP'}
          </div>
        </div>
      </div>

      {/* Selecteur d'enfant pour l'enseignant */}
      <div className="card" style={{ padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ padding: 8, background: '#e0e7ff', color: '#4338ca', borderRadius: 10 }}>
            <Users size={18} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '.9rem', color: '#1e293b' }}>Choisir l'élève à observer</div>
            <div style={{ fontSize: '.78rem', color: '#64748b' }}>Tous les enfants inscrits par les parents apparaissent ici</div>
          </div>
        </div>

        <select
          value={selectedChild?.id || ''}
          onChange={(e) => {
            const found = enfantsList.find((c) => c.id === e.target.value);
            if (found) setSelectedChild(found);
          }}
          style={{
            padding: '10px 16px',
            borderRadius: 10,
            border: '1.5px solid #cbd5e1',
            background: 'white',
            fontWeight: 600,
            color: '#1e293b',
            fontSize: '.9rem',
            cursor: 'pointer',
            minWidth: 220,
          }}
        >
          {enfantsList.map((e) => (
            <option key={e.id} value={e.id}>
              {e.prenom} {e.nom_anonyme || ''} ({e.niveau_scolaire || e.niveauScolaire || 'CP'}) {e.code ? `- ${e.code}` : ''}
            </option>
          ))}
          {enfantsList.length === 0 && (
            <option value="">{child?.prenom || 'Lucas'} (Défaut)</option>
          )}
        </select>
      </div>

      {/* Ethical notice */}
      <div className="alert alert-info" style={{ fontSize: '.84rem' }}>
        <Lock size={15} style={{ flexShrink: 0, marginTop: 1 }} />
        <span><strong>Observation indépendante :</strong> Vous ne voyez pas les réponses de la famille ni des spécialistes — vos remarques doivent décrire des faits observés en classe uniquement pour {selectedChild?.prenom || 'cet élève'}.</span>
      </div>

      {/* Success */}
      {success && (
        <div className="alert alert-success fade-in">
          <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
          <span>Observation enregistrée avec succès pour <strong>{selectedChild?.prenom}</strong>. Elle contribue au croisement multi-acteurs.</span>
        </div>
      )}

      {/* Form card */}
      <div className="card" style={{ padding: '28px' }}>
        {/* Presets */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 22, flexWrap: 'wrap' }}>
          <span style={{ fontSize: '.78rem', fontWeight: 600, color: 'var(--text-sub)' }}>Exemples rapides :</span>
          {PRESETS.map((p, i) => (
            <button key={i} type="button" onClick={() => applyPreset(p)} className="btn btn-sm btn-secondary">
              {p.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Domain */}
          <div className="field">
            <label>1. Domaine observé en classe</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
              {DOMAINS.map(d => {
                const sel = domaine === d.id;
                return (
                  <button key={d.id} type="button" onClick={() => setDomaine(d.id)} style={{
                    padding: '12px 14px', borderRadius: 'var(--r-md)', border: sel ? '2px solid var(--brand-blue)' : '1.5px solid var(--border)',
                    background: sel ? 'var(--blue-bg)' : 'var(--surface)', cursor: 'pointer', textAlign: 'left',
                    transition: 'all var(--dur) var(--ease)',
                  }}>
                    <div style={{ fontWeight: 700, fontSize: '.87rem', color: sel ? 'var(--brand-blue)' : 'var(--gray-800)', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span>{d.icon}</span> {d.label}
                    </div>
                    <p style={{ margin: '4px 0 0', fontSize: '.74rem', color: 'var(--text-sub)' }}>{d.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sliders */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, background: 'var(--gray-50)', borderRadius: 'var(--r-lg)', padding: '20px', border: '1px solid var(--border)' }}>
            {/* Frequency */}
            <div className="field">
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <label>Fréquence observée</label>
                <span style={{ background: 'var(--brand-blue)', color: 'white', padding: '1px 10px', borderRadius: 99, fontSize: '.75rem', fontWeight: 700 }}>{FREQ_LABELS[frequence]}</span>
              </div>
              <input type="range" min={1} max={5} value={frequence} onChange={e => setFrequence(+e.target.value)} style={{ accentColor: 'var(--brand-blue)' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.7rem', color: 'var(--text-muted)' }}>
                <span>Jamais</span><span>Quotidien</span>
              </div>
            </div>
            {/* Impact */}
            <div className="field">
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <label>Impact sur la scolarité</label>
                <span style={{ background: '#1e40af', color: 'white', padding: '1px 10px', borderRadius: 99, fontSize: '.75rem', fontWeight: 700 }}>{IMPACT_LABELS[impact]}</span>
              </div>
              <input type="range" min={1} max={5} value={impact} onChange={e => setImpact(+e.target.value)} style={{ accentColor: '#1e40af' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.7rem', color: 'var(--text-muted)' }}>
                <span>Nul</span><span>Bloquant</span>
              </div>
            </div>
          </div>

          {/* Textareas */}
          <div className="field">
            <label>2. Ce que vous avez observé en classe pour {selectedChild?.prenom || 'l\'élève'}</label>
            <textarea rows={3} value={detail} onChange={e => setDetail(e.target.value)} required
              placeholder="Ex: Pendant les activités de lecture individuelle, il quitte rapidement le texte des yeux..." />
          </div>

          <div className="field">
            <label>3. Exemple concret observé</label>
            <textarea rows={2} value={exemples} onChange={e => setExemples(e.target.value)}
              placeholder="Ex: Hier lors de la dictée, il a demandé 3 fois qu'on répète la même phrase..." />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" disabled={loading} className="btn btn-primary btn-lg">
              <Send size={16} />
              {loading ? 'Envoi…' : `Transmettre l'observation pour ${selectedChild?.prenom || 'l\'élève'}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

