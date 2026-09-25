import { useState, useCallback } from 'react';
import { getCommandes } from '../../service/commandes.service';
import useListeFiltree from '../../hooks/useListeFiltree';

/**
 * Contrôleur de la page Commandes (administration).
 *
 * Le statut filtre côté serveur — la table grossit vite — tandis que la
 * recherche par référence ou par nom s'applique sur ce qui est chargé.
 */

export const STATUTS = [
  { value: '',           label: 'Tous les statuts' },
  { value: 'en_attente', label: 'En attente' },
  { value: 'en_cours',   label: 'En cours' },
  { value: 'livree',     label: 'Livrée' },
  { value: 'annulee',    label: 'Annulée' },
];

/** Le backend n'a pas normalisé ses statuts : accents et synonymes cohabitent. */
export function varianteStatut(statut) {
  const s = (statut || '').toLowerCase();
  if (['livree', 'livré', 'livrée', 'traite'].includes(s)) return 'success';
  if (['annulee', 'annulée', 'refuse', 'refusee'].includes(s)) return 'danger';
  if (['en_cours', 'en cours'].includes(s)) return 'warning';
  return 'info';
}

/** Acheteur et vendeur arrivent tantôt en chaîne, tantôt en objet. */
export const nomPersonne = (valeur) => {
  if (typeof valeur === 'string') return valeur || '—';
  const complet = `${valeur?.prenom || ''} ${valeur?.nom || ''}`.trim();
  return complet || valeur?.email || '—';
};

export default function useCommandes() {
  const [statutFiltre, setStatutFiltre] = useState('');
  const [selection, setSelection] = useState(null);

  const charger = useCallback(
    () => getCommandes(statutFiltre ? { statut: statutFiltre } : undefined),
    [statutFiltre]
  );

  const liste = useListeFiltree(charger, {
    extraire: (res) => res.data?.commandes || res.data?.data || res.data || [],
    filtrer: (c, s) =>
      (c.ref || '').toLowerCase().includes(s)
      || nomPersonne(c.acheteur).toLowerCase().includes(s),
    messageErreur: 'Erreur lors du chargement des commandes',
  });

  const filtrerParStatut = (valeur) => {
    setStatutFiltre(valeur);
    liste.setPage(1);
  };

  return { ...liste, statutFiltre, filtrerParStatut, selection, setSelection };
}
