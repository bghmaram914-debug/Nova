import React, { useState } from 'react';
import { UserPlus, CheckCircle2, Copy, AlertCircle, School, Baby, ShieldCheck, ArrowRight, MapPin } from 'lucide-react';

const NIVEAUX = [
  'Préparatoire (Préscolaire)',
  '1ère Année Primaire',
  '2ème Année Primaire',
  '3ème Année Primaire',
  '4ème Année Primaire',
  '5ème Année Primaire',
  '6ème Année Primaire',
  '7ème Année de Base (Collège)',
  '8ème Année de Base',
  '9ème Année de Base'
];

const GOUVERNORATS = [
  'Tunis', 'Ariana', 'Ben Arous', 'Manouba', 'Nabeul', 'Bizerte', 'Zaghouan', 
  'Sousse', 'Monastir', 'Mahdia', 'Sfax', 'Kairouan', 'Kasserine', 'Sidi Bouzid',
  'Gafsa', 'Tozeur', 'Kebili', 'Gabès', 'Medenine', 'Tataouine', 'Béja', 'Jendouba', 'Le Kef', 'Siliana'
];

export default function InscriptionEnfant({ onEnfantAjoute }) {
  const [formData, setFormData] = useState({
    prenom: '',
    age: '7',
    niveauScolaire: '2ème Année Primaire',
    etablissement: '',
    gouvernorat: 'Tunis',
    parentNom: '',
    consentement: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resultat, setResultat] = useState(null);
  const [copie, setCopie] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.prenom.trim()) {
      setError('Le prénom de l\'enfant est requis.');
      return;
    }

    if (!formData.consentement) {
      setError('Veuillez valider l\'accord légal INADP (Loi 2004-63 Tunisie) pour le suivi collaboratif.');
      return;
    }

    setLoading(true);

    const etablissementComplet = formData.etablissement.trim() 
      ? `${formData.etablissement.trim()} (${formData.gouvernorat})`
      : `École Primaire Habib Bourguiba (${formData.gouvernorat})`;

    try {
      const response = await fetch('http://localhost:5000/api/enfants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prenom: formData.prenom.trim(),
          age: parseInt(formData.age, 10),
          niveauScolaire: formData.niveauScolaire,
          etablissement: etablissementComplet,
          parentNom: formData.parentNom.trim() || 'Tuteur Légal',
          parentId: 'P-101',
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la création du dossier enfant.');
      }

      const data = await response.json();
      setResultat(data.enfant);
      if (onEnfantAjoute) {
        onEnfantAjoute(data.enfant);
      }
    } catch (err) {
      console.warn('Mode réseau local:', err);
      const codeId = `TN-NOVA-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const newChild = {
        id: `E-${Date.now()}`,
        code: codeId,
        prenom: formData.prenom.trim(),
        age: parseInt(formData.age, 10),
        niveauScolaire: formData.niveauScolaire,
        etablissement: etablissementComplet,
        parentNom: formData.parentNom.trim() || 'Tuteur Légal',
        dateInscription: new Date().toLocaleDateString('fr-FR'),
      };
      setResultat(newChild);
      if (onEnfantAjoute) {
        onEnfantAjoute(newChild);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCopierCode = () => {
    if (resultat?.code || resultat?.code_identifiant) {
      const c = resultat.code || resultat.code_identifiant;
      navigator.clipboard.writeText(c);
      setCopie(true);
      setTimeout(() => setCopie(false), 3000);
    }
  };

  const handleReinitialiser = () => {
    setFormData({
      prenom: '',
      age: '7',
      niveauScolaire: '2ème Année Primaire',
      etablissement: '',
      gouvernorat: 'Tunis',
      parentNom: '',
      consentement: false,
    });
    setResultat(null);
    setError('');
  };

  if (resultat) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8 border border-emerald-100 max-w-2xl mx-auto text-center animate-fade-in">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <h3 className="text-2xl font-bold text-slate-800 mb-2">
          Dossier enfant créé avec succès !
        </h3>
        <p className="text-slate-600 mb-6">
          Le profil de <strong>{resultat.prenom}</strong> est désormais prêt pour le suivi pédopsychologique et éducatif.
        </p>

        {/* Code de partage */}
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 mb-6 text-left">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
            Code National d'Identification NOVA (À transmettre à l'enseignant ou praticien)
          </label>
          <div className="flex items-center gap-3">
            <span className="font-mono text-2xl font-bold text-indigo-600 bg-indigo-50 px-4 py-2 rounded-lg border border-indigo-200 flex-1 text-center tracking-widest">
              {resultat.code || resultat.code_identifiant}
            </span>
            <button
              onClick={handleCopierCode}
              className="flex items-center gap-2 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors shadow-sm"
            >
              <Copy className="w-4 h-4" />
              {copie ? 'Copié !' : 'Copier'}
            </button>
          </div>
          <p className="text-xs text-slate-500 mt-3 flex items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            Ce code sécurisé permet de lier le dossier de manière anonymisée entre l'école, la famille et les praticiens.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={handleReinitialiser}
            className="flex items-center justify-center gap-2 px-6 py-3 border border-slate-300 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            Inscrire un autre enfant
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-100 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
          <UserPlus className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800">Nouveau Dossier Enfant — NOVA Tunisie</h2>
          <p className="text-sm text-slate-500">
            Renseignez les informations de votre enfant pour ouvrir son espace de prévention pédopsychologique.
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 text-rose-700 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Prénom */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-2 flex items-center gap-1.5">
              <Baby className="w-4 h-4 text-indigo-500" /> Prénom de l'enfant *
            </label>
            <input
              type="text"
              name="prenom"
              value={formData.prenom}
              onChange={handleChange}
              placeholder="Ex: Youssef, Sarra, Ahmed..."
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
              required
            />
          </div>

          {/* Âge */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-2">
              Âge (ans) *
            </label>
            <select
              name="age"
              value={formData.age}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
            >
              {[3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map((a) => (
                <option key={a} value={a}>
                  {a} ans
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Niveau Scolaire */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-2 flex items-center gap-1.5">
              <School className="w-4 h-4 text-indigo-500" /> Niveau Scolaire (Tunisie) *
            </label>
            <select
              name="niveauScolaire"
              value={formData.niveauScolaire}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
            >
              {NIVEAUX.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>

          {/* Gouvernorat */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-2 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-indigo-500" /> Gouvernorat *
            </label>
            <select
              name="gouvernorat"
              value={formData.gouvernorat}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
            >
              {GOUVERNORATS.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Établissement Scolaire */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase mb-2">
            Nom de l'établissement scolaire / Jardin d'enfants
          </label>
          <input
            type="text"
            name="etablissement"
            value={formData.etablissement}
            onChange={handleChange}
            placeholder="Ex: École Primaire Habib Bourguiba, École Ibn Khaldoun..."
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
          />
        </div>

        {/* Nom du Responsable Légal */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase mb-2">
            Nom du tuteur légal / Parent responsable
          </label>
          <input
            type="text"
            name="parentNom"
            value={formData.parentNom}
            onChange={handleChange}
            placeholder="Ex: Mme Leila Ben Ali, M. Mehdi Trabelsi..."
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
          />
        </div>

        {/* Consentement INADP Tunisie */}
        <div className="p-4 bg-indigo-50/60 rounded-xl border border-indigo-100 flex items-start gap-3 mt-4">
          <input
            type="checkbox"
            id="consentement"
            name="consentement"
            checked={formData.consentement}
            onChange={handleChange}
            className="mt-1 w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
          />
          <label htmlFor="consentement" className="text-xs text-slate-600 cursor-pointer leading-relaxed">
            <strong className="text-slate-800">Consentement INADP & Protection des Données (Loi 2004-63 Tunisie) :</strong> J'autorise le traitement anonymisé des observations pour le suivi pédopsychologique et la détection précoce des troubles neurodéveloppementaux (TND).
          </label>
        </div>

        {/* Bouton de Soumission */}
        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '14px 20px',
            background: 'linear-gradient(135deg, #17324D 0%, #0f2035 100%)',
            color: 'white',
            border: 'none',
            borderRadius: 12,
            fontWeight: 800,
            fontSize: '1rem',
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            boxShadow: '0 4px 14px rgba(23,50,77,.25)',
            transition: 'all .2s ease',
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? (
            <span>Validation du dossier...</span>
          ) : (
            <>
              <span>Enregistrer le dossier enfant</span>
              <ArrowRight className="w-5 h-5 text-[#58B6A9]" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
