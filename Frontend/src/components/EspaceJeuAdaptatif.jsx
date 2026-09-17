import React, { useState, useEffect, useRef } from 'react';
import { Gamepad2, Star, Heart, Smile, Zap, RefreshCw, ChevronRight, Trophy, Volume2, VolumeX } from 'lucide-react';

const SCENES = [
  {
    id: 'attention',
    domaine: 'ATTENTION',
    emoji: '🎯',
    titre: 'Retrouve le bon objet !',
    description: 'Observe bien la liste, puis retrouve les objets qui ont changé.',
    items: ['🍎', '🎒', '✏️', '📚', '🦁', '🌟'],
    changed: ['🍊', '🎒', '✏️', '📖', '🦁', '⭐'],
    instruction: 'Clique sur les objets qui ont changé !'
  },
  {
    id: 'memoire',
    domaine: 'MEMOIRE',
    emoji: '🧠',
    titre: 'Retiens la séquence !',
    description: 'Regarde la séquence d emojis, puis retrouve-la dans le bon ordre.',
    sequence: ['🐸', '🌈', '🚀', '🎪'],
    choices: ['🌈', '🐸', '🎪', '🚀', '🌟', '🎯'],
    instruction: 'Rappelle-toi l ordre des emojis !'
  },
  {
    id: 'emotion',
    domaine: 'COMPORTEMENT',
    emoji: '😊',
    titre: 'Comment te sens-tu ?',
    description: 'Léo perd à un jeu avec ses amis. Comment est-ce qu il se sent probablement ?',
    situation: 'Léo joue aux cartes avec ses copains. Il perd la partie.',
    emotions: [
      { emoji: '😢', label: 'Triste' },
      { emoji: '😤', label: 'En colère' },
      { emoji: '😊', label: 'Content' },
      { emoji: '😴', label: 'Fatigué' },
      { emoji: '😨', label: 'Inquiet' },
      { emoji: '😐', label: 'Neutre' }
    ],
    instruction: 'Clique sur l émotion qui correspond !'
  }
];

const STAR_COLORS = ['#fbbf24', '#f59e0b', '#fcd34d'];

function StarBurst({ count }) {
  return (
    <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} size={20} fill={i < count ? '#fbbf24' : 'none'} stroke={i < count ? '#f59e0b' : '#cbd5e1'} />
      ))}
    </div>
  );
}

