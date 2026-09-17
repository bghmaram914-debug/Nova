import React, { useState } from 'react';
import { Home, Users, Gamepad2, UserPlus } from 'lucide-react';
import EspaceParent from './EspaceParent';
import EspaceFamilleElargie from './EspaceFamilleElargie';
import EspaceJeuAdaptatif from './EspaceJeuAdaptatif';
import InscriptionEnfant from './InscriptionEnfant';

const TABS = [
  { id: 'parent',   label: 'Parents (Maison)',     icon: Home,     color: '#7c3aed' },
  { id: 'famille',  label: 'Famille & Proches',    icon: Users,    color: '#d97706' },
  { id: 'jeu',      label: 'Jeux pour l\'enfant',  icon: Gamepad2, color: '#0ea5e9' },
  { id: 'inscrire', label: '+ Inscrire un enfant', icon: UserPlus, color: '#059669' },
];

export default function EspaceFamille({ child, onObservationAdded, refreshTrigger, user, onEnfantAjoute }) {
  const [active, setActive] = useState('parent');

  return (
    <div style={{ maxWidth: 880, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }} className="fade-up">
      {/* Barre d'onglets épurée */}
      <div style={{
        display: 'flex',
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: 12,
        padding: 4,
        boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
      }}>
        {TABS.map(t => {
          const Icon = t.icon;
          const isSel = active === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActive(t.id)}
              style={{
                flex: 1,
                padding: '9px 12px',
                borderRadius: 8,
                border: 'none',
                background: isSel ? `${t.color}14` : 'transparent',
                color: isSel ? t.color : '#64748b',
                fontWeight: isSel ? 800 : 600,
                fontSize: '.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                transition: 'all .15s ease',
              }}
            >
              <Icon size={15} color={isSel ? t.color : '#64748b'} />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Contenu de l'onglet actif */}
      <div key={active} className="fade-in">
        {active === 'inscrire' && (
          <InscriptionEnfant
            onEnfantAjoute={(newChild) => {
              if (onEnfantAjoute) onEnfantAjoute(newChild);
            }}
          />
        )}
        {active === 'parent'  && <EspaceParent child={child} onObservationAdded={onObservationAdded} refreshTrigger={refreshTrigger} user={user} />}
        {active === 'famille' && <EspaceFamilleElargie child={child} onObservationAdded={onObservationAdded} refreshTrigger={refreshTrigger} user={user} />}
        {active === 'jeu'     && <EspaceJeuAdaptatif child={child} user={user} />}
      </div>
    </div>
  );
}
