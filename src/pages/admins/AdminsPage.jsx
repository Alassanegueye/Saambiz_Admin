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
import FormulaireCompte from '../../components/forms/FormulaireCompte';
import AvatarPersonne from '../../components/common/AvatarPersonne';
import { formatDate, formatDateTime } from '../../utils/formatters';
import { Link } from 'react-router-dom';

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
            + Ajouter un administrateur
          </button>
        </div>

        <div className="card">
          <div className="card-header card-header-recherche">
            <SearchInput value={a.search} onChange={a.rechercher} placeholder="Rechercher par nom ou email…" />
          </div>

          <TableAdmins
            admins={a.pageCourante}
            recherche={a.rechercheDifferee}
            onVoir={a.voir}
            onModifier={a.ouvrirModification}
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
          large
          title={`Accès de ${a.adminSelectionne?.prenom || ''} ${a.adminSelectionne?.nom || ''}`.trim()}
          description="L'administrateur ne verra que ces pages dans le dashboard."
          footer={(
            <>
              <button className="btn btn-secondary" onClick={a.fermerPermissions} disabled={a.enregistrementPermissions}>
                Annuler
              </button>
              <button className="btn btn-primary" onClick={a.enregistrerPermissions} disabled={a.enregistrementPermissions}>
                {a.enregistrementPermissions ? 'Enregistrement…' : 'Enregistrer'}
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

        <Modal
          isOpen={Boolean(a.selection)}
          onClose={a.fermerDetail}
          title="Détails de l'administrateur"
          footer={(
            <>
              <button className="btn btn-secondary" onClick={a.fermerDetail}>Fermer</button>
              <Link className="btn btn-secondary" to={`/audit-logs?admin=${a.selection?.id}&periode=tout`}>
                Voir son activité
              </Link>
              <button
                className="btn btn-primary"
                onClick={() => { const s = a.selection; a.fermerDetail(); a.ouvrirPermissions(s); }}
              >
                Permissions
              </button>
            </>
          )}
        >
          {a.selection && (
            <div>
              <div className="entete-personne">
                <AvatarPersonne personne={a.selection} grand />
                <div>
                  <div className="entete-personne-nom">{a.selection.prenom} {a.selection.nom}</div>
                  <div className="entete-personne-email">{a.selection.email}</div>
                </div>
              </div>
              <div className="detail-grid">
                <div className="detail-item">
                  <label>Première connexion</label>
                  <span>
                    {a.selection.premiereConnexion
                      ? formatDateTime(a.selection.premiereConnexion)
                      : a.selection.isFirstLogin ? 'En attente' : 'Effectuée'}
                  </span>
                </div>
                <div className="detail-item">
                  <label>Dernière connexion</label>
                  <span>{a.selection.derniereConnexion ? formatDateTime(a.selection.derniereConnexion) : '—'}</span>
                </div>
                <div className="detail-item">
                  <label>Inscrit le</label><span>{formatDate(a.selection.createdAt)}</span>
                </div>
              </div>
            </div>
          )}
        </Modal>

        <FormulaireCompte
          key={a.edition.cle}
          ouvert={a.edition.ouvert}
          compte={a.edition.compte}
          type="admin"
          onFermer={a.fermerModification}
          onEnregistrer={a.enregistrerModification}
        />

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
