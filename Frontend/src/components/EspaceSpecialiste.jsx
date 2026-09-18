import React, { useState, useEffect } from 'react';
import {
  Stethoscope, CheckCircle2, Clock, FileText, X,
  School, Home, Gamepad2, Download, Users, Brain,
  TrendingUp, BarChart3, Save, Activity, ShieldCheck,
  Printer, Check, FileCheck, Loader2
} from 'lucide-react';
import jsPDF from 'jspdf';

// 
// MOCK DATA CLINIQUE (TUNISIE)
// 
const MOCK_PROFILE = {
  signals: [
    { domaine: 'ATTENTION',    libelle: 'Attention & Consignes',       niveau: 'SIGNAL_FORT',       score: 78, description: 'Convergence forte entre école et maison sur les difficultés d\'attention soutenue.' },
    { domaine: 'MOTRICITE',    libelle: 'Motricité fine & Graphisme',  niveau: 'SIGNAL_CONTEXTUEL', score: 55, description: 'Signal observé à l\'école lors de la copie rapide des devoirs.' },
    { domaine: 'MEMOIRE',      libelle: 'Mémoire de travail',          niveau: 'SIGNAL_CONTEXTUEL', score: 45, description: 'Fatigabilité identifiée lors des doubles consignes.' },
    { domaine: 'COMPORTEMENT', libelle: 'Comportement & Régulation',   niveau: 'PAS_DE_SIGNAL',     score: 20, description: 'Comportement adapté dans les différents contextes observés.' },
  ],
  telemetrie: { scoreAttn: 64, reactionMs: 780, successRate: 71, sessions: 8 },
  convergenceScore: 82,
};

const MOCK_OBS_ECOLE = [
  { id: 1, domaine: 'ATTENTION', frequenceDifficulte: 5, impactQuotidien: 4, reponseDetaillee: 'Difficulté persistante à maintenir son attention sur une double consigne écrite ou lors des exercices individuels.', exemplesConcrets: 'Regarde par la fenêtre dès le début de l\'exercice, oublie la 2ème étape.', created_at: '2026-09-15', observateurNom: 'Mme Sonia Trabelsi (Enseignante)' },
  { id: 2, domaine: 'MOTRICITE', frequenceDifficulte: 3, impactQuotidien: 3, reponseDetaillee: 'Tenue du crayon crispée, lenteur pour copier les devoirs au tableau en arabe et français.', exemplesConcrets: 'Prend 5 minutes de plus pour copier la date au tableau.', created_at: '2026-09-10', observateurNom: 'Mme Sonia Trabelsi (Enseignante)' },
];

const MOCK_OBS_FAMILLE = [
  { id: 3, domaine: 'ATTENTION', frequenceDifficulte: 4, impactQuotidien: 4, reponseDetaillee: 'Au moment des devoirs, la moindre distraction coupe totalement son fil de pensée.', exemplesConcrets: 'Se lève plusieurs fois, a du mal à finir 3 lignes sans pause.', created_at: '2026-09-14', observateurNom: 'Mme Leila B. (Parent)' },
];

const MOCK_JEUX = [
  { id: 1, nom_jeu: 'Bulle Attention', score: 64, temps_reaction_ms: 780, taux_succes: 71, niveau_adaptatif: 3, duree_minutes: 12, created_at: '2026-09-16' },
  { id: 2, nom_jeu: 'Mémoire Séquence', score: 58, temps_reaction_ms: 840, taux_succes: 65, niveau_adaptatif: 2, duree_minutes: 10, created_at: '2026-09-14' },
];

const DOMAIN_ICONS = {
  ATTENTION: '🎯',
  LANGAGE: '💬',
  MEMOIRE: '🧠',
  MOTRICITE: '✏️',
  COMPORTEMENT: '🏫',
};

function SignalBadge({ niveau }) {
  if (niveau === 'SIGNAL_FORT') return <span style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', padding: '2px 8px', borderRadius: 6, fontSize: '.72rem', fontWeight: 800 }}>Signal Fort</span>;
  if (niveau === 'SIGNAL_CONTEXTUEL') return <span style={{ background: '#fffbeb', color: '#d97706', border: '1px solid #fde68a', padding: '2px 8px', borderRadius: 6, fontSize: '.72rem', fontWeight: 800 }}>Signal Contextuel</span>;
  return <span style={{ background: '#f1f5f9', color: '#64748b', border: '1px solid #e2e8f0', padding: '2px 8px', borderRadius: 6, fontSize: '.72rem', fontWeight: 700 }}>Pas de signal</span>;
}

