import useTitrePage from '../../hooks/useTitrePage';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';
import SearchInput from '../../components/common/SearchInput';
import Pagination from '../../components/common/Pagination';
import useProduits, { ONGLET_ACTIFS, ONGLET_ATTENTE } from './useProduits';
import TableProduitsActifs from './components/TableProduitsActifs';
import TableProduitsEnAttente from './components/TableProduitsEnAttente';

/** Catalogue produits et file de modération. */
export default function ProduitsPage() {
  useTitrePage('Produits — SaamBiz Admin');
  const p = useProduits();
  const surActifs = p.onglet === ONGLET_ACTIFS;

  return (
    <div>

      <div className="page-header">
        <div className="page-header-left">
          <h1>Produits</h1>
          <p>
            {surActifs
              ? `${p.actifs.elements.length} produit(s) actif(s) au total`
              : `${p.enAttente.length} produit(s) en attente de modération`}
          </p>
        </div>
      </div>

      <div className="tabs-bar">
        <button
          className={`tab-btn${surActifs ? ' active' : ''}`}
          onClick={() => p.setOnglet(ONGLET_ACTIFS)}
        >
          Produits actifs
        </button>
        <button
          className={`tab-btn${surActifs ? '' : ' active'}`}
          onClick={() => p.setOnglet(ONGLET_ATTENTE)}
        >
          En attente de modération
        </button>
      </div>

      {surActifs ? (
        p.actifs.loading ? <LoadingSpinner /> : (
          <div className="card">
            <div className="card-header card-header-recherche">
              <SearchInput
                value={p.actifs.search}
                onChange={p.actifs.rechercher}
                placeholder="Rechercher par nom, vendeur, catégorie…"
              />
            </div>

            <TableProduitsActifs
              produits={p.actifs.pageCourante}
              recherche={p.actifs.rechercheDifferee}
            />

            <div className="bloc-pagination">
              <Pagination
                currentPage={p.actifs.page}
                totalPages={p.actifs.totalPages}
                onPageChange={p.actifs.setPage}
              />
            </div>
          </div>
        )
      ) : (
        p.loadingAttente ? <LoadingSpinner /> : (
          <div className="card">
            <div className="card-header">
              <span className="card-title">Produits en attente de modération</span>
            </div>

            <TableProduitsEnAttente
              produits={p.pageCouranteAttente}
              onApprouver={p.approuver}
              onRejeter={p.ouvrirRejet}
            />

            <div className="bloc-pagination">
              <Pagination
                currentPage={p.pageAttente}
                totalPages={p.totalPagesAttente}
                onPageChange={p.setPageAttente}
              />
            </div>
          </div>
        )
      )}

      <Modal
        isOpen={Boolean(p.cibleRejet)}
        onClose={p.fermerRejet}
        title="Rejeter le produit"
        footer={(
          <>
            <button className="btn btn-secondary" onClick={p.fermerRejet} disabled={p.enregistrement}>
              Annuler
            </button>
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
