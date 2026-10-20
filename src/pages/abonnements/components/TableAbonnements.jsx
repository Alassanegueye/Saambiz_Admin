import Badge from '../../../components/common/Badge';
import { formatDate, libelle } from '../../../utils/formatters';
import { varianteStatut, nomVendeur } from '../useAbonnements';

/** Liste des abonnements vendeurs. */
export default function TableAbonnements({ abonnements, recherche, onRevoquer }) {
  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th>Vendeur</th>
            <th>Type</th>
            <th>Début</th>
            <th>Fin</th>
            <th>Statut</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {abonnements.length === 0 ? (
            <tr>
              <td colSpan={6}>
                <div className="empty-state">
                  <p>
                    {recherche
                      ? `Aucun résultat pour « ${recherche} »`
                      : 'Aucun abonnement enregistré pour l’instant'}
                  </p>
                </div>
              </td>
            </tr>
          ) : abonnements.map((a) => (
            <tr key={a.id}>
              <td className="td-bold">{nomVendeur(a)}</td>
              <td className="td-muted">{libelle(a.type)}</td>
              <td className="td-muted">{formatDate(a.dateDebut)}</td>
              <td className="td-muted">{formatDate(a.dateFin)}</td>
              <td>
                <Badge variant={varianteStatut(a.statut)}>{libelle(a.statut || 'actif')}</Badge>
              </td>
              <td>
                {/* Seul un abonnement encore actif peut être révoqué. */}
                {varianteStatut(a.statut) === 'success' && (
                  <button className="btn btn-danger btn-sm" onClick={() => onRevoquer(a)}>
                    Révoquer
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
