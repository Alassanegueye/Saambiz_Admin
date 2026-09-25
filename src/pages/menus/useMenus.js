import { useState } from 'react';
import { toast } from 'react-toastify';
import { getMenus, creerMenu, updateMenu, supprimerMenu } from '../../service/rbac.service';
import useListeFiltree from '../../hooks/useListeFiltree';

/**
 * Contrôleur de la page Menus (entrées de navigation RBAC).
 *
 * Un menu porte le code sur lequel s'appuient les permissions : le supprimer
 * supprime aussi les permissions associées, d'où la confirmation explicite.
 */

const FORMULAIRE_VIDE = { name: '', code: '', path: '', icon: '', ordre: 0 };

export default function useMenus() {
  const [formulaireOuvert, setFormulaireOuvert] = useState(false);
  const [cibleEdition, setCibleEdition] = useState(null);
  const [formulaire, setFormulaire] = useState(FORMULAIRE_VIDE);
  const [erreurs, setErreurs] = useState({});
  const [enregistrement, setEnregistrement] = useState(false);
  const [cibleSuppression, setCibleSuppression] = useState(null);

  const liste = useListeFiltree(getMenus, {
    extraire: (res) => res.data?.menus || [],
    filtrer: (m, s) =>
      (m.name || '').toLowerCase().includes(s)
      || (m.code || '').toLowerCase().includes(s),
    messageErreur: 'Erreur lors du chargement des menus',
  });

  const ouvrirCreation = () => {
    setCibleEdition(null);
    setFormulaire(FORMULAIRE_VIDE);
    setErreurs({});
    setFormulaireOuvert(true);
  };

  const ouvrirEdition = (menu) => {
    setCibleEdition(menu);
    setFormulaire({
      name: menu.name,
      code: menu.code,
      path: menu.path,
      icon: menu.icon || '',
      ordre: menu.ordre || 0,
    });
    setErreurs({});
    setFormulaireOuvert(true);
  };

  const fermerFormulaire = () => setFormulaireOuvert(false);

  const changerChamp = (e) => {
    const { name, value } = e.target;
    setFormulaire((f) => ({ ...f, [name]: value }));
    // L'erreur disparaît dès que l'utilisateur corrige le champ concerné.
    if (erreurs[name]) setErreurs((prec) => ({ ...prec, [name]: undefined }));
  };

  const valider = () => {
    const e = {};
    if (!formulaire.name.trim()) e.name = 'Requis';
    if (!formulaire.code.trim()) e.code = 'Requis';
    if (!formulaire.path.trim()) e.path = 'Requis';
    setErreurs(e);
    return Object.keys(e).length === 0;
  };

  const enregistrer = async () => {
    if (!valider()) return;
    setEnregistrement(true);
    try {
      if (cibleEdition) {
        await updateMenu(cibleEdition.id, formulaire);
        toast.success('Menu modifié');
      } else {
        await creerMenu(formulaire);
        toast.success('Menu créé');
      }
      setFormulaireOuvert(false);
      await liste.recharger();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Erreur lors de la sauvegarde');
    } finally {
      setEnregistrement(false);
    }
  };

  const supprimer = async () => {
    try {
      await supprimerMenu(cibleSuppression.id);
      toast.success(`Menu « ${cibleSuppression.name} » supprimé`);
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
