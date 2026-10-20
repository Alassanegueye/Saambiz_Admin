import Badge from '../../../components/common/Badge';
import { formatDate, formatMontant, formatStatut } from '../../../utils/formatters';
import {
  referenceCommande, varianteStatut, nomClient, paiement, libelle,
  MODES_LIVRAISON, MODES_PAIEMENT, STATUTS,
} from '../useCommandes';

const statutLisible = (s) => STATUTS.find((x) => x.value === s)?.label || formatStatut(s);

/** Fiche complète d'une commande : boutique, client, articles, montants. */
export default function DetailCommande({ commande: c }) {
  if (!c) return null;
  const p = paiement(c.statutPaiement);
  const telephone = c.acheteur?.telephone || c.clientTelephone || c.numeroTelephone;

  return (
    <div>
      <div className="entete-commande">
        <div>
          <div className="entete-personne-nom">{referenceCommande(c)}</div>
          <div className="entete-personne-email">{formatDate(c.createdAt)} · {c.boutique?.nom || '—'}</div>
        </div>
        <div className="entete-produit-badges">
          <Badge variant={varianteStatut(c.statut)}>{statutLisible(c.statut)}</Badge>
          <Badge variant={p.variante}>{p.label}</Badge>
        </div>
      </div>

      <div className="detail-grid">
        <div className="detail-item"><label>Boutique</label><span>{c.boutique?.nom || '—'}</span></div>
        <div className="detail-item">
          <label>Vendeur</label>
          <span>{c.vendeur ? `${c.vendeur.prenom || ''} ${c.vendeur.nom || ''}`.trim() : '—'}</span>
        </div>
        <div className="detail-item">
          <label>Client</label>
          <span>{nomClient(c)}{!c.acheteur && <span className="td-muted"> (sans compte)</span>}</span>
        </div>
        <div className="detail-item"><label>Téléphone</label><span>{telephone || '—'}</span></div>
        <div className="detail-item"><label>Livraison</label><span>{libelle(MODES_LIVRAISON, c.modeLivraison)}</span></div>
        <div className="detail-item"><label>Paiement</label><span>{libelle(MODES_PAIEMENT, c.modePaiement)}</span></div>
        {c.adresseLivraison && (
          <div className="detail-item full"><label>Adresse</label><span>{c.adresseLivraison}</span></div>
        )}
        {c.note && <div className="detail-item full"><label>Note</label><span>{c.note}</span></div>}
      </div>

      {Array.isArray(c.lignes) && c.lignes.some((l) => l.nomProduit) && (
        <div className="table-wrap lignes-commande">
          <table className="data-table">
            <thead><tr><th>Article</th><th>Prix</th><th>Qté</th><th>Sous-total</th></tr></thead>
            <tbody>
              {c.lignes.map((l) => (
                <tr key={l.id}>
                  <td className="td-bold">{l.nomProduit}</td>
                  <td className="td-muted">{formatMontant(l.prixUnitaire)}</td>
                  <td className="td-muted">{l.quantite}</td>
                  <td className="td-bold">{formatMontant(l.sousTotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="totaux-commande">
        <div><span>Produits</span><span>{formatMontant(c.montantProduits)}</span></div>
        <div><span>Livraison</span><span>{formatMontant(c.fraisLivraison)}</span></div>
        <div className="total"><span>Total</span><span>{formatMontant(c.montantTotal)}</span></div>
      </div>
    </div>
  );
}
