import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast, showConfirm } from '../utils/alert';
import useListeFiltree from './useListeFiltree';

/**
 * Logique commune aux pages Clients et Vendeurs (comme sur Yobante
 * Boutique) : recherche, filtre de statut lu dans l'adresse (?statut=actifs
 * — c'est ainsi qu'un compteur du tableau de bord ouvre la liste concernée),
 * création, modification, suspension / réactivation et suppression.
 */

export const nomComplet = (u) => `${u?.prenom || ''} ${u?.nom || ''}`.trim();

/** Le backend renvoie `statut` ('actif' | 'inactif') ; anciens champs tolérés. */
export const estActif = (u) => (u?.statut ? u.statut === 'actif' : Boolean(u?.actif) && !u?.suspendu);

export const FILTRES_STATUT = [
  { valeur: '', libelle: 'Tous' },
  { valeur: 'actifs', libelle: 'Actifs' },
  { valeur: 'inactifs', libelle: 'Suspendus' },
];

export default function useComptes({
  charger, extraire, libelle, api, // api : { creer, modifier, suspendre, activer, supprimer }
}) {
  const [params, setParams] = useSearchParams();
  const statut = ['actifs', 'inactifs'].includes(params.get('statut')) ? params.get('statut') : '';

  const liste = useListeFiltree(charger, {
    extraire,
    filtrer: (u, s) =>
      (u.nom || '').toLowerCase().includes(s)
      || (u.prenom || '').toLowerCase().includes(s)
      || (u.email || '').toLowerCase().includes(s)
      || (u.telephone || '').toLowerCase().includes(s),
    messageErreur: `Erreur lors du chargement des ${libelle.pluriel}`,
  });

  // Filtre de statut appliqué après la recherche, page ramenée à 1.
  const filtres = useMemo(() => {
    const s = liste.rechercheDifferee.toLowerCase().trim();
    return liste.elements.filter((u) => {
      if (statut === 'actifs' && !estActif(u)) return false;
      if (statut === 'inactifs' && estActif(u)) return false;
      if (!s) return true;
      return [u.nom, u.prenom, u.email, u.telephone].some((v) => (v || '').toLowerCase().includes(s));
    });
  }, [liste.elements, liste.rechercheDifferee, statut]);

  const taille = 10;
  const totalPages = Math.max(1, Math.ceil(filtres.length / taille));
  const pageCourante = filtres.slice((liste.page - 1) * taille, liste.page * taille);

  const choisirStatut = (valeur) => {
    const suivants = new URLSearchParams(params);
    if (valeur) suivants.set('statut', valeur); else suivants.delete('statut');
    setParams(suivants, { replace: true });
    liste.setPage(1);
  };

  const compteurs = {
    '': liste.elements.length,
    actifs: liste.elements.filter(estActif).length,
    inactifs: liste.elements.filter((u) => !estActif(u)).length,
  };

  // ── Détail ──
  const [selection, setSelection] = useState(null);
  const voir = (u) => setSelection(u);
  const fermerDetail = () => setSelection(null);

  // ── Formulaire (création / modification) ──
  const [formulaire, setFormulaire] = useState({ ouvert: false, compte: null, cle: 0 });
  const ouvrirCreation = () => setFormulaire((f) => ({ ouvert: true, compte: null, cle: f.cle + 1 }));
  const ouvrirModification = (u) => setFormulaire((f) => ({ ouvert: true, compte: u, cle: f.cle + 1 }));
  const fermerFormulaire = () => setFormulaire((f) => ({ ...f, ouvert: false }));

  const enregistrer = async (valeurs) => {
    try {
      const res = formulaire.compte?.id
        ? await api.modifier(formulaire.compte.id, valeurs)
        : await api.creer(valeurs);
      toast.success(res?.data?.message || (formulaire.compte ? 'Informations mises à jour' : `${libelle.Singulier} créé`));
      fermerFormulaire();
      await liste.recharger();
    } catch (err) {
      toast.error(err);
    }
  };

  // ── Actions avec confirmation ──
  const basculerStatut = async (u) => {
    const suspendre = estActif(u);
    const ok = await showConfirm({
      titre: suspendre ? `Suspendre le ${libelle.singulier}` : `Réactiver le ${libelle.singulier}`,
      message: suspendre
        ? `Suspendre ${nomComplet(u)} ? Il ne pourra plus se connecter.`
        : `Réactiver ${nomComplet(u)} ? Il retrouvera l'accès à SaamBiz.`,
      confirmText: suspendre ? 'Suspendre' : 'Réactiver',
      danger: suspendre,
    });
    if (!ok) return;
    try {
      const res = suspendre ? await api.suspendre(u.id) : await api.activer(u.id);
      toast.success(res?.data?.message || (suspendre ? 'Compte suspendu' : 'Compte réactivé'));
      await liste.recharger();
    } catch (err) {
      toast.error(err);
    }
  };

  const supprimer = async (u) => {
    const ok = await showConfirm({
      titre: `Supprimer le ${libelle.singulier}`,
      message: `Supprimer définitivement le compte de ${nomComplet(u)} (${u.email}) ? Cette action est irréversible.`,
      confirmText: 'Supprimer',
      danger: true,
    });
    if (!ok) return;
    try {
      const res = await api.supprimer(u.id);
      toast.success(res?.data?.message || 'Compte supprimé');
      await liste.recharger();
    } catch (err) {
      toast.error(err);
    }
  };

  return {
    ...liste,
    filtres, pageCourante, totalPages,
    statut, choisirStatut, compteurs,
    selection, voir, fermerDetail,
    formulaire, ouvrirCreation, ouvrirModification, fermerFormulaire, enregistrer,
    basculerStatut, supprimer,
  };
}
