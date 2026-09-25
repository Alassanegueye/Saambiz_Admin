import { Helmet } from 'react-helmet';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ConfirmModal from '../../components/common/ConfirmModal';
import SearchInput from '../../components/common/SearchInput';
import Pagination from '../../components/common/Pagination';
import useAbonnements, { STATUTS, nomVendeur } from './useAbonnements';
import CarteExpirants from './components/CarteExpirants';
import TableAbonnements from './components/TableAbonnements';
import FormulaireAbonnement from './components/FormulaireAbonnement';

/** Abonnements des vendeurs à la plateforme. */
export default function AbonnementsPage() {
  const a = useAbonnements();

  if (a.loading) return <LoadingSpinner />;

  return (
    <div>
      <Helmet><title>Abonnements — SaamBiz Admin</title></Helmet>

      <div className="page-header">
        <div className="page-header-left">
          <h1>Abonnements</h1>
          <p>{a.elements.length} abonnement(s) au total</p>
        </div>
        <button className="btn btn-primary" onClick={a.ouvrirCreation}>
          + Créer abonnement manuel
        </button>
      </div>

      {!a.loadingExpirants && a.expirants.length > 0 && (
        <CarteExpirants abonnements={a.expirants} />
      )}

      <div className="card">
        <div className="card-header">
          <span className="card-title">Liste des abonnements</span>
          <div className="groupe-filtres">
            <select
              className="form-select filter-select"
              value={a.statutFiltre}
              onChange={(e) => a.filtrerParStatut(e.target.value)}
              aria-label="Filtrer par statut"
            >
              {STATUTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
            <SearchInput
              value={a.search}
              onChange={a.rechercher}
              placeholder="Rechercher par vendeur…"
            />
          </div>
        </div>

        <TableAbonnements
          abonnements={a.pageCourante}
          recherche={a.rechercheDifferee}
          onRevoquer={a.setCibleRevocation}
        />

        <div className="bloc-pagination">
          <Pagination currentPage={a.page} totalPages={a.totalPages} onPageChange={a.setPage} />
        </div>
      </div>

      <FormulaireAbonnement
        ouvert={a.creationOuverte}
        valeurs={a.formulaire}
        erreurs={a.erreurs}
        enregistrement={a.enregistrement}
        onChange={a.changerChamp}
        onFermer={a.fermerCreation}
        onCreer={a.creer}
        vendeurs={a.vendeursFiltres}
        rechercheVendeur={a.rechercheVendeur}
        onRechercherVendeur={a.setRechercheVendeur}
      />

      <ConfirmModal
        isOpen={Boolean(a.cibleRevocation)}
        onClose={() => a.setCibleRevocation(null)}
        onConfirm={a.revoquer}
        title="Révoquer l'abonnement"
        message={`Voulez-vous révoquer l'abonnement de ${nomVendeur(a.cibleRevocation)} ?`}
        confirmLabel="Révoquer"
        variant="danger"
      />
    </div>
  );
}
