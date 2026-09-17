import React, { useState } from 'react';
import { HeartHandshake, Lock, Send, CheckCircle2, ShieldCheck } from 'lucide-react';

const DOMAINS = [
  { id: 'ATTENTION',    label: 'Devoirs & Concentration',        desc: 'Se poser pour les devoirs, dispersion' },
  { id: 'LANGAGE',      label: 'Communication & Vocabulaire',    desc: 'Raconte ses journées, expression orale' },
  { id: 'MEMOIRE',      label: 'Routines & Oublis du quotidien', desc: 'Affaires oubliées, ordre des tâches' },
  { id: 'COMPORTEMENT', label: 'Émotions, Sommeil & Fatigue',    desc: 'Frustrations, transitions, endormissement' },
  { id: 'MOTRICITE',    label: 'Gestes du quotidien',            desc: 'Lacets, boutons, couverts' },
];

const FREQ_LABELS = ['', 'Très occasionnel', 'De temps en temps', 'Régulièrement', 'Quasiment chaque soir', 'Quotidien & systématique'];
const IMPACT_LABELS = ['', 'Léger / Gérable', 'Gère avec aide', 'Génère de la fatigue', 'Moment de tension', 'Épuisement familial'];

export default function EspaceParent({ child, onObservationAdded, user }) {
  const [domaine, setDomaine] = useState('ATTENTION');
  const [frequence, setFrequence] = useState(4);
  const [impact, setImpact] = useState(4);
  const [detail, setDetail] = useState('Au moment des devoirs, la moindre distraction sonore coupe totalement son fil de pensée. Fatigue mentale rapide.');
  const [exemples, setExemples] = useState('Se lève plusieurs fois pour aller chercher un objet, a du mal à finir 3 lignes de lecture sans pause.');
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
          observateurNom: user?.nom || 'Sophie M. (Parent)',
          domaine, contexte: 'MAISON',
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

  const color = '#7c3aed';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* Privacy notice */}
      <div className="alert alert-info" style={{ fontSize: '.84rem' }}>
        <Lock size={15} style={{ flexShrink: 0, marginTop: 1 }} />
        <div>
          <strong>Confidentialité :</strong> Vos observations familiales restent strictement protégées. Vous ne voyez pas celles de l'école — pour éviter toute influence. Aucune étiquette n'est apposée à votre enfant.
        </div>
      </div>

      {success && (
        <div className="alert alert-success fade-in">
          <CheckCircle2 size={15} style={{ flexShrink: 0 }} />
          <span>Votre observation a été transmise. Merci pour votre collaboration !</span>
        </div>
      )}

      <div className="card" style={{ padding: 28 }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          {/* Domain */}
          <div className="field">
            <label>1. Domaine à partager</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
              {DOMAINS.map(d => {
                const sel = domaine === d.id;
                return (
                  <button key={d.id} type="button" onClick={() => setDomaine(d.id)} style={{
                    padding: '12px 14px', borderRadius: 'var(--r-md)',
                    border: sel ? `2px solid ${color}` : '1.5px solid var(--border)',
                    background: sel ? '#f5f3ff' : 'var(--surface)',
                    cursor: 'pointer', textAlign: 'left', transition: 'all var(--dur) var(--ease)',
                  }}>
                    <div style={{ fontWeight: 700, fontSize: '.87rem', color: sel ? color : 'var(--gray-800)' }}>{d.label}</div>
                    <p style={{ margin: '4px 0 0', fontSize: '.74rem', color: 'var(--text-sub)' }}>{d.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sliders */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20, background: 'var(--gray-50)', borderRadius: 'var(--r-lg)', padding: 20, border: '1px solid var(--border)' }}>
            <div className="field">
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <label>2. Fréquence à la maison</label>
                <span style={{ background: color, color: 'white', padding: '1px 10px', borderRadius: 99, fontSize: '.73rem', fontWeight: 700 }}>{FREQ_LABELS[frequence]}</span>
              </div>
              <input type="range" min={1} max={5} value={frequence} onChange={e => setFrequence(+e.target.value)} style={{ accentColor: color }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.7rem', color: 'var(--text-muted)' }}>
                <span>Jamais</span><span>Systématique</span>
              </div>
            </div>
            <div className="field">
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <label>3. Impact ressenti</label>
                <span style={{ background: '#6d28d9', color: 'white', padding: '1px 10px', borderRadius: 99, fontSize: '.73rem', fontWeight: 700 }}>{IMPACT_LABELS[impact]}</span>
              </div>
              <input type="range" min={1} max={5} value={impact} onChange={e => setImpact(+e.target.value)} style={{ accentColor: '#6d28d9' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.7rem', color: 'var(--text-muted)' }}>
                <span>Nul</span><span>Épuisant</span>
              </div>
            </div>
          </div>

          <div className="field">
            <label>4. Racontez avec vos mots ce qui se passe</label>
            <textarea rows={3} value={detail} onChange={e => setDetail(e.target.value)}
              placeholder="Ex : Lors de la lecture du soir, il regarde ailleurs, demande à changer d'activité..." />
          </div>

          <div className="field">
            <label>5. Situations où votre enfant est le plus apaisé ou en difficulté</label>
            <textarea rows={2} value={exemples} onChange={e => setExemples(e.target.value)}
              placeholder="Ex : Quand la pièce est calme, ou après une pause goûter..." />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" disabled={loading} className="btn btn-lg" style={{ background: `linear-gradient(135deg, ${color}, #6d28d9)`, color: 'white', boxShadow: `0 4px 12px ${color}40` }}>
              <Send size={16} /> {loading ? 'Envoi…' : 'Enregistrer mon observation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
