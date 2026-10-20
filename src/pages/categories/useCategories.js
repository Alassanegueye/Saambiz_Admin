import { useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import {
  getCategories,
  createCategorie,
  updateCategorie,
  deleteCategorie,
  reordonnerCategories,
} from '../../service/categories.service';
import useListeFiltree from '../../hooks/useListeFiltree';
import { versLignes, versSpecifications } from './specifications';

/**
 * Contrôleur de la page Catégories.
 *
 * Un seul niveau de catégories : la liste est courte, on l'affiche donc en
 * entier (pas de pagination) pour pouvoir la réordonner d'un coup d'œil.
 * L'ordre affiché ici est exactement celui de l'application.
 */

const FORMULAIRE_VIDE = {
  nom: '', description: '', icone: '', image: '', active: true, specifications: [],
};

const messageErreur = (err, defaut) => err?.response?.data?.message || defaut;

export default function useCategories() {
  const [formulaireOuvert, setFormulaireOuvert] = useState(false);
  const [cibleEdition, setCibleEdition] = useState(null);
  const [formulaire, setFormulaire] = useState(FORMULAIRE_VIDE);
  const [erreurs, setErreurs] = useState({});
  const [enregistrement, setEnregistrement] = useState(false);
  const [cibleSuppression, setCibleSuppression] = useState(null);
  const [remplacerPar, setRemplacerPar] = useState('');
  const [suppression, setSuppression] = useState(false);
  const [deplacement, setDeplacement] = useState(false);

  const liste = useListeFiltree(getCategories, {
    extraire: (res) => res.data?.categories || res.data || [],
    filtrer: (c, s) => `${c.nom || ''} ${c.slug || ''}`.toLowerCase().includes(s),
    messageErreur: 'Erreur lors du chargement des catégories',
    taillePage: 200,
  });

  const triees = useMemo(
    () => [...liste.elements].sort((a, b) => (a.ordre - b.ordre) || a.nom.localeCompare(b.nom)),
    [liste.elements],
  );
  const affichees = useMemo(() => {
    const s = (liste.rechercheDifferee || '').toLowerCase().trim();
    return s ? triees.filter((c) => `${c.nom} ${c.slug || ''}`.toLowerCase().includes(s)) : triees;
  }, [triees, liste.rechercheDifferee]);
  const nbMasquees = triees.filter((c) => !c.active).length;

  // ── Formulaire ──────────────────────────────────────────────────────────
  const ouvrirCreation = () => {
    setCibleEdition(null);
    setFormulaire(FORMULAIRE_VIDE);
    setErreurs({});
    setFormulaireOuvert(true);
  };

  const ouvrirEdition = (categorie) => {
    setCibleEdition(categorie);
    setFormulaire({
      nom: categorie.nom || '',
      description: categorie.description || '',
      icone: categorie.icone || '',
      image: categorie.image || '',
      active: categorie.active !== false,
      specifications: versLignes(categorie.specifications),
    });
    setErreurs({});
    setFormulaireOuvert(true);
  };

  const fermerFormulaire = () => setFormulaireOuvert(false);

  const changerSpecifications = (lignes) => setFormulaire((f) => ({ ...f, specifications: lignes }));

  const changerChamp = (e) => {
    const { name, value, type, checked } = e.target;
    setFormulaire((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
    if (erreurs[name]) setErreurs((prec) => ({ ...prec, [name]: undefined }));
  };

  const valider = () => {
    const e = {};
    if (!formulaire.nom.trim()) e.nom = 'Le nom est requis';
    else if (formulaire.nom.trim().length > 60) e.nom = '60 caractères maximum';
    if (formulaire.image && !/^https?:\/\//i.test(formulaire.image.trim())) {
      e.image = 'Adresse http(s) attendue';
    }
    setErreurs(e);
    return Object.keys(e).length === 0;
  };

  const enregistrer = async () => {
    if (!valider()) return;
    setEnregistrement(true);
    const donnees = { ...formulaire, specifications: versSpecifications(formulaire.specifications) };
    try {
      if (cibleEdition) {
        await updateCategorie(cibleEdition.id, donnees);
        toast.success('Catégorie modifiée');
      } else {
        await createCategorie(donnees);
        toast.success('Catégorie créée');
      }
      setFormulaireOuvert(false);
      await liste.recharger();
    } catch (err) {
      toast.error(messageErreur(err, 'Erreur lors de la sauvegarde'));
    } finally {
      setEnregistrement(false);
    }
  };

  // ── Visibilité ──────────────────────────────────────────────────────────
  const basculerVisibilite = async (categorie) => {
    try {
      await updateCategorie(categorie.id, { active: !categorie.active });
      toast.success(categorie.active
        ? `« ${categorie.nom} » est masquée dans l'application`
        : `« ${categorie.nom} » est de nouveau visible`);
      await liste.recharger();
    } catch (err) {
      toast.error(messageErreur(err, 'Erreur lors de la mise à jour'));
    }
  };

  // ── Ordre ───────────────────────────────────────────────────────────────
  const deplacer = async (categorie, sens) => {
    const ids = triees.map((c) => c.id);
    const i = ids.indexOf(categorie.id);
    const j = i + sens;
    if (i < 0 || j < 0 || j >= ids.length) return;
    [ids[i], ids[j]] = [ids[j], ids[i]];
    setDeplacement(true);
    try {
      const res = await reordonnerCategories(ids);
      const maj = res.data?.categories;
      if (Array.isArray(maj)) liste.setElements(maj);
      else await liste.recharger();
    } catch (err) {
      toast.error(messageErreur(err, 'Erreur lors du changement d\'ordre'));
    } finally {
      setDeplacement(false);
    }
  };

  // ── Suppression / fusion ────────────────────────────────────────────────
  const demanderSuppression = (categorie) => {
    setRemplacerPar('');
    setCibleSuppression(categorie);
  };
  const annulerSuppression = () => setCibleSuppression(null);

  const supprimer = async () => {
    if (!cibleSuppression) return;
    const utilisee = (cibleSuppression.nombreProduits || 0) + (cibleSuppression.nombreBoutiques || 0) > 0;
    if (utilisee && !remplacerPar) {
      toast.error('Choisissez la catégorie qui reprend ses produits et boutiques');
      return;
    }
    setSuppression(true);
    try {
      const res = await deleteCategorie(cibleSuppression.id, utilisee ? remplacerPar : undefined);
      toast.success(res.data?.message || `Catégorie « ${cibleSuppression.nom} » supprimée`);
      setCibleSuppression(null);
      await liste.recharger();
    } catch (err) {
      toast.error(messageErreur(err, 'Erreur lors de la suppression'));
    } finally {
      setSuppression(false);
    }
  };

  return {
    ...liste,
    triees, affichees, nbMasquees,
    formulaireOuvert, cibleEdition, formulaire, erreurs, enregistrement,
    ouvrirCreation, ouvrirEdition, fermerFormulaire, changerChamp, changerSpecifications, enregistrer,
    basculerVisibilite, deplacer, deplacement,
    cibleSuppression, demanderSuppression, annulerSuppression,
    remplacerPar, setRemplacerPar, supprimer, suppression,
  };
}
