import { formatDate } from '../../../utils/formatters';
import AvatarPersonne from '../../../components/common/AvatarPersonne';
import { estActif } from '../useAcheteurs';

/** Fiche d'un client, dans la modale de détail. */
export default function DetailAcheteur({ acheteur }) {
  if (!acheteur) return null;

  return (
    <div>
      <div className="entete-personne">
        <AvatarPersonne personne={acheteur} grand />
        <div>
          <div className="entete-personne-nom">{acheteur.prenom} {acheteur.nom}</div>
          <div className="entete-personne-email">{acheteur.email}</div>
        </div>
      </div>

      <div className="detail-grid">
        <div className="detail-item">
          <label>Téléphone</label><span>{acheteur.telephone || '—'}</span>
        </div>
        <div className="detail-item">
          <label>Statut</label><span>{estActif(acheteur) ? 'Actif' : 'Suspendu'}</span>
        </div>
        <div className="detail-item">
          <label>Inscription</label><span>{formatDate(acheteur.createdAt)}</span>
        </div>
        {acheteur.adresse && (
          <div className="detail-item full">
            <label>Adresse</label><span>{acheteur.adresse}</span>
          </div>
        )}
      </div>
    </div>
  );
}
