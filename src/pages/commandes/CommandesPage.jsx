import useTitrePage from '../../hooks/useTitrePage';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import SearchInput from '../../components/common/SearchInput';
import Pagination from '../../components/common/Pagination';
import { formatDate, formatMontant, formatStatut } from '../../utils/formatters';
import useCommandes, {
  STATUTS, varianteStatut, nomPersonne, referenceCommande,
} from './useCommandes';

/** Toutes les commandes de la marketplace, vue administration. */
export default function CommandesPage() {
  useTitrePage('Commandes — SaamBiz Admin');
  const c = useCommandes();

  if (c.loading) return <LoadingSpinner />;

  const detail = c.selection;

  return (
    <div>

      <div className="page-header">
        <div className="page-header-left">
          <h1>Commandes</h1>
          <p>{c.total} commande(s) au total</p>
        </div>
      </div>

      <div className="card">
        <div className="card-header card-header-recherche">
          <SearchInput
            value={c.search}
            onChange={c.rechercher}
            placeholder="Rechercher par référence…"
          />
          <div className="groupe-filtres">
            <select
              className="form-select filter-select"
              value={c.statutFiltre}
              onChange={(e) => c.filtrerParStatut(e.target.value)}
              aria-label="Filtrer par statut"
            >
              {STATUTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
        </div>

        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Référence</th>
                <th>Acheteur</th>
                <th>Vendeur</th>
                <th>Montant</th>
                <th>Statut</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {c.pageCourante.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <div className="empty-state">
                      <p>
                        {c.rechercheDifferee
                          ? `Aucun résultat pour « ${c.rechercheDifferee} »`
                          : 'Aucune commande enregistrée pour l’instant'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : c.pageCourante.map((cmd) => (
                <tr key={cmd.id}>
                  <td className="td-bold">{referenceCommande(cmd)}</td>
                  <td className="td-muted">{nomPersonne(cmd.acheteur)}</td>
                  <td className="td-muted">{nomPersonne(cmd.vendeur)}</td>
                  <td className="td-bold">{formatMontant(cmd.montant)}</td>
                  <td>
                    <Badge variant={varianteStatut(cmd.statut)}>{formatStatut(cmd.statut)}</Badge>
                  </td>
                  <td className="td-muted">{formatDate(cmd.createdAt || cmd.date)}</td>
                  <td>
                    <button className="btn btn-ghost btn-sm" onClick={() => c.setSelection(cmd)}>
                      Voir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bloc-pagination">
          <Pagination currentPage={c.page} totalPages={c.totalPages} onPageChange={c.setPage} />
        </div>
      </div>

      <Modal
        isOpen={Boolean(detail)}
        onClose={() => c.setSelection(null)}
        title="Détail de la commande"
        footer={(
          <button className="btn btn-secondary" onClick={() => c.setSelection(null)}>
            Fermer
          </button>
        )}
      >
        {detail && (
          <div className="detail-grid">
            <div className="detail-item">
              <label>Référence</label><span>{referenceCommande(detail)}</span>
            </div>
            <div className="detail-item">
              <label>Statut</label>
              <span>
                <Badge variant={varianteStatut(detail.statut)}>{formatStatut(detail.statut)}</Badge>
              </span>
            </div>
            <div className="detail-item">
              <label>Acheteur</label><span>{nomPersonne(detail.acheteur)}</span>
            </div>
            <div className="detail-item">
              <label>Vendeur</label><span>{nomPersonne(detail.vendeur)}</span>
            </div>
            <div className="detail-item">
              <label>Montant</label><span>{formatMontant(detail.montant)}</span>
            </div>
            <div className="detail-item">
              <label>Date</label><span>{formatDate(detail.createdAt || detail.date)}</span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
