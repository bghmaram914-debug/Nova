import React, { useState } from 'react';
import { Home, Users, Gamepad2, UserPlus } from 'lucide-react';
import EspaceParent from './EspaceParent';
import EspaceFamilleElargie from './EspaceFamilleElargie';
import EspaceJeuAdaptatif from './EspaceJeuAdaptatif';
import InscriptionEnfant from './InscriptionEnfant';

const TABS = [
  { id: 'inscrire',label: 'Inscrire un enfant', sublabel: 'Nouveau dossier NOVA',     icon: UserPlus, color: '#059669', bg: '#ecfdf5', bd: '#a7f3d0' },
  { id: 'parent',  label: 'Parent',              sublabel: 'Observations à la maison', icon: Home,     color: '#7c3aed', bg: '#f5f3ff', bd: '#ddd6fe' },
  { id: 'famille', label: 'Famille élargie',     sublabel: 'Entourage & proches',       icon: Users,    color: '#d97706', bg: '#fffbeb', bd: '#fde68a' },
  { id: 'jeu',     label: 'Jeu adaptatif',       sublabel: 'Pour votre enfant',         icon: Gamepad2, color: '#0ea5e9', bg: '#f0f9ff', bd: '#bae6fd' },
];

export default function EspaceFamille({ child, onObservationAdded, refreshTrigger, user, onEnfantAjoute }) {
  const [active, setActive] = useState('parent');

  return (
    <div style={{ maxWidth: 920, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }} className="fade-up">
      {/* Page header */}
      <div style={{
        background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
        borderRadius: 'var(--r-2xl)',
        padding: '28px 32px',
        color: 'white',
        boxShadow: '0 8px 24px rgba(124,58,237,.28)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16,
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <span style={{ background: 'rgba(255,255,255,.15)', padding: '3px 12px', borderRadius: 99, fontSize: '.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Users size={13} /> ESPACE FAMILLE
            </span>
            <span style={{ fontSize: '.82rem', opacity: .9 }}>{user?.nom || 'Sophie M. & Famille'}</span>
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '0 0 6px', letterSpacing: '-.025em', color: 'white' }}>
            Votre espace collaboratif
          </h2>
          <p style={{ margin: 0, fontSize: '.88rem', opacity: .88, maxWidth: 500, lineHeight: 1.55 }}>
            Parents, famille élargie : partagez vos observations, inscrivez vos enfants et laissez {child?.prenom || 'votre enfant'} s'exprimer via le jeu adaptatif.
          </p>
        </div>
        <div style={{ background: 'rgba(255,255,255,.12)', border: '1px solid rgba(255,255,255,.2)', borderRadius: 14, padding: '14px 20px', textAlign: 'center', minWidth: 150 }}>
          <div style={{ fontSize: '.68rem', textTransform: 'uppercase', letterSpacing: '.07em', opacity: .75, marginBottom: 4 }}>Enfant sélectionné</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>{child?.prenom} {child?.nom_anonyme || 'M.'}</div>
          <div style={{ fontSize: '.78rem', opacity: .8, marginTop: 2 }}>{child?.age} ans · {child?.niveau_scolaire}</div>
        </div>
      </div>

      {/* Tab selector */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
        {TABS.map(t => {
          const Icon = t.icon;
          const sel = active === t.id;
          return (
            <button key={t.id} onClick={() => setActive(t.id)} style={{
              padding: '16px 18px', borderRadius: 'var(--r-xl)',
              border: sel ? `2px solid ${t.color}` : '1px solid var(--border)',
              background: sel ? t.bg : 'var(--surface)',
              cursor: 'pointer', textAlign: 'left',
              transition: 'all var(--dur) var(--ease)',
              boxShadow: sel ? `0 4px 14px ${t.color}25` : 'var(--sh-xs)',
              outline: 'none',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <div style={{ background: sel ? t.color : 'var(--gray-100)', borderRadius: 9, padding: '7px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all var(--dur) var(--ease)' }}>
                  <Icon size={16} color={sel ? 'white' : 'var(--gray-500)'} />
                </div>
              </div>
              <div style={{ fontWeight: 700, fontSize: '.9rem', color: sel ? t.color : 'var(--gray-800)', marginBottom: 2 }}>{t.label}</div>
              <div style={{ fontSize: '.76rem', color: sel ? t.color + 'cc' : 'var(--text-sub)' }}>{t.sublabel}</div>
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div key={active} className="fade-up">
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

