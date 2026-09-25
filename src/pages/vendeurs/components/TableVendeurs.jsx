import Badge from '../../../components/common/Badge';
import AvatarPersonne from '../../../components/common/AvatarPersonne';
import { formatDate } from '../../../utils/formatters';
import { varianteStatut, libelleStatut } from '../useVendeurs';

/** Liste des vendeurs inscrits. Présentation seule. */
export default function TableVendeurs({
  vendeurs, recherche, onVoir, onAbonnement, onVerifier, onSuspendre, onActiver, onSupprimer,
}) {
  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th>Vendeur</th>
            <th>Email</th>
            <th>Téléphone</th>
            <th>Ville</th>
            <th>Abonnement</th>
            <th>Statut</th>
            <th>Inscription</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {vendeurs.length === 0 ? (
            <tr>
              <td colSpan={8}>
                <div className="empty-state">
                  <p>
                    {recherche
                      ? `Aucun résultat pour « ${recherche} »`
                      : 'Aucun vendeur enregistré pour l’instant'}
                  </p>
                </div>
              </td>
            </tr>
          ) : vendeurs.map((v) => (
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
              <td className="td-muted">{v.ville || '—'}</td>
              <td>
                <Badge variant={v.abonnementActif ? 'success' : 'default'}>
                  {v.abonnementActif ? 'Actif' : 'Inactif'}
                </Badge>
              </td>
              <td>
                <Badge variant={varianteStatut(v.actif, v.suspendu)}>
                  {libelleStatut(v.actif, v.suspendu)}
                </Badge>
              </td>
              <td className="td-muted">{formatDate(v.createdAt)}</td>
              <td>
                <div className="table-actions">
                  <button className="btn btn-ghost btn-sm" onClick={() => onVoir(v)}>Voir</button>
                  <button className="btn btn-ghost btn-sm" onClick={() => onAbonnement(v)}>
                    Abonnement
                  </button>
                  {/* Vérifier un compte déjà vérifié n'a pas de sens. */}
                  {!v.verifie && (
                    <button className="btn btn-ghost btn-sm" onClick={() => onVerifier(v)}>
                      Vérifier
                    </button>
                  )}
                  {v.suspendu || !v.actif ? (
                    <button className="btn btn-success btn-sm" onClick={() => onActiver(v)}>
                      Réactiver
                    </button>
                  ) : (
                    <button className="btn btn-warning btn-sm" onClick={() => onSuspendre(v)}>
                      Suspendre
                    </button>
                  )}
                  <button className="btn btn-danger btn-sm" onClick={() => onSupprimer(v)}>
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
