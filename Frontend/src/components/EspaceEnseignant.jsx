import React, { useState } from 'react';
import { 
  GraduationCap, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  BookOpen, 
  Info,
  Layers
} from 'lucide-react';

export default function EspaceEnseignant({ child, onObservationAdded, refreshTrigger }) {
  const [domaine, setDomaine] = useState('ATTENTION');
  const [frequence, setFrequence] = useState(4);
  const [impact, setImpact] = useState(4);
  const [reponseDetaillee, setReponseDetaillee] = useState(
    'Difficulté persistante à maintenir son attention sur une double consigne écrite ou lors des exercices individuels de plus de 10 minutes.'
  );
  const [exemplesConcrets, setExemplesConcrets] = useState(
    'Regarde par la fenêtre dès le début de l exercice, oublie la deuxième étape des consignes.'
  );
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);

  const domainesOptions = [
    { id: 'ATTENTION', label: 'Attention & Maintien de l effort', desc: 'Capacité à suivre les consignes et rester concentré' },
    { id: 'MOTRICITE', label: 'Motricité fine & Écriture', desc: 'Tenue du stylo, copie au tableau, découpage' },
    { id: 'LANGAGE', label: 'Langage & Communication', desc: 'Compréhension orale et expression verbale' },
    { id: 'MEMOIRE', label: 'Mémoire de travail & Organisation', desc: 'Rétention des étapes, gestion du cartable et matériel' },
    { id: 'COMPORTEMENT', label: 'Comportement & Interactions', desc: 'Relations avec les pairs et régulation émotionnelle en groupe' }
  ];

  const frequenceLabels = [
    '',
    '1 - Jamais / Exceptionnel',
    '2 - Rarement (quelques fois par mois)',
    '3 - Parfois (1 à 2 fois par semaine)',
    '4 - Fréquemment (presque chaque jour)',
    '5 - Quotidien et persistant'
  ];

  const impactLabels = [
    '',
    '1 - Aucun impact sur les apprentissages',
    '2 - Léger retard facilement compensé',
    '3 - Nécessite des relances régulières',
    '4 - Bloque l autonomie sur l exercice',
    '5 - Grande souffrance / Échec systématique sans aide'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg(null);

    try {
      const payload = {
        enfantId: child.id,
        observateurId: 'a1111111-1111-1111-1111-111111111111',
        observateurNom: 'Mme Dupuis (Enseignante CE1)',
        domaine,
        contexte: 'ECOLE',
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
        setSuccessMsg('Observation enregistrée avec succès ! Le moteur de croisement a actualisé les signaux.');
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
      {/* En-tête Espace */}
      <div className="glass-card" style={{ padding: '24px', marginBottom: '24px', borderLeft: '5px solid #2563eb' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ background: '#eff6ff', padding: '12px', borderRadius: '12px', color: '#2563eb' }}>
              <GraduationCap size={28} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.4rem' }}>Espace Enseignant • Questionnaire d'Observation Scolaire</h2>
              <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
                Observatrice : <strong>Mme Dupuis</strong> • École Primaire Jules Ferry • Élève : <strong>{child?.prenom} {child?.nom_anonyme}</strong>
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f8fafc', padding: '8px 14px', borderRadius: '10px', fontSize: '0.85rem', color: '#475569', border: '1px solid #e2e8f0' }}>
            <Clock size={16} color="#2563eb" />
            <span>Format court : <strong>~5 minutes</strong></span>
          </div>
        </div>

        {/* Note éthique et RGPD */}
        <div style={{
          marginTop: '16px',
          background: '#eff6ff',
          borderRadius: '10px',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '10px',
          fontSize: '0.85rem',
          color: '#1e40af'
        }}>
          <Info size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <strong>Observation indépendante et neutre :</strong> Vous ne voyez pas les réponses de la famille ni des autres spécialistes afin de garantir une observation non biaisée. Vos remarques décrivent des faits concrets observés en classe.
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

      {/* Formulaire d'observation */}
      <div className="glass-card" style={{ padding: '30px' }}>
        <form onSubmit={handleSubmit}>
          {/* Sélection du Domaine */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontWeight: 700, fontSize: '1rem', marginBottom: '10px', color: '#1e293b' }}>
              1. Sélectionner le domaine d'observation
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
              {domainesOptions.map((opt) => (
                <div
                  key={opt.id}
                  onClick={() => setDomaine(opt.id)}
                  style={{
                    padding: '14px',
                    borderRadius: '12px',
                    border: domaine === opt.id ? '2px solid #2563eb' : '1px solid #e2e8f0',
                    background: domaine === opt.id ? '#eff6ff' : '#ffffff',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: domaine === opt.id ? '#1d4ed8' : '#334155' }}>
                    {opt.label}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
                    {opt.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Fréquence */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label style={{ fontWeight: 700, color: '#1e293b' }}>
                2. Fréquence des difficultés constatées en classe
              </label>
              <span style={{ fontWeight: 700, color: '#2563eb', fontSize: '0.9rem' }}>
                {frequenceLabels[frequence]}
              </span>
            </div>
            <input 
              type="range" 
              min="1" 
              max="5" 
              value={frequence}
              onChange={(e) => setFrequence(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#2563eb', cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>
              <span>1 - Très rare</span>
              <span>3 - Parfois</span>
              <span>5 - Quotidien</span>
            </div>
          </div>

          {/* Impact quotidien */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label style={{ fontWeight: 700, color: '#1e293b' }}>
                3. Impact sur l'autonomie et les apprentissages
              </label>
              <span style={{ fontWeight: 700, color: '#2563eb', fontSize: '0.9rem' }}>
                {impactLabels[impact]}
              </span>
            </div>
            <input 
              type="range" 
              min="1" 
              max="5" 
              value={impact}
              onChange={(e) => setImpact(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#2563eb', cursor: 'pointer' }}
            />
          </div>

          {/* Description factuelle */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontWeight: 700, color: '#1e293b', marginBottom: '8px' }}>
              4. Description factuelle des observations (sans poser de diagnostic)
            </label>
            <textarea
              rows="3"
              value={reponseDetaillee}
              onChange={(e) => setReponseDetaillee(e.target.value)}
              placeholder="Décrivez ce que vous observez concrètement lors des activités..."
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '10px',
                border: '1px solid #cbd5e1',
                fontSize: '0.95rem',
                fontFamily: 'inherit',
                resize: 'vertical'
              }}
            />
          </div>

          {/* Exemples concrets */}
          <div style={{ marginBottom: '28px' }}>
            <label style={{ display: 'block', fontWeight: 700, color: '#1e293b', marginBottom: '8px' }}>
              5. Exemples ou déclencheurs observés
            </label>
            <textarea
              rows="2"
              value={exemplesConcrets}
              onChange={(e) => setExemplesConcrets(e.target.value)}
              placeholder="Ex : bruit ambiant, changement de consigne, fin de journée..."
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
              className="btn btn-primary"
              disabled={loading}
              style={{ minWidth: '220px', padding: '12px 24px', fontSize: '1rem' }}
            >
              {loading ? (
                <span>Enregistrement en cours...</span>
              ) : (
                <>
                  <Send size={18} />
                  <span>Transmettre l'observation</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
