import { memo } from 'react';
import { Link } from 'react-router-dom';

/**
 * Compteur mis en avant en tête de tableau de bord. Avec `to`, la carte
 * ouvre la liste des éléments concernés (ex. les vendeurs inactifs).
 */
const CarteStat = memo(function CarteStat({ label, valeur, couleur, icone, to }) {
  const contenu = (
    <>
      <div className={`stat-card-icon ${couleur}`}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>{icone}</svg>
      </div>
      <div className="stat-card-value">{valeur ?? 0}</div>
      <div className="stat-card-label">{label}</div>
      {to && <span className="stat-card-lien-texte">Consulter →</span>}
    </>
  );
  if (!to) return <div className="stat-card">{contenu}</div>;
  return (
    <Link to={to} className="stat-card stat-card-lien" aria-label={`${label} : consulter la liste`}>
      {contenu}
    </Link>
  );
});

export default CarteStat;
