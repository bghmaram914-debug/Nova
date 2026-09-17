import React, { useState, useEffect, useRef } from 'react';
import {
  Stethoscope, AlertTriangle, CheckCircle2, Clock, FileText, X,
  School, Home, Gamepad2, Sparkles, Download, Users, Brain,
  TrendingUp, BarChart3, Bot, Save, Activity, ShieldCheck,
  User, Printer, Calendar, Filter, Check, Target, FileCheck,
  ArrowUpRight, Search, ChevronRight, Info, Loader2
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// ─────────────────────────────────────────────────────────────
// MOCK DATA
// ─────────────────────────────────────────────────────────────
const MOCK_PROFILE = {
  signals: [
    { domaine: 'ATTENTION',    libelle: 'Attention & Consignes', niveau: 'SIGNAL_FORT',       score: 78, description: 'Convergence forte entre école et maison sur les difficultés d\'attention soutenue.', sources: ['ECOLE','MAISON','JEUX'], frequenceMoy: 4.2 },
    { domaine: 'MOTRICITE',    libelle: 'Motricité fine',        niveau: 'SIGNAL_CONTEXTUEL', score: 55, description: 'Signal observé à l\'école uniquement. Contexte scolaire déclencheur.', sources: ['ECOLE'], frequenceMoy: 3.1 },
    { domaine: 'COMPORTEMENT', libelle: 'Comportement',          niveau: 'PAS_DE_SIGNAL',     score: 22, description: 'Aucune convergence multi-acteurs. Comportement adapté selon les contextes.', sources: [], frequenceMoy: 1.4 },
    { domaine: 'MEMOIRE',      libelle: 'Mémoire de travail',    niveau: 'SIGNAL_CONTEXTUEL', score: 45, description: 'Signal modéré identifié lors des séquences de jeu cognitif.', sources: ['JEUX','MAISON'], frequenceMoy: 2.8 },
  ],
  telemetrie: { scoreAttn: 64, reactionMs: 780, successRate: 71, variabilite: 'Haute', sessions: 8 },
  convergenceScore: 82,
};

const MOCK_OBS_ECOLE = [
  { id: 1, domaine: 'ATTENTION', frequenceDifficulte: 5, impactQuotidien: 4, reponseDetaillee: 'Difficulté persistante à maintenir son attention sur une double consigne écrite ou lors des exercices individuels de plus de 10 minutes.', exemplesConcrets: 'Regarde par la fenêtre dès le début de l\'exercice, oublie souvent la 2ème étape.', created_at: '2026-09-15', observateurNom: 'Mme Sonia Trabelsi' },
  { id: 2, domaine: 'MOTRICITE', frequenceDifficulte: 3, impactQuotidien: 3, reponseDetaillee: 'Tenue du crayon crispée, lenteur pour copier les devoirs au tableau en arabe et français.', exemplesConcrets: 'Prend 5 minutes de plus que ses camarades pour copier la date au tableau.', created_at: '2026-09-10', observateurNom: 'Mme Sonia Trabelsi' },
];

const MOCK_OBS_FAMILLE = [
  { id: 3, domaine: 'ATTENTION', frequenceDifficulte: 4, impactQuotidien: 4, reponseDetaillee: 'Au moment des devoirs, la moindre distraction coupe totalement son fil de pensée.', exemplesConcrets: 'Se lève plusieurs fois, a du mal à finir 3 lignes de lecture sans pause.', created_at: '2026-09-14', observateurNom: 'Mme Leila B. (Parent)' },
  { id: 4, domaine: 'COMPORTEMENT', frequenceDifficulte: 2, impactQuotidien: 2, reponseDetaillee: 'Bonne relation avec ses frères et sœurs, gère globalement bien ses émotions.', exemplesConcrets: 'Frustration occasionnelle lors des transitions activité → devoirs.', created_at: '2026-09-12', observateurNom: 'Mme Leila B. (Parent)' },
];


const MOCK_JEUX = [
  { id: 1, nom_jeu: 'Bulle Attention', score: 64, temps_reaction_ms: 780, taux_succes: 71, niveau_adaptatif: 3, duree_minutes: 12, created_at: '2026-09-16' },
  { id: 2, nom_jeu: 'Mémoire Séquence', score: 58, temps_reaction_ms: 840, taux_succes: 65, niveau_adaptatif: 2, duree_minutes: 10, created_at: '2026-09-14' },
  { id: 3, nom_jeu: 'Bulle Attention', score: 71, temps_reaction_ms: 750, taux_succes: 76, niveau_adaptatif: 3, duree_minutes: 11, created_at: '2026-09-12' },
];

const LONGITUDINAL = {
  '3M': [
    { label: 'Juin',     attention: 52, reaction: 820, memoire: 75, convergence: 60, jalon: null },
    { label: 'Juillet',  attention: 58, reaction: 790, memoire: 80, convergence: 68, jalon: 'Bilan Ortho' },
    { label: 'Août',     attention: 62, reaction: 760, memoire: 82, convergence: 74, jalon: null },
    { label: 'Septembre',attention: 64, reaction: 780, memoire: 90, convergence: 82, jalon: 'Aménagements CE1' },
  ],
  '6M': [
    { label: 'Avril',    attention: 48, reaction: 890, memoire: 70, convergence: 50, jalon: null },
    { label: 'Mai',      attention: 52, reaction: 850, memoire: 74, convergence: 58, jalon: 'Alerte École' },
    { label: 'Juin',     attention: 55, reaction: 820, memoire: 78, convergence: 64, jalon: 'Accord RGPD' },
    { label: 'Juillet',  attention: 60, reaction: 790, memoire: 82, convergence: 72, jalon: null },
    { label: 'Août',     attention: 62, reaction: 760, memoire: 85, convergence: 76, jalon: null },
    { label: 'Septembre',attention: 64, reaction: 780, memoire: 90, convergence: 82, jalon: 'Bilan Pluridisciplinaire' },
  ],
  '12M': [
    { label: 'Oct 25',   attention: 45, reaction: 950, memoire: 65, convergence: 40, jalon: null },
    { label: 'Déc 25',   attention: 48, reaction: 910, memoire: 70, convergence: 45, jalon: null },
    { label: 'Fév 26',   attention: 50, reaction: 870, memoire: 72, convergence: 52, jalon: 'Signal École' },
    { label: 'Avr 26',   attention: 55, reaction: 830, memoire: 76, convergence: 62, jalon: null },
    { label: 'Juin 26',  attention: 58, reaction: 790, memoire: 82, convergence: 70, jalon: 'Entrée NOVA' },
    { label: 'Sept 26',  attention: 64, reaction: 780, memoire: 90, convergence: 82, jalon: 'Suivi Spécialiste' },
  ],
};

const DOMAIN_ICONS = { ATTENTION: '🎯', LANGAGE: '🗣️', MEMOIRE: '🧠', MOTRICITE: '✍️', COMPORTEMENT: '🤝' };

const SIGNAL_COLORS = {
  SIGNAL_FORT:           { text: '#991b1b', bg: '#fef2f2', bd: '#fecaca', label: 'Signal Fort' },
  SIGNAL_CONTEXTUEL:     { text: '#92400e', bg: '#fffbeb', bd: '#fde68a', label: 'Signal Contextuel' },
  DIVERGENCE_DETECTEE:   { text: '#7c2d12', bg: '#fff7ed', bd: '#fed7aa', label: 'Divergence' },
  PAS_DE_SIGNAL:         { text: '#065f46', bg: '#ecfdf5', bd: '#a7f3d0', label: 'Pas de signal' },
};

// ─────────────────────────────────────────────────────────────
// HELPER COMPONENTS
// ─────────────────────────────────────────────────────────────
function SignalBadge({ niveau }) {
  const s = SIGNAL_COLORS[niveau] || SIGNAL_COLORS.PAS_DE_SIGNAL;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 10px', borderRadius: 99, fontSize: '.72rem', fontWeight: 700, background: s.bg, color: s.text, border: `1px solid ${s.bd}` }}>
      {niveau === 'SIGNAL_FORT' && '⚠️ '}
      {s.label}
    </span>
  );
}

