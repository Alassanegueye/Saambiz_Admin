import useTitrePage from '../../hooks/useTitrePage';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import SearchInput from '../../components/common/SearchInput';
import Pagination from '../../components/common/Pagination';
import { formatDateTime } from '../../utils/formatters';
import useAudit from './useAudit';

/** Journal des actions d'administration — qui a fait quoi, et quand. */
export default function AuditPage() {
  useTitrePage("Logs d'audit — SaamBiz Admin");
  const a = useAudit();

  if (a.loading) return <LoadingSpinner />;

  /** Les détails sont tantôt une chaîne, tantôt un objet JSON. */
  const lireDetails = (details) => {
    if (typeof details === 'string') return details;
    return details ? JSON.stringify(details) : '—';
  };

  return (
    <div>

      <div className="page-header">
        <div className="page-header-left">
          <h1>Logs d&apos;audit</h1>
          <p>{a.elements.length} entrée(s) au total</p>
        </div>
      </div>

      <div className="card">
        <div className="card-header card-header-recherche">
          <SearchInput
            value={a.search}
            onChange={a.rechercher}
            placeholder="Rechercher (admin, cible)…"
          />
          <div className="groupe-filtres">
            <input
              className="form-input champ-filtre"
              value={a.actionFiltre}
              onChange={(e) => a.filtrerParAction(e.target.value)}
              placeholder="Filtrer par action…"
              aria-label="Filtrer par action"
            />
          </div>
        </div>

        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Admin</th>
                <th>Action</th>
                <th>Cible</th>
                <th>Détails</th>
              </tr>
            </thead>
            <tbody>
              {a.pageCourante.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <div className="empty-state">
                      <p>
                        {a.rechercheDifferee || a.actionFiltre
                          ? 'Aucun résultat pour ce filtre'
                          : 'Aucun log enregistré pour l’instant'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : a.pageCourante.map((l) => (
                <tr key={l.id}>
                  <td className="td-muted">{formatDateTime(l.createdAt)}</td>
                  <td className="td-bold">#{l.adminId}</td>
                  <td className="td-muted">{l.action || '—'}</td>
                  <td className="td-muted">{l.cible ? `${l.cible} #${l.cibleId ?? ''}` : '—'}</td>
                  <td className="td-muted cellule-details">{lireDetails(l.details)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bloc-pagination">
          <Pagination currentPage={a.page} totalPages={a.totalPages} onPageChange={a.setPage} />
        </div>
      </div>
    </div>
  );
}
