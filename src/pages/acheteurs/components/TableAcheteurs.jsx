import Badge from '../../../components/common/Badge';
import AvatarPersonne from '../../../components/common/AvatarPersonne';
import { formatDate } from '../../../utils/formatters';

/** Liste des acheteurs inscrits. Présentation seule. */
export default function TableAcheteurs({
  acheteurs, recherche, onVoir, onActiver, onSupprimer,
}) {
  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th>Client</th>
            <th>Email</th>
            <th>Téléphone</th>
            <th>Inscription</th>
            <th>Statut</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {acheteurs.length === 0 ? (
            <tr>
              <td colSpan={6}>
                <div className="empty-state">
                  <p>
                    {recherche
                      ? `Aucun résultat pour « ${recherche} »`
                      : 'Aucun acheteur enregistré pour l’instant'}
                  </p>
                </div>
              </td>
            </tr>
          ) : acheteurs.map((c) => (
            <tr key={c.id}>
              <td>
                <div className="cellule-personne">
                  <AvatarPersonne personne={c} />
                  <span className="td-bold">{c.prenom} {c.nom}</span>
                </div>
              </td>
              <td className="td-muted">{c.email || '—'}</td>
              <td className="td-muted">{c.telephone || '—'}</td>
              <td className="td-muted">{formatDate(c.createdAt)}</td>
              <td>
                <Badge variant={c.actif ? 'success' : 'default'}>
                  {c.actif ? 'Actif' : 'Inactif'}
                </Badge>
              </td>
              <td>
                <div className="table-actions">
                  <button className="btn btn-ghost btn-sm" onClick={() => onVoir(c)}>
                    Voir
                  </button>
                  {/* Réactiver un compte déjà actif n'a pas de sens : le
                      bouton n'apparaît que là où il sert. */}
                  {!c.actif && (
                    <button className="btn btn-success btn-sm" onClick={() => onActiver(c)}>
                      Activer
                    </button>
                  )}
                  <button className="btn btn-danger btn-sm" onClick={() => onSupprimer(c)}>
                    Supprimer
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
