import { useEffect, useState, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast, showConfirm } from '../../utils/alert';
import {
  getProduitsEnAttente,
  approuverProduit,
  rejeterProduit,
} from '../../service/admin.service';
import useListeFiltree from '../../hooks/useListeFiltree';
import {
  getProduits, creerProduit, modifierProduit, supprimerProduit,
} from '../../service/catalogue.service';

/**
 * Contrôleur de la page Produits.
 *
 * Deux vues : le catalogue actif (consultation, recherche) et la file de
 * modération. La file n'est chargée qu'à l'ouverture de son onglet — la
 * plupart des visites ne concernent que le catalogue.
 */

export const TAILLE_PAGE = 10;

export const ONGLET_ACTIFS = 'catalogue';
export const ONGLET_ATTENTE = 'attente';

/** Le vendeur arrive imbriqué et parfois incomplet. */
export const nomVendeur = (produit) => {
  const v = produit?.vendeur;
  if (!v) return '—';
  return `${v.prenom || ''} ${v.nom || ''}`.trim() || '—';
};

/** La catégorie est tantôt un objet, tantôt un simple libellé. */
export const nomCategorie = (produit) => produit?.categorie?.nom || produit?.categorieNom || '—';

export const nomBoutique = (produit) => produit?.boutique?.nom || '—';

/** En vente : disponible ET en stock. */
export const estDisponible = (p) => Boolean(p?.disponible) && Number(p?.quantite) > 0;

export const libelleDisponibilite = (p) => {
  if (!p?.disponible) return { texte: 'Masqué', variante: 'default' };
  if (Number(p?.quantite) <= 0) return { texte: 'Rupture', variante: 'danger' };
  return { texte: 'En vente', variante: 'success' };
};

export const FILTRES_PRODUITS = [
  { valeur: '', libelle: 'Tous' },
  { valeur: 'disponibles', libelle: 'En vente' },
  { valeur: 'indisponibles', libelle: 'Indisponibles' },
];

export default function useProduits() {
  const [onglet, setOnglet] = useState(ONGLET_ACTIFS);

  // ── Catalogue : toutes les boutiques, filtres lus dans l'adresse ──
  // (?boutiqueId=… et ?statut=disponibles : c'est ainsi que le compteur
  // « Produits actifs » du tableau de bord ouvre la liste concernée).
  const [params, setParams] = useSearchParams();
  const boutiqueId = params.get('boutiqueId') || '';
  const statut = ['disponibles', 'indisponibles'].includes(params.get('statut')) ? params.get('statut') : '';

  const catalogue = useListeFiltree(getProduits, {
    extraire: (res) => res.data?.produits || [],
    messageErreur: 'Erreur lors du chargement des produits',
    taillePage: TAILLE_PAGE,
  });

  const filtres = useMemo(() => {
    const s = catalogue.rechercheDifferee.toLowerCase().trim();
    return catalogue.elements.filter((p) => {
      if (boutiqueId && p.boutique?.id !== boutiqueId) return false;
      if (statut === 'disponibles' && !estDisponible(p)) return false;
      if (statut === 'indisponibles' && estDisponible(p)) return false;
      if (!s) return true;
      return [p.nom, p.marque, p.categorie?.nom, p.boutique?.nom, nomVendeur(p)]
        .some((v) => (v || '').toLowerCase().includes(s));
    });
  }, [catalogue.elements, catalogue.rechercheDifferee, boutiqueId, statut]);

  const totalPages = Math.max(1, Math.ceil(filtres.length / TAILLE_PAGE));
  const pageCourante = filtres.slice((catalogue.page - 1) * TAILLE_PAGE, catalogue.page * TAILLE_PAGE);

  const majParam = (cle, valeur) => {
    const suivants = new URLSearchParams(params);
    if (valeur) suivants.set(cle, valeur); else suivants.delete(cle);
    setParams(suivants, { replace: true });
    catalogue.setPage(1);
  };

  const sansStatut = catalogue.elements.filter((p) => !boutiqueId || p.boutique?.id === boutiqueId);
  const compteurs = {
    '': sansStatut.length,
    disponibles: sansStatut.filter(estDisponible).length,
    indisponibles: sansStatut.filter((p) => !estDisponible(p)).length,
  };

  const [selection, setSelection] = useState(null);
  const [formulaire, setFormulaire] = useState({ ouvert: false, produit: null, cle: 0 });
  const ouvrirCreation = () => setFormulaire((f) => ({ ouvert: true, produit: null, cle: f.cle + 1 }));
  const ouvrirModification = (produit) => setFormulaire((f) => ({ ouvert: true, produit, cle: f.cle + 1 }));
  const fermerFormulaire = () => setFormulaire((f) => ({ ...f, ouvert: false }));

  const enregistrer = async (valeurs, image) => {
    try {
      if (formulaire.produit?.id) await modifierProduit(formulaire.produit.id, valeurs, image);
      else await creerProduit(valeurs, image);
      toast.success(formulaire.produit ? 'Produit mis à jour' : 'Produit ajouté');
      fermerFormulaire();
      await catalogue.recharger();
    } catch (err) {
      toast.error(err, "Erreur lors de l'enregistrement du produit");
    }
  };

  const supprimer = async (produit) => {
    const ok = await showConfirm({
      titre: 'Supprimer le produit',
      message: `Supprimer définitivement « ${produit.nom} » de la boutique ${nomBoutique(produit)} ?`,
      confirmText: 'Supprimer',
      danger: true,
    });
    if (!ok) return;
    try {
      await supprimerProduit(produit.id);
      toast.success('Produit supprimé');
      setSelection(null);
      await catalogue.recharger();
    } catch (err) {
      toast.error(err, 'Erreur lors de la suppression du produit');
    }
  };

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
    catalogue, pageCourante, totalPages, total: filtres.length,
    boutiqueId, choisirBoutique: (v) => majParam('boutiqueId', v),
    statut, choisirStatut: (v) => majParam('statut', v), compteurs,
    selection, voir: setSelection, fermerDetail: () => setSelection(null),
    formulaire, ouvrirCreation, ouvrirModification, fermerFormulaire, enregistrer, supprimer,
    enAttente, loadingAttente, pageAttente, setPageAttente,
    totalPagesAttente, pageCouranteAttente,
    approuver, cibleRejet, ouvrirRejet, fermerRejet, rejeter,
    raisonRejet, setRaisonRejet, enregistrement,
  };
}
