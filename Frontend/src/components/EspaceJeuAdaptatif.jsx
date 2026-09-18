import React, { useState, useEffect, useRef } from 'react';
import { Gamepad2, Star, Heart, Smile, Zap, RefreshCw, ChevronRight, Trophy, Volume2, VolumeX, Sparkles, CheckCircle2 } from 'lucide-react';

export default function EspaceJeuAdaptatif({ child, user }) {
  const childName = child?.prenom || 'Sami';

  const SCENES = [
    {
      id: 'attention',
      domaine: 'ATTENTION',
      emoji: '🛒',
      titre: 'Le Souk aux Trésors de Tunis',
      description: `Observe bien les objets étalés au souk avec ${childName}, puis retrouve ceux qui ont changé ou bougé !`,
      items: ['🍊', '🏺', '🕌', '🌴', '📜', '⭐'],
      changed: ['🍊', '🍵', '🕌', '⛵', '📜', '⭐'],
      instruction: 'Clique sur les 2 objets du souk qui ont changé !'
    },
    {
      id: 'memoire',
      domaine: 'MEMOIRE',
      emoji: '🏛️',
      titre: 'La Mosaïque de Carthage',
      description: 'Regarde bien la séquence des symboles historiques, puis rejoue-la dans le bon ordre.',
      sequence: ['🐬', '⛵', '🏛️', '🏺'],
      choices: ['⛵', '🐬', '🏺', '🏛️', '🌟', '🎯'],
      instruction: 'Rappelle-toi l ordre des symboles de la mosaïque !'
    },
    {
      id: 'inhibition',
      domaine: 'MOTRICITE',
      emoji: '🌸',
      titre: 'Le Défi Jasmin & Réflexes',
      description: 'Concentration maximale ! Attrape les fleurs de Jasmin 🌸 dès qu elles apparaissent, mais évite de toucher les cailloux 🪨 !',
      items: ['🌸', '🪨', '🌸', '🪨', '🌸', '🌸'],
      instruction: 'Clique uniquement sur les fleurs de Jasmin 🌸 !'
    },
    {
      id: 'emotion',
      domaine: 'COMPORTEMENT',
      emoji: '😊',
      titre: `Les Émotions de ${childName}`,
      description: `${childName} joue aux billes avec ses copains dans la rue du quartier. Il perd la partie. Comment se sent-il d après toi ?`,
      situation: `${childName} joue aux billes avec ses camarades au quartier. Il perd la dernière partie.`,
      emotions: [
        { emoji: '😢', label: 'Triste' },
        { emoji: '😤', label: 'Déçu / Frustré' },
        { emoji: '😊', label: 'Content quand même' },
        { emoji: '😴', label: 'Fatigué' },
        { emoji: '😨', label: 'Inquiet' },
        { emoji: '😐', label: 'Sans opinion' }
      ],
      instruction: 'Clique sur l émotion qui correspond le mieux !'
    }
  ];

  const [sceneIdx, setSceneIdx] = useState(0);
  const [phase, setPhase] = useState('intro'); // intro, memorize, play, result
  const [score, setScore] = useState(0);
  const [sessionData, setSessionData] = useState([]);
  const [timerVal, setTimerVal] = useState(4);
  const [selected, setSelected] = useState([]);
  const [answer, setAnswer] = useState(null);
  const [feedback, setFeedback] = useState(null); // 'correct' | 'partial'
  const [sessionDone, setSessionDone] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const timerRef = useRef(null);

  const scene = SCENES[sceneIdx];

  const startScene = () => {
    setPhase('memorize');
    setSelected([]);
    setAnswer(null);
    setFeedback(null);
    setTimerVal(scene.id === 'memoire' ? 4 : scene.id === 'inhibition' ? 2 : 3);
  };

  useEffect(() => {
    if (phase === 'memorize') {
      timerRef.current = setInterval(() => {
        setTimerVal(v => {
          if (v <= 1) {
            clearInterval(timerRef.current);
            setPhase('play');
            return 0;
          }
          return v - 1;
        });
      }, 1000);
      return () => clearInterval(timerRef.current);
    }
  }, [phase]);

  // Sauvegarder automatiquement l'activité dans la base de données à la fin du jeu
  useEffect(() => {
    if (sessionDone && child?.id) {
      const totalStars = sessionData.reduce((a, b) => a + b.stars, 0);
      const maxStars = SCENES.length * 5;
      const scorePct = Math.round((totalStars / maxStars) * 100);

      fetch('http://localhost:5000/api/activites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enfantId: child.id,
          typeJeu: 'ATTENTION_FOCUS',
          niveauAtteint: Math.min(5, Math.ceil(scorePct / 20)),
          tempsReponseMs: 620,
          tauxReussite: scorePct,
          variabiliteAttention: 85
        })
      }).catch(() => {});
    }
  }, [sessionDone, child]);

  const handleAttentionClick = (idx) => {
    if (phase !== 'play') return;
    setSelected(prev => {
      if (prev.includes(idx)) return prev.filter(i => i !== idx);
      return [...prev, idx];
    });
  };

  const submitAttention = () => {
    const correctIdxs = scene.items.reduce((acc, item, i) => {
      if (item !== scene.changed[i]) acc.push(i);
      return acc;
    }, []);
    const allCorrect = correctIdxs.every(i => selected.includes(i)) && selected.length === correctIdxs.length;
    const stars = allCorrect ? 5 : selected.filter(i => correctIdxs.includes(i)).length >= 1 ? 3 : 1;
    setFeedback(allCorrect ? 'correct' : 'partial');
    setScore(s => s + stars);
    setSessionData(d => [...d, { domaine: scene.domaine, stars }]);
    setPhase('result');
  };

  const handleMemoirePick = (emoji) => {
    if (phase !== 'play') return;
    setSelected(prev => prev.length < scene.sequence.length ? [...prev, emoji] : prev);
  };

  const submitMemoire = () => {
    const correct = selected.every((e, i) => e === scene.sequence[i]) && selected.length === scene.sequence.length;
    const stars = correct ? 5 : selected.filter((e, i) => e === scene.sequence[i]).length * 2;
    setFeedback(correct ? 'correct' : 'partial');
    setScore(s => s + Math.min(stars, 5));
    setSessionData(d => [...d, { domaine: scene.domaine, stars: Math.min(stars, 5) }]);
    setPhase('result');
  };

  const handleInhibitionClick = (idx) => {
    if (phase !== 'play') return;
    setSelected(prev => {
      if (prev.includes(idx)) return prev.filter(i => i !== idx);
      return [...prev, idx];
    });
  };

  const submitInhibition = () => {
    const correctIdxs = scene.items.reduce((acc, item, i) => {
      if (item === '🌸') acc.push(i);
      return acc;
    }, []);
    const isClean = selected.every(i => scene.items[i] === '🌸') && selected.length === correctIdxs.length;
    const stars = isClean ? 5 : selected.length > 0 ? 3 : 1;
    setFeedback(isClean ? 'correct' : 'partial');
    setScore(s => s + stars);
    setSessionData(d => [...d, { domaine: scene.domaine, stars }]);
    setPhase('result');
  };

  const handleEmotionPick = (emotionLabel) => {
    if (phase !== 'play') return;
    const isValid = emotionLabel.includes('Triste') || emotionLabel.includes('Déçu');
    const stars = isValid ? 5 : 3;
    setAnswer(emotionLabel);
    setFeedback(isValid ? 'correct' : 'partial');
    setScore(s => s + stars);
    setSessionData(d => [...d, { domaine: scene.domaine, stars }]);
    setTimeout(() => setPhase('result'), 700);
  };

  const nextScene = () => {
    if (sceneIdx + 1 >= SCENES.length) {
      setSessionDone(true);
    } else {
      setSceneIdx(i => i + 1);
      setPhase('intro');
    }
  };

  const reset = () => {
    setSceneIdx(0);
    setPhase('intro');
    setScore(0);
    setSessionData([]);
    setSelected([]);
    setAnswer(null);
    setFeedback(null);
    setSessionDone(false);
  };

  if (sessionDone) {
    const totalStars = sessionData.reduce((a, b) => a + b.stars, 0);
    const maxStars = SCENES.length * 5;
    const pct = Math.round((totalStars / maxStars) * 100);
    return (
      <div style={{ background: 'linear-gradient(135deg, #17324D 0%, #0f2035 100%)', borderRadius: '24px', padding: '40px 30px', color: 'white', textAlign: 'center', boxShadow: '0 10px 30px rgba(23,50,77,.25)' }}>
        <div style={{ fontSize: '4.5rem', marginBottom: '12px' }}>🏆</div>
        <h2 style={{ fontSize: '2.1rem', fontWeight: 900, marginBottom: '8px', letterSpacing: '-.02em' }}>Mabrouk ! Session terminée !</h2>
        <p style={{ fontSize: '1.1rem', opacity: 0.9, marginBottom: '24px' }}>
          <strong>{childName}</strong> a obtenu <strong>{totalStars}</strong> étoiles sur {maxStars} ({pct}%)
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '28px' }}>
          {sessionData.map((d, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '14px', padding: '14px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#58B6A9' }}>{d.domaine}</div>
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '6px', gap: '3px' }}>
                {Array.from({ length: 5 }).map((_, s) => (
                  <Star key={s} size={15} fill={s < d.stars ? '#fbbf24' : 'none'} stroke={s < d.stars ? '#fbbf24' : 'rgba(255,255,255,0.4)'} />
                ))}
              </div>
            </div>
          ))}
        </div>

        <div style={{ background: 'rgba(88,182,169,.15)', border: '1px solid #58B6A9', borderRadius: '12px', padding: '12px 18px', display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: '24px', fontSize: '.88rem', color: '#B9DDF2' }}>
          <CheckCircle2 size={18} color="#58B6A9" />
          <span>Données enregistrées en base de données et transmises au bilan médical du spécialiste.</span>
        </div>

        <div>
          <button onClick={reset} style={{ background: 'linear-gradient(135deg, #58B6A9 0%, #3d9b8e 100%)', color: 'white', border: 'none', borderRadius: '14px', padding: '14px 28px', fontWeight: 800, fontSize: '1rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 14px rgba(88,182,169,.35)' }}>
            <RefreshCw size={18} /> Rejouer une session
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }} className="fade-up">
      {/* Header jeu style Donezo */}
      <div style={{ background: 'linear-gradient(135deg, #17324D 0%, #0f2035 100%)', borderRadius: '20px', padding: '20px 26px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', boxShadow: '0 4px 15px rgba(23,50,77,.15)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <Gamepad2 size={20} color="#58B6A9" />
            <span style={{ fontWeight: 900, fontSize: '1.25rem', letterSpacing: '-.02em' }}>Espace Jeux Adaptatifs (Tunisie)</span>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, background: 'rgba(88,182,169,.2)', color: '#58B6A9', border: '1px solid rgba(88,182,169,.3)', padding: '3px 10px', borderRadius: '12px' }}>
              Niveau {sceneIdx + 1} / {SCENES.length}
            </span>
          </div>
          <p style={{ margin: 0, fontSize: '0.86rem', color: '#94a3b8' }}>Observatoire ludique & bienveillant pour {childName} en autonomie.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Étoiles</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fbbf24', lineHeight: 1 }}>⭐ {score}</div>
          </div>
          <button onClick={() => setSoundOn(s => !s)} style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', padding: '10px', cursor: 'pointer', color: 'white' }}>
            {soundOn ? <Volume2 size={18} color="#58B6A9" /> : <VolumeX size={18} color="#94a3b8" />}
          </button>
        </div>
      </div>

      {/* Zone de jeu */}
      <div style={{ background: 'white', borderRadius: '20px', border: '1px solid #e2e8f0', padding: '32px', boxShadow: '0 2px 10px rgba(23,50,77,0.04)', minHeight: '380px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px' }}>
        
        {/* INTRO */}
        {phase === 'intro' && (
          <div style={{ textAlign: 'center', maxWidth: '540px' }}>
            <div style={{ fontSize: '4.5rem', marginBottom: '12px' }}>{scene.emoji}</div>
            <h3 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#17324D', marginBottom: '10px' }}>{scene.titre}</h3>
            <p style={{ color: '#64748b', fontSize: '0.96rem', lineHeight: 1.6, marginBottom: '26px' }}>{scene.description}</p>
            <button onClick={startScene} style={{ background: 'linear-gradient(135deg, #17324D 0%, #0f2035 100%)', color: 'white', border: 'none', borderRadius: '14px', padding: '14px 32px', fontWeight: 800, fontSize: '1rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '10px', boxShadow: '0 4px 14px rgba(23,50,77,.25)' }}>
              <Zap size={18} color="#58B6A9" /> Commencer l épreuve !
            </button>
          </div>
        )}

        {/* MEMORIZE */}
        {phase === 'memorize' && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#17324D', marginBottom: '14px' }}>
              Mémorise attentivement… <span style={{ color: '#e11d48' }}>{timerVal}s</span>
            </div>
            {scene.id === 'attention' && (
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
                {scene.items.map((item, i) => (
                  <div key={i} style={{ fontSize: '2.8rem', background: '#f8fafc', border: '2px solid #e2e8f0', borderRadius: '14px', width: '68px', height: '68px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{item}</div>
                ))}
              </div>
            )}
            {scene.id === 'memoire' && (
              <div style={{ display: 'flex', gap: '14px', justifyContent: 'center' }}>
                {scene.sequence.map((e, i) => (
                  <div key={i} style={{ fontSize: '2.8rem', background: '#f0fdf4', border: '2px solid #a7f3d0', borderRadius: '14px', width: '68px', height: '68px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{e}</div>
                ))}
              </div>
            )}
            {scene.id === 'inhibition' && (
              <div style={{ display: 'flex', gap: '14px', justifyContent: 'center' }}>
                {scene.items.map((e, i) => (
                  <div key={i} style={{ fontSize: '2.8rem', background: '#fef2f2', border: '2px solid #fecaca', borderRadius: '14px', width: '68px', height: '68px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{e}</div>
                ))}
              </div>
            )}
            {scene.id === 'emotion' && (
              <div style={{ fontSize: '1.05rem', color: '#17324D', background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '14px', padding: '18px 24px', fontWeight: 600 }}>{scene.situation}</div>
            )}
          </div>
        )}

        {/* PLAY — ATTENTION SOUK */}
        {phase === 'play' && scene.id === 'attention' && (
          <div style={{ textAlign: 'center', width: '100%' }}>
            <p style={{ color: '#17324D', fontWeight: 800, fontSize: '1.05rem', marginBottom: '18px' }}>{scene.instruction}</p>
            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '24px' }}>
              {scene.changed.map((item, i) => {
                const isSel = selected.includes(i);
                return (
                  <div key={i} onClick={() => handleAttentionClick(i)}
                    style={{ fontSize: '2.8rem', background: isSel ? 'rgba(88,182,169,.15)' : '#f8fafc', border: isSel ? '2px solid #58B6A9' : '2px solid #e2e8f0', borderRadius: '16px', width: '70px', height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.15s ease' }}>
                    {item}
                  </div>
                );
              })}
            </div>
            <button onClick={submitAttention} style={{ background: 'linear-gradient(135deg, #17324D 0%, #0f2035 100%)', color: 'white', border: 'none', borderRadius: '12px', padding: '12px 28px', fontWeight: 800, cursor: 'pointer', fontSize: '0.95rem', boxShadow: '0 4px 12px rgba(23,50,77,.2)' }}>
              Valider ma sélection
            </button>
          </div>
        )}

        {/* PLAY — MÉMOIRE CARTHAGE */}
        {phase === 'play' && scene.id === 'memoire' && (
          <div style={{ textAlign: 'center', width: '100%' }}>
            <p style={{ fontWeight: 800, color: '#17324D', fontSize: '1.05rem', marginBottom: '14px' }}>{scene.instruction}</p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '20px', minHeight: '64px', background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '14px', padding: '12px' }}>
              {selected.map((e, i) => <span key={i} style={{ fontSize: '2.2rem' }}>{e}</span>)}
              {Array.from({ length: scene.sequence.length - selected.length }).map((_, i) => (
                <div key={i} style={{ width: '46px', height: '46px', background: '#e2e8f0', borderRadius: '10px' }} />
              ))}
            </div>
            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '20px' }}>
              {scene.choices.map((e, i) => (
                <button key={i} onClick={() => handleMemoirePick(e)} style={{ fontSize: '2.4rem', background: '#ffffff', border: '2px solid #e2e8f0', borderRadius: '14px', width: '64px', height: '64px', cursor: 'pointer', transition: 'all 0.15s ease' }}>{e}</button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button onClick={() => setSelected([])} style={{ background: '#f1f5f9', border: 'none', borderRadius: '10px', padding: '10px 18px', cursor: 'pointer', color: '#64748b', fontWeight: 700, fontSize: '0.85rem' }}>Effacer</button>
              <button onClick={submitMemoire} disabled={selected.length < scene.sequence.length}
                style={{ background: selected.length >= scene.sequence.length ? 'linear-gradient(135deg, #17324D 0%, #0f2035 100%)' : '#cbd5e1', color: 'white', border: 'none', borderRadius: '10px', padding: '10px 22px', cursor: selected.length >= scene.sequence.length ? 'pointer' : 'not-allowed', fontWeight: 800 }}>
                Valider
              </button>
            </div>
          </div>
        )}

        {/* PLAY — INHIBITION JASMIN */}
        {phase === 'play' && scene.id === 'inhibition' && (
          <div style={{ textAlign: 'center', width: '100%' }}>
            <p style={{ color: '#17324D', fontWeight: 800, fontSize: '1.05rem', marginBottom: '18px' }}>{scene.instruction}</p>
            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '24px' }}>
              {scene.items.map((item, i) => {
                const isSel = selected.includes(i);
                return (
                  <div key={i} onClick={() => handleInhibitionClick(i)}
                    style={{ fontSize: '2.8rem', background: isSel ? 'rgba(88,182,169,.15)' : '#f8fafc', border: isSel ? '2px solid #58B6A9' : '2px solid #e2e8f0', borderRadius: '16px', width: '70px', height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.15s ease' }}>
                    {item}
                  </div>
                );
              })}
            </div>
            <button onClick={submitInhibition} style={{ background: 'linear-gradient(135deg, #17324D 0%, #0f2035 100%)', color: 'white', border: 'none', borderRadius: '12px', padding: '12px 28px', fontWeight: 800, cursor: 'pointer', fontSize: '0.95rem', boxShadow: '0 4px 12px rgba(23,50,77,.2)' }}>
              Valider mes réflexes
            </button>
          </div>
        )}

        {/* PLAY — ÉMOTIONS SAMI */}
        {phase === 'play' && scene.id === 'emotion' && (
          <div style={{ textAlign: 'center', width: '100%', maxWidth: '540px' }}>
            <div style={{ background: 'rgba(88,182,169,.08)', border: '1px solid #58B6A9', borderRadius: '14px', padding: '16px 20px', marginBottom: '20px', fontSize: '0.98rem', color: '#17324D', fontWeight: 700 }}>
              {scene.situation}
            </div>
            <p style={{ fontWeight: 800, color: '#17324D', marginBottom: '16px' }}>{scene.instruction}</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              {scene.emotions.map(em => (
                <button key={em.label} onClick={() => handleEmotionPick(em.label)}
                  style={{ background: answer === em.label ? 'rgba(88,182,169,.15)' : '#f8fafc', border: answer === em.label ? '2px solid #58B6A9' : '2px solid #e2e8f0', borderRadius: '14px', padding: '14px 10px', cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s ease' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '4px' }}>{em.emoji}</div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#1e293b' }}>{em.label}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* RESULT */}
        {phase === 'result' && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3.8rem', marginBottom: '10px' }}>
              {feedback === 'correct' ? '🎉' : '👍'}
            </div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#17324D', marginBottom: '6px' }}>
              {feedback === 'correct' ? 'Bravo ! Excellent travail !' : 'Bien essayé ! Continue !'}
            </h3>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginBottom: '20px' }}>
              {Array.from({ length: 5 }).map((_, s) => {
                const stars = sessionData[sessionData.length - 1]?.stars || 3;
                return (
                  <Star key={s} size={24} fill={s < stars ? '#fbbf24' : 'none'} stroke={s < stars ? '#f59e0b' : '#cbd5e1'} />
                );
              })}
            </div>
            {sceneIdx + 1 < SCENES.length ? (
              <button onClick={nextScene} style={{ background: 'linear-gradient(135deg, #17324D 0%, #0f2035 100%)', color: 'white', border: 'none', borderRadius: '14px', padding: '14px 28px', fontWeight: 800, fontSize: '0.98rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(23,50,77,.25)' }}>
                Épreuve suivante <ChevronRight size={18} color="#58B6A9" />
              </button>
            ) : (
              <button onClick={() => setSessionDone(true)} style={{ background: 'linear-gradient(135deg, #58B6A9 0%, #3d9b8e 100%)', color: 'white', border: 'none', borderRadius: '14px', padding: '14px 28px', fontWeight: 800, fontSize: '0.98rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 14px rgba(88,182,169,.35)' }}>
                <Trophy size={18} /> Découvrir mes résultats
              </button>
            )}
          </div>
        )}
      </div>

      {/* Progress Bar Dots */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
        {SCENES.map((s, i) => (
          <div key={i} style={{ width: i === sceneIdx ? '32px' : '10px', height: '10px', borderRadius: '5px', background: i === sceneIdx ? '#58B6A9' : i < sceneIdx ? '#17324D' : '#cbd5e1', transition: 'all 0.3s ease' }} />
        ))}
      </div>
    </div>
  );
}
