import { toast } from '../../utils/alert';
import {
  getVendeurs, abonnementManuel, verifierVendeur,
  creerVendeur, modifierVendeur, suspendreVendeur, activerVendeur, supprimerVendeur,
} from '../../service/admin.service';
import useComptes, { nomComplet, estActif } from '../../hooks/useComptes';

export { nomComplet, estActif };

export function varianteStatut(actif) {
  return actif ? 'success' : 'danger';
}

export function libelleStatut(actif) {
  return actif ? 'Actif' : 'Suspendu';
}

const API = {
  creer: creerVendeur,
  modifier: modifierVendeur,
  suspendre: suspendreVendeur,
  activer: activerVendeur,
  supprimer: supprimerVendeur,
};

/** Contrôleur de la page Vendeurs : gestion commune + actions propres. */
export default function useVendeurs() {
  const c = useComptes({
    charger: getVendeurs,
    extraire: (res) => res.data?.vendeurs || res.data || [],
    libelle: { singulier: 'vendeur', Singulier: 'Vendeur', pluriel: 'vendeurs' },
    api: API,
  });

  const activerAbonnement = async (vendeur) => {
    try {
      await abonnementManuel(vendeur.id);
      toast.success(`Abonnement activé pour ${nomComplet(vendeur)}`);
      await c.recharger();
    } catch (err) {
      toast.error(err, "Erreur lors de l'activation de l'abonnement");
    }
  };

  const verifier = async (vendeur) => {
    try {
      await verifierVendeur(vendeur.id);
      toast.success(`Vendeur ${nomComplet(vendeur)} vérifié`);
      await c.recharger();
    } catch (err) {
      toast.error(err, 'Erreur lors de la vérification du vendeur');
    }
  };

  return { ...c, activerAbonnement, verifier };
}
