import React, { useState, useEffect } from 'react';
import { 
  Stethoscope, 
  HelpCircle, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  Clock, 
  Layers, 
  FileText, 
  Eye, 
  X, 
  School, 
  Home, 
  Gamepad2,
  Sparkles,
  UserCheck,
  ShieldCheck,
  Download
} from 'lucide-react';

export default function EspaceSpecialiste({ child, refreshTrigger }) {
  const [profilData, setProfilData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeModalDomain, setActiveModalDomain] = useState(null);
  const [decisionPrise, setDecisionPrise] = useState(null);

  useEffect(() => {
    fetchProfil();
  }, [child?.id, refreshTrigger]);

  const fetchProfil = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/profil-explicable/${child?.id || 'e1111111-1111-1111-1111-111111111111'}`);
      if (res.ok) {
        const data = await res.json();
        setProfilData(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openPourquoiModal = (domaineItem) => {
    setActiveModalDomain(domaineItem);
  };

  const closeModal = () => {
    setActiveModalDomain(null);
  };

  const getDomainIcon = (domaine) => {
    switch (domaine) {
      case 'ATTENTION': return '🎯';
      case 'LANGAGE': return '🗣️';
      case 'MEMOIRE': return '🧠';
      case 'MOTRICITE': return '✍️';
      case 'COMPORTEMENT': return '🤝';
      default: return '📋';
    }
  };

  const getBadgeClass = (niveau) => {
    switch (niveau) {
      case 'SIGNAL_FORT': return 'signal-red';
      case 'SIGNAL_CONTEXTUEL': return 'signal-yellow';
      case 'DIVERGENCE_DETECTEE': return 'signal-orange';
      case 'PAS_DE_SIGNAL': 
      default: return 'signal-green';
    }
  };

  return (
    <div className="fade-in" style={{ paddingBottom: '50px' }}>
      {/* En-tête Spécialiste */}
      <div className="glass-card" style={{ padding: '24px', marginBottom: '24px', borderLeft: '5px solid #7c3aed' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ background: '#f5f3ff', padding: '12px', borderRadius: '12px', color: '#7c3aed' }}>
              <Stethoscope size={28} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.4rem' }}>Espace Spécialiste • Profil Explicable Multi-Acteurs</h2>
              <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
                Praticienne : <strong>Dr. Claire Laurent (Neuropsychologue)</strong> • Dossier : <strong>{child?.prenom} {child?.nom_anonyme} (7 ans, {child?.niveau_scolaire})</strong>
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f5f3ff', border: '1px solid #ddd6fe', padding: '8px 14px', borderRadius: '10px', fontSize: '0.85rem', color: '#6d28d9' }}>
            <Sparkles size={16} />
            <span>Moteur de croisement : <strong>Algorithme déterministe & traçable</strong></span>
          </div>
        </div>

        {/* Synthèse globale et Recommandation */}
        <div style={{
          marginTop: '20px',
          background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
          color: 'white',
          borderRadius: '14px',
          padding: '20px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '16px',
          boxShadow: '0 4px 15px rgba(49, 46, 129, 0.2)'
        }}>
          <div style={{
            background: 'rgba(239, 68, 68, 0.2)',
            border: '1px solid #f87171',
            borderRadius: '10px',
            padding: '10px',
            color: '#fca5a5'
          }}>
            <AlertTriangle size={24} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', background: '#ef4444', color: 'white', padding: '2px 8px', borderRadius: '6px', fontWeight: 800 }}>
                SIGNAL FORT CONVERGENT DÉTECTÉ
              </span>
              <span style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>
                Analysé le {profilData?.dateAnalyse ? new Date(profilData.dateAnalyse).toLocaleDateString('fr-FR') : 'Aujourd hui'}
              </span>
            </div>
            <h3 style={{ fontSize: '1.2rem', marginTop: '6px', color: '#ffffff' }}>
              {profilData?.syntheseGlobale || 'Convergence multi-contextes mise en évidence sur l Attention.'}
            </h3>
            <p style={{ color: '#c7d2fe', fontSize: '0.9rem', marginTop: '6px' }}>
              <strong>Recommandation :</strong> {profilData?.recommandationPrioritaire || 'Évaluation spécialisée conseillée (Bilan pluridisciplinaire).'}
            </p>
          </div>
        </div>
      </div>

      {/* Cartes par Domaine (Diagramme 3 & 4) */}
      <h3 style={{ fontSize: '1.2rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Layers size={20} color="#2563eb" />
        <span>Cartographie des Signaux par Domaine</span>
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        {profilData?.domaines?.map((domaineItem) => {
          const isRed = domaineItem.niveau === 'SIGNAL_FORT';
          return (
            <div 
              key={domaineItem.domaine} 
              className="glass-card" 
              style={{
                padding: '22px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                borderTop: isRed ? '4px solid #ef4444' : '4px solid #10b981',
                boxShadow: isRed ? '0 4px 14px rgba(239, 68, 68, 0.12)' : 'var(--shadow-sm)'
              }}
            >
              <div>
                {/* En-tête de la carte */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '1.5rem' }}>{getDomainIcon(domaineItem.domaine)}</span>
                    <div>
                      <h4 style={{ fontSize: '1.1rem', color: '#0f172a' }}>{domaineItem.domaine}</h4>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        {domaineItem.contexte_count > 0 
                          ? `${domaineItem.contexte_count} contexte(s) : ${domaineItem.contextes.join(', ')}` 
                          : 'Aucune alerte contextuelle'}
                      </span>
                    </div>
                  </div>

                  <span className={`signal-badge ${getBadgeClass(domaineItem.niveau)}`}>
                    <span className={`dot ${isRed ? 'red' : 'green'}`} />
                    {domaineItem.niveau_label}
                  </span>
                </div>

                {/* Justification explicable */}
                <p style={{ fontSize: '0.88rem', color: '#334155', lineHeight: 1.5, marginBottom: '14px' }}>
                  {domaineItem.justification}
                </p>
              </div>

              {/* Pied de carte avec le Bouton "Pourquoi ?" */}
              <div style={{
                borderTop: '1px solid #f1f5f9',
                paddingTop: '14px',
                marginTop: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  {domaineItem.sourcesCroisees?.length || 0} source(s) tracée(s)
                </span>

                <button 
                  onClick={() => openPourquoiModal(domaineItem)}
                  className="btn-pourquoi"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <HelpCircle size={15} />
                  <span>Bouton "Pourquoi ?"</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Séquence de Démo : Décision du Spécialiste */}
      <div className="glass-card" style={{ padding: '28px', background: '#ffffff', border: '2px solid #e2e8f0' }}>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '8px', color: '#0f172a' }}>
          🩺 Décision du Professionnel de Santé (L'humain garde le contrôle final)
        </h3>
        <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '20px' }}>
          Conformément au principe d'éthique et d'IA Responsable de NOVA, la plateforme n'établit aucun diagnostic. Vous décidez souverainement des suites à donner.
        </p>

        {decisionPrise ? (
          <div className="fade-in" style={{
            background: '#ecfdf5',
            border: '1px solid #a7f3d0',
            borderRadius: '12px',
            padding: '18px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#065f46' }}>
              <CheckCircle2 size={24} color="#059669" />
              <div>
                <strong>Décision enregistrée : {decisionPrise}</strong>
                <p style={{ fontSize: '0.85rem', color: '#047857' }}>
                  Une synthèse pré-remplie et explicable est mise à disposition pour la famille et l'équipe pédagogique.
                </p>
              </div>
            </div>
            <button 
              onClick={() => alert('Téléchargement de la fiche de synthèse NOVA pour Léo M. (Format PDF clinique)')}
              className="btn btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}
            >
              <Download size={16} />
              Télécharger la Synthèse
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button 
              onClick={() => setDecisionPrise('Orientation vers un Bilan Neuropsychologique & Orthophonique')}
              className="btn btn-primary"
              style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)', boxShadow: '0 4px 12px rgba(109,40,217,0.3)' }}
            >
              <CheckCircle2 size={18} />
              Conseiller un Bilan Spécialisé
            </button>

            <button 
              onClick={() => setDecisionPrise('Mise en place d aménagements pédagogiques en classe et suivi à 6 semaines')}
              className="btn btn-secondary"
            >
              Préconiser des adaptations en classe (sans bilan immédiat)
            </button>

            <button 
              onClick={() => setDecisionPrise('Poursuite de la scolarité classique')}
              className="btn btn-secondary"
              style={{ color: '#64748b' }}
            >
              Pas de suite nécessaire
            </button>
          </div>
        )}
      </div>

      {/* Modal Explicable "Pourquoi ?" */}
      {activeModalDomain && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            {/* Header Modal */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '16px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: '#f5f3ff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#7c3aed'
                }}>
                  <HelpCircle size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.25rem' }}>
                    Pourquoi ce signal sur le domaine : {activeModalDomain.domaine} ?
                  </h3>
                  <span className={`signal-badge ${getBadgeClass(activeModalDomain.niveau)}`} style={{ marginTop: '4px' }}>
                    {activeModalDomain.niveau_label}
                  </span>
                </div>
              </div>

              <button 
                onClick={closeModal}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={22} />
              </button>
            </div>

            {/* Règle appliquée du moteur de croisement */}
            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              padding: '14px',
              marginBottom: '20px',
              fontSize: '0.88rem',
              color: '#334155'
            }}>
              <strong>Règle du moteur de croisement appliquée :</strong>
              <p style={{ marginTop: '4px', color: '#475569' }}>
                {activeModalDomain.justification}
              </p>
            </div>

            {/* Chronologie des observations sources */}
            <h4 style={{ fontSize: '1rem', marginBottom: '12px', color: '#1e293b' }}>
              Observations & Télémétries ayant contribué au signal :
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {activeModalDomain.sourcesCroisees?.length > 0 ? (
                activeModalDomain.sourcesCroisees.map((src, idx) => (
                  <div 
                    key={idx}
                    style={{
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '10px',
                      padding: '14px',
                      borderLeft: src.type === 'ACTIVITE_ADAPTATIVE' ? '4px solid #d97706' : src.contexte === 'ECOLE' ? '4px solid #2563eb' : '4px solid #059669'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {src.contexte === 'ECOLE' && <School size={16} color="#2563eb" />}
                        {src.contexte === 'MAISON' && <Home size={16} color="#059669" />}
                        {src.type === 'ACTIVITE_ADAPTATIVE' && <Gamepad2 size={16} color="#d97706" />}
                        <strong style={{ fontSize: '0.9rem', color: '#1e293b' }}>
                          {src.auteur || src.jeu}
                        </strong>
                      </div>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        {src.score || src.temps_reponse}
                      </span>
                    </div>

                    <p style={{ fontSize: '0.85rem', color: '#334155', fontStyle: 'italic', marginBottom: '4px' }}>
                      « {src.commentaire || src.interpretation} »
                    </p>

                    {src.exemples && (
                      <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>
                        <strong>Faits concrets :</strong> {src.exemples}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
                  Aucune observation isolée enregistrée pour ce domaine.
                </p>
              )}
            </div>

            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={closeModal} className="btn btn-secondary">
                Fermer l'explication
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
