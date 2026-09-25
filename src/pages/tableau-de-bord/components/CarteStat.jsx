import { memo } from 'react';

/** Compteur mis en avant en tête de tableau de bord. */
const CarteStat = memo(function CarteStat({ label, valeur, couleur, icone }) {
  return (
    <div className="stat-card">
      <div className={`stat-card-icon ${couleur}`}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>{icone}</svg>
      </div>
      <div className="stat-card-value">{valeur ?? 0}</div>
      <div className="stat-card-label">{label}</div>
    </div>
  );
});

export default CarteStat;
