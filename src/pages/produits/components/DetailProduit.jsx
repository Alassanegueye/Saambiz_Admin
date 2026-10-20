import Badge from '../../../components/common/Badge';
import { formatDate, formatMontant } from '../../../utils/formatters';
import { nomCategorie, nomBoutique, nomVendeur, libelleDisponibilite } from '../useProduits';

const MODERATION = {
  approuve: { texte: 'Approuvé', variante: 'success' },
  en_attente: { texte: 'En attente', variante: 'warning' },
  rejete: { texte: 'Rejeté', variante: 'danger' },
};

/** Fiche d'un produit, dans la modale de consultation. */
export default function DetailProduit({ produit }) {
  if (!produit) return null;
  const etat = libelleDisponibilite(produit);
  const moderation = MODERATION[produit.statut] || MODERATION.approuve;

  return (
    <div>
      <div className="entete-produit">
        {produit.image
          ? <img className="image-produit" src={produit.image} alt="" />
          : <div className="image-produit vignette-vide">IMG</div>}
        <div>
          <div className="entete-personne-nom">{produit.nom}</div>
          <div className="entete-personne-email">{nomBoutique(produit)} · {nomVendeur(produit)}</div>
          <div className="entete-produit-badges">
            <Badge variant={etat.variante}>{etat.texte}</Badge>
            <Badge variant={moderation.variante}>{moderation.texte}</Badge>
          </div>
        </div>
      </div>

      <div className="detail-grid">
        <div className="detail-item"><label>Prix</label><span>{formatMontant(produit.prix)}</span></div>
        <div className="detail-item">
          <label>Prix soldé</label>
          <span>{produit.prix_promo ? formatMontant(produit.prix_promo) : '—'}</span>
        </div>
        <div className="detail-item"><label>Stock</label><span>{produit.quantite ?? 0}</span></div>
        <div className="detail-item"><label>Catégorie</label><span>{nomCategorie(produit)}</span></div>
        <div className="detail-item"><label>Marque</label><span>{produit.marque || '—'}</span></div>
        <div className="detail-item"><label>Ventes</label><span>{produit.nombre_ventes ?? 0}</span></div>
        <div className="detail-item"><label>Vues</label><span>{produit.vues ?? 0}</span></div>
        <div className="detail-item"><label>Ajouté le</label><span>{formatDate(produit.createdAt)}</span></div>
        {produit.description && (
          <div className="detail-item full"><label>Description</label><span>{produit.description}</span></div>
        )}
      </div>
    </div>
  );
}
