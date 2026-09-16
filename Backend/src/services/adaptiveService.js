/**
 * MOTEUR ADAPTATIF POUR LES MINI-JEUX ENFANT ("Les Étoiles de NOVA")
 * Ajuste la difficulté en temps réel en fonction du temps de réponse et de la précision
 */

export const calculerAdaptation = ({
  niveauActuel = 1,
  historiqueReponses = [], // ex: [ { correct: true, tempsMs: 450 }, ... ]
  typeJeu = 'ATTENTION_FOCUS'
}) => {
  if (historiqueReponses.length === 0) {
    return {
      nouveauNiveau: niveauActuel,
      delaiApparitionMs: 1500,
      vitesseCible: 1.0,
      nombreDistracteurs: 1,
      encouragement: 'Bienvenue dans la mission ! Attrape les étoiles dorées !'
    };
  }

  // Examiner les 3 dernières réponses
  const dernieres = historiqueReponses.slice(-3);
  const reussitesConsecutives = dernieres.filter(r => r.correct).length;
  const erreursConsecutives = dernieres.filter(r => !r.correct).length;
  const tempsMoyen = dernieres.reduce((acc, r) => acc + (r.tempsMs || 0), 0) / dernieres.length;

  let nouveauNiveau = niveauActuel;
  let encouragement = 'Bravo, continue comme ça !';

  // Si l'enfant réussit facilement et vite -> monter de niveau
  if (reussitesConsecutives === 3 && tempsMoyen < 800) {
    nouveauNiveau = Math.min(niveauActuel + 1, 8);
    encouragement = 'Super réflexe ! Tu montes au niveau suivant ! 🚀';
  } 
  // Si l'enfant rencontre des difficultés (2 erreurs consécutives) -> adoucir sans frustration
  else if (erreursConsecutives >= 2) {
    nouveauNiveau = Math.max(niveauActuel - 1, 1);
    encouragement = 'Prends ton temps, tu vas y arriver ! ✨';
  }

  // Calcul des paramètres dynamiques selon le niveau
  const vitesseCible = 1.0 + (nouveauNiveau - 1) * 0.2; // Vitesse de déplacement des cibles
  const delaiApparitionMs = Math.max(700, 1600 - (nouveauNiveau - 1) * 150); // Fenêtre de réaction
  const nombreDistracteurs = Math.min(4, Math.floor((nouveauNiveau - 1) / 2) + 1); // Distracteurs visuels

  return {
    nouveauNiveau,
    vitesseCible,
    delaiApparitionMs,
    nombreDistracteurs,
    encouragement,
    metriques: {
      tempsMoyenMs: Math.round(tempsMoyen),
      niveauActuel: nouveauNiveau
    }
  };
};
