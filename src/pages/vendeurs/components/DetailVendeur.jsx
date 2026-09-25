import AvatarPersonne from '../../../components/common/AvatarPersonne';
import { formatDate } from '../../../utils/formatters';
import { libelleStatut } from '../useVendeurs';

/** Fiche d'un vendeur, dans la modale de détail. */
export default function DetailVendeur({ vendeur }) {
  if (!vendeur) return null;

  return (
    <div>
      <div className="entete-personne">
        <AvatarPersonne personne={vendeur} grand />
        <div>
          <div className="entete-personne-nom">{vendeur.prenom} {vendeur.nom}</div>
          <div className="entete-personne-email">{vendeur.email}</div>
        </div>
      </div>

      <div className="detail-grid">
        <div className="detail-item">
          <label>Téléphone</label><span>{vendeur.telephone || '—'}</span>
        </div>
        <div className="detail-item">
          <label>Ville</label><span>{vendeur.ville || '—'}</span>
        </div>
        <div className="detail-item">
          <label>Statut</label><span>{libelleStatut(vendeur.actif, vendeur.suspendu)}</span>
        </div>
        <div className="detail-item">
          <label>Abonnement</label><span>{vendeur.abonnementActif ? 'Actif' : 'Inactif'}</span>
        </div>
        <div className="detail-item">
          <label>Vérification</label><span>{vendeur.verifie ? 'Vérifié' : 'Non vérifié'}</span>
        </div>
        <div className="detail-item">
          <label>Inscription</label><span>{formatDate(vendeur.createdAt)}</span>
        </div>
        <div className="detail-item">
          <label>Boutique</label><span>{vendeur.boutiques?.nom || '—'}</span>
        </div>
        {vendeur.adresse && (
          <div className="detail-item full">
            <label>Adresse</label><span>{vendeur.adresse}</span>
          </div>
        )}
      </div>
    </div>
  );
}
