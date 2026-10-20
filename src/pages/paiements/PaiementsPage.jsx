import useTitrePage from '../../hooks/useTitrePage';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';
import SearchInput from '../../components/common/SearchInput';
import Pagination from '../../components/common/Pagination';
import { formatDateTime, formatMontant, formatStatut, libelle } from '../../utils/formatters';
import usePaiements, { varianteStatut } from './usePaiements';

/** Transactions de la marketplace, et celles qui ont échoué. */
export default function PaiementsPage() {
  useTitrePage('Paiements — SaamBiz Admin');
  const p = usePaiements();
  const liste = p.courant;
  const surEchecs = p.onglet === 'echecs';

  return (
    <div>

      <div className="page-header">
        <div className="page-header-left">
          <h1>Paiements</h1>
          <p>{p.nbTous} paiement(s) au total — {p.nbEchecs} échec(s)</p>
        </div>
      </div>

      <div className="tabs-bar">
        <button
          className={`tab-btn${!surEchecs ? ' active' : ''}`}
          onClick={() => p.changerOnglet('tous')}
        >
          Tous les paiements
        </button>
        <button
          className={`tab-btn${surEchecs ? ' active' : ''}`}
          onClick={() => p.changerOnglet('echecs')}
        >
          Paiements échoués
        </button>
      </div>

      <div className="card">
        <div className="card-header card-header-recherche">
          <SearchInput
            value={liste.search}
            onChange={liste.rechercher}
            placeholder="Rechercher (référence, type, statut)…"
          />
        </div>

        {liste.loading ? <LoadingSpinner /> : (
          <>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Montant</th>
                    <th>Type</th>
                    <th>Statut</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {liste.pageCourante.length === 0 ? (
                    <tr>
                      <td colSpan={5}>
                        <div className="empty-state">
                          <p>
                            {liste.rechercheDifferee
                              ? `Aucun résultat pour « ${liste.rechercheDifferee} »`
                              : `Aucun paiement ${surEchecs ? 'échoué ' : ''}enregistré pour l’instant`}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : liste.pageCourante.map((paiement) => (
                    <tr key={paiement.id}>
                      <td className="td-muted">#{paiement.id}</td>
                      <td className="td-bold">{formatMontant(paiement.montant)}</td>
                      <td className="td-muted">{libelle(paiement.type)}</td>
                      <td>
                        <Badge variant={varianteStatut(paiement.statut)}>
                          {formatStatut(paiement.statut)}
                        </Badge>
                      </td>
                      <td className="td-muted">
                        {formatDateTime(paiement.date || paiement.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bloc-pagination">
              <Pagination
                currentPage={liste.page}
                totalPages={liste.totalPages}
                onPageChange={liste.setPage}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
