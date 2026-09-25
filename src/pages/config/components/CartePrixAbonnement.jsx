import { formatMontant } from '../../../utils/formatters';

/** Prix de l'abonnement vendeur : affichage de la valeur en vigueur et édition. */
export default function CartePrixAbonnement({
  prixActuel, nouveauPrix, onChangerPrix, enregistrement, onDemanderEnregistrement, onAnnuler,
}) {
  return (
    <div className="card carte-etroite">
      <div className="card-header">
        <span className="card-title">Prix de l&apos;abonnement</span>
      </div>
      <div className="card-body">
        <div className="config-current-price">
          <div>
            <div className="config-price-label">Prix actuel</div>
            <div className="config-price-value">
              {prixActuel !== null ? formatMontant(prixActuel) : '—'}
            </div>
          </div>
        </div>

        <div className="form-field">
          <label className="form-label" htmlFor="nouveauPrix">
            Nouveau prix (FCFA) <span className="champ-requis">*</span>
          </label>
          <input
            id="nouveauPrix"
            className="form-input"
            type="number"
            min="0"
            step="100"
            value={nouveauPrix}
            onChange={(e) => onChangerPrix(e.target.value)}
            placeholder="Ex : 5000"
          />
        </div>

        <div className="barre-actions">
          <button
            className="btn btn-primary"
            onClick={onDemanderEnregistrement}
            disabled={enregistrement || !nouveauPrix}
          >
            {enregistrement ? 'Enregistrement…' : 'Enregistrer'}
          </button>
          <button className="btn btn-secondary" onClick={onAnnuler} disabled={enregistrement}>
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
}