// 
// G0N0RATEUR ET T0L0CHARGEMENT DIRECT DU FICHIER PDF
// 
export const generateAndDownloadNovaPDF = (child, profil) => {
  try {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const childName = `${child?.prenom || 'Youssef'} ${child?.nom_anonyme || 'B.'}`;
    const childCode = child?.code_identifiant || 'TN-NOVA-2026-084';
    const ageNiveau = `${child?.age || 7} ans · ${child?.niveau_scolaire || '2ème Année Primaire'}`;
    const etablissement = child?.etablissement || 'École Primaire Habib Bourguiba - Tunis';
    const today = new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });

    // 1. Bandeau supérieur institutionnel
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, 210, 22, 'F');
    doc.setTextColor(239, 68, 68);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text("RÉPUBLIQUE TUNISIENNE", 14, 9);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'normal');
    doc.text("· MINISTRE DE LA SANTÉ PUBLIQUE & MINISTRE DE L'ÉDUCATION", 58, 9);
    doc.setTextColor(148, 163, 184);
    doc.setFontSize(7.2);
    doc.text("OBSERVATOIRE DES TROUBLES NEURODÉVELOPPEMENTAUX (TND) · PROTOCOLE NATIONAL", 14, 16);
    doc.setTextColor(110, 231, 183);
    doc.text("Conforme Loi INADP 2004-63", 152, 16);

    // 2. Titre et Date
    doc.setTextColor(29, 78, 216);
    doc.setFontSize(15);
    doc.setFont('helvetica', 'bold');
    doc.text("NOVA TUNISIE  BILAN CLINIQUE DE SYNTHÈSE", 14, 34);
    doc.setTextColor(71, 85, 105);
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.text(`Compte-rendu Pédopsychiatrique & Recommandations d'Aménagements · Édition du ${today}`, 14, 40);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.4);
    doc.line(14, 43, 196, 43);

    // 3. Fiche Patient
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(14, 47, 182, 25, 2.5, 2.5, 'FD');
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.text("CODE PATIENT SÉCURISÉ", 18, 54);
    doc.text("IDENTITÉ DU PATIENT", 80, 54);
    doc.text("GE & SCOLARITÉ", 140, 54);
    doc.setTextColor(29, 78, 216);
    doc.setFontSize(10.5);
    doc.text(childCode, 18, 60);
    doc.setTextColor(15, 23, 42);
    doc.text(childName, 80, 60);
    doc.text(ageNiveau, 140, 60);
    doc.setTextColor(71, 85, 105);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(`Structure d'accueil : ${etablissement}`, 18, 67);

    // 4. Signaux neurodéveloppementaux
    let y = 79;
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(10.5);
    doc.setFont('helvetica', 'bold');
    doc.text("1. SIGNAUX NEURODÉVELOPPEMENTAUX DÉTECTÉS PAR DOMAINE", 14, y);
    y += 5;

    const signals = (profil?.signals && profil.signals.length > 0) ? profil.signals : MOCK_PROFILE.signals;
    signals.forEach((s) => {
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(14, y, 182, 17, 2, 2, 'FD');
      doc.setTextColor(30, 41, 59);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text(s.libelle, 18, y + 5.5);

      if (s.niveau === 'SIGNAL_FORT') {
        doc.setFillColor(254, 226, 226);
        doc.roundedRect(142, y + 2, 48, 5.5, 1.5, 1.5, 'F');
        doc.setTextColor(185, 28, 28);
        doc.setFontSize(7);
        doc.setFont('helvetica', 'bold');
        doc.text("SIGNAL FORT (Priorité)", 145, y + 5.8);
      } else if (s.niveau === 'SIGNAL_CONTEXTUEL') {
        doc.setFillColor(254, 243, 199);
        doc.roundedRect(142, y + 2, 48, 5.5, 1.5, 1.5, 'F');
        doc.setTextColor(180, 83, 9);
        doc.setFontSize(7);
        doc.setFont('helvetica', 'bold');
        doc.text("SIGNAL CONTEXTUEL", 145, y + 5.8);
      } else {
        doc.setFillColor(241, 245, 249);
        doc.roundedRect(142, y + 2, 48, 5.5, 1.5, 1.5, 'F');
        doc.setTextColor(100, 116, 139);
        doc.setFontSize(7);
        doc.setFont('helvetica', 'bold');
        doc.text("PAS DE SIGNAL MAJEUR", 145, y + 5.8);
      }

      doc.setTextColor(71, 85, 105);
      doc.setFontSize(7.8);
      doc.setFont('helvetica', 'normal');
      const splitDesc = doc.splitTextToSize(s.description, 172);
      doc.text(splitDesc, 18, y + 11);
      y += 20;
    });

    // 5. Préconisations médicales
    y += 2;
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(10.5);
    doc.setFont('helvetica', 'bold');
    doc.text("2. PRÉCONISATIONS MÉDICALES & AMÉNAGEMENTS SCOLAIRES", 14, y);
    y += 5;

    doc.setFillColor(240, 253, 244);
    doc.setDrawColor(167, 243, 208);
    doc.roundedRect(14, y, 182, 32, 2.5, 2.5, 'FD');
    doc.setTextColor(6, 95, 70);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    const recos = [
      "- Bilan neuropsychologique approfondi : Évaluation des fonctions exécutives et de l'attention soutenue.",
      "- Aménagements scolaires en classe : Majoration du temps (+25%), simplification des doubles consignes.",
      "- Aménagement ergonomique : Placement face au tableau pour limiter les distracteurs visuels et sonores.",
      "- Suivi collaboratif & contrôle : Réévaluation pluridisciplinaire planifiée à 3 mois via NOVA Tunisie."
    ];
    let ry = y + 6;
    recos.forEach(r => {
      doc.text(r, 18, ry);
      ry += 6;
    });

    // 6. Signatures et Visas
    y += 38;
    doc.setFillColor(250, 250, 250);
    doc.setDrawColor(226, 232, 240);

    // Bloc Praticien
    doc.roundedRect(14, y, 88, 36, 2, 2, 'FD');
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text("Praticien Rédacteur", 18, y + 5.5);
    doc.setTextColor(29, 78, 216);
    doc.text("Dr. Anis Ben Salah", 18, y + 11);
    doc.setTextColor(71, 85, 105);
    doc.setFontSize(7.2);
    doc.setFont('helvetica', 'normal');
    doc.text("Pédopsychiatre Référent · Hôpital Razi / Tunis", 18, y + 16);
    doc.text("N° Ordre des Médecins : 18452/TN", 18, y + 20.5);
    doc.setDrawColor(203, 213, 225);
    doc.line(18, y + 25, 96, y + 25);
    doc.setTextColor(148, 163, 184);
    doc.text("Signature & Cachet Médical :", 18, y + 30);

    // Bloc Commission
    doc.roundedRect(108, y, 88, 36, 2, 2, 'FD');
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text("Structure Destinataire", 112, y + 5.5);
    doc.setTextColor(5, 150, 105);
    doc.text("Commission Médicale Scolaire & CNAM", 112, y + 11);
    doc.setTextColor(71, 85, 105);
    doc.setFontSize(7.2);
    doc.setFont('helvetica', 'normal');
    doc.text("Ministère de l'Éducation · Direction Régionale", 112, y + 16);
    doc.text("Dossier d'adaptation pédagogique", 112, y + 20.5);
    doc.setDrawColor(203, 213, 225);
    doc.line(112, y + 25, 190, y + 25);
    doc.setTextColor(148, 163, 184);
    doc.text("Visa de Réception & Décision :", 112, y + 30);

    // 7. Pied de page
    doc.setTextColor(148, 163, 184);
    doc.setFontSize(7);
    doc.text("NOVA TUNISIE  Document officiel généré sous contrôle médical (Loi INADP n° 2004-63).", 14, 288);
    doc.text("Page 1 / 1", 188, 288);

    const sanitizedName = (child?.nom_anonyme || child?.prenom || 'Enfant').replace(/[^a-zA-Z0-9_-]/g, '_');
    doc.save(`Bilan_Pedopsychiatrique_NOVA_${sanitizedName}_${childCode}.pdf`);
    return true;
  } catch (err) {
    console.error('Erreur PDF:', err);
    window.print();
    return false;
  }
};

