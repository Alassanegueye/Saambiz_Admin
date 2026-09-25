import { useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import {
  getVendeurs,
  abonnementManuel,
  suspendreVendeur,
  supprimerUtilisateur,
  activerUtilisateur,
  verifierVendeur,
} from '../../service/admin.service';
import useListeFiltree from '../../hooks/useListeFiltree';

/**
 * Contrôleur de la page Vendeurs.
 *
 * Les actions se répartissent en deux familles : celles qui s'exécutent
 * directement (abonnement, vérification) et celles qui passent par une
 * confirmation parce qu'elles coupent l'accès du vendeur.
 */

export const nomComplet = (v) => `${v?.prenom || ''} ${v?.nom || ''}`.trim();

export function varianteStatut(actif, suspendu) {
  if (suspendu) return 'danger';
  if (actif) return 'success';
  return 'default';
}

export function libelleStatut(actif, suspendu) {
  if (suspendu) return 'Suspendu';
  if (actif) return 'Actif';
  return 'Inactif';
}

/** Textes de la modale de confirmation, par action. */
const CONFIRMATIONS = {
  suspendre: {
    titre: 'Suspendre le vendeur',
    bouton: 'Suspendre',
    variante: 'warning',
    message: (v) => `Voulez-vous suspendre le compte de ${nomComplet(v)} ?`,
  },
  activer: {
    titre: 'Réactiver le vendeur',
    bouton: 'Réactiver',
    variante: 'warning',
    message: (v) => `Voulez-vous réactiver le compte de ${nomComplet(v)} ?`,
  },
  supprimer: {
    titre: 'Supprimer le vendeur',
    bouton: 'Supprimer',
    variante: 'danger',
    message: (v) => `Voulez-vous définitivement supprimer ${nomComplet(v)} ? Cette action est irréversible.`,
  },
};

export default function useVendeurs() {
  const liste = useListeFiltree(getVendeurs, {
    extraire: (res) => res.data?.vendeurs || res.data || [],
    filtrer: (v, s) =>
      (v.nom || '').toLowerCase().includes(s)
      || (v.prenom || '').toLowerCase().includes(s)
      || (v.email || '').toLowerCase().includes(s),
    messageErreur: 'Erreur lors du chargement des vendeurs',
  });

  const [selection, setSelection] = useState(null);
  const [detailOuvert, setDetailOuvert] = useState(false);
  const [confirmation, setConfirmation] = useState({ ouvert: false, action: null, vendeur: null });

  const ouvrirDetail = (vendeur) => { setSelection(vendeur); setDetailOuvert(true); };
  const demanderConfirmation = (action, vendeur) =>
    setConfirmation({ ouvert: true, action, vendeur });
  const fermerConfirmation = () =>
    setConfirmation({ ouvert: false, action: null, vendeur: null });

  const activerAbonnement = async (vendeur) => {
    try {
      await abonnementManuel(vendeur.id);
      toast.success(`Abonnement activé pour ${nomComplet(vendeur)}`);
      await liste.recharger();
    } catch {
      toast.error("Erreur lors de l'activation de l'abonnement");
    }
  };

  const verifier = async (vendeur) => {
    try {
      await verifierVendeur(vendeur.id);
      toast.success(`Vendeur ${nomComplet(vendeur)} vérifié`);
      await liste.recharger();
    } catch {
      toast.error('Erreur lors de la vérification du vendeur');
    }
  };

  const executer = useCallback(async () => {
    const { action, vendeur } = confirmation;
    if (!vendeur) return;
    try {
      if (action === 'suspendre') {
        await suspendreVendeur(vendeur.id);
        toast.success(`Vendeur ${nomComplet(vendeur)} suspendu`);
      } else if (action === 'activer') {
        await activerUtilisateur(vendeur.id);
        toast.success(`Vendeur ${nomComplet(vendeur)} activé`);
      } else if (action === 'supprimer') {
        await supprimerUtilisateur(vendeur.id);
        toast.success(`Vendeur ${nomComplet(vendeur)} supprimé`);
      }
      fermerConfirmation();
      await liste.recharger();
    } catch {
      const messages = {
        suspendre: 'Erreur lors de la suspension',
        activer: "Erreur lors de l'activation",
        supprimer: 'Erreur lors de la suppression',
      };
      toast.error(messages[action] || 'Erreur lors du traitement');
    }
  }, [confirmation, liste]);

  const textesConfirmation = CONFIRMATIONS[confirmation.action] || null;

  return {
    ...liste,
    selection, detailOuvert, setDetailOuvert, ouvrirDetail,
    activerAbonnement, verifier,
    confirmation, demanderConfirmation, fermerConfirmation, executer, textesConfirmation,
  };
}
