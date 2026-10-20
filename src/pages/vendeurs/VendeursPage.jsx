import useTitrePage from '../../hooks/useTitrePage';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';
import ConfirmModal from '../../components/common/ConfirmModal';
import SearchInput from '../../components/common/SearchInput';
import Pagination from '../../components/common/Pagination';
import useVendeurs from './useVendeurs';
import TableVendeurs from './components/TableVendeurs';
import DetailVendeur from './components/DetailVendeur';

/** Comptes vendeurs de la plateforme. */
export default function VendeursPage() {
  useTitrePage('Vendeurs — SaamBiz Admin');
  const v = useVendeurs();

  if (v.loading) return <LoadingSpinner />;

  return (
    <div>

      <div className="page-header">
        <div className="page-header-left">
          <h1>Vendeurs</h1>
          <p>{v.elements.length} vendeur(s) au total</p>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">Liste des vendeurs</span>
          <SearchInput
            value={v.search}
            onChange={v.rechercher}
            placeholder="Rechercher par nom ou email…"
          />
        </div>

        <TableVendeurs
          vendeurs={v.pageCourante}
          recherche={v.rechercheDifferee}
          onVoir={v.ouvrirDetail}
          onAbonnement={v.activerAbonnement}
          onVerifier={v.verifier}
          onSuspendre={(vendeur) => v.demanderConfirmation('suspendre', vendeur)}
          onActiver={(vendeur) => v.demanderConfirmation('activer', vendeur)}
          onSupprimer={(vendeur) => v.demanderConfirmation('supprimer', vendeur)}
        />

        <div className="bloc-pagination">
          <Pagination currentPage={v.page} totalPages={v.totalPages} onPageChange={v.setPage} />
        </div>
      </div>

      <Modal
        isOpen={v.detailOuvert}
        onClose={() => v.setDetailOuvert(false)}
        title="Détails du vendeur"
        footer={(
          <button className="btn btn-secondary" onClick={() => v.setDetailOuvert(false)}>
            Fermer
          </button>
        )}
      >
        <DetailVendeur vendeur={v.selection} />
      </Modal>

      <ConfirmModal
        isOpen={v.confirmation.ouvert}
        onClose={v.fermerConfirmation}
        onConfirm={v.executer}
        title={v.textesConfirmation?.titre || ''}
        message={v.textesConfirmation?.message(v.confirmation.vendeur) || ''}
        confirmLabel={v.textesConfirmation?.bouton || 'Confirmer'}
        variant={v.textesConfirmation?.variante || 'warning'}
      />
    </div>
  );
}