function PageHeader({ icon: Icon, title, subtitle, color = 'var(--brand-blue)', badge }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20, gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 40, height: 40, borderRadius: 11, background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon size={20} color="white" />
        </div>
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--gray-900)', margin: 0 }}>{title}</h2>
          {subtitle && <p style={{ fontSize: '.8rem', color: 'var(--text-sub)', margin: '2px 0 0' }}>{subtitle}</p>}
        </div>
      </div>
      {badge}
    </div>
  );
}

function ObsCard({ obs, context }) {
  const color = context === 'school' ? '#1d4ed8' : '#7c3aed';
  const bg    = context === 'school' ? '#eff6ff'  : '#f5f3ff';
  return (
    <div style={{ padding: '16px 18px', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', background: 'var(--surface)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: '1rem' }}>{DOMAIN_ICONS[obs.domaine] || '📋'}</span>
          <span style={{ fontWeight: 700, fontSize: '.9rem', color: 'var(--gray-800)' }}>{obs.domaine.charAt(0) + obs.domaine.slice(1).toLowerCase().replace(/_/g, ' ')}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: '.73rem', color: 'var(--text-muted)' }}>{obs.created_at?.slice(0,10)}</span>
          <span style={{ padding: '2px 8px', background: bg, color, borderRadius: 99, fontSize: '.7rem', fontWeight: 700 }}>Fréq. {obs.frequenceDifficulte}/5</span>
        </div>
      </div>
      <p style={{ margin: '0 0 8px', fontSize: '.85rem', color: 'var(--gray-700)', lineHeight: 1.55 }}>{obs.reponseDetaillee}</p>
      {obs.exemplesConcrets && (
        <p style={{ margin: 0, fontSize: '.78rem', color: 'var(--text-sub)', fontStyle: 'italic', borderLeft: `3px solid ${color}`, paddingLeft: 10 }}>
          {obs.exemplesConcrets}
        </p>
      )}
      <div style={{ marginTop: 10, fontSize: '.73rem', color: 'var(--text-muted)' }}>— {obs.observateurNom}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// LONGITUDINAL SVG CHART
