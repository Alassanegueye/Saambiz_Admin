import Badge from '../../../components/common/Badge';
import { formatDate } from '../../../utils/formatters';

/** Tableau des entrées de navigation configurées. */
export default function TableMenus({ menus, recherche, onModifier, onSupprimer }) {
  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th>Nom</th>
            <th>Code</th>
            <th>Chemin</th>
            <th>Ordre</th>
            <th>Statut</th>
            <th>Créé le</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {menus.length === 0 ? (
            <tr>
              <td colSpan={7}>
                <div className="empty-state">
                  <p>
                    {recherche
                      ? `Aucun résultat pour « ${recherche} »`
                      : 'Aucun menu enregistré'}
                  </p>
                </div>
              </td>
            </tr>
          ) : menus.map((m) => (
            <tr key={m.id}>
              <td className="td-bold">{m.name}</td>
              <td><code className="code-inline">{m.code}</code></td>
              <td className="td-muted">{m.path}</td>
              <td className="td-muted">{m.ordre}</td>
              <td>
                <Badge variant={m.isActive ? 'success' : 'default'}>
                  {m.isActive ? 'Actif' : 'Inactif'}
                </Badge>
              </td>
              <td className="td-muted">{formatDate(m.createdAt)}</td>
              <td>
                <div className="table-actions">
                  <button className="btn btn-ghost btn-sm" onClick={() => onModifier(m)}>
                    Modifier
                  </button>
                  <button className="btn btn-danger btn-sm" onClick={() => onSupprimer(m)}>
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
