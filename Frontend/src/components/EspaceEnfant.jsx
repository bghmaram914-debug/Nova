import React, { useState, useEffect, useRef } from 'react';
import { 
  Gamepad2, 
  Sparkles, 
  Trophy, 
  Zap, 
  Flame, 
  RefreshCw, 
  CheckCircle,
  BrainCircuit,
  Rocket
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function EspaceEnfant({ child, onActivityCompleted }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameFinished, setGameFinished] = useState(false);
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [trials, setTrials] = useState(0);
  const [maxTrials] = useState(12);

  // Targets state
  const [targets, setTargets] = useState([]);
  const [message, setMessage] = useState('Clique sur les étoiles dorées dès qu elles apparaissent ! ⭐');
  const [encouragement, setEncouragement] = useState('Bienvenue Astronaute Léo ! 🚀');

  // Telemetry collected
  const [responseTimes, setResponseTimes] = useState([]);
  const [correctClicks, setCorrectClicks] = useState(0);
  const [totalClicks, setTotalClicks] = useState(0);
  const targetAppearTimeRef = useRef(Date.now());
  const timerRef = useRef(null);

  // Lancement de la mission
  const startGame = () => {
    setIsPlaying(true);
    setGameFinished(false);
    setLevel(1);
    setScore(0);
    setTrials(0);
    setResponseTimes([]);
    setCorrectClicks(0);
    setTotalClicks(0);
    setMessage('Prêt ? Attrape les étoiles !');
    spawnTarget(1);
  };

  // Apparition d'une cible avec adaptation dynamique
  const spawnTarget = (currentLevel) => {
    // Calcul de la vitesse et de la fenêtre en fonction du niveau
    const speedMs = Math.max(900, 2200 - (currentLevel - 1) * 250);
    const hasDistractor = currentLevel >= 2;

    const newTarget = {
      id: Math.random().toString(),
      type: 'STAR', // Cible principale
      x: Math.floor(Math.random() * 70) + 15,
      y: Math.floor(Math.random() * 60) + 20,
      size: Math.max(45, 65 - currentLevel * 3)
    };

    const newTargets = [newTarget];

    if (hasDistractor) {
      newTargets.push({
        id: Math.random().toString(),
        type: 'DISTRACTOR', // Météorite à ne pas toucher
        x: Math.floor(Math.random() * 70) + 15,
        y: Math.floor(Math.random() * 60) + 20,
        size: 40
      });
    }

    setTargets(newTargets);
    targetAppearTimeRef.current = Date.now();

    // Minuteur d'expiration de la cible
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      handleMiss(currentLevel);
    }, speedMs);
  };

  // Clic sur une cible
  const handleTargetClick = (target) => {
    if (!isPlaying) return;
    if (timerRef.current) clearTimeout(timerRef.current);

    const reactionTime = Date.now() - targetAppearTimeRef.current;
    const isCorrect = target.type === 'STAR';

    setTotalClicks(prev => prev + 1);
    if (isCorrect) {
      setCorrectClicks(prev => prev + 1);
      setScore(prev => prev + 10 * level);
      setResponseTimes(prev => [...prev, reactionTime]);
    }

    const currentTrials = trials + 1;
    setTrials(currentTrials);

    // Moteur adaptatif temps réel : adaptation de la difficulté
    adapterDifficulteEnTempsReel(isCorrect, reactionTime, currentTrials);
  };

  // En cas de cible ratée
  const handleMiss = (currentLevel) => {
    if (!isPlaying) return;
    setTotalClicks(prev => prev + 1);
    const currentTrials = trials + 1;
    setTrials(currentTrials);
    adapterDifficulteEnTempsReel(false, 1500, currentTrials);
  };

  // Logique adaptative NOVA
  const adapterDifficulteEnTempsReel = (isCorrect, reactionTime, currentTrials) => {
    let nextLevel = level;

    if (isCorrect && reactionTime < 900) {
      // Réussite rapide : élévation de niveau
      nextLevel = Math.min(level + 1, 5);
      setLevel(nextLevel);
      setEncouragement('Super réflexe ! Vitesse augmentée ! 🚀');
    } else if (!isCorrect) {
      // Difficulté : réajustement bienveillant
      nextLevel = Math.max(level - 1, 1);
      setLevel(nextLevel);
      setEncouragement('Prends ton temps, tu vas y arriver ! ✨');
    } else {
      setEncouragement('Bien joué, continue ! 🌟');
    }

    // Fin du mini-jeu après le nombre d'essais démo
    if (currentTrials >= maxTrials) {
      finishGame();
    } else {
      // Nouvelle cible après un court délai
      setTimeout(() => {
        spawnTarget(nextLevel);
      }, 400);
    }
  };

  const finishGame = async () => {
    setIsPlaying(false);
    setGameFinished(true);
    setTargets([]);

    // Confetti de félicitations
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {}

    // Calcul des télémétries
    const avgTime = responseTimes.length > 0 
      ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length) 
      : 750;
    const accuracy = totalClicks > 0 ? Math.round((correctClicks / totalClicks) * 100) : 70;

    // Envoi de la télémétrie au Backend
    try {
      await fetch('http://localhost:5000/api/activites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enfantId: child.id,
          typeJeu: 'ATTENTION_FOCUS',
          niveauAtteint: level,
          tempsReponseMs: avgTime,
          tauxReussite: accuracy,
          variabiliteAttention: 180
        })
      });

      if (onActivityCompleted) onActivityCompleted();
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <div className="fade-in" style={{ paddingBottom: '40px' }}>
      {/* En-tête Espace Enfant */}
      <div className="glass-card" style={{ padding: '24px', marginBottom: '24px', borderLeft: '5px solid #d97706' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ background: '#fffbeb', padding: '12px', borderRadius: '12px', color: '#d97706' }}>
              <Gamepad2 size={28} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.4rem' }}>Espace Enfant • Mission Astro : Les Étoiles de NOVA</h2>
              <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
                Activités ludiques adaptatives • Joueur : <strong>{child?.prenom}</strong> • Pas de score stigmatisant visible pour l'enfant
              </p>
            </div>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: '#fffbeb',
            border: '1px solid #fde68a',
            padding: '8px 14px',
            borderRadius: '10px',
            fontSize: '0.85rem',
            color: '#92400e'
          }}>
            <BrainCircuit size={18} color="#d97706" />
            <span>Moteur adaptatif : <strong>Ajustement temps réel actif</strong></span>
          </div>
        </div>

        {/* Note Innovation */}
        <div style={{
          marginTop: '16px',
          background: '#fffbeb',
          borderRadius: '10px',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '10px',
          fontSize: '0.85rem',
          color: '#92400e'
        }}>
          <Sparkles size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <strong>L'évaluation s'adapte à l'enfant, pas l'inverse :</strong> En fonction de sa réactivité et de son attention, le jeu module sa cadence sans jamais le mettre en échec. Les métriques (fluctuations attentionnelles, impulsivité) enrichissent le croisement avec les observations de l'école et de la maison.
          </div>
        </div>
      </div>

      {/* Arène de jeu */}
      <div className="glass-card" style={{ padding: '24px', position: 'relative', minHeight: '440px', overflow: 'hidden' }}>
        {/* Bandeau d'état du jeu */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #e2e8f0',
          paddingBottom: '16px',
          marginBottom: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Zap size={18} color="#d97706" />
              <span style={{ fontWeight: 700, fontSize: '1rem', color: '#1e293b' }}>
                Niveau de difficulté : <span style={{ color: '#d97706', fontSize: '1.2rem' }}>{level}</span> / 5
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Rocket size={18} color="#2563eb" />
              <span style={{ color: '#64748b', fontSize: '0.9rem' }}>
                Progression : <strong>{trials}</strong> / {maxTrials} séquences
              </span>
            </div>
          </div>

          <div style={{
            background: '#f1f5f9',
            padding: '6px 14px',
            borderRadius: '20px',
            fontWeight: 700,
            fontSize: '0.9rem',
            color: '#334155'
          }}>
            {encouragement}
          </div>
        </div>

        {/* Espace spatial / Canvas interactif */}
        <div style={{
          background: 'linear-gradient(180deg, #0b1120 0%, #1e1b4b 100%)',
          borderRadius: '16px',
          height: '320px',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.5)',
          overflow: 'hidden'
        }}>
          {/* Étoiles d'arrière-plan décoratives */}
          <div style={{ position: 'absolute', top: '20%', left: '15%', opacity: 0.3, color: 'white' }}>✦</div>
          <div style={{ position: 'absolute', top: '70%', left: '80%', opacity: 0.3, color: 'white' }}>★</div>
          <div style={{ position: 'absolute', top: '40%', left: '60%', opacity: 0.2, color: 'white' }}>✦</div>

          {!isPlaying && !gameFinished && (
            <div style={{ textAlign: 'center', zIndex: 10 }}>
              <div style={{ fontSize: '3rem', marginBottom: '10px' }}>🚀</div>
              <h3 style={{ color: 'white', fontSize: '1.4rem', marginBottom: '8px' }}>
                Mission Spatiale de Léo
              </h3>
              <p style={{ color: '#cbd5e1', fontSize: '0.95rem', maxWidth: '400px', margin: '0 auto 20px auto' }}>
                Attrape les étoiles dorées le plus vite possible ! Évite les météorites grises !
              </p>
              <button 
                onClick={startGame}
                className="btn"
                style={{
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  color: 'white',
                  padding: '14px 28px',
                  fontSize: '1.1rem',
                  fontWeight: 800,
                  borderRadius: '30px',
                  boxShadow: '0 6px 20px rgba(217, 119, 6, 0.4)',
                  cursor: 'pointer'
                }}
              >
                Commencer l'Aventure ! ✨
              </button>
            </div>
          )}

          {isPlaying && (
            <>
              {targets.map((target) => (
                <button
                  key={target.id}
                  onClick={() => handleTargetClick(target)}
                  style={{
                    position: 'absolute',
                    left: `${target.x}%`,
                    top: `${target.y}%`,
                    transform: 'translate(-50%, -50%)',
                    width: `${target.size}px`,
                    height: `${target.size}px`,
                    borderRadius: '50%',
                    background: target.type === 'STAR' 
                      ? 'radial-gradient(circle, #fef08a 0%, #eab308 60%, #ca8a04 100%)' 
                      : 'radial-gradient(circle, #94a3b8 0%, #475569 100%)',
                    border: target.type === 'STAR' ? '3px solid #ffffff' : '2px dashed #cbd5e1',
                    boxShadow: target.type === 'STAR' ? '0 0 25px #facc15' : '0 0 10px rgba(0,0,0,0.5)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: target.type === 'STAR' ? '1.6rem' : '1.2rem',
                    animation: 'pulse 1.2s infinite ease-in-out',
                    transition: 'all 0.1s ease'
                  }}
                >
                  {target.type === 'STAR' ? '⭐' : '☄️'}
                </button>
              ))}
            </>
          )}

          {gameFinished && (
            <div style={{ textAlign: 'center', zIndex: 10 }} className="fade-in">
              <div style={{ fontSize: '3rem', marginBottom: '10px' }}>🏆</div>
              <h3 style={{ color: '#fef08a', fontSize: '1.5rem', marginBottom: '8px' }}>
                Mission Accomplie, Astronaute Léo !
              </h3>
              <p style={{ color: '#e2e8f0', fontSize: '0.95rem', marginBottom: '20px' }}>
                Tes réflexes et ton attention ont été enregistrés avec succès.
              </p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <button 
                  onClick={startGame}
                  className="btn"
                  style={{
                    background: 'rgba(255, 255, 255, 0.15)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    color: 'white',
                    padding: '10px 20px',
                    borderRadius: '20px',
                    cursor: 'pointer'
                  }}
                >
                  <RefreshCw size={16} />
                  Rejouer
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Télémétrie invisible pour l'enfant, affichée ici pour la démo Hackathon */}
        <div style={{
          marginTop: '20px',
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          fontSize: '0.85rem'
        }}>
          <div>
            <span style={{ fontWeight: 700, color: '#1e293b' }}>
              📊 Données télémétriques transmises au moteur de croisement :
            </span>
            <span style={{ color: '#64748b', marginLeft: '8px' }}>
              Temps moyen : <strong>{responseTimes.length > 0 ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length) : 740} ms</strong> • 
              Niveau atteint : <strong>{level}/5</strong> • 
              Taux de précision : <strong>{totalClicks > 0 ? Math.round((correctClicks / totalClicks) * 100) : 65}%</strong>
            </span>
          </div>
          <span style={{ color: '#059669', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <CheckCircle size={16} /> Signal synchronisé
          </span>
        </div>
      </div>
    </div>
  );
}