// ─────────────────────────────────────────────────────────────
function LongitudinalChart({ data, metric }) {
  const W = 520, H = 200, PAD = { t: 20, r: 20, b: 40, l: 40 };
  const values = data.map(d => d[metric]);
  const min = Math.min(...values) - 10;
  const max = Math.max(...values) + 10;
  const xStep = (W - PAD.l - PAD.r) / (data.length - 1);
  const yScale = v => PAD.t + (H - PAD.t - PAD.b) * (1 - (v - min) / (max - min));
  const points = data.map((d, i) => ({ x: PAD.l + i * xStep, y: yScale(d[metric]), ...d }));
  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaD = `${pathD} L ${points[points.length-1].x} ${H - PAD.b} L ${PAD.l} ${H - PAD.b} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto' }}>
      <defs>
        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2563eb" stopOpacity=".2" />
          <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Grid lines */}
      {[0,25,50,75,100].map(v => {
        const y = yScale(min + (max - min) * v / 100);
        return <line key={v} x1={PAD.l} y1={y} x2={W - PAD.r} y2={y} stroke="#f1f5f9" strokeWidth="1" />;
      })}
      {/* Area fill */}
      <path d={areaD} fill="url(#chartGrad)" />
      {/* Line */}
      <path d={pathD} fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* Points */}
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r={5} fill="white" stroke="#2563eb" strokeWidth="2.5" />
          {p.jalon && (
            <g>
              <line x1={p.x} y1={p.y - 8} x2={p.x} y2={H - PAD.b} stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="3,3" />
              <rect x={p.x - 40} y={p.y - 22} width={80} height={14} rx={4} fill="#fffbeb" stroke="#fde68a" strokeWidth="1" />
              <text x={p.x} y={p.y - 12} textAnchor="middle" fontSize="8" fill="#92400e" fontWeight="600">{p.jalon}</text>
            </g>
          )}
          {/* Value label */}
          <text x={p.x} y={p.y - 10} textAnchor="middle" fontSize="9" fill="#2563eb" fontWeight="700">
            {typeof p[metric] === 'number' ? p[metric] : ''}
          </text>
          {/* X label */}
          <text x={p.x} y={H - PAD.b + 14} textAnchor="middle" fontSize="9" fill="#94a3b8">{p.label}</text>
        </g>
      ))}
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────
// GÉNÉRATEUR ET TÉLÉCHARGEMENT DIRECT DE FICHIER PDF (jsPDF)
// ─────────────────────────────────────────────────────────────
export const generateAndDownloadNovaPDF = (child, profil) => {
  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

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
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text("· MINISTÈRE DE LA SANTÉ PUBLIQUE & MINISTÈRE DE L'ÉDUCATION", 58, 9);

    doc.setTextColor(148, 163, 184);
    doc.setFontSize(7.2);
    doc.text("OBSERVATOIRE DES TROUBLES NEURODÉVELOPPEMENTAUX (TND) · PROTOCOLE NATIONAL", 14, 16);

    doc.setTextColor(110, 231, 183);
    doc.text("Conforme Loi INADP 2004-63", 152, 16);

    // 2. Titre et Date
    doc.setTextColor(29, 78, 216);
    doc.setFontSize(15);
    doc.setFont('helvetica', 'bold');
    doc.text("NOVA TUNISIE — BILAN CLINIQUE DE SYNTHÈSE", 14, 34);

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
    doc.text("ÂGE & SCOLARITÉ", 140, 54);

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

    const signals = (profil?.signals && profil.signals.length > 0) ? profil.signals : [
      { domaine: 'ATTENTION', libelle: 'Attention & Consignes', niveau: 'SIGNAL_FORT', description: 'Convergence multi-acteurs forte sur les difficultés de maintien attentionnel et de distractibilité.' },
      { domaine: 'MOTRICITE', libelle: 'Motricité fine & Graphisme', niveau: 'SIGNAL_CONTEXTUEL', description: 'Difficulté en milieu scolaire lors de la copie rapide et tenue crispée du stylo.' },
      { domaine: 'MEMOIRE', libelle: 'Mémoire de travail', niveau: 'SIGNAL_CONTEXTUEL', description: 'Fatigabilité lors des tâches impliquant une double consigne séquentielle.' },
      { domaine: 'COMPORTEMENT', libelle: 'Comportement & Régulation', niveau: 'PAS_DE_SIGNAL', description: 'Comportement adapté et bonne intégration avec les pairs et la fratrie.' }
    ];

    signals.forEach((s) => {
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(14, y, 182, 17, 2, 2, 'FD');

      doc.setTextColor(30, 41, 59);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text(s.libelle, 18, y + 5.5);

      // Badge
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
    doc.text("NOVA TUNISIE — Document officiel généré sous contrôle médical (Loi INADP n° 2004-63).", 14, 288);
    doc.text("Page 1 / 1", 188, 288);

    // Sauvegarde et déclenchement automatique du téléchargement
    const sanitizedName = (child?.nom_anonyme || child?.prenom || 'Enfant').replace(/[^a-zA-Z0-9_-]/g, '_');
    const filename = `Bilan_Pedopsychiatrique_NOVA_${sanitizedName}_${childCode}.pdf`;
    doc.save(filename);
    return true;
  } catch (err) {
    console.error('Erreur directe jsPDF:', err);
    window.print();
    return false;
  }
};

// ─────────────────────────────────────────────────────────────
// MODAL D'APERÇU & TÉLÉCHARGEMENT DU BILAN PDF
// ─────────────────────────────────────────────────────────────
function MdphReport({ child, profil, onClose }) {
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const today = new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
  const childName = child?.nom_anonyme || child?.prenom || 'Enfant';
  const childCode = child?.code_identifiant || 'TN-NOVA-2026-084';

  const handleDownloadPDF = () => {
    setIsDownloading(true);
    setTimeout(() => {
      const success = generateAndDownloadNovaPDF(child, profil);
      setIsDownloading(false);
      if (success) {
        setDownloadSuccess(true);
        setTimeout(() => setDownloadSuccess(false), 4000);
      }
    }, 100);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,.65)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, backdropFilter: 'blur(6px)' }} className="fade-in">
      <div style={{ background: 'white', borderRadius: 'var(--r-2xl)', width: '100%', maxWidth: 740, maxHeight: '92vh', overflow: 'auto', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.35)' }}>
        
        {/* Modal header */}
        <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f8fafc' }}>
          <div>
            <h3 style={{ fontWeight: 800, fontSize: '1.05rem', margin: 0, color: '#0f172a' }}>
              Bilan Pédopsychiatrique Officiel — {childName}
            </h3>
            <p style={{ fontSize: '.78rem', color: 'var(--text-sub)', margin: '2px 0 0' }}>
              Format normé · Conforme INADP Loi n° 2004-63 (Tunisie)
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={handleDownloadPDF}
              disabled={isDownloading}
              className="btn btn-primary btn-sm"
              style={{
                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                borderColor: '#059669',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontWeight: 700,
                boxShadow: '0 4px 12px rgba(5,150,105,.3)'
              }}
            >
              {isDownloading ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  <span>Génération du PDF…</span>
                </>
              ) : (
                <>
                  <Download size={15} />
                  <span>Télécharger le PDF</span>
                </>
              )}
            </button>

            <button
              onClick={() => window.print()}
              className="btn btn-secondary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <Printer size={14} /> Imprimer
            </button>

            <button onClick={onClose} className="btn btn-secondary btn-sm" style={{ padding: '6px 10px' }}>
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Confirmation de téléchargement réussi */}
        {downloadSuccess && (
          <div style={{
            background: '#ecfdf5',
            border: '1.5px solid #a7f3d0',
            borderRadius: 12,
            padding: '12px 20px',
            margin: '16px 24px 0',
            color: '#065f46',
            fontWeight: 700,
            fontSize: '.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            boxShadow: '0 2px 8px rgba(5,150,105,0.1)'
          }}>
            <CheckCircle2 size={18} color="#059669" />
            <span>Fichier PDF téléchargé avec succès dans vos Téléchargements : <code>Bilan_Pedopsychiatrique_NOVA_{childName.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf</code></span>
          </div>
        )}

        {/* Print & Export PDF Area */}
        <div className="print-zone" style={{ padding: '32px 36px', background: 'white' }}>
          {/* Entête Officielle Tunisie */}
          <div style={{ borderBottom: '2px solid #0f172a', paddingBottom: 14, marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: '.72rem', fontWeight: 800, color: '#dc2626', letterSpacing: '.04em' }}>
                  🇹🇳 RÉPUBLIQUE TUNISIENNE · MINISTÈRE DE LA SANTÉ PUBLIQUE
                </div>
                <div style={{ fontWeight: 900, fontSize: '1.45rem', color: '#1d4ed8', letterSpacing: '-.02em', marginTop: 2 }}>
                  NOVA TUNISIE
                </div>
                <div style={{ fontSize: '.78rem', color: '#475569', fontWeight: 600 }}>
                  Observatoire National & Détection Précoce des TND (TSA · TDAH · Dys)
                </div>
              </div>

              <div style={{ textAlign: 'right', fontSize: '.76rem', color: '#475569' }}>
                <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '.85rem', marginBottom: 2 }}>
                  BILAN DE SYNTHÈSE PÉDOPSYCHIATRIQUE
                </div>
                <div style={{ color: '#059669', fontWeight: 600 }}>Secret Médical · Loi INADP n° 2004-63</div>
                <div>Date d'édition : <strong>{today}</strong></div>
              </div>
            </div>
          </div>

          {/* Fiche Patient */}
          <div style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: 12, padding: '16px 20px', marginBottom: 20 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, fontSize: '.84rem' }}>
              <div>
                <div style={{ color: '#64748b', fontSize: '.72rem', fontWeight: 700, textTransform: 'uppercase' }}>CODE PATIENT SÉCURISÉ</div>
                <div style={{ fontWeight: 800, color: '#1d4ed8', fontSize: '1rem' }}>{childCode}</div>
              </div>
              <div>
                <div style={{ color: '#64748b', fontSize: '.72rem', fontWeight: 700, textTransform: 'uppercase' }}>IDENTITÉ / PRÉNOM</div>
                <div style={{ fontWeight: 800, color: '#0f172a' }}>{child?.prenom || 'Youssef'} {child?.nom_anonyme || 'B.'}</div>
              </div>
              <div>
                <div style={{ color: '#64748b', fontSize: '.72rem', fontWeight: 700, textTransform: 'uppercase' }}>ÂGE & SCOLARITÉ</div>
                <div style={{ fontWeight: 700, color: '#0f172a' }}>{child?.age || 7} ans · {child?.niveau_scolaire || '2ème Année Primaire'}</div>
              </div>
            </div>
            <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid #e2e8f0', fontSize: '.78rem', color: '#64748b' }}>
              Établissement : <strong style={{ color: '#334155' }}>{child?.etablissement || 'École Primaire Habib Bourguiba - Tunis'}</strong>
            </div>
          </div>

          {/* Signaux détectés par domaine */}
          <h4 style={{ fontSize: '.88rem', fontWeight: 800, marginBottom: 12, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '.05em', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Brain size={16} color="#2563eb" /> Signaux Neurodéveloppementaux Détectés
          </h4>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
            {(profil?.signals || MOCK_PROFILE.signals).map(s => (
              <div key={s.domaine} style={{ border: '1px solid #e2e8f0', borderRadius: 10, padding: '12px 16px', display: 'flex', gap: 14, alignItems: 'flex-start', background: '#ffffff' }}>
                <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>{DOMAIN_ICONS[s.domaine]}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontWeight: 800, fontSize: '.88rem', color: '#1e293b' }}>{s.libelle}</span>
                    <SignalBadge niveau={s.niveau} />
                  </div>
                  <p style={{ margin: 0, fontSize: '.82rem', color: '#475569', lineHeight: 1.5 }}>{s.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Recommandations préliminaires & Aménagements */}
          <h4 style={{ fontSize: '.88rem', fontWeight: 800, margin: '20px 0 10px', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '.05em', display: 'flex', alignItems: 'center', gap: 8 }}>
            <CheckCircle2 size={16} color="#059669" /> Préconisations Cliniques & Aménagements Scolaires
          </h4>
          <div style={{ background: '#f0fdf4', border: '1.5px solid #a7f3d0', borderRadius: 10, padding: '16px 18px', fontSize: '.84rem', color: '#065f46' }}>
            <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.8 }}>
              <li><strong>Bilan neuropsychologique complet :</strong> Évaluation de l'attention soutenue, des fonctions exécutives et de la mémoire de travail.</li>
              <li><strong>Aménagements pédagogiques :</strong> Simplification des consignes écrites, temps majoré (+25%), placement au premier rang en classe.</li>
              <li><strong>Bilan orthophonique :</strong> Analyse fine du langage et de la coordination motrice fine.</li>
              <li><strong>Suivi collaboratif :</strong> Réévaluation de contrôle à 3 mois via le portail NOVA Tunisie.</li>
            </ul>
          </div>

          {/* Bloc de Signature & Cachet Officiel */}
          <div style={{ marginTop: 28, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
            <div style={{ border: '1.5px solid #e2e8f0', borderRadius: 10, padding: '14px 16px', fontSize: '.78rem', color: '#64748b', background: '#fafafa' }}>
              <div style={{ fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>Médecin / Praticien Rédacteur</div>
              <div style={{ fontWeight: 700, color: '#1d4ed8' }}>Dr. Anis Ben Salah</div>
              <div>Pédopsychiatre Référent · Hôpital Razi / Tunis</div>
              <div>N° Inscription Conseil de l'Ordre : 18452/TN</div>
              <div style={{ marginTop: 18, borderTop: '1px dashed #cbd5e1', paddingTop: 8, color: '#94a3b8' }}>
                Signature & Cachet Médical :
              </div>
            </div>

            <div style={{ border: '1.5px solid #e2e8f0', borderRadius: 10, padding: '14px 16px', fontSize: '.78rem', color: '#64748b', background: '#fafafa' }}>
              <div style={{ fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>Commission Destinataire</div>
              <div style={{ fontWeight: 700, color: '#059669' }}>Commission Médicale Scolaire & CNAM</div>
              <div>Ministère de l'Éducation · Direction Régionale</div>
              <div>Dossier d'aménagements spécifiques</div>
              <div style={{ marginTop: 18, borderTop: '1px dashed #cbd5e1', paddingTop: 8, color: '#94a3b8' }}>
                Visa de Réception :
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// PAGES
// ─────────────────────────────────────────────────────────────
function PageDashboard({ profil, obsEcole, obsFamille, jeux, onGoTo }) {
  const p = profil || MOCK_PROFILE;
  const signals = (p?.signals && p.signals.length > 0) ? p.signals : MOCK_PROFILE.signals;
  const telemetrie = p?.telemetrie || MOCK_PROFILE.telemetrie;
  const signalFort = signals.filter(s => s.niveau === 'SIGNAL_FORT').length;

  const statItems = [
    { label: 'Enfants suivis', value: 2, color: 'var(--brand-blue)', icon: Users },
    { label: 'Signaux forts', value: signalFort, color: '#ef4444', icon: AlertTriangle },
    { label: 'Convergence', value: `${p?.convergenceScore ?? 82}%`, color: 'var(--brand-teal)', icon: Activity },
    { label: 'Sessions jeu', value: telemetrie?.sessions ?? 8, color: '#7c3aed', icon: Gamepad2 },
  ];

  return (
    <div className="fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <PageHeader icon={BarChart3} title="Tableau de Bord" subtitle="Vue cohorte des patients suivis" color="#2563eb" />

      {/* Stats */}
      <div className="stat-grid">
        {statItems.map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="stat-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <div style={{ width: 34, height: 34, borderRadius: 9, background: s.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={17} color={s.color} />
                </div>
              </div>
              <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          );
        })}
      </div>

      {/* Signals overview */}
      <div className="card" style={{ padding: '22px 24px' }}>
        <h3 style={{ fontSize: '.95rem', fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Brain size={18} color="var(--brand-violet)" /> Signaux actifs — Léo M.
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {signals.map(s => (
            <div key={s.domaine} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 'var(--r-md)', background: 'var(--gray-50)', border: '1px solid var(--border)' }}>
              <span style={{ fontSize: '1rem' }}>{DOMAIN_ICONS[s.domaine]}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: '.87rem', color: 'var(--gray-800)', marginBottom: 2 }}>{s.libelle}</div>
                <div style={{ height: 5, borderRadius: 99, background: 'var(--gray-200)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${s.score}%`, background: s.niveau === 'SIGNAL_FORT' ? '#ef4444' : s.niveau === 'SIGNAL_CONTEXTUEL' ? '#f59e0b' : 'var(--green)', borderRadius: 99, transition: 'width .5s var(--ease)' }} />
                </div>
              </div>
              <SignalBadge niveau={s.niveau} />
            </div>
          ))}
        </div>
      </div>

      {/* Quick nav */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
        {[
          { page: 'enseignant', icon: School,    label: 'Feedback Enseignant', count: obsEcole.length,    color: '#1d4ed8' },
          { page: 'famille',    icon: Home,      label: 'Feedback Famille',    count: obsFamille.length,  color: '#7c3aed' },
          { page: 'jeux',       icon: Gamepad2,  label: 'Jeux & Télémétrie',   count: jeux.length,        color: '#0ea5e9' },
          { page: 'longitudinal',icon: TrendingUp,label:'Suivi Longitudinal',  count: null,               color: '#0d9488' },
        ].map(item => {
          const Icon = item.icon;
          return (
            <button key={item.page} onClick={() => onGoTo(item.page)} style={{
              background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)',
              padding: '16px', cursor: 'pointer', textAlign: 'left', transition: 'all var(--dur) var(--ease)',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = item.color + '60'; e.currentTarget.style.boxShadow = `0 4px 12px ${item.color}18`; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <div style={{ width: 32, height: 32, borderRadius: 9, background: item.color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                <Icon size={16} color={item.color} />
              </div>
              <div style={{ fontWeight: 700, fontSize: '.85rem', color: 'var(--gray-800)', marginBottom: 2 }}>{item.label}</div>
              {item.count !== null && <div style={{ fontSize: '.75rem', color: 'var(--text-sub)' }}>{item.count} observation{item.count !== 1 ? 's' : ''}</div>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function PageProfil({ child, profil }) {
  const rawP = profil || MOCK_PROFILE;
  const p = { ...rawP, signals: (rawP?.signals && rawP.signals.length > 0) ? rawP.signals : MOCK_PROFILE.signals, telemetrie: rawP?.telemetrie || MOCK_PROFILE.telemetrie };
  const c = child || {};
  return (
    <div className="fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <PageHeader icon={User} title="Identité & Profil 360°" subtitle="Fiche patient consolidée" color="#0d9488" />

      {/* Identity card */}
      <div className="card" style={{ padding: '22px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16 }}>
          {[
            ['Code patient', c.code_identifiant || 'NOVA-2026-084'],
            ['Prénom', c.prenom || 'Léo'],
            ['Âge', `${c.age || 7} ans`],
            ['Niveau', c.niveau_scolaire || 'CE1'],
            ['Établissement', c.etablissement || 'École Jules Ferry'],
            ['Consentement RGPD', '✅ Signé'],
          ].map(([k, v]) => (
            <div key={k}>
              <div style={{ fontSize: '.7rem', textTransform: 'uppercase', letterSpacing: '.07em', color: 'var(--text-muted)', marginBottom: 3 }}>{k}</div>
              <div style={{ fontWeight: 700, fontSize: '.9rem', color: 'var(--gray-800)' }}>{v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Telemetry */}
      <div className="card" style={{ padding: '22px 24px' }}>
        <h3 style={{ fontSize: '.95rem', fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Activity size={17} color="var(--brand-blue)" /> Métriques Cognitives (Jeux Adaptatifs)
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12 }}>
          {[
            { label: 'Score Attention', value: `${p.telemetrie.scoreAttn}%`,  color: '#ef4444' },
            { label: 'Temps Réaction',  value: `${p.telemetrie.reactionMs} ms`, color: '#f59e0b' },
            { label: 'Taux de Succès', value: `${p.telemetrie.successRate}%`, color: '#10b981' },
            { label: 'Convergence',    value: `${p.convergenceScore}%`,       color: '#2563eb' },
          ].map(m => (
            <div key={m.label} style={{ background: 'var(--gray-50)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: '14px 16px' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: m.color, letterSpacing: '-.03em' }}>{m.value}</div>
              <div style={{ fontSize: '.75rem', color: 'var(--text-sub)', marginTop: 2 }}>{m.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Signals */}
      <div className="card" style={{ padding: '22px 24px' }}>
        <h3 style={{ fontSize: '.95rem', fontWeight: 700, marginBottom: 16 }}>Signaux détectés par domaine</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {p.signals.map(s => (
            <div key={s.domaine} style={{ padding: '14px 16px', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <span style={{ fontSize: '1.1rem', flexShrink: 0, marginTop: 2 }}>{DOMAIN_ICONS[s.domaine]}</span>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontWeight: 700, fontSize: '.9rem' }}>{s.libelle}</span>
                  <SignalBadge niveau={s.niveau} />
                </div>
                <p style={{ margin: '0 0 6px', fontSize: '.82rem', color: 'var(--gray-600)', lineHeight: 1.5 }}>{s.description}</p>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {s.sources.map(src => <span key={src} className="badge badge-gray">{src}</span>)}
                </div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: s.niveau === 'SIGNAL_FORT' ? '#ef4444' : s.niveau === 'SIGNAL_CONTEXTUEL' ? '#f59e0b' : 'var(--green)' }}>{s.score}%</div>
                <div style={{ fontSize: '.7rem', color: 'var(--text-muted)' }}>intensité</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PageObs({ obs, context, icon: Icon, color, title }) {
  return (
    <div className="fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <PageHeader icon={Icon} title={title} subtitle={`${obs.length} observation${obs.length !== 1 ? 's' : ''} enregistrée${obs.length !== 1 ? 's' : ''}`} color={color} />
      <div className="alert alert-info" style={{ fontSize: '.83rem' }}>
        <Info size={14} style={{ flexShrink: 0, marginTop: 1 }} />
        <span>Ces observations sont partagées avec vous en lecture seule. L'espace de saisie reste réservé à l'observateur pour garantir l'indépendance des données.</span>
      </div>
      {obs.length === 0 ? (
        <div className="card" style={{ padding: 32, textAlign: 'center', color: 'var(--text-sub)' }}>
          <FileText size={32} style={{ marginBottom: 10, opacity: .4 }} />
          <div>Aucune observation reçue pour ce patient</div>
        </div>
      ) : (
        obs.map(o => <ObsCard key={o.id} obs={o} context={context} />)
      )}
    </div>
  );
}

function PageJeux({ jeux }) {
  const data = jeux.length > 0 ? jeux : MOCK_JEUX;
  const avgScore = Math.round(data.reduce((a, j) => a + j.score, 0) / data.length);
  const avgReaction = Math.round(data.reduce((a, j) => a + j.temps_reaction_ms, 0) / data.length);

  return (
    <div className="fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <PageHeader icon={Gamepad2} title="Jeux & Télémétrie Adaptative" subtitle="Sessions de jeu cognitif enregistrées" color="#0ea5e9" />

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12 }}>
        {[
          { label: 'Sessions', value: data.length, color: '#0ea5e9' },
          { label: 'Score moyen', value: `${avgScore}%`, color: '#2563eb' },
          { label: 'Temps moyen', value: `${avgReaction} ms`, color: '#f59e0b' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Sessions list */}
      <div className="card" style={{ padding: '22px 24px' }}>
        <h3 style={{ fontSize: '.95rem', fontWeight: 700, marginBottom: 16 }}>Sessions de jeu</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {data.map(j => (
            <div key={j.id} style={{ padding: '14px 16px', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: '#f0f9ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Gamepad2 size={18} color="#0ea5e9" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: '.9rem', color: 'var(--gray-800)' }}>{j.nom_jeu}</div>
                <div style={{ fontSize: '.77rem', color: 'var(--text-sub)' }}>{j.created_at?.slice(0,10)} · {j.duree_minutes} min · Niveau {j.niveau_adaptatif}/5</div>
              </div>
              <div style={{ display: 'flex', gap: 16, fontSize: '.85rem', textAlign: 'center' }}>
                <div><div style={{ fontWeight: 800, color: '#2563eb' }}>{j.score}%</div><div style={{ fontSize: '.68rem', color: 'var(--text-muted)' }}>Score</div></div>
                <div><div style={{ fontWeight: 800, color: '#f59e0b' }}>{j.temps_reaction_ms} ms</div><div style={{ fontSize: '.68rem', color: 'var(--text-muted)' }}>Réaction</div></div>
                <div><div style={{ fontWeight: 800, color: '#10b981' }}>{j.taux_succes}%</div><div style={{ fontSize: '.68rem', color: 'var(--text-muted)' }}>Succès</div></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PageLongitudinal() {
  const [horizon, setHorizon] = useState('6M');
  const [metric, setMetric] = useState('attention');
  const data = LONGITUDINAL[horizon];

  const metrics = [
    { id: 'attention',   label: 'Attention (%)' },
    { id: 'memoire',     label: 'Mémoire (%)' },
    { id: 'convergence', label: 'Convergence (%)' },
  ];

  const first = data[0][metric];
  const last  = data[data.length - 1][metric];
  const delta = last - first;

  return (
    <div className="fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <PageHeader icon={TrendingUp} title="Suivi Longitudinal" subtitle="Évolution des performances cognitives dans le temps" color="#0d9488" />

      <div className="card" style={{ padding: '22px 24px' }}>
        {/* Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: 6 }}>
            {['3M', '6M', '12M'].map(h => (
              <button key={h} onClick={() => setHorizon(h)} className={`btn btn-sm ${horizon === h ? 'btn-primary' : 'btn-secondary'}`}>{h}</button>
            ))}
          </div>
          <div style={{ width: 1, height: 24, background: 'var(--border)', margin: '0 4px' }} />
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {metrics.map(m => (
              <button key={m.id} onClick={() => setMetric(m.id)} className="btn btn-sm" style={{ background: metric === m.id ? '#0d9488' : 'var(--surface)', color: metric === m.id ? 'white' : 'var(--gray-600)', border: `1px solid ${metric === m.id ? '#0d9488' : 'var(--border)'}` }}>{m.label}</button>
            ))}
          </div>
        </div>

        {/* Delta */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
          <div style={{ background: delta >= 0 ? '#ecfdf5' : '#fef2f2', border: `1px solid ${delta >= 0 ? '#a7f3d0' : '#fecaca'}`, borderRadius: 'var(--r-md)', padding: '12px 18px' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: delta >= 0 ? '#059669' : '#dc2626' }}>{delta >= 0 ? '+' : ''}{delta} pts</div>
            <div style={{ fontSize: '.75rem', color: 'var(--text-sub)', marginTop: 2 }}>Évolution sur {horizon}</div>
          </div>
        </div>

        {/* Chart */}
        <LongitudinalChart data={data} metric={metric} />

        {/* Milestones */}
        <div style={{ marginTop: 16 }}>
          <div className="section-label" style={{ marginBottom: 8 }}>Jalons cliniques</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {data.filter(d => d.jalon).map(d => (
              <span key={d.label} className="badge badge-amber">📍 {d.label} — {d.jalon}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function PageIA({ profil }) {
  const rawP = profil || MOCK_PROFILE;
  const p = { ...rawP, signals: (rawP?.signals && rawP.signals.length > 0) ? rawP.signals : MOCK_PROFILE.signals, telemetrie: rawP?.telemetrie || MOCK_PROFILE.telemetrie, convergenceScore: rawP?.convergenceScore ?? MOCK_PROFILE.convergenceScore };
  const top = p.signals.filter(s => s.niveau !== 'PAS_DE_SIGNAL');

  return (
    <div className="fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <PageHeader icon={Bot} title="Analyse IA & Signaux" subtitle="Croisement multi-acteurs et analyse explicable" color="#7c3aed"
        badge={<span className="badge badge-gray" style={{ background: '#f5f3ff', color: '#7c3aed', border: '1px solid #ddd6fe' }}>🤖 IA Explicable</span>}
      />

      <div className="alert" style={{ background: '#f5f3ff', border: '1px solid #ddd6fe', color: '#6d28d9', fontSize: '.84rem' }}>
        <Sparkles size={15} style={{ flexShrink: 0, marginTop: 1 }} />
        <div><strong>Note :</strong> L'IA NOVA ne pose aucun diagnostic. Elle identifie des convergences statistiques entre les signaux pour aider le praticien à prioriser son analyse clinique.</div>
      </div>

      {/* Convergence score */}
      <div className="card" style={{ padding: '22px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h3 style={{ fontSize: '.95rem', fontWeight: 700 }}>Indice de Convergence Multi-Acteurs</h3>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: '#2563eb', letterSpacing: '-.04em' }}>{p.convergenceScore}%</div>
        </div>
        <div style={{ height: 8, background: 'var(--gray-100)', borderRadius: 99, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${p.convergenceScore}%`, background: 'linear-gradient(90deg, #2563eb, #7c3aed)', borderRadius: 99, transition: 'width .6s var(--ease)' }} />
        </div>
        <div style={{ fontSize: '.78rem', color: 'var(--text-sub)', marginTop: 8 }}>Convergence entre Enseignant · Famille · Jeux adaptatifs</div>
      </div>

      {/* Top signals */}
      <div className="card" style={{ padding: '22px 24px' }}>
        <h3 style={{ fontSize: '.95rem', fontWeight: 700, marginBottom: 16 }}>Signaux prioritaires détectés</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {top.map(s => (
            <div key={s.domaine} style={{ padding: '14px 16px', background: 'var(--gray-50)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <span style={{ fontSize: '1rem' }}>{DOMAIN_ICONS[s.domaine]}</span>
                <span style={{ fontWeight: 700, fontSize: '.9rem' }}>{s.libelle}</span>
                <SignalBadge niveau={s.niveau} />
                <span style={{ marginLeft: 'auto', fontSize: '.85rem', fontWeight: 800, color: '#ef4444' }}>{s.score}%</span>
              </div>
              <p style={{ margin: '0 0 8px', fontSize: '.82rem', color: 'var(--gray-600)', lineHeight: 1.5 }}>{s.description}</p>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {s.sources.map(src => <span key={src} className="badge badge-blue" style={{ fontSize: '.68rem' }}>{src}</span>)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Probabilités du Modèle IA (v4 réentraîné sur 2 135 enfants) */}
      <div className="card" style={{ padding: '22px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <h3 style={{ fontSize: '.95rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Brain size={18} color="#7c3aed" /> Probabilités Prédites par l'IA NOVA (Modèle v4)
          </h3>
          <span className="badge badge-gray" style={{ background: '#f5f3ff', color: '#6d28d9', border: '1px solid #ddd6fe', fontSize: '.72rem', fontWeight: 700 }}>
            Base : 2 135 cohortes
          </span>
        </div>
        <p style={{ fontSize: '.8rem', color: 'var(--text-sub)', margin: '0 0 16px', lineHeight: 1.5 }}>
          Distribution statistique multiclasse issue de la régression logistique étalonnée sur les observations croisées (école, famille, tests adaptatifs).
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {((profil?.probabilitesModele && profil.probabilitesModele.length > 0) ? profil.probabilitesModele : [
            { profil: 'Développement typique', probabilite: 0.785 },
            { profil: 'Vigilance attentionnelle', probabilite: 0.201 },
            { profil: 'Vigilance mixte', probabilite: 0.010 },
            { profil: 'Vigilance lecture-écriture', probabilite: 0.003 },
            { profil: 'Vigilance sociale', probabilite: 0.001 },
          ]).map((item, idx) => {
            const pct = Math.round((item.probabilite || 0) * 1000) / 10;
            const isTop = idx === 0 || pct > 30;
            return (
              <div key={item.profil} style={{ background: isTop ? '#faf5ff' : 'var(--gray-50)', border: `1px solid ${isTop ? '#e9d5ff' : 'var(--border)'}`, borderRadius: 'var(--r-md)', padding: '12px 14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontWeight: isTop ? 700 : 600, fontSize: '.85rem', color: isTop ? '#581c87' : 'var(--gray-700)' }}>
                    {item.profil}
                  </span>
                  <span style={{ fontWeight: 800, fontSize: '.9rem', color: isTop ? '#7c3aed' : 'var(--gray-600)' }}>
                    {pct}%
                  </span>
                </div>
                <div style={{ height: 6, borderRadius: 99, background: 'var(--gray-200)', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${Math.max(pct, 1)}%`,
                    background: isTop ? 'linear-gradient(90deg, #7c3aed, #a855f7)' : '#94a3b8',
                    borderRadius: 99,
                    transition: 'width 0.6s var(--ease)'
                  }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* AI recommendations */}
      <div className="card" style={{ padding: '22px 24px' }}>
        <h3 style={{ fontSize: '.95rem', fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Target size={17} color="#7c3aed" /> Propositions d'orientation (IA – v1)
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { icon: '🔬', text: 'Bilan neuropsychologique complet recommandé (attention soutenue, mémoire de travail)', level: 'Priorité haute' },
            { icon: '🏫', text: 'Mise en place d\'aménagements scolaires provisoires (tiers-temps, consignes simplifiées)', level: 'Recommandé' },
            { icon: '💬', text: 'Consultation orthophonique à envisager si les signaux persistent 3 mois', level: 'À discuter' },
            { icon: '📊', text: 'Réévaluation via NOVA dans 3 mois pour mesurer l\'évolution des signaux', level: 'Planification' },
          ].map((r, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 14px', border: '1px solid var(--border)', borderRadius: 'var(--r-md)' }}>
              <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{r.icon}</span>
              <div style={{ flex: 1 }}>
                <p style={{ margin: '0 0 4px', fontSize: '.85rem', color: 'var(--gray-700)', lineHeight: 1.5 }}>{r.text}</p>
                <span className="badge badge-gray" style={{ fontSize: '.68rem' }}>{r.level}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PageDecision({ child, profil, onExportPDF }) {
  const [decision, setDecision] = useState(null);
  const [notes, setNotes] = useState(() => {
    try { return localStorage.getItem(`nova_notes_${child?.id}`) || ''; } catch { return ''; }
  });
  const [saved, setSaved] = useState(false);

  const saveNotes = () => {
    try { localStorage.setItem(`nova_notes_${child?.id}`, notes); setSaved(true); setTimeout(() => setSaved(false), 3000); } catch {}
  };

  const decisions = [
    { id: 'bilan_neuro',  icon: '🔬', label: 'Orienter vers un bilan neuropsychologique complet' },
    { id: 'aménagement',  icon: '🏫', label: 'Mettre en place des aménagements scolaires (PAP/PPS)' },
    { id: 'ortho',        icon: '💬', label: 'Solliciter un bilan orthophonique' },
    { id: 'surveillance', icon: '👁️', label: 'Surveillance active — réévaluation à 3 mois' },
  ];

  return (
    <div className="fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <PageHeader icon={FileCheck} title="Bilan Médical & Décision" subtitle="Synthèse clinique et export officiel téléchargeable" color="#059669"
        badge={
          <button onClick={onExportPDF} className="btn btn-sm" style={{ background: '#059669', color: 'white', boxShadow: '0 2px 8px rgba(5,150,105,.3)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Download size={14} /> Télécharger Bilan PDF
          </button>
        }
      />

      {/* Decision */}
      <div className="card" style={{ padding: '22px 24px' }}>
        <h3 style={{ fontSize: '.95rem', fontWeight: 700, marginBottom: 14 }}>Orientation clinique</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {decisions.map(d => (
            <button key={d.id} onClick={() => setDecision(d.id)} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '13px 16px',
              border: decision === d.id ? '2px solid #059669' : '1.5px solid var(--border)',
              background: decision === d.id ? '#f0fdf4' : 'var(--surface)',
              borderRadius: 'var(--r-md)', cursor: 'pointer', textAlign: 'left', transition: 'all var(--dur) var(--ease)',
            }}>
              <span style={{ fontSize: '1.1rem' }}>{d.icon}</span>
              <span style={{ fontWeight: 600, fontSize: '.88rem', color: decision === d.id ? '#059669' : 'var(--gray-700)', flex: 1 }}>{d.label}</span>
              {decision === d.id && <Check size={16} color="#059669" />}
            </button>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div className="card" style={{ padding: '22px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <h3 style={{ fontSize: '.95rem', fontWeight: 700 }}>Notes cliniques (privées)</h3>
          {saved && <span className="badge badge-green">✓ Sauvegardé</span>}
        </div>
        <textarea
          rows={5}
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Vos notes cliniques confidentielles pour ce patient..."
          style={{ marginBottom: 12 }}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={saveNotes} className="btn btn-secondary btn-sm"><Save size={13} /> Sauvegarder les notes</button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────
export default function EspaceSpecialiste({ child, refreshTrigger, user }) {
  const [page, setPage] = useState('dashboard');
  const [enfants, setEnfants] = useState([]);
  const [selectedId, setSelectedId] = useState(child?.id || 'e1111111-1111-1111-1111-111111111111');
  const [selectedChild, setSelectedChild] = useState(child || { prenom: 'Léo', nom_anonyme: 'Léo M.', age: 7, niveau_scolaire: 'CE1' });
  const [profil, setProfil] = useState(MOCK_PROFILE);
  const [obsEcole, setObsEcole] = useState(MOCK_OBS_ECOLE);
  const [obsFamille, setObsFamille] = useState(MOCK_OBS_FAMILLE);
  const [jeux, setJeux] = useState(MOCK_JEUX);
  const [loading, setLoading] = useState(false);
  const [showMdph, setShowMdph] = useState(false);

  useEffect(() => {
    fetch('http://localhost:5000/api/enfants')
      .then(r => r.ok ? r.json() : [])
      .then(d => {
        if (Array.isArray(d) && d.length > 0) {
          setEnfants(d);
          const f = d.find(e => e.id === selectedId);
          if (f) setSelectedChild(f);
        }
      })
      .catch(() => {});
  }, [refreshTrigger]);

  useEffect(() => {
    if (!selectedId) return;
    Promise.all([
      fetch(`http://localhost:5000/api/profil-explicable/${selectedId}`).then(r => r.ok ? r.json() : null).catch(() => null),
      fetch(`http://localhost:5000/api/observations/${selectedId}`).then(r => r.ok ? r.json() : []).catch(() => []),
      fetch(`http://localhost:5000/api/activites/${selectedId}`).then(r => r.ok ? r.json() : []).catch(() => []),
    ]).then(([p, obs, acts]) => {
      setProfil(p || MOCK_PROFILE);
      const ecole = (obs || []).filter(o => o.contexte === 'ECOLE');
      const famille = (obs || []).filter(o => o.contexte === 'MAISON' || o.contexte === 'FAMILLE');
      setObsEcole(ecole.length > 0 ? ecole : MOCK_OBS_ECOLE);
      setObsFamille(famille.length > 0 ? famille : MOCK_OBS_FAMILLE);
      setJeux(acts && acts.length > 0 ? acts : MOCK_JEUX);
    }).catch(() => {
      setProfil(MOCK_PROFILE);
      setObsEcole(MOCK_OBS_ECOLE);
      setObsFamille(MOCK_OBS_FAMILLE);
      setJeux(MOCK_JEUX);
    });
  }, [selectedId, refreshTrigger]);

  const NAV = [
    { group: 'VUE GLOBALE', items: [
      { id: 'dashboard', icon: BarChart3, label: 'Tableau de bord', badge: enfants.length || 2 },
    ]},
    { group: `DOSSIER : ${selectedChild?.prenom || 'LÉO'}`, items: [
      { id: 'profil',      icon: User,       label: 'Profil 360°' },
      { id: 'enseignant',  icon: School,     label: 'Feedback enseignant', badge: obsEcole.length || '' },
      { id: 'famille',     icon: Home,       label: 'Feedback famille',    badge: obsFamille.length || '' },
      { id: 'jeux',        icon: Gamepad2,   label: 'Jeux & Télémétrie',   badge: (jeux.length || MOCK_JEUX.length) || '' },
      { id: 'longitudinal',icon: TrendingUp, label: 'Suivi longitudinal' },
      { id: 'ia_signaux',  icon: Bot,        label: 'Analyse IA' },
      { id: 'decision',    icon: FileCheck,  label: 'Bilan & Décision' },
    ]},
  ];

  return (
    <div className="fade-up">
      {showMdph && (
        <MdphReport child={selectedChild || child} profil={profil} onClose={() => setShowMdph(false)} />
      )}

      <div className="sp-layout">
        {/* ── SIDEBAR ─────────────────────────────────── */}
        <aside className="sp-sidebar">
          {/* Practitioner */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 14, marginBottom: 14, borderBottom: '1px solid var(--border)' }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: 'linear-gradient(135deg, #0d9488, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Stethoscope size={19} color="white" />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '.9rem', color: 'var(--gray-900)' }}>{user?.nom || 'Dr. C. Laurent'}</div>
              <div style={{ fontSize: '.72rem', color: 'var(--text-sub)' }}>Neuropsychologue</div>
            </div>
          </div>

          {/* Patient selector */}
          <div style={{ marginBottom: 14 }}>
            <div className="sp-nav-label" style={{ padding: '0 0 4px' }}>Patient actif</div>
            <select value={selectedId} onChange={e => { setSelectedId(e.target.value); setPage('dashboard'); }} style={{ fontSize: '.84rem', padding: '8px 10px' }}>
              {enfants.length > 0 ? enfants.map(e => (
                <option key={e.id} value={e.id}>{e.prenom} {e.nom_anonyme} ({e.age} ans)</option>
              )) : (
                <option value={child?.id}>{child?.prenom} {child?.nom_anonyme} ({child?.age} ans)</option>
              )}
            </select>
          </div>

          {/* Navigation */}
          {NAV.map(group => (
            <div key={group.group} style={{ marginBottom: 16 }}>
              <div className="sp-nav-label">{group.group}</div>
              {group.items.map(item => {
                const Icon = item.icon;
                const active = page === item.id;
                return (
                  <button key={item.id} onClick={() => setPage(item.id)} className={`sp-nav-item ${active ? 'active' : ''}`}>
                    <Icon size={15} />
                    <span style={{ flex: 1 }}>{item.label}</span>
                    {item.badge !== undefined && item.badge !== '' && (
                      <span className="sp-nav-badge">{item.badge}</span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}

          {/* Export PDF button */}
          <div style={{ paddingTop: 14, borderTop: '1px solid var(--border)' }}>
            <button
              onClick={() => {
                generateAndDownloadNovaPDF(selectedChild || child, profil);
                setShowMdph(true);
              }}
              className="btn btn-sm"
              style={{
                width: '100%',
                background: '#059669',
                color: 'white',
                boxShadow: '0 2px 8px rgba(5,150,105,.25)',
                justifyContent: 'center',
                borderRadius: 'var(--r-md)',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontWeight: 700
              }}
            >
              <Download size={14} /> Télécharger Bilan PDF
            </button>
          </div>
        </aside>

        {/* ── MAIN CONTENT ─────────────────────────────── */}
        <main>
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 240, color: 'var(--text-sub)', flexDirection: 'column', gap: 12 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', border: '3px solid var(--border)', borderTopColor: 'var(--brand-blue)', animation: 'spin 0.8s linear infinite' }} />
              <span style={{ fontSize: '.85rem' }}>Chargement du dossier…</span>
            </div>
          ) : (
            <>
              {page === 'dashboard'   && <PageDashboard profil={profil} obsEcole={obsEcole} obsFamille={obsFamille} jeux={jeux} onGoTo={setPage} />}
              {page === 'profil'      && <PageProfil child={selectedChild || child} profil={profil} />}
              {page === 'enseignant'  && <PageObs obs={obsEcole.length > 0 ? obsEcole : MOCK_OBS_ECOLE} context="school" icon={School} color="#1d4ed8" title="Feedback Enseignant" />}
              {page === 'famille'     && <PageObs obs={obsFamille.length > 0 ? obsFamille : MOCK_OBS_FAMILLE} context="family" icon={Home} color="#7c3aed" title="Feedback Famille" />}
              {page === 'jeux'        && <PageJeux jeux={jeux} />}
              {page === 'longitudinal'&& <PageLongitudinal />}
              {page === 'ia_signaux'  && <PageIA profil={profil} />}
              {page === 'decision'    && (
                <PageDecision
                  child={selectedChild || child}
                  profil={profil}
                  onExportPDF={() => {
                    generateAndDownloadNovaPDF(selectedChild || child, profil);
                    setShowMdph(true);
                  }}
                />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
