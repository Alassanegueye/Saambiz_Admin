import { useState, useCallback } from 'react';
import { toast, showConfirm } from '../../utils/alert';
import {
  getCommande, creerCommande, modifierCommande, supprimerCommande,
} from '../../service/catalogue.service';
import { useSearchParams } from 'react-router-dom';
import { getCommandes } from '../../service/commandes.service';
import useListeServeur from '../../hooks/useListeServeur';

/**
 * Contrôleur de la page Commandes (administration).
 *
 * Le statut ET la pagination partent au serveur — la table grossit vite —
 * tandis que la recherche par référence ou par nom s'applique à la page
 * affichée (voir useListeServeur).
 */

// Les valeurs sont celles de l'énumération du backend (TRANSITIONS dans
// commande.service.js). La liste proposait « en_cours », qui n'y existe pas :
// PostgreSQL rejetait la valeur et le filtre renvoyait une erreur.
export const STATUTS = [
  { value: '',               label: 'Tous les statuts' },
  { value: 'en_attente',     label: 'En attente' },
  { value: 'confirmee',      label: 'Confirmée' },
  { value: 'en_preparation', label: 'En préparation' },
  { value: 'prete',          label: 'Prête' },
  { value: 'en_livraison',   label: 'En livraison' },
  { value: 'livree',         label: 'Livrée' },
  { value: 'annulee',        label: 'Annulée' },
];

/** Référence lisible : le backend l'expose sous `referenceCommande`. */
export const referenceCommande = (c) => c?.referenceCommande || c?.ref || `#${c?.id}`;

/** Le backend n'a pas normalisé ses statuts : accents et synonymes cohabitent. */
export function varianteStatut(statut) {
  const s = (statut || '').toLowerCase();
  if (['livree', 'livré', 'livrée', 'traite'].includes(s)) return 'success';
  if (['annulee', 'annulée', 'refuse', 'refusee'].includes(s)) return 'danger';
  if (['en_cours', 'en cours', 'confirmee', 'en_preparation', 'prete', 'en_livraison'].includes(s)) return 'warning';
  return 'info';
}

/** Acheteur et vendeur arrivent tantôt en chaîne, tantôt en objet. */
export const STATUTS_PAIEMENT = [
  { value: 'non_paye', label: 'Non payée', variante: 'warning' },
  { value: 'paye', label: 'Payée', variante: 'success' },
  { value: 'rembourse', label: 'Remboursée', variante: 'info' },
];
export const paiement = (v) => STATUTS_PAIEMENT.find((s) => s.value === v) || { label: v || '—', variante: 'default' };

export const MODES_LIVRAISON = [
  { value: 'livraison', label: 'Livraison' },
  { value: 'retrait', label: 'Retrait en boutique' },
];
export const MODES_PAIEMENT = [
  { value: 'a_la_livraison', label: 'À la livraison' },
  { value: 'en_ligne', label: 'En ligne' },
];
export const libelle = (liste, v) => liste.find((x) => x.value === v)?.label || v || '—';

/** Client : un compte acheteur, ou les coordonnées d'un client sans compte. */
export const nomClient = (c) => {
  if (c?.acheteur) return nomPersonne(c.acheteur);
  const libre = `${c?.clientPrenom || ''} ${c?.clientNom || ''}`.trim();
  return libre || c?.clientTelephone || '—';
};

export const nomPersonne = (valeur) => {
  if (typeof valeur === 'string') return valeur || '—';
  const complet = `${valeur?.prenom || ''} ${valeur?.nom || ''}`.trim();
  return complet || valeur?.email || '—';
};

export default function useCommandes() {
  // `?statut=livree` ou `?boutiqueId=…` : ouverture depuis le tableau de bord.
  const [params, setParams] = useSearchParams();
  const statutFiltre = params.get('statut') || '';
  const boutiqueId = params.get('boutiqueId') || '';

  const charger = useCallback(
    ({ page, limit }) => getCommandes({
      page,
      limit,
      ...(statutFiltre ? { statut: statutFiltre } : {}),
      ...(boutiqueId ? { boutiqueId } : {}),
    }),
    [statutFiltre, boutiqueId]
  );

  const liste = useListeServeur(charger, {
    extraire: (res) => res.data?.commandes || res.data?.data || res.data || [],
    extraireTotal: (res) => res.data?.pagination?.total,
    filtrer: (c, s) =>
      referenceCommande(c).toLowerCase().includes(s)
      || nomClient(c).toLowerCase().includes(s)
      || (c.boutique?.nom || '').toLowerCase().includes(s),
    messageErreur: 'Erreur lors du chargement des commandes',
  });

  const majParam = (cle, valeur) => {
    const suivants = new URLSearchParams(params);
    if (valeur) suivants.set(cle, valeur); else suivants.delete(cle);
    setParams(suivants, { replace: true });
    liste.setPage(1);
  };

  // ── Consultation : la fiche complète (lignes, client) vient du serveur ──
  const [selection, setSelection] = useState(null);
  const voir = async (cmd) => {
    setSelection(cmd);
    try {
      const res = await getCommande(cmd.id);
      setSelection(res.data?.commande || cmd);
    } catch (err) {
      toast.error(err, 'Impossible de charger la commande');
    }
  };

  // ── Création / modification ──
  const [creation, setCreation] = useState({ ouvert: false, cle: 0 });
  const ouvrirCreation = () => setCreation((c) => ({ ouvert: true, cle: c.cle + 1 }));
  const fermerCreation = () => setCreation((c) => ({ ...c, ouvert: false }));

  const [edition, setEdition] = useState({ ouvert: false, commande: null, cle: 0 });
  const ouvrirModification = (commande) => setEdition((e) => ({ ouvert: true, commande, cle: e.cle + 1 }));
  const fermerModification = () => setEdition((e) => ({ ...e, ouvert: false }));

  const creer = async (donnees) => {
    try {
      const res = await creerCommande(donnees);
      toast.success(`Commande ${referenceCommande(res.data?.commande)} créée`);
      fermerCreation();
      await liste.recharger();
    } catch (err) {
      toast.error(err, 'Erreur lors de la création de la commande');
    }
  };

  const modifier = async (donnees) => {
    try {
      const res = await modifierCommande(edition.commande.id, donnees);
      toast.success('Commande mise à jour');
      fermerModification();
      if (selection?.id === edition.commande.id) setSelection(res.data?.commande || null);
      await liste.recharger();
    } catch (err) {
      toast.error(err, 'Erreur lors de la mise à jour de la commande');
    }
  };

  const supprimer = async (cmd) => {
    const ok = await showConfirm({
      titre: 'Supprimer la commande',
      message: `Supprimer définitivement la commande ${referenceCommande(cmd)} ? Le stock réservé est rendu à la boutique.`,
      confirmText: 'Supprimer',
      danger: true,
    });
    if (!ok) return;
    try {
      await supprimerCommande(cmd.id);
      toast.success('Commande supprimée');
      setSelection(null);
      await liste.recharger();
    } catch (err) {
      toast.error(err, 'Erreur lors de la suppression de la commande');
    }
  };

  return {
    ...liste,
    statutFiltre, filtrerParStatut: (v) => majParam('statut', v),
    boutiqueId, filtrerParBoutique: (v) => majParam('boutiqueId', v),
    selection, voir, fermerDetail: () => setSelection(null),
    creation, ouvrirCreation, fermerCreation, creer,
    edition, ouvrirModification, fermerModification, modifier,
    supprimer,
  };
}
