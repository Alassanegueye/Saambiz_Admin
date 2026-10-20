import useTitrePage from '../../hooks/useTitrePage';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import SearchInput from '../../components/common/SearchInput';
import Pagination from '../../components/common/Pagination';
import ConfirmModal from '../../components/common/ConfirmModal';
import useMenus from './useMenus';
import TableMenus from './components/TableMenus';
import FormulaireMenu from './components/FormulaireMenu';

/** Entrées de navigation sur lesquelles s'appuie le RBAC. */
export default function MenusPage() {
  useTitrePage('Menus — SaamBiz Admin');
  const m = useMenus();

  if (m.loading) return <LoadingSpinner />;

  return (
    <>
      <div>
        <div className="page-header">
          <div className="page-header-left">
            <h1>Menus</h1>
            <p>{m.elements.length} menu(s) configuré(s)</p>
          </div>
          <button className="btn btn-primary" onClick={m.ouvrirCreation}>
            + Ajouter un menu
          </button>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">Liste des menus</span>
            <SearchInput value={m.search} onChange={m.rechercher} placeholder="Rechercher…" />
          </div>

          <TableMenus
            menus={m.pageCourante}
            recherche={m.rechercheDifferee}
            onModifier={m.ouvrirEdition}
            onSupprimer={m.setCibleSuppression}
          />

          <div className="bloc-pagination">
            <Pagination currentPage={m.page} totalPages={m.totalPages} onPageChange={m.setPage} />
          </div>
        </div>

        <FormulaireMenu
          ouvert={m.formulaireOuvert}
          edition={m.cibleEdition}
          valeurs={m.formulaire}
          erreurs={m.erreurs}
          enregistrement={m.enregistrement}
          onChange={m.changerChamp}
          onFermer={m.fermerFormulaire}
          onEnregistrer={m.enregistrer}
        />

        <ConfirmModal
          isOpen={Boolean(m.cibleSuppression)}
          onClose={() => m.setCibleSuppression(null)}
          onConfirm={m.supprimer}
          title="Supprimer le menu"
          message={`Voulez-vous supprimer le menu « ${m.cibleSuppression?.name} » ? Les permissions associées seront aussi supprimées.`}
          confirmLabel="Supprimer"
          variant="danger"
        />
      </div>
    </>
  );
}
