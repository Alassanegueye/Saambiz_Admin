import useTitrePage from '../../hooks/useTitrePage';
import useBoutiques, { libelleBoutique } from '../../hooks/useBoutiques';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import SearchInput from '../../components/common/SearchInput';
import Pagination from '../../components/common/Pagination';
import { formatDate, formatMontant, formatStatut } from '../../utils/formatters';
import useCommandes, {
  STATUTS, varianteStatut, nomClient, referenceCommande, paiement,
} from './useCommandes';
import DetailCommande from './components/DetailCommande';
import FormulaireCommande from './components/FormulaireCommande';
import EditionCommande from './components/EditionCommande';

const statutLisible = (s) => STATUTS.find((x) => x.value === s)?.label || formatStatut(s);

/** Commandes de toutes les boutiques : consulter, créer, modifier, supprimer. */
export default function CommandesPage() {
  useTitrePage('Commandes — SaamBiz Admin');
  const c = useCommandes();
  const boutiques = useBoutiques();

  if (c.loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Commandes</h1>
          <p>{c.total} commande(s) au total</p>
        </div>
        <button className="btn btn-primary" onClick={c.ouvrirCreation}>+ Nouvelle commande</button>
      </div>

      <div className="card">
        <div className="card-header card-header-recherche">
          <SearchInput value={c.search} onChange={c.rechercher} placeholder="Rechercher par référence, client, boutique…" />
          <div className="groupe-filtres">
            <select
              className="form-select filter-select"
              value={c.boutiqueId}
              onChange={(e) => c.filtrerParBoutique(e.target.value)}
              aria-label="Filtrer par boutique"
            >
              <option value="">Toutes les boutiques</option>
              {boutiques.map((b) => <option key={b.id} value={b.id}>{libelleBoutique(b)}</option>)}
            </select>
            <select
              className="form-select filter-select"
              value={c.statutFiltre}
              onChange={(e) => c.filtrerParStatut(e.target.value)}
              aria-label="Filtrer par statut"
            >
              {STATUTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
        </div>

        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Référence</th>
                <th>Boutique</th>
                <th>Client</th>
                <th>Montant</th>
                <th>Statut</th>
                <th>Paiement</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {c.pageCourante.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    <div className="empty-state">
                      <p>
                        {c.rechercheDifferee
                          ? `Aucun résultat pour « ${c.rechercheDifferee} »`
                          : 'Aucune commande pour ce filtre'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : c.pageCourante.map((cmd) => {
                const p = paiement(cmd.statutPaiement);
                return (
                  <tr key={cmd.id}>
                    <td className="td-bold">{referenceCommande(cmd)}</td>
                    <td className="td-muted">{cmd.boutique?.nom || '—'}</td>
                    <td className="td-muted">{nomClient(cmd)}</td>
                    <td className="td-bold">{formatMontant(cmd.montantTotal)}</td>
                    <td><Badge variant={varianteStatut(cmd.statut)}>{statutLisible(cmd.statut)}</Badge></td>
                    <td><Badge variant={p.variante}>{p.label}</Badge></td>
                    <td className="td-muted">{formatDate(cmd.createdAt)}</td>
                    <td>
                      <div className="table-actions">
                        <button className="btn btn-ghost btn-sm" onClick={() => c.voir(cmd)}>Voir</button>
                        <button className="btn btn-ghost btn-sm" onClick={() => c.ouvrirModification(cmd)}>Modifier</button>
                        <button className="btn btn-danger btn-sm" onClick={() => c.supprimer(cmd)}>Supprimer</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="bloc-pagination">
          <Pagination currentPage={c.page} totalPages={c.totalPages} onPageChange={c.setPage} />
        </div>
      </div>

      <Modal
        isOpen={Boolean(c.selection)}
        onClose={c.fermerDetail}
        large
        title="Détail de la commande"
        footer={(
          <>
            <button className="btn btn-danger" onClick={() => c.supprimer(c.selection)}>Supprimer</button>
            <button className="btn btn-secondary" onClick={c.fermerDetail}>Fermer</button>
            <button className="btn btn-primary" onClick={() => c.ouvrirModification(c.selection)}>Modifier</button>
          </>
        )}
      >
        <DetailCommande commande={c.selection} />
      </Modal>

      <FormulaireCommande
        key={`creation-${c.creation.cle}`}
        ouvert={c.creation.ouvert}
        boutiques={boutiques}
        boutiqueParDefaut={c.boutiqueId}
        onFermer={c.fermerCreation}
        onCreer={c.creer}
      />

      <EditionCommande
        key={`edition-${c.edition.cle}`}
        ouvert={c.edition.ouvert}
        commande={c.edition.commande}
        onFermer={c.fermerModification}
        onEnregistrer={c.modifier}
      />
    </div>
  );
}
