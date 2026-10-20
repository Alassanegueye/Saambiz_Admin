import useTitrePage from '../../hooks/useTitrePage';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';
import SearchInput from '../../components/common/SearchInput';
import Pagination from '../../components/common/Pagination';
import FiltresStatut from '../../components/common/FiltresStatut';
import FormulaireCompte from '../../components/forms/FormulaireCompte';
import { FILTRES_STATUT } from '../../hooks/useComptes';
import TableAcheteurs from './components/TableAcheteurs';
import DetailAcheteur from './components/DetailAcheteur';
import useAcheteurs from './useAcheteurs';

/** Comptes clients : consulter, ajouter, modifier, suspendre, supprimer. */
export default function AcheteursPage() {
  useTitrePage('Clients — SaamBiz Admin');
  const a = useAcheteurs();

  if (a.loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Clients</h1>
          <p>{a.elements.length} client(s) au total</p>
        </div>
        <button className="btn btn-primary" onClick={a.ouvrirCreation}>+ Ajouter un client</button>
      </div>

      <div className="card">
        <div className="card-header card-header-recherche">
          <SearchInput value={a.search} onChange={a.rechercher} placeholder="Rechercher par nom, email ou téléphone…" />
          <FiltresStatut
            options={FILTRES_STATUT.map((f) => ({ ...f, nombre: a.compteurs[f.valeur] }))}
            valeur={a.statut}
            onChange={a.choisirStatut}
          />
        </div>

        <TableAcheteurs
          acheteurs={a.pageCourante}
          recherche={a.rechercheDifferee}
          filtre={a.statut}
          onVoir={a.voir}
          onModifier={a.ouvrirModification}
          onBasculer={a.basculerStatut}
          onSupprimer={a.supprimer}
        />

        <div className="bloc-pagination">
          <Pagination currentPage={a.page} totalPages={a.totalPages} onPageChange={a.setPage} />
        </div>
      </div>

      <Modal
        isOpen={Boolean(a.selection)}
        onClose={a.fermerDetail}
        title="Détails du client"
        footer={(
          <>
            <button className="btn btn-secondary" onClick={a.fermerDetail}>Fermer</button>
            <button
              className="btn btn-primary"
              onClick={() => { const s = a.selection; a.fermerDetail(); a.ouvrirModification(s); }}
            >
              Modifier
            </button>
          </>
        )}
      >
        <DetailAcheteur acheteur={a.selection} />
      </Modal>

      <FormulaireCompte
        key={a.formulaire.cle}
        ouvert={a.formulaire.ouvert}
        compte={a.formulaire.compte}
        type="client"
        onFermer={a.fermerFormulaire}
        onEnregistrer={a.enregistrer}
      />
    </div>
  );
}
