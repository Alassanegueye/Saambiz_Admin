import Badge from '../../../components/common/Badge';
import AvatarPersonne from '../../../components/common/AvatarPersonne';
import { formatDate, formatDateTime } from '../../../utils/formatters';

/** Liste des comptes administrateurs. */
export default function TableAdmins({
  admins, recherche, onVoir, onModifier, onPermissions, onSupprimer,
}) {
  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th>Administrateur</th>
            <th>Email</th>
            <th>Première connexion</th>
            <th>Dernière connexion</th>
            <th>Inscrit le</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {admins.length === 0 ? (
            <tr>
              <td colSpan={6}>
                <div className="empty-state">
                  <p>
                    {recherche
                      ? `Aucun résultat pour « ${recherche} »`
                      : 'Aucun administrateur enregistré'}
                  </p>
                </div>
              </td>
            </tr>
          ) : admins.map((a) => (
            <tr key={a.id}>
              <td>
                <div className="cellule-personne">
                  <AvatarPersonne personne={a} />
                  <span className="td-bold">{a.prenom} {a.nom}</span>
                </div>
              </td>
              <td className="td-muted">{a.email}</td>
              <td>
                {/* Date réelle dès qu'elle est connue ; sinon, tant que le
                    mot de passe initial n'a pas été changé, la connexion est
                    « en attente ». Un compte déjà utilisé avant l'ajout du
                    suivi des dates reste « effectuée » sans date. */}
                {a.premiereConnexion ? (
                  <span className="td-muted" title={formatDateTime(a.premiereConnexion)}>
                    {formatDate(a.premiereConnexion)}
                  </span>
                ) : a.isFirstLogin ? (
                  <Badge variant="warning">En attente</Badge>
                ) : (
                  <Badge variant="success">Effectuée</Badge>
                )}
              </td>
              <td className="td-muted" title={a.derniereConnexion ? formatDateTime(a.derniereConnexion) : undefined}>
                {a.derniereConnexion ? formatDateTime(a.derniereConnexion) : '—'}
              </td>
              <td className="td-muted">{formatDate(a.createdAt)}</td>
              <td>
                <div className="table-actions">
                  <button className="btn btn-ghost btn-sm" onClick={() => onVoir(a)}>Voir</button>
                  <button className="btn btn-ghost btn-sm" onClick={() => onModifier(a)}>Modifier</button>
                  <button className="btn btn-ghost btn-sm" onClick={() => onPermissions(a)}>
                    Permissions
                  </button>
                  <button className="btn btn-danger btn-sm" onClick={() => onSupprimer(a)}>
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
