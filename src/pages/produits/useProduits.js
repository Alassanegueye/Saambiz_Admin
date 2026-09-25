import { useEffect, useState, useCallback, useMemo } from 'react';
import { toast } from 'react-toastify';
import {
  getProduitsActifs,
  getProduitsEnAttente,
  approuverProduit,
  rejeterProduit,
} from '../../service/admin.service';
import useListeFiltree from '../../hooks/useListeFiltree';

/**
 * Contrôleur de la page Produits.
 *
 * Deux vues : le catalogue actif (consultation, recherche) et la file de
 * modération. La file n'est chargée qu'à l'ouverture de son onglet — la
 * plupart des visites ne concernent que le catalogue.
 */

export const TAILLE_PAGE = 10;

export const ONGLET_ACTIFS = 'actifs';
export const ONGLET_ATTENTE = 'attente';

/** Le vendeur arrive imbriqué et parfois incomplet. */
export const nomVendeur = (produit) => {
  const v = produit?.vendeur;
  if (!v) return '—';
  return `${v.prenom || ''} ${v.nom || ''}`.trim() || '—';
};

/** La catégorie est tantôt un objet, tantôt un simple libellé. */
export const nomCategorie = (produit) => produit?.categorie?.nom || produit?.categorieNom || '—';

export default function useProduits() {
  const [onglet, setOnglet] = useState(ONGLET_ACTIFS);

  const actifs = useListeFiltree(getProduitsActifs, {
    extraire: (res) => res.data?.produits || res.data || [],
    filtrer: (p, s) =>
      (p.nom || '').toLowerCase().includes(s)
      || (p.categorie?.nom || '').toLowerCase().includes(s)
      || (p.vendeur?.nom || '').toLowerCase().includes(s),
    messageErreur: 'Erreur lors du chargement des produits',
    taillePage: TAILLE_PAGE,
  });

  const [enAttente, setEnAttente] = useState([]);
  const [loadingAttente, setLoadingAttente] = useState(true);
  const [pageAttente, setPageAttente] = useState(1);
  const [cibleRejet, setCibleRejet] = useState(null);
  const [raisonRejet, setRaisonRejet] = useState('');
  const [enregistrement, setEnregistrement] = useState(false);

  const chargerEnAttente = useCallback(async () => {
    setLoadingAttente(true);
    try {
      const res = await getProduitsEnAttente();
      const liste = res.data?.produits || res.data?.data || res.data || [];
      setEnAttente(Array.isArray(liste) ? liste : []);
    } catch {
      toast.error('Erreur lors du chargement des produits en attente');
    } finally {
      setLoadingAttente(false);
    }
  }, []);

  useEffect(() => {
    if (onglet === ONGLET_ATTENTE) chargerEnAttente();
  }, [onglet, chargerEnAttente]);

  const totalPagesAttente = Math.ceil(enAttente.length / TAILLE_PAGE);
  const pageCouranteAttente = useMemo(
    () => enAttente.slice((pageAttente - 1) * TAILLE_PAGE, pageAttente * TAILLE_PAGE),
    [enAttente, pageAttente]
  );

  const approuver = async (produit) => {
    try {
      await approuverProduit(produit.id);
      toast.success(`Produit « ${produit.nom} » approuvé`);
      await chargerEnAttente();
    } catch {
      toast.error("Erreur lors de l'approbation du produit");
    }
  };

  const ouvrirRejet = (produit) => {
    setCibleRejet(produit);
    setRaisonRejet('');
  };

  const fermerRejet = () => setCibleRejet(null);

  const rejeter = async () => {
    if (!cibleRejet) return;
    setEnregistrement(true);
    try {
      await rejeterProduit(cibleRejet.id, raisonRejet);
      toast.success(`Produit « ${cibleRejet.nom} » rejeté`);
      fermerRejet();
      await chargerEnAttente();
    } catch {
      toast.error('Erreur lors du rejet du produit');
    } finally {
      setEnregistrement(false);
    }
  };

  return {
    onglet, setOnglet,
    actifs,
    enAttente, loadingAttente, pageAttente, setPageAttente,
    totalPagesAttente, pageCouranteAttente,
    approuver, cibleRejet, ouvrirRejet, fermerRejet, rejeter,
    raisonRejet, setRaisonRejet, enregistrement,
  };
}
