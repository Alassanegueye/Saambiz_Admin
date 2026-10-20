import useTitrePage from '../../hooks/useTitrePage';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import SearchInput from '../../components/common/SearchInput';
import Pagination from '../../components/common/Pagination';
import useRetours, { STATUTS, varianteStatut, estTraitable } from './useRetours';
import { libelle } from '../../utils/formatters';

/** Demandes de retour déposées par les acheteurs. */
export default function RetoursPage() {
  useTitrePage('Demandes de retour — SaamBiz Admin');
  const r = useRetours();

  if (r.loading) return <LoadingSpinner />;

  const accepte = r.traitement.action === 'accepter';

  return (
    <div>

      <div className="page-header">
        <div className="page-header-left">
          <h1>Demandes de retour</h1>
          <p>{r.elements.length} demande(s) au total</p>
        </div>
      </div>

      <div className="card">
        <div className="card-header card-header-recherche">
          <SearchInput
            value={r.search}
            onChange={r.rechercher}
            placeholder="Rechercher par raison ou commande…"
          />
          <div className="groupe-filtres">
            <select
              className="form-select filter-select"
              value={r.statutFiltre}
              onChange={(e) => r.filtrerParStatut(e.target.value)}
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
                <th>Commande</th>
                <th>Acheteur</th>
                <th>Raison</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {r.pageCourante.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <div className="empty-state">
                      <p>
                        {r.rechercheDifferee
                          ? `Aucun résultat pour « ${r.rechercheDifferee} »`
                          : 'Aucune demande de retour enregistrée pour l’instant'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : r.pageCourante.map((demande) => (
                <tr key={demande.id}>
                  <td className="td-bold">#{demande.commandeId}</td>
                  <td className="td-muted">#{demande.acheteurId}</td>
                  <td className="td-muted cellule-raison">
                    {(demande.raison || '—').substring(0, 80)}
                    {(demande.raison || '').length > 80 ? '…' : ''}
                  </td>
                  <td>
                    <Badge variant={varianteStatut(demande.statut)}>
                      {libelle(demande.statut || 'en_attente')}
                    </Badge>
                  </td>
                  <td>
                    <div className="table-actions">
                      {estTraitable(demande) && (
                        <>
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => r.ouvrirTraitement('accepter', demande)}
                          >
                            Accepter
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => r.ouvrirTraitement('refuser', demande)}
                          >
                            Refuser
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bloc-pagination">
          <Pagination currentPage={r.page} totalPages={r.totalPages} onPageChange={r.setPage} />
        </div>
      </div>

      <Modal
        isOpen={r.traitement.ouvert}
        onClose={r.fermerTraitement}
        title={accepte ? 'Accepter la demande de retour' : 'Refuser la demande de retour'}
        footer={(
          <>
            <button
              className="btn btn-secondary"
              onClick={r.fermerTraitement}
              disabled={r.enregistrement}
            >
              Annuler
            </button>
            <button
              className={accepte ? 'btn btn-success' : 'btn btn-danger'}
              onClick={r.confirmerTraitement}
              disabled={r.enregistrement}
            >
              {r.enregistrement ? 'Traitement…' : (accepte ? 'Accepter' : 'Refuser')}
            </button>
          </>
        )}
      >
        <div className="form-field">
          <label className="form-label" htmlFor="reponseAdmin">
            Réponse de l&apos;administrateur
          </label>
          <textarea
            id="reponseAdmin"
            className="form-textarea"
            value={r.reponseAdmin}
            onChange={(e) => r.setReponseAdmin(e.target.value)}
            placeholder="Message optionnel à destination de l’acheteur…"
          />
        </div>
      </Modal>
    </div>
  );
}
