/**
 * MOTEUR DE CROISEMENT EXPLICABLE NOVA
 * Conforme au diagramme de flux décisionnel (Diagramme 3 & 4)
 * 
 * Analyse la convergence / divergence des observations multi-acteurs 
 * et des télémétries de mini-jeux adaptatifs de l'enfant.
 */

export const DOMAINES = ['ATTENTION', 'LANGAGE', 'MEMOIRE', 'MOTRICITE', 'COMPORTEMENT'];

export const NIVEAUX_SIGNAL = {
  PAS_DE_SIGNAL: {
    code: 'PAS_DE_SIGNAL',
    label: 'Pas de signal significatif',
    couleur: '#10B981', // Vert
    badgeClass: 'signal-green',
    description: '0 ou 1 signal isolé. Aucun motif d alerte transversale détecté à ce stade.'
  },
  SIGNAL_CONTEXTUEL: {
    code: 'SIGNAL_CONTEXTUEL',
    label: 'Signal dépendant du contexte',
    couleur: '#F59E0B', // Jaune/Ambre
    badgeClass: 'signal-yellow',
    description: '2+ signaux concordants, mais limités à un seul contexte (ex: uniquement en classe ou uniquement à domicile).'
  },
  DIVERGENCE_DETECTEE: {
    code: 'DIVERGENCE_DETECTEE',
    label: 'Divergence détectée',
    couleur: '#F97316', // Orange
    badgeClass: 'signal-orange',
    description: 'Observateurs en désaccord marqué sur ce domaine (ex: difficulté rapportée à l école mais aisance totale à la maison).'
  },
  SIGNAL_FORT: {
    code: 'SIGNAL_FORT',
    label: 'Signal fort convergent',
    couleur: '#EF4444', // Rouge
    badgeClass: 'signal-red',
    description: '2+ observations concordantes observées à travers plusieurs contextes de vie (école, maison et/ou mini-jeu adaptatif).'
  }
};

/**
 * Analyse un domaine donné pour un ensemble d'observations et d'activités
 */
