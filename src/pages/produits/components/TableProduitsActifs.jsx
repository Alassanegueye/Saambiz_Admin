import Badge from '../../../components/common/Badge';
import { formatMontant } from '../../../utils/formatters';
import { nomVendeur, nomCategorie } from '../useProduits';

/** Catalogue des produits en ligne. */
export default function TableProduitsActifs({ produits, recherche }) {
  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th>Produit</th>
            <th>Vendeur</th>
            <th>Prix</th>
            <th>Catégorie</th>
            <th>Stock</th>
            <th>Statut</th>
          </tr>
        </thead>
        <tbody>
          {produits.length === 0 ? (
            <tr>
              <td colSpan={6}>
                <div className="empty-state">
                  <p>
                    {recherche
                      ? `Aucun résultat pour « ${recherche} »`
                      : 'Aucun produit enregistré pour l’instant'}
                  </p>
                </div>
              </td>
            </tr>
          ) : produits.map((p) => (
            <tr key={p.id}>
              <td>
                <div className="cellule-produit">
                  {p.image
                    ? <img className="vignette-produit" src={p.image} alt={p.nom} />
                    : <div className="vignette-produit vignette-vide">IMG</div>}
                  <span className="td-bold">{p.nom || '—'}</span>
                </div>
              </td>
              <td className="td-muted">{nomVendeur(p)}</td>
              <td className="td-bold">{formatMontant(p.prix)}</td>
              <td className="td-muted">{nomCategorie(p)}</td>
              <td className="td-muted">{p.stock ?? p.quantite ?? '—'}</td>
              <td>
                <Badge variant={p.actif ? 'success' : 'default'}>
                  {p.actif ? 'Actif' : 'Inactif'}
                </Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
