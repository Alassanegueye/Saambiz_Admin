import useTitrePage from '../../hooks/useTitrePage';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';
import ConfirmModal from '../../components/common/ConfirmModal';
import SearchInput from '../../components/common/SearchInput';
import Pagination from '../../components/common/Pagination';
import useAdmins from './useAdmins';
import TableAdmins from './components/TableAdmins';
import FormulaireAdmin from './components/FormulaireAdmin';
import GrillePermissions from './components/GrillePermissions';

/** Comptes administrateurs et leurs droits (RBAC). */
export default function AdminsPage() {
  useTitrePage('Administrateurs — SaamBiz Admin');
  const a = useAdmins();

  if (a.loading) return <LoadingSpinner />;

  return (
    <>
      <div>
        <div className="page-header">
          <div className="page-header-left">
            <h1>Administrateurs</h1>
            <p>{a.elements.length} administrateur(s) au total</p>
          </div>
          <button className="btn btn-primary" onClick={a.ouvrirCreation}>
            + Nouvel administrateur
          </button>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">Liste des administrateurs</span>
            <SearchInput value={a.search} onChange={a.rechercher} placeholder="Rechercher…" />
          </div>

          <TableAdmins
            admins={a.pageCourante}
            recherche={a.rechercheDifferee}
            onPermissions={a.ouvrirPermissions}
            onSupprimer={a.setCibleSuppression}
          />

          <div className="bloc-pagination">
            <Pagination currentPage={a.page} totalPages={a.totalPages} onPageChange={a.setPage} />
          </div>
        </div>

        <FormulaireAdmin
          ouvert={a.creationOuverte}
          valeurs={a.formulaire}
          erreurs={a.erreurs}
          enregistrement={a.enregistrement}
          onChange={a.changerChamp}
          onFermer={a.fermerCreation}
          onCreer={a.creer}
          menus={a.menus}
          permissions={a.permissions}
          onChangerPermission={a.changerPermission}
        />

        <Modal
          isOpen={a.permissionsOuvertes}
          onClose={a.fermerPermissions}
          title={`Permissions — ${a.adminSelectionne?.prenom} ${a.adminSelectionne?.nom}`}
          footer={(
            <>
              <button
                className="btn btn-secondary"
                onClick={a.fermerPermissions}
                disabled={a.enregistrementPermissions}
              >
                Annuler
              </button>
              <button
                className="btn btn-primary"
                onClick={a.enregistrerPermissions}
                disabled={a.enregistrementPermissions}
              >
                {a.enregistrementPermissions ? 'Sauvegarde…' : 'Enregistrer'}
              </button>
            </>
          )}
        >
          <GrillePermissions
            menus={a.menus}
            permissions={a.permissionsEditees}
            onChange={a.changerPermissionEditee}
          />
        </Modal>

        <ConfirmModal
          isOpen={Boolean(a.cibleSuppression)}
          onClose={() => a.setCibleSuppression(null)}
          onConfirm={a.supprimer}
          title="Supprimer l'administrateur"
          message={`Voulez-vous supprimer ${a.cibleSuppression?.prenom} ${a.cibleSuppression?.nom} ? Cette action est irréversible.`}
          confirmLabel="Supprimer"
          variant="danger"
        />
      </div>
    </>
  );
}