export const analyserDomaine = (domaine, observations, activites = []) => {
  // Filtrer les observations de ce domaine
  const obsDomaine = observations.filter(o => o.domaine === domaine);

  // Activités liées au domaine (ex: ATTENTION_FOCUS -> ATTENTION, SEQUENCE_MEMOIRE -> MEMOIRE)
  const actDomaine = activites.filter(a => {
    if (domaine === 'ATTENTION' && (a.type_jeu === 'ATTENTION_FOCUS' || a.type_jeu === 'INHIBITION_MOTRICE')) return true;
    if (domaine === 'MEMOIRE' && a.type_jeu === 'SEQUENCE_MEMOIRE') return true;
    return false;
  });

  // Identifier les observateurs signalant une difficulté notable (score >= 3/5)
  const observationsEnDifficulte = obsDomaine.filter(o => o.frequence_difficulte >= 3 || o.impact_quotidien >= 3);
  const observationsSansDifficulte = obsDomaine.filter(o => o.frequence_difficulte <= 2 && o.impact_quotidien <= 2);

  // Signaux d'activité numérique (jeu adaptatif)
  const activiteSignalFaibleReussite = actDomaine.some(a => Number(a.taux_reussite) < 70 || Number(a.temps_reponse_ms) > 700);

  // Collecter les contextes distincts où une difficulté est constatée
  const contextesAvecDifficulte = new Set(observationsEnDifficulte.map(o => o.contexte));
  if (activiteSignalFaibleReussite) {
    contextesAvecDifficulte.add('MINI_JEU_ADAPTATIF');
  }

  const nombreObservateursDifficulte = observationsEnDifficulte.length;
  const nombreObservateursSansDifficulte = observationsSansDifficulte.length;

  let niveau = NIVEAUX_SIGNAL.PAS_DE_SIGNAL;
  let justification = '';
  let recommandation = 'Poursuite de l accompagnement pédagogique habituel sans bilan spécifique nécessaire.';

  // Traces pour le bouton "Pourquoi ?"
  const sourcesCroisees = [
    ...observationsEnDifficulte.map(o => ({
      type: 'OBSERVATION',
      auteur: o.observateur_nom || `Observateur (${o.contexte})`,
      contexte: o.contexte,
      score: `${o.frequence_difficulte}/5 (Impact: ${o.impact_quotidien}/5)`,
      commentaire: o.reponse_detaillee,
      exemples: o.exemples_concrets,
      date: o.date_observation
    })),
    ...observationsSansDifficulte.map(o => ({
      type: 'OBSERVATION_NEUTRE',
      auteur: o.observateur_nom || `Observateur (${o.contexte})`,
      contexte: o.contexte,
      score: `${o.frequence_difficulte}/5`,
      commentaire: o.reponse_detaillee,
      date: o.date_observation
    })),
    ...actDomaine.map(a => ({
      type: 'ACTIVITE_ADAPTATIVE',
      jeu: a.type_jeu,
      score: `Niveau ${a.niveau_atteint} - Taux succès: ${a.taux_reussite}%`,
      temps_reponse: `${a.temps_reponse_ms} ms`,
      interpretation: Number(a.taux_reussite) < 70 ? 'Fluctuation d attention constatée en jeu' : 'Performance stable en jeu',
      date: a.date_session
    }))
  ];

  // APPLICATION DU FLUX DÉCISIONNEL (PDF Page 4)
  if (nombreObservateursDifficulte === 0 && !activiteSignalFaibleReussite) {
    niveau = NIVEAUX_SIGNAL.PAS_DE_SIGNAL;
    justification = 'Aucune difficulté significative n est rapportée dans ce domaine par l entourage ni lors des activités adaptatives.';
  } else if (nombreObservateursDifficulte === 1 && !activiteSignalFaibleReussite) {
    niveau = NIVEAUX_SIGNAL.PAS_DE_SIGNAL;
    justification = `Un seul signal isolé rapporté dans le contexte ${observationsEnDifficulte[0].contexte}. Ne constitue pas à ce jour un motif de préoccupation transversale.`;
  } else if (nombreObservateursDifficulte >= 1 && nombreObservateursSansDifficulte >= 1 && contextesAvecDifficulte.size <= 1) {
    // Désaccord franc entre acteurs (ex: école vs maison)
    niveau = NIVEAUX_SIGNAL.DIVERGENCE_DETECTEE;
    justification = `Divergence constatée : une difficulté est observée en milieu ${Array.from(contextesAvecDifficulte).join(', ')}, alors que d autres observateurs ne constatent pas de gène dans leur contexte.`;
    recommandation = 'Organiser un échange de concertation entre les parents et l entourage familial pour comprendre les déclencheurs environnementaux.';
  } else if (nombreObservateursDifficulte >= 2 && contextesAvecDifficulte.size === 1) {
    // 2+ concordants mais 1 seul contexte
    niveau = NIVEAUX_SIGNAL.SIGNAL_CONTEXTUEL;
    justification = `Plusieurs observations concordantes mais circonscrites exclusivement au contexte ${Array.from(contextesAvecDifficulte)[0]}.`;
    recommandation = 'Mettre en place des adaptations ergonomiques ou pédagogiques spécifiques à cet environnement et réévaluer à 6 semaines.';
  } else if ((nombreObservateursDifficulte >= 2 || (nombreObservateursDifficulte >= 1 && activiteSignalFaibleReussite)) && contextesAvecDifficulte.size >= 2) {
    // Multi-contextes (ex: École + Maison, ou École + Mini-jeu)
    niveau = NIVEAUX_SIGNAL.SIGNAL_FORT;
    justification = `Convergence transversale confirmée à travers ${contextesAvecDifficulte.size} contextes distincts (${Array.from(contextesAvecDifficulte).join(', ')}). Les manifestations se répètent indépendamment de l environnement.`;
    recommandation = 'Évaluation spécialisée conseillée (Bilan pluridisciplinaire auprès d un professionnel de santé : neuropsychologue / orthophoniste / médecin).';
  } else {
    niveau = NIVEAUX_SIGNAL.PAS_DE_SIGNAL;
    justification = 'Données actuelles insuffisantes ou ponctuelles.';
  }

  return {
    domaine,
    niveau: niveau.code,
    niveau_label: niveau.label,
    couleur: niveau.couleur,
    badgeClass: niveau.badgeClass,
    justification,
    recommandation,
    contexte_count: contextesAvecDifficulte.size,
    contextes: Array.from(contextesAvecDifficulte),
    sourcesCroisees
  };
};

/**
 * Calcule le profil explicable complet pour un enfant
 */
export const genererProfilComplet = (enfantId, observations, activites, consentement) => {
  if (!consentement || consentement.statut !== 'SIGNE') {
    return {
      enfantId,
      consentementActif: false,
      message: 'Consentement parental non signé ou en attente. Conformément au RGPD et au principe éthique de NOVA, les observations ne peuvent être croisées.',
      domaines: []
    };
  }

  const profilsParDomaine = DOMAINES.map(domaine => {
    return analyserDomaine(domaine, observations, activites);
  });

  const aSignalFort = profilsParDomaine.some(p => p.niveau === 'SIGNAL_FORT');
  const aDivergence = profilsParDomaine.some(p => p.niveau === 'DIVERGENCE_DETECTEE');

  let syntheseGlobale = 'Profil global équilibré. Aucune démarche spécialisée requise.';
  let recommandationPrioritaire = 'Poursuite de la scolarité classique et stimulation générale.';

  if (aSignalFort) {
    syntheseGlobale = 'Signaux convergents multi-contextes détectés. Un bilan spécialisé approfondi permettrait de lever le doute et de guider les aménagements.';
    recommandationPrioritaire = 'Proposer aux parents une consultation avec un spécialiste (médecin de l éducation nationale, pédiatre ou neuropsychologue).';
  } else if (aDivergence) {
    syntheseGlobale = 'Des divergences entre contextes (école/maison) ont été mises en évidence. Une phase d échange est recommandée avant toute démarche clinique.';
    recommandationPrioritaire = 'Rendez-vous de concertation tripartite (Enseignant - Parent - Professionnel ressource).';
  }

  return {
    enfantId,
    consentementActif: true,
    dateAnalyse: new Date().toISOString(),
    syntheseGlobale,
    recommandationPrioritaire,
    domaines: profilsParDomaine
  };
};
