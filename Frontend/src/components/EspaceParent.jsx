import React, { useState } from 'react';
import { 
  HeartHandshake, 
  ShieldCheck, 
  Send, 
  CheckCircle2, 
  Home, 
  Moon, 
  Smile, 
  Sparkles,
  Lock
} from 'lucide-react';

export default function EspaceParent({ child, onObservationAdded, refreshTrigger }) {
  const [consentementSigne, setConsentementSigne] = useState(true);
  const [domaine, setDomaine] = useState('ATTENTION');
  const [frequence, setFrequence] = useState(4);
  const [impact, setImpact] = useState(4);
  const [reponseDetaillee, setReponseDetaillee] = useState(
    'Au moment des devoirs, la moindre distraction sonore coupe totalement son fil de pensée. Fatigue mentale rapide.'
  );
  const [exemplesConcrets, setExemplesConcrets] = useState(
    'Se lève plusieurs fois pour aller chercher un objet, a du mal à finir 3 lignes de lecture sans pause.'
  );
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);

  const domainesOptions = [
    { id: 'ATTENTION', label: 'Devoirs & Concentration à la maison', desc: 'Capacité à se poser pour les devoirs, dispersion face aux bruits' },
    { id: 'LANGAGE', label: 'Communication & Vocabulaire', desc: 'Raconte ses journées, expression orale et compréhension' },
    { id: 'MEMOIRE', label: 'Routines & Oublis du quotidien', desc: 'Habillage, affaires oubliées, respect de l ordre des tâches' },
    { id: 'COMPORTEMENT', label: 'Émotions, Sommeil & Fatigue', desc: 'Gestation des frustrations, transitions, temps d endormissement' },
    { id: 'MOTRICITE', label: 'Gestes du quotidien', desc: 'Lacets, boutons, utilisation des couverts' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg(null);

    try {
      const payload = {
        enfantId: child.id,
        observateurId: 'a2222222-2222-2222-2222-222222222222',
        observateurNom: 'Sophie M. (Parent de Léo)',
        domaine,
        contexte: 'MAISON',
        frequenceDifficulte: frequence,
        impactQuotidien: impact,
        reponseDetaillee,
        exemplesConcrets
      };

      const res = await fetch('http://localhost:5000/api/observations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setSuccessMsg('Votre observation a été transmise en toute confidentialité ! Merci pour votre collaboration.');
        if (onObservationAdded) onObservationAdded();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fade-in" style={{ paddingBottom: '40px' }}>
      {/* En-tête Espace Parent */}
      <div className="glass-card" style={{ padding: '24px', marginBottom: '24px', borderLeft: '5px solid #059669' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ background: '#ecfdf5', padding: '12px', borderRadius: '12px', color: '#059669' }}>
              <HeartHandshake size={28} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.4rem' }}>Espace Parent • Votre regard du quotidien</h2>
              <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
                Parent connecté : <strong>Sophie M.</strong> • Enfant : <strong>{child?.prenom} {child?.nom_anonyme}</strong>
              </p>
            </div>
          </div>

          {/* Badge Consentement RGPD */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: '#ecfdf5',
            border: '1px solid #a7f3d0',
            padding: '8px 14px',
            borderRadius: '10px',
            fontSize: '0.85rem',
            color: '#065f46'
          }}>
            <ShieldCheck size={18} color="#059669" />
            <span>Consentement parental : <strong>Actif & Signé</strong></span>
          </div>
        </div>

        {/* Engagement de confiance */}
        <div style={{
          marginTop: '16px',
          background: '#f0fdf4',
          borderRadius: '10px',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '10px',
          fontSize: '0.85rem',
          color: '#166534'
        }}>
          <Lock size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <strong>Confidentialité & Valeur Fondamentale :</strong> Vos observations familiales restent strictement protégées. Vous partagez vos observations librement sans voir celles de l'école afin d'éviter toute influence mutuelle. Aucune étiquette n'est apposée à votre enfant.
          </div>
        </div>
      </div>

      {successMsg && (
        <div className="glass-card fade-in" style={{
          padding: '16px 20px',
          marginBottom: '20px',
          background: '#ecfdf5',
          border: '1px solid #a7f3d0',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          color: '#065f46'
        }}>
          <CheckCircle2 size={20} color="#10b981" />
          <span style={{ fontWeight: 600 }}>{successMsg}</span>
        </div>
      )}

      {/* Formulaire Parent */}
      <div className="glass-card" style={{ padding: '30px' }}>
        <form onSubmit={handleSubmit}>
          {/* Sélection Domaine */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontWeight: 700, fontSize: '1rem', marginBottom: '10px', color: '#1e293b' }}>
              1. Dans quel domaine souhaitez-vous partager une observation ?
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
              {domainesOptions.map((opt) => (
                <div
                  key={opt.id}
                  onClick={() => setDomaine(opt.id)}
                  style={{
                    padding: '14px',
                    borderRadius: '12px',
                    border: domaine === opt.id ? '2px solid #059669' : '1px solid #e2e8f0',
                    background: domaine === opt.id ? '#ecfdf5' : '#ffffff',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: domaine === opt.id ? '#047857' : '#334155' }}>
                    {opt.label}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
                    {opt.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Curseur Fréquence à la maison */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label style={{ fontWeight: 700, color: '#1e293b' }}>
                2. À quelle fréquence cela se manifeste-t-il à la maison ?
              </label>
              <span style={{ fontWeight: 700, color: '#059669', fontSize: '0.9rem' }}>
                {frequence === 1 && 'Très occasionnel'}
                {frequence === 2 && 'De temps en temps'}
                {frequence === 3 && 'Régulièrement chaque semaine'}
                {frequence === 4 && 'Quasiment à chaque séance de devoirs'}
                {frequence === 5 && 'Quotidien et systématique'}
              </span>
            </div>
            <input 
              type="range" 
              min="1" 
              max="5" 
              value={frequence}
              onChange={(e) => setFrequence(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#059669', cursor: 'pointer' }}
            />
          </div>

          {/* Impact sur le quotidien de la famille */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label style={{ fontWeight: 700, color: '#1e293b' }}>
                3. Quel est l'impact ressenti sur le quotidien ?
              </label>
              <span style={{ fontWeight: 700, color: '#059669', fontSize: '0.9rem' }}>
                {impact <= 2 ? 'Léger / Gérable sereinement' : impact === 3 ? 'Génère de la fatigue' : 'Moment de tension et d épuisement'}
              </span>
            </div>
            <input 
              type="range" 
              min="1" 
              max="5" 
              value={impact}
              onChange={(e) => setImpact(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#059669', cursor: 'pointer' }}
            />
          </div>

          {/* Description */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontWeight: 700, color: '#1e293b', marginBottom: '8px' }}>
              4. Racontez avec vos mots ce qui se passe
            </label>
            <textarea
              rows="3"
              value={reponseDetaillee}
              onChange={(e) => setReponseDetaillee(e.target.value)}
              placeholder="Ex : Lors de la lecture du soir, il regarde ailleurs, demande à changer d activité..."
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '10px',
                border: '1px solid #cbd5e1',
                fontSize: '0.95rem',
                fontFamily: 'inherit'
              }}
            />
          </div>

          {/* Exemples concrets */}
          <div style={{ marginBottom: '28px' }}>
            <label style={{ display: 'block', fontWeight: 700, color: '#1e293b', marginBottom: '8px' }}>
              5. Situations où votre enfant est le plus apaisé ou en difficulté
            </label>
            <textarea
              rows="2"
              value={exemplesConcrets}
              onChange={(e) => setExemplesConcrets(e.target.value)}
              placeholder="Ex : Quand la pièce est calme, ou après une pause goûter..."
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '10px',
                border: '1px solid #cbd5e1',
                fontSize: '0.95rem',
                fontFamily: 'inherit'
              }}
            />
          </div>

          {/* Bouton de soumission */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button 
              type="submit" 
              className="btn"
              disabled={loading}
              style={{ 
                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)', 
                color: 'white',
                minWidth: '220px', 
                padding: '12px 24px', 
                fontSize: '1rem',
                boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)'
              }}
            >
              {loading ? (
                <span>Enregistrement...</span>
              ) : (
                <>
                  <Send size={18} />
                  <span>Enregistrer mon observation</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
