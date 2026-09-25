import { useState } from 'react';
import { toast } from 'react-toastify';
import {
  getCategories,
  createCategorie,
  updateCategorie,
  deleteCategorie,
} from '../../service/categories.service';
import useListeFiltree from '../../hooks/useListeFiltree';

/** Contrôleur de la page Catégories de produits. */

const FORMULAIRE_VIDE = { nom: '', description: '' };

export default function useCategories() {
  const [formulaireOuvert, setFormulaireOuvert] = useState(false);
  const [cibleEdition, setCibleEdition] = useState(null);
  const [formulaire, setFormulaire] = useState(FORMULAIRE_VIDE);
  const [erreurs, setErreurs] = useState({});
  const [enregistrement, setEnregistrement] = useState(false);
  const [cibleSuppression, setCibleSuppression] = useState(null);

  const liste = useListeFiltree(getCategories, {
    extraire: (res) => res.data?.categories || res.data || [],
    filtrer: (c, s) => (c.nom || '').toLowerCase().includes(s),
    messageErreur: 'Erreur lors du chargement des catégories',
  });

  const ouvrirCreation = () => {
    setCibleEdition(null);
    setFormulaire(FORMULAIRE_VIDE);
    setErreurs({});
    setFormulaireOuvert(true);
  };

  const ouvrirEdition = (categorie) => {
    setCibleEdition(categorie);
    setFormulaire({ nom: categorie.nom || '', description: categorie.description || '' });
    setErreurs({});
    setFormulaireOuvert(true);
  };

  const fermerFormulaire = () => setFormulaireOuvert(false);

  const changerChamp = (e) => {
    const { name, value } = e.target;
    setFormulaire((f) => ({ ...f, [name]: value }));
    if (erreurs[name]) setErreurs((prec) => ({ ...prec, [name]: undefined }));
  };

  const valider = () => {
    const e = {};
    if (!formulaire.nom.trim()) e.nom = 'Le nom est requis';
    setErreurs(e);
    return Object.keys(e).length === 0;
  };

  const enregistrer = async () => {
    if (!valider()) return;
    setEnregistrement(true);
    try {
      if (cibleEdition) {
        await updateCategorie(cibleEdition.id, formulaire);
        toast.success('Catégorie modifiée avec succès');
      } else {
        await createCategorie(formulaire);
        toast.success('Catégorie créée avec succès');
      }
      setFormulaireOuvert(false);
      await liste.recharger();
    } catch {
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setEnregistrement(false);
    }
  };

  const supprimer = async () => {
    if (!cibleSuppression) return;
    try {
      await deleteCategorie(cibleSuppression.id);
      toast.success(`Catégorie « ${cibleSuppression.nom} » supprimée`);
      setCibleSuppression(null);
      await liste.recharger();
    } catch {
      toast.error('Erreur lors de la suppression');
    }
  };

  return {
    ...liste,
    formulaireOuvert, cibleEdition, formulaire, erreurs, enregistrement,
    ouvrirCreation, ouvrirEdition, fermerFormulaire, changerChamp, enregistrer,
    cibleSuppression, setCibleSuppression, supprimer,
  };
}