export default function EspaceJeuAdaptatif({ child, user }) {
  const [sceneIdx, setSceneIdx] = useState(0);
  const [phase, setPhase] = useState('intro'); // intro, memorize, play, result
  const [score, setScore] = useState(0);
  const [sessionData, setSessionData] = useState([]);
  const [timerVal, setTimerVal] = useState(5);
  const [selected, setSelected] = useState([]);
  const [answer, setAnswer] = useState(null);
  const [feedback, setFeedback] = useState(null); // 'correct' | 'wrong'
  const [sessionDone, setSessionDone] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const timerRef = useRef(null);

  const scene = SCENES[sceneIdx];

  const startScene = () => {
    setPhase('memorize');
    setSelected([]);
    setAnswer(null);
    setFeedback(null);
    setTimerVal(scene.id === 'memoire' ? 4 : 3);
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

  const handleAttentionClick = (idx) => {
    if (phase !== 'play') return;
    const orig = scene.items[idx];
    const changed = scene.changed[idx];
    const hasChanged = orig !== changed;

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

  const handleEmotionPick = (emotionLabel) => {
    if (phase !== 'play') return;
    const isValid = emotionLabel === 'Triste' || emotionLabel === 'En colère';
    const stars = isValid ? 5 : 2;
    setAnswer(emotionLabel);
    setFeedback(isValid ? 'correct' : 'partial');
    setScore(s => s + stars);
    setSessionData(d => [...d, { domaine: scene.domaine, stars }]);
    setTimeout(() => setPhase('result'), 800);
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
      <div style={{ background: 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)', borderRadius: '24px', padding: '40px', color: 'white', textAlign: 'center' }}>
        <div style={{ fontSize: '4rem', marginBottom: '12px' }}>🏆</div>
        <h2 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '8px' }}>Session terminée !</h2>
        <p style={{ fontSize: '1.1rem', opacity: 0.9, marginBottom: '24px' }}>
          {child?.prenom || 'Votre enfant'} a obtenu <strong>{totalStars}</strong> étoiles sur {maxStars} ({pct}%)
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '28px' }}>
          {sessionData.map((d, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '14px', padding: '14px' }}>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.8 }}>{d.domaine}</div>
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '6px', gap: '3px' }}>
                {Array.from({ length: 5 }).map((_, s) => (
                  <Star key={s} size={16} fill={s < d.stars ? '#fbbf24' : 'none'} stroke={s < d.stars ? '#fbbf24' : 'rgba(255,255,255,0.4)'} />
                ))}
              </div>
            </div>
          ))}
        </div>
        <p style={{ fontSize: '0.85rem', opacity: 0.8, marginBottom: '20px' }}>
          Les données de jeu sont transmises au spécialiste pour enrichir le bilan de {child?.prenom || 'votre enfant'}.
        </p>
        <button onClick={reset} style={{ background: 'white', color: '#0ea5e9', border: 'none', borderRadius: '14px', padding: '13px 26px', fontWeight: 800, fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', margin: '0 auto' }}>
          <RefreshCw size={18} /> Rejouer
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      {/* Header jeu */}
      <div style={{ background: 'linear-gradient(135deg, #0ea5e9 0%, #38bdf8 100%)', borderRadius: '20px', padding: '20px 26px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Gamepad2 size={18} />
            <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>Jeu Adaptatif</span>
            <span style={{ fontSize: '0.8rem', background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '10px' }}>
              {sceneIdx + 1} / {SCENES.length}
            </span>
          </div>
          <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.9 }}>Un jeu bienveillant pour observer {child?.prenom || 'votre enfant'} en autonomie.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.7rem', opacity: 0.8 }}>Score</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, lineHeight: 1 }}>{score}</div>
          </div>
          <button onClick={() => setSoundOn(s => !s)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '10px', padding: '8px', cursor: 'pointer', color: 'white' }}>
            {soundOn ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>
        </div>
      </div>

      {/* Zone de jeu */}
      <div style={{ background: 'white', borderRadius: '20px', border: '1px solid #e2e8f0', padding: '30px', boxShadow: '0 4px 15px rgba(0,0,0,0.04)', minHeight: '360px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px' }}>
        {/* INTRO */}
        {phase === 'intro' && (
          <div style={{ textAlign: 'center', maxWidth: '520px' }}>
            <div style={{ fontSize: '4rem', marginBottom: '12px' }}>{scene.emoji}</div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0f172a', marginBottom: '10px' }}>{scene.titre}</h3>
            <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '24px' }}>{scene.description}</p>
            <button onClick={startScene} style={{ background: 'linear-gradient(135deg, #0ea5e9, #6366f1)', color: 'white', border: 'none', borderRadius: '14px', padding: '14px 30px', fontWeight: 800, fontSize: '1rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <Zap size={18} /> C est parti !
            </button>
          </div>
        )}

        {/* MEMORIZE */}
        {phase === 'memorize' && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0ea5e9', marginBottom: '10px' }}>
              Observe bien… {timerVal}s
            </div>
            {scene.id === 'attention' && (
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
                {scene.items.map((item, i) => (
                  <div key={i} style={{ fontSize: '2.8rem', background: '#f0f9ff', borderRadius: '12px', padding: '12px', width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{item}</div>
                ))}
              </div>
            )}
            {scene.id === 'memoire' && (
              <div style={{ display: 'flex', gap: '14px', justifyContent: 'center' }}>
                {scene.sequence.map((e, i) => (
                  <div key={i} style={{ fontSize: '2.6rem', background: '#f0f9ff', borderRadius: '12px', padding: '12px' }}>{e}</div>
                ))}
              </div>
            )}
            {scene.id === 'emotion' && (
              <div style={{ fontSize: '1rem', color: '#475569', background: '#f0f9ff', borderRadius: '14px', padding: '16px 24px' }}>{scene.situation}</div>
            )}
          </div>
        )}

        {/* PLAY — attention */}
        {phase === 'play' && scene.id === 'attention' && (
          <div style={{ textAlign: 'center', width: '100%' }}>
            <p style={{ color: '#0f172a', fontWeight: 700, marginBottom: '16px' }}>{scene.instruction}</p>
            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '24px' }}>
              {scene.changed.map((item, i) => {
                const isSel = selected.includes(i);
                return (
                  <div key={i} onClick={() => handleAttentionClick(i)}
                    style={{ fontSize: '2.6rem', background: isSel ? '#dbeafe' : '#f8fafc', border: isSel ? '2px solid #3b82f6' : '2px solid #e2e8f0', borderRadius: '14px', padding: '12px', width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.15s ease' }}>
                    {item}
                  </div>
                );
              })}
            </div>
            <button onClick={submitAttention} style={{ background: '#0ea5e9', color: 'white', border: 'none', borderRadius: '12px', padding: '12px 24px', fontWeight: 700, cursor: 'pointer', fontSize: '0.95rem' }}>
              Valider ma réponse
            </button>
          </div>
        )}

        {/* PLAY — mémoire */}
        {phase === 'play' && scene.id === 'memoire' && (
          <div style={{ textAlign: 'center', width: '100%' }}>
            <p style={{ fontWeight: 700, color: '#0f172a', marginBottom: '12px' }}>{scene.instruction}</p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '16px', minHeight: '56px', background: '#f0f9ff', borderRadius: '12px', padding: '10px' }}>
              {selected.map((e, i) => <span key={i} style={{ fontSize: '2rem' }}>{e}</span>)}
              {Array.from({ length: scene.sequence.length - selected.length }).map((_, i) => (
                <div key={i} style={{ width: '40px', height: '40px', background: '#e2e8f0', borderRadius: '8px' }} />
              ))}
            </div>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '16px' }}>
              {scene.choices.map((e, i) => (
                <button key={i} onClick={() => handleMemoirePick(e)} style={{ fontSize: '2rem', background: '#f8fafc', border: '2px solid #e2e8f0', borderRadius: '12px', padding: '10px', cursor: 'pointer', transition: 'all 0.15s ease' }}>{e}</button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button onClick={() => setSelected([])} style={{ background: '#f1f5f9', border: 'none', borderRadius: '10px', padding: '8px 16px', cursor: 'pointer', color: '#64748b', fontSize: '0.85rem' }}>Effacer</button>
              <button onClick={submitMemoire} disabled={selected.length < scene.sequence.length}
                style={{ background: selected.length >= scene.sequence.length ? '#0ea5e9' : '#cbd5e1', color: 'white', border: 'none', borderRadius: '10px', padding: '8px 18px', cursor: selected.length >= scene.sequence.length ? 'pointer' : 'not-allowed', fontWeight: 700 }}>
                Valider
              </button>
            </div>
          </div>
        )}

        {/* PLAY — émotion */}
        {phase === 'play' && scene.id === 'emotion' && (
          <div style={{ textAlign: 'center', width: '100%', maxWidth: '520px' }}>
            <div style={{ background: '#fef3c7', border: '1px solid #fde68a', borderRadius: '14px', padding: '14px 20px', marginBottom: '20px', fontSize: '0.95rem', color: '#92400e' }}>
              {scene.situation}
            </div>
            <p style={{ fontWeight: 700, color: '#0f172a', marginBottom: '14px' }}>{scene.instruction}</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              {scene.emotions.map(em => (
                <button key={em.label} onClick={() => handleEmotionPick(em.label)}
                  style={{ background: answer === em.label ? '#dbeafe' : '#f8fafc', border: answer === em.label ? '2px solid #3b82f6' : '2px solid #e2e8f0', borderRadius: '14px', padding: '14px 10px', cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s ease' }}>
                  <div style={{ fontSize: '2.4rem', marginBottom: '4px' }}>{em.emoji}</div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569' }}>{em.label}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* RESULT */}
        {phase === 'result' && (
          <div style={{ textAlign: 'center', animation: 'popIn 0.4s cubic-bezier(0.34,1.56,0.64,1)' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '10px' }}>
              {feedback === 'correct' ? '🎉' : '👍'}
            </div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0f172a', marginBottom: '6px' }}>
              {feedback === 'correct' ? 'Excellent !' : 'Bien essayé !'}
            </h3>
            <div style={{ marginBottom: '18px' }}>
              <StarBurst count={sessionData[sessionData.length - 1]?.stars || 3} />
            </div>
            {sceneIdx + 1 < SCENES.length ? (
              <button onClick={nextScene} style={{ background: 'linear-gradient(135deg, #0ea5e9, #6366f1)', color: 'white', border: 'none', borderRadius: '14px', padding: '13px 26px', fontWeight: 800, fontSize: '0.95rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                Mini-jeu suivant <ChevronRight size={18} />
              </button>
            ) : (
              <button onClick={() => setSessionDone(true)} style={{ background: 'linear-gradient(135deg, #f59e0b, #fbbf24)', color: 'white', border: 'none', borderRadius: '14px', padding: '13px 26px', fontWeight: 800, fontSize: '0.95rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                <Trophy size={18} /> Voir mes résultats
              </button>
            )}
          </div>
        )}
      </div>

      {/* Indicateurs de scènes */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
        {SCENES.map((s, i) => (
          <div key={i} style={{ width: i === sceneIdx ? '28px' : '10px', height: '10px', borderRadius: '5px', background: i === sceneIdx ? '#0ea5e9' : i < sceneIdx ? '#6366f1' : '#e2e8f0', transition: 'all 0.3s ease' }} />
        ))}
      </div>
      <style>{`
        @keyframes popIn {
          0% { transform: scale(0.7); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
