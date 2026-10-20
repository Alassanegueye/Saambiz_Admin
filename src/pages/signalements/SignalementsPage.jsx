import useTitrePage from '../../hooks/useTitrePage';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';
import SearchInput from '../../components/common/SearchInput';
import Pagination from '../../components/common/Pagination';
import Modal from '../../components/common/Modal';
import { formatDateTime } from '../../utils/formatters';
import useSignalements, {
  TAILLE_PAGE, varianteStatut, lireMotif, nomPersonne, nomCible,
} from './useSignalements';

/** Signalements remontés par les utilisateurs. */
export default function SignalementsPage() {
  useTitrePage('Signalements — SaamBiz Admin');
  const s = useSignalements();

  if (s.loading) return <LoadingSpinner />;

  const detail = s.selection;

  /** Le motif peut être long : la colonne n'en montre que le début. */
  const motifCourt = (signalement) => {
    const motif = lireMotif(signalement);
    if (!motif) return '—';
    return motif.length > 60 ? `${motif.substring(0, 60)}…` : motif;
  };

  return (
    <div>

      <div className="page-header">
        <div className="page-header-left">
          <h1>Signalements</h1>
          <p>{s.elements.length} signalement(s) au total</p>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">Liste des signalements</span>
          <SearchInput value={s.search} onChange={s.rechercher} placeholder="Rechercher…" />
        </div>

        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Raison / Motif</th>
                <th>Signalé par</th>
                <th>Cible</th>
                <th>Date</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {s.pageCourante.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <div className="empty-state">
                      <p>
                        {s.rechercheDifferee
                          ? `Aucun résultat pour « ${s.rechercheDifferee} »`
                          : 'Aucun signalement enregistré pour l’instant'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : s.pageCourante.map((sig, i) => (
                <tr key={sig.id || i}>
                  <td className="td-muted">{(s.page - 1) * TAILLE_PAGE + i + 1}</td>
                  <td><span className="td-bold texte-motif">{motifCourt(sig)}</span></td>
                  <td className="td-muted signal-meta">{nomPersonne(sig.signalePar) || '—'}</td>
                  <td className="td-muted signal-meta">{nomCible(sig)}</td>
                  <td className="td-muted signal-meta">{formatDateTime(sig.createdAt)}</td>
                  <td>
                    <Badge variant={varianteStatut(sig.statut)}>{sig.statut || 'En attente'}</Badge>
                  </td>
                  <td>
                    <button className="btn btn-ghost btn-sm" onClick={() => s.setSelection(sig)}>
                      Voir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bloc-pagination">
          <Pagination currentPage={s.page} totalPages={s.totalPages} onPageChange={s.setPage} />
        </div>
      </div>

      <Modal
        isOpen={Boolean(detail)}
        onClose={() => s.setSelection(null)}
        title="Détail du signalement"
        footer={(
          <button className="btn btn-secondary" onClick={() => s.setSelection(null)}>Fermer</button>
        )}
      >
        {detail && (
          <div className="detail-grid">
            <div className="detail-item">
              <label>Statut</label>
              <span>
                <Badge variant={varianteStatut(detail.statut)}>
                  {detail.statut || 'En attente'}
                </Badge>
              </span>
            </div>
            <div className="detail-item">
              <label>Date</label><span>{formatDateTime(detail.createdAt)}</span>
            </div>
            <div className="detail-item">
              <label>Signalé par</label><span>{nomPersonne(detail.signalePar) || '—'}</span>
            </div>
            <div className="detail-item">
              <label>Cible</label><span>{nomCible(detail)}</span>
            </div>
            <div className="detail-item full">
              <label>Raison / Motif</label>
              {/* Le motif est saisi librement : ses retours à la ligne portent
                  du sens, on les conserve. */}
              <span className="texte-multiligne">{lireMotif(detail) || '—'}</span>
            </div>
            {detail.description && (
              <div className="detail-item full">
                <label>Description</label>
                <span className="texte-multiligne">{detail.description}</span>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
