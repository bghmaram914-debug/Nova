import React, { useState } from 'react';
import { Home, Users, Gamepad2, UserPlus, Heart, MessageCircle, Star } from 'lucide-react';
import EspaceParent from './EspaceParent';
import EspaceFamilleElargie from './EspaceFamilleElargie';
import EspaceJeuAdaptatif from './EspaceJeuAdaptatif';
import InscriptionEnfant from './InscriptionEnfant';

const TABS = [
  { id: 'parent',   label: 'Maison & Parents',    icon: Home,     color: '#17324D', bg: 'rgba(23,50,77,.08)' },
  { id: 'famille',  label: 'Famille & Proches',   icon: Users,    color: '#58B6A9', bg: 'rgba(88,182,169,.10)' },
  { id: 'jeu',      label: 'Jeux pour l\'enfant', icon: Gamepad2, color: '#3d9b8e', bg: 'rgba(61,155,142,.10)' },
  { id: 'inscrire', label: '+ Inscrire un enfant',icon: UserPlus, color: '#17324D', bg: 'rgba(23,50,77,.08)' },
];

const STATS = [
  { label: 'Observations envoyées', value: '5', icon: MessageCircle, color: '#17324D', bg: 'rgba(23,50,77,.07)' },
  { label: 'Domaines suivis', value: '3', icon: Heart, color: '#58B6A9', bg: 'rgba(88,182,169,.10)' },
  { label: 'Sessions de jeu', value: '8', icon: Gamepad2, color: '#3d9b8e', bg: 'rgba(61,155,142,.10)' },
  { label: 'Score moyen', value: '71%', icon: Star, color: '#17324D', bg: 'rgba(23,50,77,.07)' },
];

const card = {
  background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0',
  padding: '18px 20px', boxShadow: '0 2px 8px rgba(23,50,77,.04)',
};

export default function EspaceFamille({ child, onObservationAdded, refreshTrigger, user, onEnfantAjoute }) {
  const [active, setActive] = useState('parent');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }} className="fade-up">

      {/* ── En-tête de page ── */}
      <div>
        <h1 style={{ fontSize: '1.55rem', fontWeight: 900, color: '#17324D', margin: 0, letterSpacing: '-.02em' }}>
          Espace Famille
        </h1>
        <p style={{ fontSize: '.88rem', color: '#64748b', margin: '4px 0 0' }}>
          Suivi quotidien, observations à la maison et jeux adaptatifs pour {child?.prenom || 'votre enfant'}
        </p>
      </div>

      {/* ── Cartes de stats ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        {STATS.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} style={{ ...card }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: '.75rem', color: '#64748b', fontWeight: 600 }}>{label}</span>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={15} color={color} />
              </div>
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#17324D', lineHeight: 1 }}>{value}</div>
            <div style={{ fontSize: '.7rem', color: '#94a3b8', marginTop: 6 }}>Ce mois-ci</div>
          </div>
        ))}
      </div>

      {/* ── Navigation par onglets ── */}
      <div style={{ display: 'flex', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: 4, boxShadow: '0 2px 8px rgba(23,50,77,.04)', gap: 4 }}>
        {TABS.map(t => {
          const Icon = t.icon;
          const isSel = active === t.id;
          return (
            <button key={t.id} onClick={() => setActive(t.id)} style={{
              flex: 1, padding: '9px 12px', borderRadius: 10, border: 'none',
              background: isSel ? t.bg : 'transparent',
              color: isSel ? t.color : '#94a3b8',
              fontWeight: isSel ? 800 : 600, fontSize: '.82rem',
              cursor: 'pointer', display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: 6, fontFamily: 'inherit',
              transition: 'all .15s ease',
              outline: isSel ? `2px solid ${t.color}20` : 'none',
            }}>
              <Icon size={14} color={isSel ? t.color : '#94a3b8'} />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── Contenu de l'onglet ── */}
      <div key={active} className="fade-in">
        {active === 'inscrire' && (
          <InscriptionEnfant onEnfantAjoute={(newChild) => { if (onEnfantAjoute) onEnfantAjoute(newChild); }} />
        )}
        {active === 'parent'  && <EspaceParent  child={child} onObservationAdded={onObservationAdded} refreshTrigger={refreshTrigger} user={user} />}
        {active === 'famille' && <EspaceFamilleElargie child={child} onObservationAdded={onObservationAdded} refreshTrigger={refreshTrigger} user={user} />}
        {active === 'jeu'     && <EspaceJeuAdaptatif child={child} user={user} />}
      </div>
    </div>
  );
}
