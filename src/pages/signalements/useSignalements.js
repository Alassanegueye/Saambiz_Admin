import { useState } from 'react';
import { getSignalements } from '../../service/signalements.service';
import useListeFiltree from '../../hooks/useListeFiltree';

/**
 * Contrôleur de la page Signalements.
 *
 * Le backend a nommé le champ de motif de trois façons selon les versions —
 * `raison`, `motif`, `message`. Les lecteurs sont regroupés ici pour que la
 * page n'ait pas à connaître cet historique.
 */

export const TAILLE_PAGE = 10;

export function varianteStatut(statut) {
  if (!statut) return 'default';
  const s = statut.toLowerCase();
  if (s === 'traite' || s === 'traité') return 'success';
  if (s === 'en_cours' || s === 'en cours') return 'warning';
  return 'info';
}

/** Motif du signalement, quel que soit le nom du champ. */
export const lireMotif = (s) => s?.raison || s?.motif || s?.message || '';

/** Nom lisible d'une personne, ou repli sur son email. */
export const nomPersonne = (p) => {
  if (!p) return null;
  return `${p.prenom || ''} ${p.nom || ''}`.trim() || p.email || null;
};

/** La cible est tantôt un utilisateur, tantôt un produit. */
export const nomCible = (s) => nomPersonne(s?.cible) || s?.produit?.nom || '—';

export default function useSignalements() {
  const [selection, setSelection] = useState(null);

  const liste = useListeFiltree(getSignalements, {
    extraire: (res) => res.data?.signalements || res.data || [],
    filtrer: (s, q) =>
      lireMotif(s).toLowerCase().includes(q)
      || (s.statut || '').toLowerCase().includes(q),
    messageErreur: 'Erreur lors du chargement des signalements',
    taillePage: TAILLE_PAGE,
  });

  return { ...liste, selection, setSelection };
}
