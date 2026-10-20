import { useState, useCallback } from 'react';
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
export const nomPersonne = (valeur) => {
  if (typeof valeur === 'string') return valeur || '—';
  const complet = `${valeur?.prenom || ''} ${valeur?.nom || ''}`.trim();
  return complet || valeur?.email || '—';
};

export default function useCommandes() {
  // `?statut=livree` : ouverture depuis un compteur du tableau de bord.
  const [params] = useSearchParams();
  const [statutFiltre, setStatutFiltre] = useState(() => params.get('statut') || '');
  const [selection, setSelection] = useState(null);

  const charger = useCallback(
    ({ page, limit }) => getCommandes({
      page,
      limit,
      ...(statutFiltre ? { statut: statutFiltre } : {}),
    }),
    [statutFiltre]
  );

  const liste = useListeServeur(charger, {
    extraire: (res) => res.data?.commandes || res.data?.data || res.data || [],
    extraireTotal: (res) => res.data?.pagination?.total,
    filtrer: (c, s) =>
      referenceCommande(c).toLowerCase().includes(s)
      || nomPersonne(c.acheteur).toLowerCase().includes(s),
    messageErreur: 'Erreur lors du chargement des commandes',
  });

  const filtrerParStatut = (valeur) => {
    setStatutFiltre(valeur);
    liste.setPage(1);
  };

  return { ...liste, statutFiltre, filtrerParStatut, selection, setSelection };
}
