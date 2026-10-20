import { useState } from 'react';
import { toast } from '../../utils/alert';
import {
  getProduitsEnAttente,
  approuverProduit,
  rejeterProduit,
} from '../../service/moderation.service';
import useListeFiltree from '../../hooks/useListeFiltree';

/**
 * Contrôleur de la modération des produits.
 *
 * `busy` porte l'identifiant du produit en cours de traitement, pas un
 * booléen : sur une file d'attente, plusieurs décisions s'enchaînent vite, et
 * un drapeau global bloquerait toutes les lignes au lieu de la seule concernée.
 */
export default function useModeration() {
  const liste = useListeFiltree(getProduitsEnAttente, {
    extraire: (res) => res.data?.produits || res.data || [],
    filtrer: (p, s) =>
      (p.nom || '').toLowerCase().includes(s)
      || `${p.vendeur?.prenom || ''} ${p.vendeur?.nom || ''}`.toLowerCase().includes(s),
    messageErreur: 'Erreur lors du chargement des produits en attente',
    taillePage: 20,
  });

  const [busy, setBusy] = useState(null);

  const decider = async (produit, approuve) => {
    setBusy(produit.id);
    try {
      if (approuve) {
        await approuverProduit(produit.id);
        toast.success('Produit approuvé');
      } else {
        await rejeterProduit(produit.id);
        toast.success('Produit rejeté');
      }
      // Retrait local plutôt que rechargement : la file est parcourue de haut
      // en bas, un rechargement complet ferait sauter la position de lecture.
      liste.setElements((precedents) => precedents.filter((p) => p.id !== produit.id));
    } catch {
      toast.error("Échec de l'action");
    } finally {
      setBusy(null);
    }
  };

  return { ...liste, busy, decider };
}
