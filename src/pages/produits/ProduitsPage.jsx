import useTitrePage from '../../hooks/useTitrePage';
import useBoutiques, { libelleBoutique } from '../../hooks/useBoutiques';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';
import SearchInput from '../../components/common/SearchInput';
import Pagination from '../../components/common/Pagination';
import FiltresStatut from '../../components/common/FiltresStatut';
import useProduits, { ONGLET_ACTIFS, ONGLET_ATTENTE, FILTRES_PRODUITS } from './useProduits';
import TableProduits from './components/TableProduits';
import TableProduitsEnAttente from './components/TableProduitsEnAttente';
import DetailProduit from './components/DetailProduit';
import FormulaireProduit from './components/FormulaireProduit';

/** Catalogue de toutes les boutiques et file de modération. */
export default function ProduitsPage() {
  useTitrePage('Produits — SaamBiz Admin');
  const p = useProduits();
  const boutiques = useBoutiques();
  const surCatalogue = p.onglet === ONGLET_ACTIFS;

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Produits</h1>
          <p>
            {surCatalogue
              ? `${p.catalogue.elements.length} produit(s) au total`
              : `${p.enAttente.length} produit(s) en attente de modération`}
          </p>
        </div>
        <button className="btn btn-primary" onClick={p.ouvrirCreation}>+ Ajouter un produit</button>
      </div>

      <div className="tabs-bar">
        <button className={`tab-btn${surCatalogue ? ' active' : ''}`} onClick={() => p.setOnglet(ONGLET_ACTIFS)}>
          Catalogue
        </button>
        <button className={`tab-btn${surCatalogue ? '' : ' active'}`} onClick={() => p.setOnglet(ONGLET_ATTENTE)}>
          En attente de modération
        </button>
      </div>

      {surCatalogue ? (
        p.catalogue.loading ? <LoadingSpinner /> : (
          <div className="card">
            <div className="card-header card-header-recherche">
              <SearchInput
                value={p.catalogue.search}
                onChange={p.catalogue.rechercher}
                placeholder="Rechercher un produit, une boutique, une catégorie…"
              />
              <div className="groupe-filtres">
                <select
                  className="form-select filter-select"
                  value={p.boutiqueId}
                  onChange={(e) => p.choisirBoutique(e.target.value)}
                  aria-label="Filtrer par boutique"
                >
                  <option value="">Toutes les boutiques</option>
                  {boutiques.map((b) => <option key={b.id} value={b.id}>{libelleBoutique(b)}</option>)}
                </select>
                <FiltresStatut
                  options={FILTRES_PRODUITS.map((f) => ({ ...f, nombre: p.compteurs[f.valeur] }))}
                  valeur={p.statut}
                  onChange={p.choisirStatut}
                />
              </div>
            </div>

            <TableProduits
              produits={p.pageCourante}
              recherche={p.catalogue.rechercheDifferee}
              onVoir={p.voir}
              onModifier={p.ouvrirModification}
              onSupprimer={p.supprimer}
            />

            <div className="bloc-pagination">
              <Pagination currentPage={p.catalogue.page} totalPages={p.totalPages} onPageChange={p.catalogue.setPage} />
            </div>
          </div>
        )
      ) : (
        p.loadingAttente ? <LoadingSpinner /> : (
          <div className="card">
            <TableProduitsEnAttente
              produits={p.pageCouranteAttente}
              onApprouver={p.approuver}
              onRejeter={p.ouvrirRejet}
            />
            <div className="bloc-pagination">
              <Pagination currentPage={p.pageAttente} totalPages={p.totalPagesAttente} onPageChange={p.setPageAttente} />
            </div>
          </div>
        )
      )}

      <Modal
        isOpen={Boolean(p.selection)}
        onClose={p.fermerDetail}
        large
        title="Détails du produit"
        footer={(
          <>
            <button className="btn btn-danger" onClick={() => p.supprimer(p.selection)}>Supprimer</button>
            <button className="btn btn-secondary" onClick={p.fermerDetail}>Fermer</button>
            <button
              className="btn btn-primary"
              onClick={() => { const s = p.selection; p.fermerDetail(); p.ouvrirModification(s); }}
            >
              Modifier
            </button>
          </>
        )}
      >
        <DetailProduit produit={p.selection} />
      </Modal>

      <FormulaireProduit
        key={p.formulaire.cle}
        ouvert={p.formulaire.ouvert}
        produit={p.formulaire.produit}
        boutiques={boutiques}
        boutiqueParDefaut={p.boutiqueId}
        onFermer={p.fermerFormulaire}
        onEnregistrer={p.enregistrer}
      />

      <Modal
        isOpen={Boolean(p.cibleRejet)}
        onClose={p.fermerRejet}
        title="Rejeter le produit"
        footer={(
          <>
            <button className="btn btn-secondary" onClick={p.fermerRejet} disabled={p.enregistrement}>Annuler</button>
            <button className="btn btn-danger" onClick={p.rejeter} disabled={p.enregistrement}>
              {p.enregistrement ? 'Rejet…' : 'Rejeter'}
            </button>
          </>
        )}
      >
        <div className="form-field">
          <label className="form-label" htmlFor="raisonRejet">
            Raison du rejet <span className="champ-requis">*</span>
          </label>
          <textarea
            id="raisonRejet"
            className="form-textarea"
            value={p.raisonRejet}
            onChange={(e) => p.setRaisonRejet(e.target.value)}
            placeholder="Expliquez pourquoi ce produit est rejeté…"
          />
        </div>
      </Modal>
    </div>
  );
}
