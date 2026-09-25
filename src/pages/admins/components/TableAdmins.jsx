import Badge from '../../../components/common/Badge';
import AvatarPersonne from '../../../components/common/AvatarPersonne';
import { formatDate } from '../../../utils/formatters';

/** Liste des comptes administrateurs. */
export default function TableAdmins({ admins, recherche, onPermissions, onSupprimer }) {
  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th>Administrateur</th>
            <th>Email</th>
            <th>Première connexion</th>
            <th>Inscrit le</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {admins.length === 0 ? (
            <tr>
              <td colSpan={5}>
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
                {/* Tant que le compte n'a pas servi, le mot de passe initial
                    envoyé par email est encore en circulation. */}
                <Badge variant={a.isFirstLogin ? 'warning' : 'success'}>
                  {a.isFirstLogin ? 'Non connecté' : 'Connecté'}
                </Badge>
              </td>
              <td className="td-muted">{formatDate(a.createdAt)}</td>
              <td>
                <div className="table-actions">
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
