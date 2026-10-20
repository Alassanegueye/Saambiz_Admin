import useTitrePage from '../../hooks/useTitrePage';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';
import ConfirmModal from '../../components/common/ConfirmModal';
import SearchInput from '../../components/common/SearchInput';
import Pagination from '../../components/common/Pagination';
import TableAcheteurs from './components/TableAcheteurs';
import DetailAcheteur from './components/DetailAcheteur';
import useAcheteurs from './useAcheteurs';

/** Comptes acheteurs inscrits sur la marketplace. */
export default function AcheteursPage() {
  useTitrePage('Acheteurs — SaamBiz Admin');
  const a = useAcheteurs();

  if (a.loading) return <LoadingSpinner />;

  const suppression = a.confirmation.action === 'supprimer';
  const cible = a.nomComplet(a.confirmation.client);

  return (
    <div>

      <div className="page-header">
        <div className="page-header-left">
          <h1>Acheteurs</h1>
          <p>{a.elements.length} acheteur(s) au total</p>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">Liste des acheteurs</span>
          <SearchInput
            value={a.search}
            onChange={a.rechercher}
            placeholder="Rechercher par nom ou email…"
          />
        </div>

        <TableAcheteurs
          acheteurs={a.pageCourante}
          recherche={a.rechercheDifferee}
          onVoir={a.ouvrirDetail}
          onActiver={(c) => a.demanderConfirmation('activer', c)}
          onSupprimer={(c) => a.demanderConfirmation('supprimer', c)}
        />

        <div className="bloc-pagination">
          <Pagination currentPage={a.page} totalPages={a.totalPages} onPageChange={a.setPage} />
        </div>
      </div>

      <Modal
        isOpen={a.detailOuvert}
        onClose={() => a.setDetailOuvert(false)}
        title="Détails de l'acheteur"
        footer={(
          <button className="btn btn-secondary" onClick={() => a.setDetailOuvert(false)}>
            Fermer
          </button>
        )}
      >
        <DetailAcheteur acheteur={a.selection} />
      </Modal>

      <ConfirmModal
        isOpen={a.confirmation.ouvert}
        onClose={a.fermerConfirmation}
        onConfirm={a.executer}
        title={suppression ? "Supprimer l'acheteur" : "Activer l'acheteur"}
        message={suppression
          ? `Voulez-vous définitivement supprimer ${cible} ?`
          : `Voulez-vous activer le compte de ${cible} ?`}
        confirmLabel={suppression ? 'Supprimer' : 'Activer'}
        variant={suppression ? 'danger' : 'warning'}
      />
    </div>
  );
}
