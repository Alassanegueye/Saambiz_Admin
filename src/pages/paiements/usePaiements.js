import { useState, useCallback } from 'react';
import { getPaiements, getPaiementsEchecs } from '../../service/paiements.service';
import useListeServeur from '../../hooks/useListeServeur';

/**
 * Contrôleur de la page Paiements.
 *
 * Deux listes chargées d'emblée, pas au changement d'onglet : le compteur
 * d'échecs est affiché dans l'en-tête, il doit être connu avant qu'on ouvre
 * l'onglet correspondant.
 */

/** Le backend n'a pas normalisé ses statuts : accents, tirets, synonymes. */
export function varianteStatut(statut) {
  const s = (statut || '').toLowerCase();
  if (['reussi', 'réussi', 'valide', 'validé', 'traite'].includes(s)) return 'success';
  if (['echec', 'échec', 'refuse', 'refusé'].includes(s)) return 'danger';
  if (['en_cours', 'en cours', 'en_attente'].includes(s)) return 'warning';
  return 'default';
}

const extraire = (res) => res.data?.paiements || res.data?.data || res.data || [];

const filtrer = (p, s) =>
  String(p.id || '').toLowerCase().includes(s)
  || (p.type || '').toLowerCase().includes(s)
  || (p.statut || '').toLowerCase().includes(s);

export default function usePaiements() {
  const [onglet, setOnglet] = useState('tous');

  // Pagination côté serveur : l'API ne renvoyait que les 20 derniers
  // paiements, et la page les présentait comme « le total ».
  const chargerTous = useCallback((params) => getPaiements(params), []);
  const chargerEchecs = useCallback((params) => getPaiementsEchecs(params), []);

  const tous = useListeServeur(chargerTous, {
    extraire, filtrer, messageErreur: 'Erreur lors du chargement des paiements',
  });
  const echecs = useListeServeur(chargerEchecs, {
    extraire, filtrer, messageErreur: 'Erreur lors du chargement des paiements échoués',
  });

  const courant = onglet === 'echecs' ? echecs : tous;

  const changerOnglet = (nom) => {
    setOnglet(nom);
    // Chaque onglet garde sa propre pagination, mais on revient en tête :
    // rester en page 3 en changeant de liste n'a pas de sens.
    (nom === 'echecs' ? echecs : tous).setPage(1);
  };

  return {
    onglet, changerOnglet, courant,
    nbTous: tous.total,
    nbEchecs: echecs.total,
  };
}
