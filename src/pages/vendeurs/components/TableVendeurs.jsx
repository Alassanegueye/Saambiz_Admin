import Badge from '../../../components/common/Badge';
import AvatarPersonne from '../../../components/common/AvatarPersonne';
import { formatDate } from '../../../utils/formatters';
import { estActif, varianteStatut, libelleStatut } from '../useVendeurs';

/** Liste des vendeurs inscrits. Présentation seule. */
export default function TableVendeurs({
  vendeurs, recherche, filtre, onVoir, onModifier, onAbonnement, onVerifier, onBasculer, onSupprimer,
}) {
  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th>Vendeur</th>
            <th>Email</th>
            <th>Téléphone</th>
            <th>Statut</th>
            <th>Inscription</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {vendeurs.length === 0 ? (
            <tr>
              <td colSpan={6}>
                <div className="empty-state">
                  <p>
                    {recherche ? `Aucun résultat pour « ${recherche} »`
                      : filtre ? `Aucun vendeur ${filtre === 'actifs' ? 'actif' : 'suspendu'}`
                        : 'Aucun vendeur enregistré pour l’instant'}
                  </p>
                </div>
              </td>
            </tr>
          ) : vendeurs.map((v) => {
            const actif = estActif(v);
            return (
              <tr key={v.id}>
                <td>
                  <div className="cellule-personne">
                    <AvatarPersonne personne={v} />
                    <span className="td-bold">{v.prenom} {v.nom}</span>
                    {v.verifie && <Badge variant="info">Vérifié</Badge>}
                  </div>
                </td>
                <td className="td-muted">{v.email || '—'}</td>
                <td className="td-muted">{v.telephone || '—'}</td>
                <td><Badge variant={varianteStatut(actif)}>{libelleStatut(actif)}</Badge></td>
                <td className="td-muted">{formatDate(v.createdAt)}</td>
                <td>
                  <div className="table-actions">
                    <button className="btn btn-ghost btn-sm" onClick={() => onVoir(v)}>Voir</button>
                    <button className="btn btn-ghost btn-sm" onClick={() => onModifier(v)}>Modifier</button>
                    <button className="btn btn-ghost btn-sm" onClick={() => onAbonnement(v)}>Abonnement</button>
                    {!v.verifie && (
                      <button className="btn btn-ghost btn-sm" onClick={() => onVerifier(v)}>Vérifier</button>
                    )}
                    <button
                      className={`btn btn-sm ${actif ? 'btn-warning' : 'btn-success'}`}
                      onClick={() => onBasculer(v)}
                    >
                      {actif ? 'Suspendre' : 'Réactiver'}
                    </button>
                    <button className="btn btn-danger btn-sm" onClick={() => onSupprimer(v)}>Supprimer</button>
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
