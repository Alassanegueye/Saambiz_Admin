import { formatMontant } from '../../../utils/formatters';
import { nomVendeur, nomCategorie } from '../useProduits';

/** File de modération : produits soumis, pas encore visibles des clients. */
export default function TableProduitsEnAttente({ produits, onApprouver, onRejeter }) {
  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th>Produit</th>
            <th>Vendeur</th>
            <th>Prix</th>
            <th>Catégorie</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {produits.length === 0 ? (
            <tr>
              <td colSpan={5}>
                <div className="empty-state">
                  <p>Aucun produit en attente de modération</p>
                </div>
              </td>
            </tr>
          ) : produits.map((p) => (
            <tr key={p.id}>
              <td className="td-bold">{p.nom || '—'}</td>
              <td className="td-muted">{nomVendeur(p)}</td>
              <td className="td-bold">{formatMontant(p.prix)}</td>
              <td className="td-muted">{nomCategorie(p)}</td>
              <td>
                <div className="table-actions">
                  <button className="btn btn-success btn-sm" onClick={() => onApprouver(p)}>
                    Approuver
                  </button>
                  <button className="btn btn-danger btn-sm" onClick={() => onRejeter(p)}>
                    Rejeter
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
