import Badge from '../../../components/common/Badge';
import { formatMontant } from '../../../utils/formatters';
import { nomCategorie, nomBoutique, nomVendeur, libelleDisponibilite } from '../useProduits';

/** Catalogue de toutes les boutiques. Présentation seule. */
export default function TableProduits({
  produits, recherche, onVoir, onModifier, onSupprimer,
}) {
  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th>Produit</th>
            <th>Boutique</th>
            <th>Catégorie</th>
            <th>Prix</th>
            <th>Stock</th>
            <th>Statut</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {produits.length === 0 ? (
            <tr>
              <td colSpan={7}>
                <div className="empty-state">
                  <p>{recherche ? `Aucun résultat pour « ${recherche} »` : 'Aucun produit pour ce filtre'}</p>
                </div>
              </td>
            </tr>
          ) : produits.map((p) => {
            const etat = libelleDisponibilite(p);
            const promo = p.prix_promo != null && Number(p.prix_promo) > 0 && Number(p.prix_promo) < Number(p.prix);
            return (
              <tr key={p.id}>
                <td>
                  <div className="cellule-produit">
                    {p.image
                      ? <img className="vignette-produit" src={p.image} alt="" />
                      : <div className="vignette-produit vignette-vide">IMG</div>}
                    <span className="td-bold">{p.nom || '—'}</span>
                  </div>
                </td>
                <td>
                  <div className="td-bold">{nomBoutique(p)}</div>
                  <div className="td-muted td-petit">{nomVendeur(p)}</div>
                </td>
                <td className="td-muted">{nomCategorie(p)}</td>
                <td className="td-bold">
                  {promo ? (
                    <>
                      {formatMontant(p.prix_promo)}
                      <div className="td-muted td-petit prix-barre">{formatMontant(p.prix)}</div>
                    </>
                  ) : formatMontant(p.prix)}
                </td>
                <td className="td-muted">{p.quantite ?? '—'}</td>
                <td><Badge variant={etat.variante}>{etat.texte}</Badge></td>
                <td>
                  <div className="table-actions">
                    <button className="btn btn-ghost btn-sm" onClick={() => onVoir(p)}>Voir</button>
                    <button className="btn btn-ghost btn-sm" onClick={() => onModifier(p)}>Modifier</button>
                    <button className="btn btn-danger btn-sm" onClick={() => onSupprimer(p)}>Supprimer</button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
