import Badge from '../../../components/common/Badge';
import AvatarPersonne from '../../../components/common/AvatarPersonne';
import { formatDate } from '../../../utils/formatters';
import { estActif } from '../useAcheteurs';

/** Liste des clients inscrits. Présentation seule. */
export default function TableAcheteurs({
  acheteurs, recherche, filtre, onVoir, onModifier, onBasculer, onSupprimer,
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
                    {recherche ? `Aucun résultat pour « ${recherche} »`
                      : filtre ? `Aucun client ${filtre === 'actifs' ? 'actif' : 'suspendu'}`
                        : 'Aucun client enregistré pour l’instant'}
                  </p>
                </div>
              </td>
            </tr>
          ) : acheteurs.map((c) => {
            const actif = estActif(c);
            return (
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
                <td><Badge variant={actif ? 'success' : 'danger'}>{actif ? 'Actif' : 'Suspendu'}</Badge></td>
                <td>
                  <div className="table-actions">
                    <button className="btn btn-ghost btn-sm" onClick={() => onVoir(c)}>Voir</button>
                    <button className="btn btn-ghost btn-sm" onClick={() => onModifier(c)}>Modifier</button>
                    <button
                      className={`btn btn-sm ${actif ? 'btn-warning' : 'btn-success'}`}
                      onClick={() => onBasculer(c)}
                    >
                      {actif ? 'Suspendre' : 'Réactiver'}
                    </button>
                    <button className="btn btn-danger btn-sm" onClick={() => onSupprimer(c)}>Supprimer</button>
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
