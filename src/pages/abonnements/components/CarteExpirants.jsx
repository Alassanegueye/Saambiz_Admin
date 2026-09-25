import Badge from '../../../components/common/Badge';
import { formatDate } from '../../../utils/formatters';
import { varianteStatut, nomVendeur, JOURS_ALERTE_EXPIRATION } from '../useAbonnements';

/** Alerte : abonnements dont l'échéance approche, à relancer. */
export default function CarteExpirants({ abonnements }) {
  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">Expirent bientôt ({JOURS_ALERTE_EXPIRATION} jours)</span>
      </div>
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr><th>Vendeur</th><th>Type</th><th>Fin</th><th>Statut</th></tr>
          </thead>
          <tbody>
            {abonnements.map((a) => (
              <tr key={a.id}>
                <td className="td-bold">{nomVendeur(a)}</td>
                <td className="td-muted">{a.type || '—'}</td>
                <td className="td-muted">{formatDate(a.dateFin)}</td>
                <td>
                  <Badge variant={varianteStatut(a.statut)}>{a.statut || 'Actif'}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
