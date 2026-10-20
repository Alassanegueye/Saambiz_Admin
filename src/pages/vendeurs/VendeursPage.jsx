import useTitrePage from '../../hooks/useTitrePage';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';
import SearchInput from '../../components/common/SearchInput';
import Pagination from '../../components/common/Pagination';
import FiltresStatut from '../../components/common/FiltresStatut';
import FormulaireCompte from '../../components/forms/FormulaireCompte';
import { FILTRES_STATUT } from '../../hooks/useComptes';
import useVendeurs from './useVendeurs';
import TableVendeurs from './components/TableVendeurs';
import DetailVendeur from './components/DetailVendeur';

/** Comptes vendeurs : consulter, ajouter, modifier, suspendre, supprimer. */
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
        <button className="btn btn-primary" onClick={v.ouvrirCreation}>+ Ajouter un vendeur</button>
      </div>

      <div className="card">
        <div className="card-header card-header-recherche">
          <SearchInput value={v.search} onChange={v.rechercher} placeholder="Rechercher par nom, email ou téléphone…" />
          <FiltresStatut
            options={FILTRES_STATUT.map((f) => ({ ...f, nombre: v.compteurs[f.valeur] }))}
            valeur={v.statut}
            onChange={v.choisirStatut}
          />
        </div>

        <TableVendeurs
          vendeurs={v.pageCourante}
          recherche={v.rechercheDifferee}
          filtre={v.statut}
          onVoir={v.voir}
          onModifier={v.ouvrirModification}
          onAbonnement={v.activerAbonnement}
          onVerifier={v.verifier}
          onBasculer={v.basculerStatut}
          onSupprimer={v.supprimer}
        />

        <div className="bloc-pagination">
          <Pagination currentPage={v.page} totalPages={v.totalPages} onPageChange={v.setPage} />
        </div>
      </div>

      <Modal
        isOpen={Boolean(v.selection)}
        onClose={v.fermerDetail}
        title="Détails du vendeur"
        footer={(
          <>
            <button className="btn btn-secondary" onClick={v.fermerDetail}>Fermer</button>
            <button
              className="btn btn-primary"
              onClick={() => { const s = v.selection; v.fermerDetail(); v.ouvrirModification(s); }}
            >
              Modifier
            </button>
          </>
        )}
      >
        <DetailVendeur vendeur={v.selection} />
      </Modal>

      <FormulaireCompte
        key={v.formulaire.cle}
        ouvert={v.formulaire.ouvert}
        compte={v.formulaire.compte}
        type="vendeur"
        onFermer={v.fermerFormulaire}
        onEnregistrer={v.enregistrer}
      />
    </div>
  );
}
