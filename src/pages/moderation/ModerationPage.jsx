import useTitrePage from '../../hooks/useTitrePage';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import SearchInput from '../../components/common/SearchInput';
import Pagination from '../../components/common/Pagination';
import { formatMontant } from '../../utils/formatters';
import useModeration from './useModeration';

/** File des produits en attente de validation. */
export default function ModerationPage() {
  useTitrePage('Modération — SaamBiz Admin');
  const m = useModeration();

  if (m.loading) return <LoadingSpinner />;

  const nomVendeur = (p) =>
    p.vendeur ? `${p.vendeur.prenom || ''} ${p.vendeur.nom || ''}`.trim() || '—' : '—';

  return (
    <div>

      <div className="page-header">
        <div className="page-header-left">
          <h1>Modération des produits</h1>
          <p>{m.elements.length} produit(s) en attente</p>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">Produits en attente</span>
          <SearchInput
            value={m.search}
            onChange={m.rechercher}
            placeholder="Rechercher un produit ou un vendeur…"
          />
        </div>

        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Vendeur</th>
                <th>Catégorie</th>
                <th>Prix</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {m.pageCourante.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <div className="empty-state">
                      <p>
                        {m.rechercheDifferee
                          ? `Aucun résultat pour « ${m.rechercheDifferee} »`
                          : 'Aucun produit en attente'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : m.pageCourante.map((p) => (
                <tr key={p.id}>
                  <td className="td-bold">{p.nom}</td>
                  <td className="td-muted">{nomVendeur(p)}</td>
                  <td className="td-muted">{p.categorie?.nom || '—'}</td>
                  <td>{formatMontant(p.prix)}</td>
                  <td>
                    <div className="table-actions">
                      <button
                        className="btn btn-success btn-sm"
                        disabled={m.busy === p.id}
                        onClick={() => m.decider(p, true)}
                      >
                        Approuver
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        disabled={m.busy === p.id}
                        onClick={() => m.decider(p, false)}
                      >
                        Rejeter
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {m.totalPages > 1 && (
          <div className="bloc-pagination">
            <Pagination currentPage={m.page} totalPages={m.totalPages} onPageChange={m.setPage} />
          </div>
        )}
      </div>
    </div>
  );
}
