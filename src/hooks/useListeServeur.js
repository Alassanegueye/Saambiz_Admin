import { useEffect, useState, useCallback, useMemo } from 'react';
import { toast } from '../utils/alert';
import useDebounce from './useDebounce';

/**
 * Liste paginée CÔTÉ SERVEUR — le pendant de `useListeFiltree` pour les
 * tables qui grossissent sans limite (commandes, paiements).
 *
 * Pourquoi un second hook : `useListeFiltree` charge « toute » la liste puis
 * la découpe dans le navigateur. Or ces routes paginent côté API (20 lignes
 * par défaut). On affichait donc les 20 dernières commandes, découpées en
 * deux pages de 10, et le compteur annonçait « 20 commandes au total » :
 * tout ce qui était plus ancien était inaccessible depuis l'administration.
 *
 * Ici chaque page est demandée au serveur, et le total vient de sa réponse.
 * La recherche texte s'applique à la page affichée (l'API ne propose pas
 * encore de recherche sur ces routes) ; le filtre par statut, lui, part au
 * serveur via `charger`.
 *
 * Même forme de retour que `useListeFiltree`, pour que les pages passent de
 * l'un à l'autre sans changer leur JSX.
 *
 * @param {Function} charger  `({ page, limit }) => Promise<réponse axios>`.
 *   Doit être stable (useCallback) : un changement relance le chargement.
 * @param {Object}   options
 * @param {Function} options.extraire       Sort le tableau de la réponse.
 * @param {Function} options.extraireTotal  Sort le total de la réponse.
 * @param {Function} options.filtrer        `(element, recherche) => bool`.
 */
export default function useListeServeur(charger, {
  extraire = (res) => res.data?.data || res.data || [],
  extraireTotal = (res) => res.data?.pagination?.total ?? res.data?.total,
  filtrer,
  messageErreur = 'Erreur lors du chargement',
  taillePage = 20,
} = {}) {
  const [elements, setElements] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPageInterne] = useState(1);

  const rechercheDifferee = useDebounce(search, 300);

  const chargerPage = useCallback(async (numero) => {
    try {
      const res = await charger({ page: numero, limit: taillePage });
      const liste = extraire(res);
      const tableau = Array.isArray(liste) ? liste : [];
      setElements(tableau);
      const t = Number(extraireTotal(res));
      setTotal(Number.isFinite(t) ? t : tableau.length);
    } catch {
      toast.error(messageErreur);
    } finally {
      setLoading(false);
    }
    // `extraire*` et `messageErreur` sont des constantes de la page appelante.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [charger, taillePage]);

  // Un nouveau `charger` (filtre de statut changé) : retour en page 1. Le
  // chargement n'est lancé que par l'effet ci-dessous, une seule fois.
  useEffect(() => {
    chargerPage(page);
  }, [chargerPage, page]);

  /** Changer de page déclenche le chargement de cette page sur le serveur. */
  const setPage = useCallback((numero) => {
    setLoading(true);
    setPageInterne(numero);
  }, []);

  const recharger = useCallback(() => {
    setLoading(true);
    return chargerPage(page);
  }, [chargerPage, page]);

  const filtres = useMemo(() => {
    const s = rechercheDifferee.toLowerCase().trim();
    if (!s || !filtrer) return elements;
    return elements.filter((e) => filtrer(e, s));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elements, rechercheDifferee]);

  return {
    elements, setElements, loading, recharger,
    search, rechercher: setSearch, rechercheDifferee,
    page, setPage,
    totalPages: Math.max(1, Math.ceil(total / taillePage)),
    pageCourante: filtres,
    // Total côté serveur — pas le nombre de lignes de la page.
    total,
  };
}
