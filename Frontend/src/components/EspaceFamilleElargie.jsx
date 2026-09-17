import React, { useState } from 'react';
import { 
  Users, 
  Heart, 
  Send, 
  CheckCircle2, 
  Smile, 
  Sparkles,
  Lock,
  Clock,
  Compass,
  AlertCircle
} from 'lucide-react';

export default function EspaceFamilleElargie({ child, onObservationAdded, refreshTrigger, user }) {
  const [domaine, setDomaine] = useState('ATTENTION');
  const [frequence, setFrequence] = useState(4);
  const [impact, setImpact] = useState(3);
  const [reponseDetaillee, setReponseDetaillee] = useState(
    'Lors des déjeuners de famille et des jeux calmes, Léo a du mal à rester assis plus de 10 minutes et passe constamment d une activité à l autre.'
  );
  const [exemplesConcrets, setExemplesConcrets] = useState(
    'Quitte souvent la table avant la fin, commence un puzzle puis abandonne pour courir chercher un autre jeu.'
  );
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const domainesOptions = [
    { 
      id: 'ATTENTION', 
      label: 'Attention & Activités familiales', 
      desc: 'Capacité à se poser pour un repas de famille, un jeu de société calme, écouter une histoire',
      icon: '🎯'
    },
    { 
      id: 'COMPORTEMENT', 
      label: 'Émotions & Vie avec les proches', 
      desc: 'Réactions aux imprévus, partages avec cousins/fratrie, gestion de l excitation et de la fatigue',
      icon: '💛'
    },
    { 
      id: 'LANGAGE', 
      label: 'Échanges, Récits & Partage', 
      desc: 'Raconte ses anecdotes, dialogue avec l entourage, compréhension des échanges familiaux',
      icon: '💬'
    },
    { 
      id: 'MOTRICITE', 
      label: 'Autonomie & Gestes quotidiens', 
      desc: 'Activités manuelles partagées, jeux de plein air, vélo, rangement de ses affaires',
      icon: '🏃'
    },
    { 
      id: 'MEMOIRE', 
      label: 'Routines & Rituels familiaux', 
      desc: 'Respect des habitudes lors des visites, mémorisation des consignes simples données en famille',
      icon: '🧠'
    }
  ];

  const presetsSuggestions = [
    {
      domaine: 'ATTENTION',
      titre: 'Repas de famille & jeux calmes',
      detail: 'Pendant les repas de famille ou les jeux de société, Léo bouge énormément et abandonne rapidement les activités calmes.',
      ex: 'Se lève plusieurs fois pendant le repas, passe d un jeu à l autre sans terminer le premier.'
    },
    {
      domaine: 'COMPORTEMENT',
      titre: 'Excitation & retour au calme',
      detail: 'Très joyeux et plein d énergie, mais a beaucoup de mal à faire baisser son niveau d excitation lors des fêtes familiales.',
      ex: 'Ne s arrête plus lorsqu il court avec ses cousins, peut crier ou faire des colères soudaines de fatigue.'
    },
    {
      domaine: 'MOTRICITE',
      titre: 'Jeux manuels et coordination',
      detail: 'Adore grimper et courir, mais rechigne à faire des activités de découpage, coloriage ou puzzle.',
      ex: 'Se décourage vite s il doit enfiler des perles ou boutonner son manteau seul.'
    }
  ];

  const appliquerPreset = (p) => {
    setDomaine(p.domaine);
    setReponseDetaillee(p.detail);
    setExemplesConcrets(p.ex);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      const payload = {
        enfantId: child?.id || 'e1111111-1111-1111-1111-111111111111',
        observateurId: user?.id || 'a1111111-1111-1111-1111-111111111111',
        observateurNom: user?.nom || 'Marc & Hélène M. (Famille)',
        domaine,
        contexte: 'FAMILLE',
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
        setSuccessMsg('Votre observation familiale a été enregistrée avec succès. Elle enrichit le croisement d IA explicable.');
        if (onObservationAdded) onObservationAdded();
      } else {
        const data = await res.json();
        setErrorMsg(data.error || 'Erreur lors de l enregistrement.');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Impossible de joindre le serveur. Vos données locales sont conservées.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '980px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Bannière d'accueil Espace Famille */}
      <div style={{
        background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
        color: 'white',
        borderRadius: '20px',
        padding: '28px 32px',
        boxShadow: '0 10px 25px -5px rgba(2, 132, 199, 0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        <div style={{ maxWidth: '620px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.2)',
              padding: '6px 12px',
              borderRadius: '20px',
              fontSize: '0.8rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <Users size={15} /> ESPACE FAMILLE & ENTOURAGE
            </div>
            <span style={{ fontSize: '0.85rem', opacity: 0.9 }}>
              Observateur : <strong>{user?.nom || 'Famille de Léo'}</strong>
            </span>
          </div>

          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0 0 10px 0', letterSpacing: '-0.02em' }}>
            Regard Bienveillant sur {child?.prenom || 'Léo'}
          </h2>
          <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: 1.5, opacity: 0.95 }}>
            En tant que membres de la famille (grands-parents, fratrie, proches), vos observations lors des moments de vie partagée (repas, vacances, sorties, loisirs) complètent précieusement le regard des parents et des spécialistes.
          </p>
        </div>

        <div style={{
          background: 'rgba(255,255,255,0.12)',
          border: '1px solid rgba(255,255,255,0.25)',
          borderRadius: '16px',
          padding: '16px 20px',
          textAlign: 'center',
          minWidth: '180px'
        }}>
          <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.85 }}>
            Enfant suivi
          </div>
          <div style={{ fontSize: '1.3rem', fontWeight: 800, marginTop: '4px' }}>
            {child?.prenom || 'Léo'} {child?.nom_anonyme || 'M.'}
          </div>
          <div style={{ fontSize: '0.8rem', opacity: 0.9, marginTop: '2px' }}>
            {child?.age || 7} ans • {child?.niveau_scolaire || 'CE1'}
          </div>
        </div>
      </div>

      {/* Note éthique et protection des données */}
      <div style={{
        background: '#f0f9ff',
        border: '1px solid #bae6fd',
        borderRadius: '14px',
        padding: '14px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        fontSize: '0.88rem',
        color: '#0369a1'
      }}>
        <Lock size={18} style={{ flexShrink: 0 }} />
        <div>
          <strong>Observation libre et sans jargon médical :</strong> Décrivez simplement ce qui se passe concrètement lors de vos moments partagés. Vos remarques alimentent directement l analyse de convergence pour le spécialiste.
        </div>
      </div>

      {/* Formulaire d'observation */}
      <div style={{
        background: 'white',
        borderRadius: '20px',
        border: '1px solid #e2e8f0',
        padding: '30px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.03)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>
              Nouvelle Observation de l Entourage
            </h3>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
              Prenez 2 minutes pour partager un moment ou une situation vécue avec {child?.prenom || 'l enfant'}.
            </p>
          </div>

          {/* Raccourcis de scénarios démo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>Exemples rapides :</span>
            {presetsSuggestions.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => appliquerPreset(p)}
                style={{
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  padding: '4px 10px',
                  fontSize: '0.75rem',
                  color: '#334155',
                  cursor: 'pointer',
                  fontWeight: 600,
                  transition: 'all 0.15s ease'
                }}
              >
                {p.titre}
              </button>
            ))}
          </div>
        </div>

        {successMsg && (
          <div style={{
            background: '#ecfdf5',
            border: '1px solid #a7f3d0',
            color: '#065f46',
            padding: '14px 18px',
            borderRadius: '12px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '0.9rem'
          }}>
            <CheckCircle2 size={20} color="#10b981" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#991b1b',
            padding: '14px 18px',
            borderRadius: '12px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '0.9rem'
          }}>
            <AlertCircle size={20} color="#ef4444" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
          {/* Étape 1 : Domaine d'observation */}
          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, color: '#1e293b', marginBottom: '10px' }}>
              1. Choisissez le moment ou domaine observé
            </label>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '12px'
            }}>
              {domainesOptions.map((opt) => {
                const isSelected = domaine === opt.id;
                return (
                  <div
                    key={opt.id}
                    onClick={() => setDomaine(opt.id)}
                    style={{
                      border: isSelected ? '2px solid #0284c7' : '1px solid #e2e8f0',
                      background: isSelected ? '#f0f9ff' : '#ffffff',
                      borderRadius: '14px',
                      padding: '14px 16px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      boxShadow: isSelected ? '0 4px 12px rgba(2, 132, 199, 0.12)' : 'none'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ fontSize: '1.2rem' }}>{opt.icon}</span>
                      <span style={{ fontWeight: isSelected ? 800 : 700, fontSize: '0.9rem', color: isSelected ? '#0369a1' : '#1e293b' }}>
                        {opt.label}
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b', lineHeight: 1.4 }}>
                      {opt.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Étape 2 : Évaluation des curseurs */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '20px',
            background: '#f8fafc',
            borderRadius: '16px',
            padding: '20px',
            border: '1px solid #e2e8f0'
          }}>
            {/* Fréquence */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1e293b' }}>
                  Fréquence de la situation observée
                </label>
                <span style={{
                  background: '#0284c7',
                  color: 'white',
                  padding: '2px 10px',
                  borderRadius: '12px',
                  fontSize: '0.8rem',
                  fontWeight: 800
                }}>
                  {frequence} / 5
                </span>
              </div>
              <input 
                type="range" 
                min="1" 
                max="5" 
                value={frequence} 
                onChange={(e) => setFrequence(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#0284c7', cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#64748b', marginTop: '4px' }}>
                <span>Rare / Exceptionnel (1)</span>
                <span>Parfois (3)</span>
                <span>Systématique (5)</span>
              </div>
            </div>

            {/* Impact sur le moment partagé */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1e293b' }}>
                  Impact sur le déroulement du moment
                </label>
                <span style={{
                  background: '#0369a1',
                  color: 'white',
                  padding: '2px 10px',
                  borderRadius: '12px',
                  fontSize: '0.8rem',
                  fontWeight: 800
                }}>
                  {impact} / 5
                </span>
              </div>
              <input 
                type="range" 
                min="1" 
                max="5" 
                value={impact} 
                onChange={(e) => setImpact(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#0369a1', cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#64748b', marginTop: '4px' }}>
                <span>Sans impact (1)</span>
                <span>Nécessite de l aide (3)</span>
                <span>Interrompt l activité (5)</span>
              </div>
            </div>
          </div>

          {/* Étape 3 : Ce qui a été remarqué */}
          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, color: '#1e293b', marginBottom: '8px' }}>
              2. Ce que vous avez remarqué en famille
            </label>
            <textarea
              rows={3}
              value={reponseDetaillee}
              onChange={(e) => setReponseDetaillee(e.target.value)}
              placeholder="Ex : Pendant le jeu de société en famille, il a beaucoup de mal à attendre son tour..."
              required
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: '12px',
                border: '1px solid #cbd5e1',
                fontSize: '0.9rem',
                fontFamily: 'inherit',
                outline: 'none',
                transition: 'border 0.2s',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Étape 4 : Exemples concrets */}
          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, color: '#1e293b', marginBottom: '8px' }}>
              3. Exemple concret illustrant ce comportement
            </label>
            <textarea
              rows={2}
              value={exemplesConcrets}
              onChange={(e) => setExemplesConcrets(e.target.value)}
              placeholder="Ex : Au bout de 5 minutes, il a renversé les pions et a préféré courir dehors."
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: '12px',
                border: '1px solid #cbd5e1',
                fontSize: '0.9rem',
                fontFamily: 'inherit',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Bouton de soumission */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                padding: '14px 28px',
                fontWeight: 700,
                fontSize: '0.95rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                boxShadow: '0 4px 14px rgba(2, 132, 199, 0.35)',
                transition: 'all 0.2s ease'
              }}
            >
              <Send size={18} />
              {loading ? 'Transmission en cours...' : 'Transmettre l observation familiale'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
