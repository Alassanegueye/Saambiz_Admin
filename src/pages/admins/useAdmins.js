import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import {
  getAdmins, creerAdmin, supprimerAdmin,
  getAdminPermissions, updateAdminPerms, getMenus,
} from '../../service/rbac.service';
import useListeFiltree from '../../hooks/useListeFiltree';

/**
 * Contrôleur de la page Administrateurs.
 *
 * Les permissions sont manipulées sous forme de dictionnaire indexé par menu
 * — c'est ce que réclament les cases à cocher — puis reconverties en tableau
 * au moment de l'envoi, format attendu par l'API.
 */

const FORMULAIRE_VIDE = { nom: '', prenom: '', email: '' };

export const ACTIONS = [
  { cle: 'canView',   label: 'Voir' },
  { cle: 'canCreate', label: 'Créer' },
  { cle: 'canUpdate', label: 'Modifier' },
  { cle: 'canDelete', label: 'Supprimer' },
];

const AUCUNE_PERMISSION = {
  canView: false, canCreate: false, canUpdate: false, canDelete: false,
};

/** Dictionnaire « menuId → permissions », toutes cases décochées. */
const grilleVide = (menus) =>
  Object.fromEntries(menus.map((m) => [m.id, { ...AUCUNE_PERMISSION }]));

/** Repasse du dictionnaire au tableau attendu par l'API. */
const enTableau = (grille) =>
  Object.entries(grille).map(([menuId, p]) => ({ menuId: parseInt(menuId, 10), ...p }));

export default function useAdmins() {
  const [menus, setMenus] = useState([]);

  const liste = useListeFiltree(getAdmins, {
    extraire: (res) => res.data?.admins || [],
    filtrer: (a, s) =>
      (a.nom || '').toLowerCase().includes(s)
      || (a.prenom || '').toLowerCase().includes(s)
      || (a.email || '').toLowerCase().includes(s),
    messageErreur: 'Erreur lors du chargement des administrateurs',
  });

  useEffect(() => {
    (async () => {
      try {
        const res = await getMenus();
        setMenus(res.data?.menus || []);
      } catch {
        toast.error('Erreur lors du chargement des menus');
      }
    })();
  }, []);

  // ── Création ──
  const [creationOuverte, setCreationOuverte] = useState(false);
  const [formulaire, setFormulaire] = useState(FORMULAIRE_VIDE);
  const [erreurs, setErreurs] = useState({});
  const [permissions, setPermissions] = useState({});
  const [enregistrement, setEnregistrement] = useState(false);

  const ouvrirCreation = () => {
    setFormulaire(FORMULAIRE_VIDE);
    setErreurs({});
    setPermissions(grilleVide(menus));
    setCreationOuverte(true);
  };

  const fermerCreation = () => setCreationOuverte(false);

  const changerChamp = (champ) => (e) => {
    setFormulaire((f) => ({ ...f, [champ]: e.target.value }));
    if (erreurs[champ]) setErreurs((prec) => ({ ...prec, [champ]: undefined }));
  };

  const changerPermission = (menuId, action, valeur) =>
    setPermissions((p) => ({ ...p, [menuId]: { ...p[menuId], [action]: valeur } }));

  const validerCreation = () => {
    const e = {};
    if (!formulaire.nom.trim()) e.nom = 'Requis';
    if (!formulaire.prenom.trim()) e.prenom = 'Requis';
    if (!formulaire.email.trim()) e.email = 'Requis';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formulaire.email)) e.email = 'Email invalide';
    setErreurs(e);
    return Object.keys(e).length === 0;
  };

  const creer = async () => {
    if (!validerCreation()) return;
    setEnregistrement(true);
    try {
      // Un menu sans aucune case cochée n'est pas transmis : le laisser
      // reviendrait à enregistrer une permission vide côté serveur.
      const permissionsUtiles = enTableau(permissions)
        .filter(({ menuId, ...actions }) => menuId && Object.values(actions).some(Boolean));
      await creerAdmin({ ...formulaire, permissions: permissionsUtiles });
      toast.success(`Administrateur ${formulaire.prenom} ${formulaire.nom} créé — email envoyé.`);
      setCreationOuverte(false);
      await liste.recharger();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Erreur lors de la création');
    } finally {
      setEnregistrement(false);
    }
  };

  // ── Édition des permissions d'un administrateur existant ──
  const [permissionsOuvertes, setPermissionsOuvertes] = useState(false);
  const [adminSelectionne, setAdminSelectionne] = useState(null);
  const [permissionsEditees, setPermissionsEditees] = useState({});
  const [enregistrementPermissions, setEnregistrementPermissions] = useState(false);

  const ouvrirPermissions = async (admin) => {
    setAdminSelectionne(admin);
    try {
      const res = await getAdminPermissions(admin.id);
      const grille = grilleVide(menus);
      (res.data?.permissions || []).forEach((p) => {
        grille[p.menuId] = {
          canView: p.canView, canCreate: p.canCreate,
          canUpdate: p.canUpdate, canDelete: p.canDelete,
        };
      });
      setPermissionsEditees(grille);
      setPermissionsOuvertes(true);
    } catch {
      toast.error('Erreur lors du chargement des permissions');
    }
  };

  const fermerPermissions = () => setPermissionsOuvertes(false);

  const changerPermissionEditee = (menuId, action, valeur) =>
    setPermissionsEditees((p) => ({ ...p, [menuId]: { ...p[menuId], [action]: valeur } }));

  const enregistrerPermissions = async () => {
    setEnregistrementPermissions(true);
    try {
      await updateAdminPerms(adminSelectionne.id, enTableau(permissionsEditees));
      toast.success('Permissions mises à jour');
      setPermissionsOuvertes(false);
    } catch {
      toast.error('Erreur lors de la mise à jour des permissions');
    } finally {
      setEnregistrementPermissions(false);
    }
  };

  // ── Suppression ──
  const [cibleSuppression, setCibleSuppression] = useState(null);

  const supprimer = async () => {
    try {
      await supprimerAdmin(cibleSuppression.id);
      toast.success(`Admin ${cibleSuppression.prenom} ${cibleSuppression.nom} supprimé`);
      setCibleSuppression(null);
      await liste.recharger();
    } catch {
      toast.error('Erreur lors de la suppression');
    }
  };

  return {
    ...liste,
    menus,
    creationOuverte, ouvrirCreation, fermerCreation,
    formulaire, erreurs, changerChamp, permissions, changerPermission,
    enregistrement, creer,
    permissionsOuvertes, adminSelectionne, ouvrirPermissions, fermerPermissions,
    permissionsEditees, changerPermissionEditee,
    enregistrementPermissions, enregistrerPermissions,
    cibleSuppression, setCibleSuppression, supprimer,
  };
}
