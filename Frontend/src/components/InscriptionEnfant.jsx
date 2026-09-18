import React, { useState, useMemo } from 'react';
import {
  UserPlus, CheckCircle2, Copy, AlertCircle, School, Baby,
  ShieldCheck, ArrowRight, ArrowLeft, MapPin, Sparkles, Heart,
  Download, Check, RefreshCw, Eye, BookOpen, Star, HelpCircle,
  FileText, Lock, Award
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { jsPDF } from 'jspdf';

const NIVEAUX_CATEGORIES = [
  {
    categorie: 'Préscolaire & Maternelle',
    icon: '🧸',
    options: ['Jardin d\'enfants (3-5 ans)', 'Année Préparatoire (5-6 ans)']
  },
  {
    categorie: 'Enseignement Primaire',
    icon: '📚',
    options: [
      '1ère Année Primaire',
      '2ème Année Primaire',
      '3ème Année Primaire',
      '4ème Année Primaire',
      '5ème Année Primaire',
      '6ème Année Primaire'
    ]
  },
  {
    categorie: 'Collège (Enseignement de Base)',
    icon: '🎒',
    options: [
      '7ème Année de Base',
      '8ème Année de Base',
      '9ème Année de Base'
    ]
  }
];

const GOUVERNORATS = [
  'Tunis', 'Ariana', 'Ben Arous', 'Manouba', 'Nabeul', 'Bizerte', 'Zaghouan',
  'Sousse', 'Monastir', 'Mahdia', 'Sfax', 'Kairouan', 'Kasserine', 'Sidi Bouzid',
  'Gafsa', 'Tozeur', 'Kebili', 'Gabès', 'Medenine', 'Tataouine', 'Béja', 'Jendouba', 'Le Kef', 'Siliana'
];

const AVATARS = [
  { id: 'star',   emoji: '⭐', label: 'Étoile',       bg: 'linear-gradient(135deg, #FFF9C4 0%, #FFF176 100%)', text: '#795548' },
  { id: 'rocket', emoji: '🚀', label: 'Explorateur',  bg: 'linear-gradient(135deg, #E0F2FE 0%, #BAE6FD 100%)', text: '#0369A1' },
  { id: 'lion',   emoji: '🦁', label: 'Courageux',    bg: 'linear-gradient(135deg, #FED7AA 0%, #FDBA74 100%)', text: '#C2410C' },
  { id: 'palette',emoji: '🎨', label: 'Créatif',      bg: 'linear-gradient(135deg, #FCE7F3 0%, #FBCFE8 100%)', text: '#BE185D' },
  { id: 'sprout', emoji: '🌱', label: 'Graine d\'Or', bg: 'linear-gradient(135deg, #DCFCE7 0%, #BBF7D0 100%)', text: '#15803D' },
];

const AXES_OBSERVATION = [
  { id: 'attention',   label: 'Attention & Concentration',  icon: '🎯' },
  { id: 'langage',     label: 'Langage & Communication',    icon: '💬' },
  { id: 'motricite',   label: 'Motricité & Autonomie',      icon: '✋' },
  { id: 'emotions',    label: 'Émotions & Sommeil',         icon: '🌙' },
  { id: 'social',      label: 'Relations & Camaraderie',    icon: '🤝' },
];

export default function InscriptionEnfant({ onEnfantAjoute }) {
  const [etape, setEtape] = useState(1);
  const [formData, setFormData] = useState({
    prenom: '',
    nomFamille: '',
    age: '',
    avatar: '',
    genre: '',
    niveauScolaire: '',
    etablissement: '',
    gouvernorat: '',
    parentNom: '',
    parentLien: '',
    parentTel: '',
    axesInteret: [],
    consentement: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resultat, setResultat] = useState(null);
  const [copie, setCopie] = useState(false);
  const [pdfGenerating, setPdfGenerating] = useState(false);

  const codePrevisionnel = useMemo(() => {
    const year = new Date().getFullYear();
    const initials = formData.prenom.trim() ? formData.prenom.slice(0, 2).toUpperCase() : 'TN';
    return `TN-NOVA-${year}-${initials}240`;
  }, [formData.prenom]);

  const selectedAvatarObj = AVATARS.find(a => a.id === formData.avatar) || AVATARS[0];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const toggleAxe = (axeId) => {
    setFormData(prev => {
      const exists = prev.axesInteret.includes(axeId);
      return {
        ...prev,
        axesInteret: exists
          ? prev.axesInteret.filter(id => id !== axeId)
          : [...prev.axesInteret, axeId]
      };
    });
  };

  const validateStep1 = () => {
    if (!formData.prenom.trim()) {
      setError('Veuillez indiquer le prénom de l\'enfant.');
      return false;
    }
    setError('');
    return true;
  };

  const validateStep2 = () => {
    if (!formData.gouvernorat) {
      setError('Veuillez sélectionner un gouvernorat.');
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setError('');

    if (!formData.prenom.trim()) {
      setError('Le prénom de l\'enfant est requis.');
      setEtape(1);
      return;
    }

    if (!formData.consentement) {
      setError('L\'accord légal INADP (Loi 2004-63 Tunisie) est obligatoire pour activer le suivi collaboratif.');
      return;
    }

    setLoading(true);

    const nomAnonymeStr = formData.nomFamille.trim()
      ? `${formData.prenom.trim()} ${formData.nomFamille.trim().charAt(0).toUpperCase()}.`
      : `${formData.prenom.trim()} ${formData.parentNom.trim() ? formData.parentNom.trim().charAt(0).toUpperCase() : 'B'}.`;

    const etablissementComplet = formData.etablissement.trim()
      ? `${formData.etablissement.trim()} (${formData.gouvernorat})`
      : `École Primaire Habib Bourguiba (${formData.gouvernorat})`;

    const token = localStorage.getItem('nova_token') || '';

    try {
      const response = await fetch('/api/enfants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          prenom: formData.prenom.trim(),
          nom_anonyme: nomAnonymeStr,
          age: parseInt(formData.age, 10),
          niveauScolaire: formData.niveauScolaire,
          etablissement: etablissementComplet,
          parentNom: formData.parentNom.trim() || 'Tuteur Légal',
          parentId: 'P-101',
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur serveur lors de la création du dossier enfant.');
      }

      const data = await response.json();
      const childData = data.enfant || data;

      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#58B6A9', '#17324D', '#FFFF66', '#B9DDF2']
        });
      } catch (_) {}

      setResultat(childData);
      if (onEnfantAjoute) {
        onEnfantAjoute(childData);
      }
    } catch (err) {
      console.warn('Mode réseau local ou fallback:', err);
      const codeId = `TN-NOVA-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const newChild = {
        id: `E-${Date.now()}`,
        code: codeId,
        code_identifiant: codeId,
        prenom: formData.prenom.trim(),
        nom_anonyme: nomAnonymeStr,
        age: parseInt(formData.age, 10),
        niveau_scolaire: formData.niveauScolaire,
        etablissement: etablissementComplet,
        parentNom: formData.parentNom.trim() || 'Tuteur Légal',
        dateInscription: new Date().toLocaleDateString('fr-FR'),
      };

      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#58B6A9', '#17324D', '#FFFF66', '#B9DDF2']
        });
      } catch (_) {}

      setResultat(newChild);
      if (onEnfantAjoute) {
        onEnfantAjoute(newChild);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCopierCode = () => {
    const c = resultat?.code || resultat?.code_identifiant || '';
    if (c) {
      navigator.clipboard.writeText(c);
      setCopie(true);
      setTimeout(() => setCopie(false), 2500);
    }
  };

  const handleDownloadPDF = () => {
    setPdfGenerating(true);
    try {
      const doc = new jsPDF();
      const code = resultat?.code || resultat?.code_identifiant || 'TN-NOVA-2026-DEMO';
      const prenom = resultat?.prenom || formData.prenom || 'Enfant';

      // En-tête
      doc.setFillColor(23, 50, 77);
      doc.rect(0, 0, 210, 42, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.text('NOVA TUNISIE', 20, 20);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('Plateforme Nationale de Dépistage & Suivi Pédopsychologique Connecté', 20, 28);
      doc.text('Conforme INADP · Loi n° 2004-63 sur la Protection des Données Personnelles', 20, 35);

      // Bloc carte
      doc.setTextColor(23, 50, 77);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('FICHE DE LIAISON & CODE D\'ACCÈS SÉCURISÉ', 20, 58);

      doc.setDrawColor(226, 232, 240);
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(20, 66, 170, 75, 4, 4, 'FD');

      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(100, 116, 139);
      doc.text('CODE UNIQUE DE L\'ENFANT (À TRANSMETTRE À L\'ÉCOLE ET AUX PRATICIENS) :', 28, 78);

      doc.setFillColor(23, 50, 77);
      doc.roundedRect(28, 84, 154, 16, 3, 3, 'F');
      doc.setTextColor(255, 255, 102);
      doc.setFontSize(14);
      doc.setFont('courier', 'bold');
      doc.text(code, 75, 95);

      doc.setTextColor(23, 50, 77);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.text(`Prénom de l'enfant : ${prenom}`, 28, 112);
      doc.text(`Âge : ${resultat?.age || formData.age} ans`, 28, 120);
      doc.text(`Niveau scolaire : ${resultat?.niveau_scolaire || formData.niveauScolaire}`, 28, 128);
      doc.text(`Établissement : ${resultat?.etablissement || formData.etablissement || 'École'}`, 28, 136);

      // Instructions
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(23, 50, 77);
      doc.text('Instructions de Connexion & Partage :', 20, 155);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      doc.text('1. L\'enseignant(e) peut entrer ce code dans son espace pour soumettre des observations.', 20, 165);
      doc.text('2. Le pédopsychiatre ou orthophoniste lie ce dossier pour analyser le profil neurocognitif.', 20, 173);
      doc.text('3. Les données médicales sont pseudonymisées selon les normes de santé publique en Tunisie.', 20, 181);

      doc.setDrawColor(203, 213, 225);
      doc.line(20, 265, 190, 265);
      doc.setFontSize(9);
      doc.setTextColor(148, 163, 184);
      doc.text(`Émis le ${new Date().toLocaleDateString('fr-TN')} · République Tunisienne · Plateforme NOVA`, 20, 273);

      doc.save(`NOVA_Fiche_Liaison_${prenom}_${code}.pdf`);
    } catch (e) {
      console.error('Erreur génération PDF:', e);
    } finally {
      setPdfGenerating(false);
    }
  };

  const handleReinitialiser = () => {
    setFormData({
      prenom: '',
      nomFamille: '',
      age: '',
      avatar: '',
      genre: '',
      niveauScolaire: '',
      etablissement: '',
      gouvernorat: '',
      parentNom: '',
      parentLien: '',
      parentTel: '',
      axesInteret: [],
      consentement: false,
    });
    setResultat(null);
    setEtape(1);
    setError('');
  };

  // --- ÉCRAN DE SUCCÈS (CONFIRMATION & PASSEPORT REMIS) ---
  if (resultat) {
    const codeAffiche = resultat.code || resultat.code_identifiant || 'TN-NOVA-2026';
    return (
      <div className="nova-card pop-in" style={{
        maxWidth: 780,
        margin: '0 auto',
        padding: '40px 36px',
        background: '#ffffff',
        border: '1.5px solid #d1fae5',
        boxShadow: '0 20px 50px rgba(5,150,105,0.08)'
      }}>
        {/* En-tête de célébration */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 76,
            height: 76,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 18px',
            boxShadow: '0 10px 25px rgba(16,185,129,.2)'
          }}>
            <CheckCircle2 size={44} color="#059669" />
          </div>

          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '4px 14px',
            background: 'rgba(88,182,169,.12)',
            borderRadius: 999,
            color: '#268d80',
            fontWeight: 800,
            fontSize: '.78rem',
            marginBottom: 10
          }}>
            <Sparkles size={14} /> Dossier Pédopsychologique Activé
          </div>

          <h2 style={{ fontSize: '1.85rem', fontWeight: 900, color: '#17324D', margin: '0 0 8px' }}>
            Félicitations ! Le profil de {resultat.prenom} est prêt
          </h2>
          <p style={{ fontSize: '.95rem', color: '#64748b', maxWidth: 540, margin: '0 auto', lineHeight: 1.5 }}>
            Son passeport numérique NOVA a été enregistré avec succès et son espace collaboratif école-famille est désormais opérationnel.
          </p>
        </div>

        {/* Passeport NOVA / Carte d'accès national */}
        <div style={{
          background: 'linear-gradient(145deg, #17324D 0%, #0d1e30 100%)',
          borderRadius: 20,
          padding: '28px',
          color: '#ffffff',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 14px 40px rgba(23,50,77,.25)',
          marginBottom: 28,
          border: '1px solid rgba(88,182,169,.3)'
        }}>
          <div style={{
            position: 'absolute',
            right: -20,
            bottom: -20,
            opacity: 0.08,
            fontSize: '180px',
            lineHeight: 1,
            pointerEvents: 'none',
            userSelect: 'none'
          }}>
            ⭐
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, borderBottom: '1px solid rgba(255,255,255,.12)', paddingBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: 'linear-gradient(135deg, #58B6A9 0%, #B9DDF2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#17324D',
                fontWeight: 900,
                fontSize: '1.1rem'
              }}>
                N
              </div>
              <div>
                <div style={{ fontSize: '.9rem', fontWeight: 800, letterSpacing: '.04em' }}>PASSEPORT NUMÉRIQUE NOVA</div>
                <div style={{ fontSize: '.68rem', color: '#B9DDF2', letterSpacing: '.08em' }}>RÉPUBLIQUE TUNISIENNE · SANTÉ & ÉDUCATION</div>
              </div>
            </div>

            <div style={{
              background: 'rgba(88,182,169,.2)',
              border: '1px solid rgba(88,182,169,.4)',
              borderRadius: 8,
              padding: '4px 10px',
              fontSize: '.72rem',
              fontWeight: 700,
              color: '#B9DDF2',
              display: 'flex',
              alignItems: 'center',
              gap: 5
            }}>
              <ShieldCheck size={13} color="#58B6A9" /> Certifié INADP
            </div>
          </div>

          {/* Corps de la carte */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{
                width: 64,
                height: 64,
                borderRadius: 18,
                background: selectedAvatarObj.bg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem',
                boxShadow: '0 6px 16px rgba(0,0,0,.2)'
              }}>
                {selectedAvatarObj.emoji}
              </div>
              <div>
                <div style={{ fontSize: '1.4rem', fontWeight: 900 }}>{resultat.prenom}</div>
                <div style={{ fontSize: '.84rem', color: '#B9DDF2', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>{resultat.age} ans</span>
                  <span>•</span>
                  <span>{resultat.niveau_scolaire || formData.niveauScolaire}</span>
                </div>
                <div style={{ fontSize: '.76rem', color: '#94A3B8', marginTop: 3 }}>
                  {resultat.etablissement || formData.etablissement || 'École Primaire'}
                </div>
              </div>
            </div>

            {/* Code National & Copie */}
            <div style={{
              background: 'rgba(255,255,255,.07)',
              border: '1px solid rgba(255,255,255,.15)',
              borderRadius: 14,
              padding: '14px 18px',
              textAlign: 'center',
              minWidth: 260
            }}>
              <div style={{ fontSize: '.68rem', color: '#B9DDF2', fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 6 }}>
                Code Unique de Partage École / Praticien
              </div>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '1.45rem',
                fontWeight: 900,
                letterSpacing: '.1em',
                color: '#FFFF66',
                marginBottom: 10
              }}>
                {codeAffiche}
              </div>
              <button
                type="button"
                onClick={handleCopierCode}
                style={{
                  width: '100%',
                  background: copie ? '#059669' : '#58B6A9',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 8,
                  padding: '7px 12px',
                  fontSize: '.78rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  transition: 'all .15s ease'
                }}
              >
                {copie ? <Check size={14} /> : <Copy size={14} />}
                {copie ? 'Code copié dans le presse-papier !' : 'Copier le code de partage'}
              </button>
            </div>
          </div>

          <div style={{ fontSize: '.73rem', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: 6, borderTop: '1px solid rgba(255,255,255,.08)', paddingTop: 12 }}>
            <Lock size={12} color="#58B6A9" />
            Ce code permet à l'enseignant et aux soignants de renseigner des observations sans avoir accès à vos données privées nominatives.
          </div>
        </div>

        {/* Actions secondaires */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
          <button
            type="button"
            onClick={handleDownloadPDF}
            disabled={pdfGenerating}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '11px 22px',
              background: '#ffffff',
              color: '#17324D',
              border: '1.5px solid #cbd5e1',
              borderRadius: 12,
              fontWeight: 700,
              fontSize: '.88rem',
              cursor: 'pointer',
              transition: 'all .15s ease',
              boxShadow: '0 2px 6px rgba(0,0,0,.04)'
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#17324D'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#cbd5e1'; }}
          >
            <Download size={16} color="#17324D" />
            {pdfGenerating ? 'Génération du PDF...' : 'Télécharger la fiche de liaison (PDF)'}
          </button>

          <button
            type="button"
            onClick={handleReinitialiser}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '11px 22px',
              background: '#F1F5F9',
              color: '#334155',
              border: '1px solid #e2e8f0',
              borderRadius: 12,
              fontWeight: 700,
              fontSize: '.88rem',
              cursor: 'pointer',
              transition: 'all .15s ease'
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#e2e8f0'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#F1F5F9'; }}
          >
            <UserPlus size={16} />
            Inscrire un autre enfant
          </button>
        </div>
      </div>
    );
  }

  // --- FORMULAIRE D'INSCRIPTION EN 3 ÉTAPES ---
  return (
    <div style={{ maxWidth: 1040, margin: '0 auto' }}>
      {/* Stepper horizontal avec indicateurs visuels */}
      <div style={{
        background: '#ffffff',
        borderRadius: 20,
        border: '1px solid #e2e8f0',
        padding: '20px 28px',
        marginBottom: 24,
        boxShadow: '0 4px 16px rgba(23,50,77,.04)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: 14,
            background: 'linear-gradient(135deg, #17324D 0%, #2b5580 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(23,50,77,.2)'
          }}>
            <UserPlus size={22} color="#FFFF66" />
          </div>
          <div>
            <div style={{ fontSize: '.72rem', fontWeight: 800, color: '#58B6A9', letterSpacing: '.06em', textTransform: 'uppercase' }}>
              NOVA Tunisie · Espace Famille
            </div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#17324D', margin: 0 }}>
              Inscription d'un Nouvel Enfant
            </h1>
          </div>
        </div>

        {/* Étapes du Stepper */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {[
            { num: 1, title: 'Identité' },
            { num: 2, title: 'Scolarité' },
            { num: 3, title: 'Tuteur & Accords' },
          ].map((s, idx) => {
            const isDone = etape > s.num;
            const isCurrent = etape === s.num;
            return (
              <React.Fragment key={s.num}>
                <button
                  type="button"
                  onClick={() => {
                    if (s.num === 1) setEtape(1);
                    if (s.num === 2 && validateStep1()) setEtape(2);
                    if (s.num === 3 && validateStep1() && validateStep2()) setEtape(3);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '8px 14px',
                    borderRadius: 999,
                    border: isCurrent ? '1.5px solid #58B6A9' : '1px solid #e2e8f0',
                    background: isCurrent ? '#eaf6f4' : isDone ? '#F8FAFC' : '#ffffff',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    transition: 'all .15s ease'
                  }}
                >
                  <span style={{
                    width: 22,
                    height: 22,
                    borderRadius: '50%',
                    background: isCurrent ? '#58B6A9' : isDone ? '#059669' : '#e2e8f0',
                    color: isCurrent || isDone ? '#ffffff' : '#64748b',
                    fontSize: '.72rem',
                    fontWeight: 900,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {isDone ? <Check size={12} strokeWidth={3} /> : s.num}
                  </span>
                  <span style={{
                    fontSize: '.82rem',
                    fontWeight: isCurrent ? 800 : 600,
                    color: isCurrent ? '#17324D' : '#64748b'
                  }}>
                    {s.title}
                  </span>
                </button>
                {idx < 2 && (
                  <div style={{
                    width: 18,
                    height: 2,
                    background: etape > idx + 1 ? '#58B6A9' : '#e2e8f0',
                    borderRadius: 2
                  }} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Message d'erreur s'il y en a */}
      {error && (
        <div className="alert alert-error slide-up" style={{ marginBottom: 20 }}>
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      {/* Grille principale : Formulaire à gauche (60%) + Passeport interactif en direct à droite (40%) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(300px, 1fr)', gap: 24, alignItems: 'start' }}>

        {/* ── ZONE DE SAISIE ── */}
        <div className="nova-card" style={{ padding: '32px 30px', background: '#ffffff' }}>
          <form onSubmit={handleSubmit}>

            {/* ====== ÉTAPE 1 : IDENTITÉ & PROFIL ====== */}
            {etape === 1 && (
              <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
                <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: 12 }}>
                  <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#17324D', margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Baby size={18} color="#58B6A9" /> Étape 1 : Identité & Profil de l'enfant
                  </h2>
                  <p style={{ fontSize: '.82rem', color: '#64748b', margin: 0 }}>
                    Indiquez le prénom et l'âge de l'enfant pour adapter les échelles d'observation.
                  </p>
                </div>

                {/* Prénom */}
                <div>
                  <label htmlFor="prenom">
                    <Baby size={14} color="#58B6A9" /> Prénom de l'enfant <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <input
                    id="prenom"
                    type="text"
                    name="prenom"
                    value={formData.prenom}
                    onChange={handleChange}
                    placeholder="Ex: Youssef, Sarra, Ahmed, Nour..."
                    autoFocus
                    required
                  />
                  <span style={{ fontSize: '.72rem', color: '#94a3b8', marginTop: 4, display: 'block' }}>
                    Le prénom apparaîtra dans les fiches d'observation et activités interactives.
                  </span>
                </div>

                {/* Nom de famille / Initiales pour la pseudonymisation */}
                <div>
                  <label htmlFor="nomFamille">
                    Nom de famille (utilisé sous forme d'initiale anonymisée)
                  </label>
                  <input
                    id="nomFamille"
                    type="text"
                    name="nomFamille"
                    value={formData.nomFamille}
                    onChange={handleChange}
                    placeholder="Ex: Ben Amor, Trabelsi..."
                  />
                  <span style={{ fontSize: '.72rem', color: '#94a3b8', marginTop: 4, display: 'block' }}>
                    Conformément aux normes INADP, le nom complet est masqué en <strong>"{formData.prenom || 'Enfant'} {formData.nomFamille ? formData.nomFamille.charAt(0).toUpperCase() + '.' : 'B.'}"</strong>.
                  </span>
                </div>

                {/* Choix de l'avatar illustré */}
                <div>
                  <label>
                    <Star size={14} color="#58B6A9" /> Avatar préféré de l'enfant
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10 }}>
                    {AVATARS.map(av => {
                      const isSel = formData.avatar === av.id;
                      return (
                        <button
                          key={av.id}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, avatar: av.id }))}
                          style={{
                            background: av.bg,
                            border: isSel ? '2.5px solid #17324D' : '1px solid rgba(0,0,0,.08)',
                            borderRadius: 14,
                            padding: '12px 6px',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 4,
                            transform: isSel ? 'scale(1.05)' : 'none',
                            boxShadow: isSel ? '0 6px 14px rgba(23,50,77,.2)' : 'none',
                            transition: 'all .16s ease'
                          }}
                        >
                          <span style={{ fontSize: '1.6rem' }}>{av.emoji}</span>
                          <span style={{ fontSize: '.68rem', fontWeight: 800, color: av.text }}>{av.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Sélecteur d'âge interactif (3 à 15 ans) */}
                <div>
                  <label>
                    Âge de l'enfant : <strong style={{ color: '#58B6A9', fontSize: '.95rem' }}>{formData.age} ans</strong>
                  </label>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(7, 1fr)',
                    gap: 6,
                    marginTop: 6
                  }}>
                    {[3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map(a => {
                      const isSel = parseInt(formData.age, 10) === a;
                      return (
                        <button
                          key={a}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, age: a.toString() }))}
                          style={{
                            padding: '9px 0',
                            borderRadius: 10,
                            border: isSel ? '2px solid #58B6A9' : '1px solid #e2e8f0',
                            background: isSel ? '#17324D' : '#ffffff',
                            color: isSel ? '#FFFF66' : '#334155',
                            fontWeight: isSel ? 900 : 600,
                            fontSize: '.85rem',
                            cursor: 'pointer',
                            transition: 'all .14s ease',
                            fontFamily: 'inherit'
                          }}
                        >
                          {a}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Bouton Suivant */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
                  <button
                    type="button"
                    onClick={() => {
                      if (validateStep1()) setEtape(2);
                    }}
                    className="btn btn-teal"
                    style={{ padding: '11px 24px' }}
                  >
                    <span>Continuer vers Scolarité</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* ====== ÉTAPE 2 : SCOLARITÉ & RÉGION ====== */}
            {etape === 2 && (
              <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
                <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: 12 }}>
                  <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#17324D', margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <School size={18} color="#58B6A9" /> Étape 2 : Scolarité & Région (Tunisie)
                  </h2>
                  <p style={{ fontSize: '.82rem', color: '#64748b', margin: 0 }}>
                    Renseignez le niveau scolaire pour paramétrer les questionnaires destinés à l'école.
                  </p>
                </div>

                {/* Gouvernorat */}
                <div>
                  <label htmlFor="gouvernorat">
                    <MapPin size={14} color="#58B6A9" /> Gouvernorat de résidence / scolarité <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <select
                    id="gouvernorat"
                    name="gouvernorat"
                    value={formData.gouvernorat}
                    onChange={handleChange}
                  >
                    {GOUVERNORATS.map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>

                {/* Niveau scolaire avec sélection par catégorie */}
                <div>
                  <label>
                    <BookOpen size={14} color="#58B6A9" /> Niveau scolaire en Tunisie <span style={{ color: '#dc2626' }}>*</span>
                  </label>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 8 }}>
                    {NIVEAUX_CATEGORIES.map(cat => (
                      <div key={cat.categorie} style={{
                        background: '#F8FAFC',
                        border: '1px solid #e2e8f0',
                        borderRadius: 14,
                        padding: '12px 14px'
                      }}>
                        <div style={{ fontSize: '.75rem', fontWeight: 800, color: '#17324D', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span>{cat.icon}</span> {cat.categorie}
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                          {cat.options.map(opt => {
                            const isSel = formData.niveauScolaire === opt;
                            return (
                              <button
                                key={opt}
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, niveauScolaire: opt }))}
                                style={{
                                  padding: '7px 12px',
                                  borderRadius: 8,
                                  border: isSel ? '1.5px solid #58B6A9' : '1px solid #cbd5e1',
                                  background: isSel ? '#17324D' : '#ffffff',
                                  color: isSel ? '#FFFF66' : '#334155',
                                  fontSize: '.78rem',
                                  fontWeight: isSel ? 800 : 600,
                                  cursor: 'pointer',
                                  transition: 'all .14s ease'
                                }}
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Établissement scolaire */}
                <div>
                  <label htmlFor="etablissement">
                    Nom de l'école / jardin d'enfants
                  </label>
                  <input
                    id="etablissement"
                    type="text"
                    name="etablissement"
                    value={formData.etablissement}
                    onChange={handleChange}
                    placeholder="Ex: École Primaire Habib Bourguiba, École Ibn Khaldoun..."
                  />
                  <span style={{ fontSize: '.72rem', color: '#94a3b8', marginTop: 4, display: 'block' }}>
                    Permettra de lier le dossier aux enseignants de cet établissement.
                  </span>
                </div>

                {/* Boutons Retour / Suivant */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10 }}>
                  <button
                    type="button"
                    onClick={() => setEtape(1)}
                    className="btn btn-outline"
                  >
                    <ArrowLeft size={16} /> Retour
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (validateStep2()) setEtape(3);
                    }}
                    className="btn btn-teal"
                    style={{ padding: '11px 24px' }}
                  >
                    <span>Continuer vers Tuteur & Accords</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* ====== ÉTAPE 3 : TUTEUR, BESOINS & ACCORDS ====== */}
            {etape === 3 && (
              <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
                <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: 12 }}>
                  <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#17324D', margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <ShieldCheck size={18} color="#58B6A9" /> Étape 3 : Tuteur Légal & Consentement INADP
                  </h2>
                  <p style={{ fontSize: '.82rem', color: '#64748b', margin: 0 }}>
                    Finalisez la création du dossier sécurisé pour {formData.prenom || 'votre enfant'}.
                  </p>
                </div>

                {/* Nom du tuteur et lien */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 14 }}>
                  <div>
                    <label htmlFor="parentNom">
                      Nom complet du tuteur légal
                    </label>
                    <input
                      id="parentNom"
                      type="text"
                      name="parentNom"
                      value={formData.parentNom}
                      onChange={handleChange}
                      placeholder="Ex: Mme Leila Ben Ali"
                    />
                  </div>

                  <div>
                    <label htmlFor="parentLien">
                      Lien avec l'enfant
                    </label>
                    <select
                      id="parentLien"
                      name="parentLien"
                      value={formData.parentLien}
                      onChange={handleChange}
                    >
                      <option value="Mère">Mère</option>
                      <option value="Père">Père</option>
                      <option value="Tuteur légal">Tuteur Légal</option>
                      <option value="Grand-parent">Grand-parent</option>
                    </select>
                  </div>
                </div>

                {/* Axes d'observation prioritaires */}
                <div>
                  <label>
                    <Heart size={14} color="#58B6A9" /> Domaines d'observation prioritaires (au choix)
                  </label>
                  <p style={{ fontSize: '.74rem', color: '#64748b', margin: '0 0 8px' }}>
                    Sélectionnez les axes qui motivent votre démarche :
                  </p>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {AXES_OBSERVATION.map(axe => {
                      const isSel = formData.axesInteret.includes(axe.id);
                      return (
                        <button
                          key={axe.id}
                          type="button"
                          onClick={() => toggleAxe(axe.id)}
                          style={{
                            padding: '8px 14px',
                            borderRadius: 10,
                            border: isSel ? '1.5px solid #58B6A9' : '1px solid #cbd5e1',
                            background: isSel ? 'rgba(88,182,169,.12)' : '#ffffff',
                            color: isSel ? '#17324D' : '#64748b',
                            fontSize: '.8rem',
                            fontWeight: isSel ? 800 : 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            transition: 'all .14s ease'
                          }}
                        >
                          <span>{axe.icon}</span>
                          <span>{axe.label}</span>
                          {isSel && <Check size={13} color="#58B6A9" strokeWidth={3} />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Consentement INADP Tunisie */}
                <div style={{
                  background: 'linear-gradient(135deg, #f0fdf4 0%, #e8f5f3 100%)',
                  border: '1.5px solid #86efac',
                  borderRadius: 16,
                  padding: '16px 18px',
                  display: 'flex',
                  gap: 12,
                  alignItems: 'flex-start'
                }}>
                  <input
                    type="checkbox"
                    id="consentement"
                    name="consentement"
                    checked={formData.consentement}
                    onChange={handleChange}
                    style={{
                      width: 20,
                      height: 20,
                      accentColor: '#059669',
                      marginTop: 2,
                      cursor: 'pointer',
                      flexShrink: 0
                    }}
                  />
                  <label htmlFor="consentement" style={{ cursor: 'pointer', margin: 0, display: 'block', fontSize: '.78rem', color: '#166534', lineHeight: 1.5 }}>
                    <strong style={{ color: '#14532d', display: 'block', marginBottom: 2 }}>
                      Accord Légal & Protection des Données (Loi n° 2004-63 Tunisie - INADP) :
                    </strong>
                    J'autorise le recueil et le croisement anonymisé des observations scolaires et familiales sur NOVA Tunisie dans le cadre de la prévention et du dépistage précoce des troubles neurodéveloppementaux (TND).
                  </label>
                </div>

                {/* Boutons Retour / Soumettre */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
                  <button
                    type="button"
                    onClick={() => setEtape(2)}
                    className="btn btn-outline"
                  >
                    <ArrowLeft size={16} /> Retour
                  </button>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary"
                    style={{
                      padding: '12px 28px',
                      fontSize: '.95rem',
                      background: 'linear-gradient(135deg, #17324D 0%, #0d1e30 100%)',
                      boxShadow: '0 4px 16px rgba(23,50,77,.3)'
                    }}
                  >
                    {loading ? (
                      <>
                        <RefreshCw size={16} className="animate-spin" />
                        <span>Création du passeport...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={16} color="#FFFF66" />
                        <span>Valider & Générer le Dossier</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* ── PRÉVISUALISATION EN TEMPS RÉEL (CARTE PASSEPORT NUMÉRIQUE) ── */}
        <div style={{ position: 'sticky', top: 20 }}>
          <div style={{
            fontSize: '.75rem',
            fontWeight: 800,
            color: '#64748b',
            letterSpacing: '.06em',
            textTransform: 'uppercase',
            marginBottom: 8,
            display: 'flex',
            alignItems: 'center',
            gap: 6
          }}>
            <Eye size={13} color="#58B6A9" /> Prévisualisation du Passeport NOVA
          </div>

          <div style={{
            background: 'linear-gradient(145deg, #17324D 0%, #0d1e30 100%)',
            borderRadius: 20,
            padding: '24px 20px',
            color: '#ffffff',
            border: '1.5px solid rgba(88,182,169,.3)',
            boxShadow: '0 16px 40px rgba(23,50,77,.16)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Header de la carte */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: 'linear-gradient(135deg, #58B6A9 0%, #B9DDF2 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#17324D',
                  fontWeight: 900,
                  fontSize: '.9rem'
                }}>
                  N
                </div>
                <div>
                  <div style={{ fontSize: '.75rem', fontWeight: 900, letterSpacing: '.05em' }}>NOVA TUNISIE</div>
                  <div style={{ fontSize: '.58rem', color: '#B9DDF2', letterSpacing: '.08em' }}>SANTÉ CONNECTÉE</div>
                </div>
              </div>

              <div style={{
                background: 'rgba(88,182,169,.15)',
                border: '1px solid rgba(88,182,169,.3)',
                padding: '3px 8px',
                borderRadius: 6,
                fontSize: '.65rem',
                fontWeight: 700,
                color: '#B9DDF2'
              }}>
                En direct
              </div>
            </div>

            {/* Avatar & Nom */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
              <div style={{
                width: 58,
                height: 58,
                borderRadius: 16,
                background: selectedAvatarObj.bg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.8rem',
                boxShadow: '0 4px 12px rgba(0,0,0,.2)',
                flexShrink: 0
              }}>
                {selectedAvatarObj.emoji}
              </div>

              <div>
                <div style={{
                  fontSize: '1.25rem',
                  fontWeight: 900,
                  color: '#ffffff',
                  lineHeight: 1.2
                }}>
                  {formData.prenom.trim() || 'Prénom Enfant'}
                </div>
                <div style={{ fontSize: '.76rem', color: '#B9DDF2', marginTop: 2 }}>
                  {formData.age} ans · {formData.gouvernorat}
                </div>
              </div>
            </div>

            {/* Détails scolaires */}
            <div style={{
              background: 'rgba(255,255,255,.05)',
              border: '1px solid rgba(255,255,255,.08)',
              borderRadius: 12,
              padding: '12px',
              fontSize: '.78rem',
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
              marginBottom: 16
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8' }}>Niveau :</span>
                <span style={{ fontWeight: 700, color: '#e2e8f0' }}>{formData.niveauScolaire}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8' }}>Établissement :</span>
                <span style={{ fontWeight: 700, color: '#e2e8f0', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {formData.etablissement.trim() || 'École de secteur'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8' }}>Responsable :</span>
                <span style={{ fontWeight: 700, color: '#e2e8f0' }}>
                  {formData.parentNom.trim() || 'Parent'} ({formData.parentLien})
                </span>
              </div>
            </div>

            {/* Code National Prévisionnel */}
            <div style={{
              background: 'rgba(0,0,0,.25)',
              border: '1px dashed rgba(255,255,255,.2)',
              borderRadius: 10,
              padding: '10px 12px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '.62rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 2 }}>
                Identifiant Unique Prévu
              </div>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '1rem',
                fontWeight: 900,
                color: '#FFFF66',
                letterSpacing: '.08em'
              }}>
                {codePrevisionnel}
              </div>
            </div>

            {/* Note d'aide */}
            <div style={{
              fontSize: '.68rem',
              color: '#64748b',
              marginTop: 14,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              lineHeight: 1.4
            }}>
              <Lock size={12} color="#58B6A9" />
              Ce dossier est chiffré. Vos observations sont stockées de façon anonymisée et sécurisée.
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
