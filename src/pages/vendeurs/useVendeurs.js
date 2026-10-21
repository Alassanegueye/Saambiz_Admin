import { toast, showConfirm } from '../../utils/alert';
import {
  getVendeurs, abonnementManuel, verifierVendeur, basculerSiteBoutique, supprimerSiteBoutique,
  creerVendeur, modifierVendeur, suspendreVendeur, activerVendeur, supprimerVendeur,
} from '../../service/admin.service';
import useComptes, { nomComplet, estActif } from '../../hooks/useComptes';

export { nomComplet, estActif };

/** Boutique du vendeur (une par vendeur), avec l'état de son site. */
export const boutiqueDe = (v) => (Array.isArray(v?.boutiques) ? v.boutiques[0] : v?.boutiques) || null;

const SITE_BASE = (import.meta.env.VITE_SITE_URL || 'https://www.saambiz.com').replace(/\/+$/, '');
export const adresseSite = (b) => (b?.slug ? `${SITE_BASE}/b/${b.slug}` : null);

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

  // Site web de la boutique : activé ou coupé par l'admin.
  const basculerSite = async (vendeur) => {
    const b = boutiqueDe(vendeur);
    if (!b) { toast.info("Ce vendeur n'a pas encore créé sa boutique."); return; }
    const activer = !b.vitrineActive;
    const ok = await showConfirm({
      titre: activer ? 'Activer le site' : 'Désactiver le site',
      message: activer
        ? `Mettre en ligne le site de « ${b.nom} » ? Il sera visible par tous à son adresse.`
        : `Mettre hors ligne le site de « ${b.nom} » ? La boutique reste visible dans l'application.`,
      confirmText: activer ? 'Activer' : 'Désactiver',
      danger: !activer,
    });
    if (!ok) return;
    try {
      await basculerSiteBoutique(b.id, activer);
      toast.success(activer ? `Site de « ${b.nom} » en ligne` : `Site de « ${b.nom} » hors ligne`);
      await c.recharger();
    } catch (err) {
      toast.error(err, 'Impossible de modifier le site');
    }
  };

  // Supprimer le site (présence en ligne) — les produits restent.
  const supprimerSite = async (vendeur) => {
    const b = boutiqueDe(vendeur);
    if (!b) return;
    const ok = await showConfirm({
      titre: 'Supprimer le site',
      message: `Supprimer le site de « ${b.nom} » ? Il ne sera plus accessible et ses réglages seront effacés. Les produits restent dans l'application.`,
      confirmText: 'Supprimer le site',
      danger: true,
    });
    if (!ok) return;
    try {
      await supprimerSiteBoutique(b.id);
      toast.success(`Site de « ${b.nom} » supprimé`);
      c.fermerDetail();
      await c.recharger();
    } catch (err) {
      toast.error(err, 'Impossible de supprimer le site');
    }
  };

  return { ...c, activerAbonnement, verifier, basculerSite, supprimerSite };
}