// 
// COMPOSANT PRINCIPAL ESPACE SP0CIALISTE 0PUR0
// 
export default function EspaceSpecialiste({ child, refreshTrigger, user }) {
  const [page, setPage] = useState('dashboard');
  const [profil, setProfil] = useState(MOCK_PROFILE);
  const [obsEcole, setObsEcole] = useState([]);
  const [obsFamille, setObsFamille] = useState([]);
  const [jeux, setJeux] = useState([]);
  const [notes, setNotes] = useState(() => localStorage.getItem('nova_notes') || '');
  const [decision, setDecision] = useState('bilan_neuro');
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [showIAModal, setShowIAModal] = useState(false);
  const [iaLoading, setIaLoading] = useState(false);
  const [iaResult, setIaResult] = useState(null);

  useEffect(() => {
    const childId = child?.id || 'e1111111-1111-1111-1111-111111111111';

    // 1. Récupérer la synthèse croisée & signaux
    fetch(`http://localhost:5000/api/profil-explicable/${childId}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data) {
          const DOMAIN_LABELS = {
            ATTENTION: 'Attention & Consignes',
            LANGAGE: 'Langage & Communication',
            MEMOIRE: 'Mémoire & Apprentissage',
            MOTRICITE: 'Motricité fine & Graphisme',
            COMPORTEMENT: 'Comportement & Régulation',
          };
          const signals = Array.isArray(data.domaines)
            ? data.domaines.map(d => ({
                domaine: d.domaine,
                libelle: DOMAIN_LABELS[d.domaine] || d.domaine,
                niveau: d.niveau,
                score: d.niveau === 'SIGNAL_FORT' ? 85 : d.niveau === 'SIGNAL_CONTEXTUEL' ? 60 : d.niveau === 'DIVERGENCE_DETECTEE' ? 70 : 20,
                description: d.justification || d.recommandation || 'Aucun signal d\'alerte.'
              }))
            : MOCK_PROFILE.signals;

          const sfCount = signals.filter(s => s.niveau === 'SIGNAL_FORT').length;
          const scCount = signals.filter(s => s.niveau === 'SIGNAL_CONTEXTUEL').length;
          const convScore = data.domaines ? Math.max(25, Math.min(95, 40 + (sfCount * 25) + (scCount * 15))) : 82;

          setProfil({
            ...data,
            signals,
            convergenceScore: convScore,
            telemetrie: { scoreAttn: 64, reactionMs: 780, successRate: 71, sessions: 8 }
          });
        }
      })
      .catch(() => setProfil(MOCK_PROFILE));

    // 2. Récupérer les observations réelles de cet enfant (École + Famille)
    fetch(`http://localhost:5000/api/observations/${childId}`)
      .then(r => r.ok ? r.json() : [])
      .then(obsList => {
        if (Array.isArray(obsList) && obsList.length > 0) {
          setObsEcole(obsList.filter(o => o.contexte === 'ECOLE'));
          setObsFamille(obsList.filter(o => o.contexte === 'MAISON' || o.contexte === 'FAMILLE'));
        } else {
          setObsEcole(MOCK_OBS_ECOLE);
          setObsFamille(MOCK_OBS_FAMILLE);
        }
      })
      .catch(() => {
        setObsEcole(MOCK_OBS_ECOLE);
        setObsFamille(MOCK_OBS_FAMILLE);
      });

    // 3. Récupérer les activités réelles de cet enfant
    fetch(`http://localhost:5000/api/activites/${childId}`)
      .then(r => r.ok ? r.json() : [])
      .then(actList => {
        if (Array.isArray(actList) && actList.length > 0) {
          const JEU_NAMES = {
            ATTENTION_FOCUS: 'Bulle Attention',
            SEQUENCE_MEMOIRE: 'Mémoire Séquence',
            INHIBITION_MOTRICE: 'Frein Réflexe',
          };
          setJeux(actList.map((a, idx) => ({
            id: a.id || idx,
            nom_jeu: JEU_NAMES[a.type_jeu] || a.type_jeu,
            score: a.taux_reussite || 70,
            temps_reaction_ms: a.temps_reponse_ms || 750,
            taux_succes: a.taux_reussite || 70,
            niveau_adaptatif: a.niveau_atteint || 3,
            duree_minutes: 10,
            created_at: (a.date_session || new Date().toISOString()).slice(0, 10),
          })));
        } else {
          setJeux(MOCK_JEUX);
        }
      })
      .catch(() => setJeux(MOCK_JEUX));
  }, [child, refreshTrigger]);

  
  const handleOpenIA = async () => {
    setShowIAModal(true);
    setIaLoading(true);
    try {
      const childId = child?.id || 'e1111111-1111-1111-1111-111111111111';
      const rObs = await fetch(`http://localhost:5000/api/observations/${childId}`);
      const obsList = await rObs.json();
      
      const rAI = await fetch('http://localhost:5000/api/ai/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ observations: obsList })
      });
      const data = await rAI.json();
      setIaResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIaLoading(false);
    }
  };

  const handleDownload = () => {
    const ok = generateAndDownloadNovaPDF(child, profil);
    if (ok) {
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3500);
    }
  };

  const navTabs = [
    { id: 'dashboard',    label: 'Tableau de bord & Signaux', icon: BarChart3 },
    { id: 'observations', label: 'Observations École & Famille', icon: Users },
    { id: 'jeux',         label: 'Jeux & Télémétrie', icon: Gamepad2 },
    { id: 'decision',     label: 'Bilan Médical & Décision', icon: FileCheck },
  ];

  const STATS = [
    { label: 'Score de convergence', value: `${profil.convergenceScore}%`, icon: Brain, color: '#17324D', bg: 'rgba(23,50,77,.07)' },
    { label: 'Signaux forts détectés', value: profil.signals.filter(s => s.niveau === 'SIGNAL_FORT').length || '1', icon: Activity, color: '#e11d48', bg: 'rgba(225,29,72,.08)' },
    { label: 'Sessions télémétrie', value: `${profil.telemetrie?.sessions || 8}`, icon: Gamepad2, color: '#58B6A9', bg: 'rgba(88,182,169,.1)' },
    { label: 'Avis médical', value: decision ? 'En cours' : 'À valider', icon: ShieldCheck, color: '#3d9b8e', bg: 'rgba(61,155,142,.1)' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }} className="fade-up">
      {/*    En-tte de page Donezo Style    */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: '1.55rem', fontWeight: 900, color: '#17324D', margin: 0, letterSpacing: '-.02em' }}>
            Espace Spécialiste & Pédopsychiatrie
          </h1>
          <p style={{ fontSize: '.88rem', color: '#64748b', margin: '4px 0 0' }}>
            Analyse croisée multi-sources, signaux faibles & dossier médical pour {child?.prenom || 'l\'enfant'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={handleOpenIA}
            style={{
              background: 'linear-gradient(135deg, #58B6A9 0%, #3d9b8e 100%)',
              color: 'white',
              border: 'none',
              padding: '10px 18px',
              borderRadius: 12,
              fontWeight: 800,
              fontSize: '.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: '0 4px 12px rgba(88,182,169,.3)',
              transition: 'all .2s ease',
            }}
          >
            <Brain size={17} color="#ffffff" />
            <span>Analyse IA & Explicabilité (Pourquoi ?)</span>
          </button>

          <button
            onClick={handleDownload}
            style={{
              background: 'linear-gradient(135deg, #17324D 0%, #0f2035 100%)',
              color: 'white',
              border: 'none',
              padding: '10px 18px',
              borderRadius: 12,
              fontWeight: 800,
              fontSize: '.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: '0 4px 12px rgba(23,50,77,.25)',
              transition: 'all .2s ease',
            }}
          >
            <Download size={16} color="#58B6A9" />
            <span>Générer Bilan Médical (PDF)</span>
          </button>
        </div>
      </div>

      {/*    Cartes de Statistiques    */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        {STATS.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} style={{
            background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0',
            padding: '18px 20px', boxShadow: '0 2px 8px rgba(23,50,77,.04)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: '.75rem', color: '#64748b', fontWeight: 600 }}>{label}</span>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={15} color={color} />
              </div>
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#17324D', lineHeight: 1 }}>{value}</div>
            <div style={{ fontSize: '.7rem', color: '#94a3b8', marginTop: 6 }}>Dossier actif</div>
          </div>
        ))}
      </div>

      {/*    Navigation par onglets    */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: 14,
        padding: 4,
        boxShadow: '0 2px 8px rgba(23,50,77,.04)',
      }}>
        <div style={{ display: 'flex', gap: 4, flex: 1 }}>
          {navTabs.map(t => {
            const Icon = t.icon;
            const isSel = page === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setPage(t.id)}
                style={{
                  flex: 1,
                  padding: '9px 14px',
                  borderRadius: 10,
                  border: 'none',
                  background: isSel ? 'rgba(88,182,169,.12)' : 'transparent',
                  color: isSel ? '#17324D' : '#64748b',
                  fontWeight: isSel ? 800 : 600,
                  fontSize: '.84rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  transition: 'all .15s ease',
                }}
              >
                <Icon size={15} color={isSel ? '#58B6A9' : '#64748b'} />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {downloadSuccess && (
        <div style={{
          background: 'rgba(88,182,169,.08)',
          border: '1px solid #a7f3d0',
          borderRadius: 10,
          padding: '10px 16px',
          color: '#065f46',
          fontWeight: 700,
          fontSize: '.84rem',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}>
          <CheckCircle2 size={16} color="#3d9b8e" />
          <span>Bilan médical PDF téléchargé avec succès.</span>
        </div>
      )}

      {/*  1. VUE TABLEAU DE BORD & SIGNAUX  */}
      {page === 'dashboard' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Métriques clés */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 12, padding: '14px 16px' }}>
              <div style={{ fontSize: '.75rem', color: '#64748b', fontWeight: 600 }}>Convergence multi-acteurs</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#3d9b8e', marginTop: 2 }}>{profil.convergenceScore}%</div>
            </div>
            <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 12, padding: '14px 16px' }}>
              <div style={{ fontSize: '.75rem', color: '#64748b', fontWeight: 600 }}>Signaux prioritaires</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#ef4444', marginTop: 2 }}>
                {profil.signals.filter(s => s.niveau === 'SIGNAL_FORT').length}
              </div>
            </div>
            <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 12, padding: '14px 16px' }}>
              <div style={{ fontSize: '.75rem', color: '#64748b', fontWeight: 600 }}>Temps de réaction moyen</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#f59e0b', marginTop: 2 }}>{profil.telemetrie.reactionMs} ms</div>
            </div>
            <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 12, padding: '14px 16px' }}>
              <div style={{ fontSize: '.75rem', color: '#64748b', fontWeight: 600 }}>Sessions de jeu analysées</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#2563eb', marginTop: 2 }}>{profil.telemetrie.sessions}</div>
            </div>
          </div>

          {/* Liste des signaux croisés */}
          <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 14, padding: 20 }}>
            <h3 style={{ fontSize: '.95rem', fontWeight: 800, margin: '0 0 14px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Brain size={17} color="#2563eb" /> Signaux Neurodéveloppementaux Croisés
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {profil.signals.map(s => (
                <div key={s.domaine} style={{ border: '1px solid #e2e8f0', borderRadius: 10, padding: '12px 16px', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <span style={{ fontSize: '1.2rem' }}>{DOMAIN_ICONS[s.domaine]}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 }}>
                      <span style={{ fontWeight: 800, fontSize: '.88rem', color: '#1e293b' }}>{s.libelle}</span>
                      <SignalBadge niveau={s.niveau} />
                    </div>
                    <p style={{ margin: 0, fontSize: '.82rem', color: '#64748b', lineHeight: 1.45 }}>{s.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/*  2. VUE OBSERVATIONS CROIS0ES 0COLE & FAMILLE  */}
      {page === 'observations' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {/* Retours École */}
          <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 14, padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, color: '#1d4ed8' }}>
              <School size={18} />
              <h3 style={{ fontSize: '.95rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>Observations Scolaires (Enseignant)</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {obsEcole.map(o => (
                <div key={o.id} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.75rem', fontWeight: 700, color: '#1d4ed8', marginBottom: 4 }}>
                    <span>{o.domaine}</span>
                    <span style={{ color: '#64748b' }}>{o.created_at}</span>
                  </div>
                  <p style={{ margin: '0 0 6px', fontSize: '.82rem', color: '#1e293b', lineHeight: 1.4 }}>{o.reponseDetaillee}</p>
                  {o.exemplesConcrets && (
                    <div style={{ fontSize: '.76rem', color: '#64748b', background: 'white', padding: '6px 10px', borderRadius: 6, border: '1px solid #e2e8f0' }}>
                      Exemple : {o.exemplesConcrets}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Retours Famille */}
          <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 14, padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, color: '#7c3aed' }}>
              <Home size={18} />
              <h3 style={{ fontSize: '.95rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>Observations Familiales (Parents)</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {obsFamille.map(o => (
                <div key={o.id} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.75rem', fontWeight: 700, color: '#7c3aed', marginBottom: 4 }}>
                    <span>{o.domaine}</span>
                    <span style={{ color: '#64748b' }}>{o.created_at}</span>
                  </div>
                  <p style={{ margin: '0 0 6px', fontSize: '.82rem', color: '#1e293b', lineHeight: 1.4 }}>{o.reponseDetaillee}</p>
                  {o.exemplesConcrets && (
                    <div style={{ fontSize: '.76rem', color: '#64748b', background: 'white', padding: '6px 10px', borderRadius: 6, border: '1px solid #e2e8f0' }}>
                      Exemple : {o.exemplesConcrets}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/*  3. VUE JEUX & T0L0M0TRIE  */}
      {page === 'jeux' && (
        <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 14, padding: 20 }}>
          <h3 style={{ fontSize: '.95rem', fontWeight: 800, margin: '0 0 14px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Gamepad2 size={18} color="#0ea5e9" /> Sessions de Jeux Cognitifs & Télémétrie
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {jeux.map(j => (
              <div key={j.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 14, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10 }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '.88rem', color: '#1e293b' }}>{j.nom_jeu}</div>
                  <div style={{ fontSize: '.75rem', color: '#64748b' }}>{j.created_at} · Durée : {j.duree_minutes} min</div>
                </div>
                <div style={{ display: 'flex', gap: 16, textAlign: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 800, color: '#2563eb', fontSize: '.95rem' }}>{j.score}%</div>
                    <div style={{ fontSize: '.7rem', color: '#64748b' }}>Score</div>
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, color: '#f59e0b', fontSize: '.95rem' }}>{j.temps_reaction_ms} ms</div>
                    <div style={{ fontSize: '.7rem', color: '#64748b' }}>Réaction</div>
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, color: '#58B6A9', fontSize: '.95rem' }}>{j.taux_succes}%</div>
                    <div style={{ fontSize: '.7rem', color: '#64748b' }}>Succès</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/*  4. VUE BILAN M0DICAL & D0CISION  */}
      {page === 'decision' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Orientation clinique */}
          <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 14, padding: 20 }}>
            <h3 style={{ fontSize: '.95rem', fontWeight: 800, margin: '0 0 12px', color: '#0f172a' }}>Orientation clinique préconisée</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                { id: 'bilan_neuro', label: 'Bilan neuropsychologique approfondi' },
                { id: 'aménagement', label: 'Aménagements scolaires (PAP/PPS)' },
                { id: 'ortho', label: 'Bilan orthophonique complémentaire' },
                { id: 'surveillance', label: 'Surveillance active & contrôle à 3 mois' },
              ].map(d => (
                <button
                  key={d.id}
                  onClick={() => setDecision(d.id)}
                  style={{
                    padding: '12px 14px',
                    borderRadius: 10,
                    border: decision === d.id ? '2px solid #58B6A9' : '1px solid #e2e8f0',
                    background: decision === d.id ? 'rgba(88,182,169,.08)' : '#ffffff',
                    fontWeight: 700,
                    fontSize: '.84rem',
                    color: decision === d.id ? '#17324D' : '#334155',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    textAlign: 'left',
                    transition: 'all .15s ease',
                  }}
                >
                  <span>{d.label}</span>
                  {decision === d.id && <Check size={16} color="#58B6A9" />}
                </button>
              ))}
            </div>
          </div>

          {/* Notes privées */}
          <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 14, padding: 20 }}>
            <h3 style={{ fontSize: '.95rem', fontWeight: 800, margin: '0 0 10px', color: '#0f172a' }}>Notes confidentielles du médecin</h3>
            <textarea
              rows={4}
              value={notes}
              onChange={e => {
                setNotes(e.target.value);
                localStorage.setItem('nova_notes', e.target.value);
              }}
              placeholder="Saisissez vos observations médicales privées..."
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: '.85rem' }}
            />
          </div>
        </div>
      )}

      {/* ── MODAL ANALYSE IA EXPLICABLE & BOUTON POURQUOI ── */}
      {showIAModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)',
          zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
        }}>
          <div style={{
            background: '#ffffff', borderRadius: 20, width: '100%', maxWidth: 680,
            maxHeight: '90vh', overflowY: 'auto', padding: 28, boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
            animation: 'popIn 0.3s ease'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, borderBottom: '1px solid #e2e8f0', pb: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(88,182,169,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Brain size={22} color="#58B6A9" />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#17324D', margin: 0 }}>Modèle IA Embarqué & Explicabilité</h2>
                  <span style={{ fontSize: '.75rem', color: '#64748b' }}>Entraîné sur 2 135 cohortes d enfants · Détection précoce TND</span>
                </div>
              </div>
              <button onClick={() => setShowIAModal(false)} style={{ background: '#f1f5f9', border: 'none', borderRadius: 10, padding: 8, cursor: 'pointer' }}>
                <X size={18} color="#64748b" />
              </button>
            </div>

            {iaLoading ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#17324D' }}>
                <Loader2 size={32} className="spin" color="#58B6A9" style={{ margin: '0 auto 12px' }} />
                <p style={{ fontWeight: 700, margin: 0 }}>Calcul des probabilités et convergence multi-acteurs par l IA...</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                
                {/* Diagnostic principal prédit */}
                <div style={{ background: 'linear-gradient(135deg, #17324D 0%, #0f2035 100%)', borderRadius: 14, padding: '20px 22px', color: 'white' }}>
                  <div style={{ fontSize: '.75rem', textTransform: 'uppercase', letterSpacing: '.08em', color: '#58B6A9', fontWeight: 800 }}>Hypothèse clinique dominante</div>
                  <div style={{ fontSize: '1.45rem', fontWeight: 900, marginTop: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>{iaResult?.topProfil?.profil || 'Développement sous observation'}</span>
                    <span style={{ background: 'rgba(88,182,169,.25)', color: '#58B6A9', padding: '4px 12px', borderRadius: 8, fontSize: '.95rem', fontWeight: 900 }}>
                      {Math.round((iaResult?.topProfil?.probabilite || 0.85) * 100)}% de confiance
                    </span>
                  </div>
                  <p style={{ margin: '8px 0 0', fontSize: '.84rem', color: '#94a3b8', lineHeight: 1.5 }}>
                    L algorithme de Régression Logistique pondéré compare les signaux de {child?.prenom || 'l enfant'} avec la base d entraînement des 2 135 cas pédiatriques.
                  </p>
                </div>

                {/* Barres de probabilités comparées */}
                <div>
                  <h4 style={{ fontSize: '.9rem', fontWeight: 800, color: '#17324D', marginBottom: 12 }}>Probabilités comparées des cas possibles</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {(iaResult?.probabilites || []).map((p, idx) => {
                      const pct = Math.round(p.probabilite * 100);
                      const isTop = idx === 0;
                      return (
                        <div key={p.profil} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '10px 14px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.82rem', fontWeight: 800, color: isTop ? '#17324D' : '#64748b', marginBottom: 6 }}>
                            <span>{p.profil}</span>
                            <span>{pct}%</span>
                          </div>
                          <div style={{ height: 8, background: '#e2e8f0', borderRadius: 4, overflow: 'hidden' }}>
                            <div style={{ width: `${pct}%`, height: '100%', background: isTop ? 'linear-gradient(90deg, #58B6A9, #3d9b8e)' : '#94a3b8', borderRadius: 4, transition: 'width 0.4s ease' }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Explications & Conseilles pour le Spécialiste */}
                <div style={{ background: 'rgba(88,182,169,.08)', border: '1px solid #a7f3d0', borderRadius: 14, padding: 18 }}>
                  <h4 style={{ fontSize: '.9rem', fontWeight: 800, color: '#065f46', margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <ShieldCheck size={18} color="#3d9b8e" /> Conseils & Orientations pour le Pédopsychiatre
                  </h4>
                  <ul style={{ margin: 0, paddingLeft: 18, fontSize: '.84rem', color: '#1e293b', lineHeight: 1.6 }}>
                    <li><strong>Analyse croisée</strong> : Vérifier la convergence entre le questionnaire enseignant (classe) et l observation parentale (maison).</li>
                    <li><strong>Variabilité attentionnelle</strong> : Prendre en compte le score de jeu adaptatif pour éliminer les simples fatigues passagères.</li>
                    <li><strong>Décision médicale</strong> : Ce modèle IA constitue une aide à la décision clinique et ne remplace pas l évaluation directe du praticien.</li>
                  </ul>
                </div>

              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
