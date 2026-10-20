import { useEffect, useState, useCallback, useMemo } from 'react';
import { toast } from '../utils/alert';
import useDebounce from './useDebounce';

/**
 * Liste chargée, filtrée et paginée — la forme de presque toutes les pages
 * d'administration.
 *
 * Elle était recopiée à l'identique dans seize fichiers : même `load`, même
 * filtre insensible à la casse, même découpe en pages, même remise à la
 * page 1. Quinze copies sur seize finissaient par ne pas recevoir les
 * corrections apportées à la seizième.
 *
 * @param {Function} charger        Appel réseau. Doit renvoyer la réponse axios.
 * @param {Object}   options
 * @param {Function} options.extraire  Sort le tableau de la réponse. Les
 *   routes de l'API n'ont pas encore toutes la même enveloppe.
 * @param {Function} options.filtrer   `(element, recherche) => bool`.
 * @param {string}   options.messageErreur
 * @param {number}   options.taillePage
 */
export default function useListeFiltree(charger, {
  extraire = (res) => res.data?.data || res.data || [],
  filtrer,
  messageErreur = 'Erreur lors du chargement',
  taillePage = 10,
} = {}) {
  const [elements, setElements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const rechercheDifferee = useDebounce(search, 300);

  const recharger = useCallback(async ({ initial = false } = {}) => {
    if (!initial) setLoading(true);
    try {
      const res = await charger();
      const liste = extraire(res);
      setElements(Array.isArray(liste) ? liste : []);
    } catch {
      toast.error(messageErreur);
    } finally {
      setLoading(false);
    }
    // `extraire` et `messageErreur` sont des constantes de la page appelante ;
    // les mettre en dépendance relancerait le chargement à chaque rendu.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [charger]);

  // `loading` vaut déjà true au montage : le premier chargement n'a rien à
  // signaler. Ne pas le faire évite aussi un rendu en cascade.
  useEffect(() => { recharger({ initial: true }); }, [recharger]);

  const filtres = useMemo(() => {
    const s = rechercheDifferee.toLowerCase().trim();
    if (!s || !filtrer) return elements;
    return elements.filter((e) => filtrer(e, s));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elements, rechercheDifferee]);

  const totalPages = Math.ceil(filtres.length / taillePage);
  const pageCourante = filtres.slice((page - 1) * taillePage, page * taillePage);

  /** Toute recherche ramène en page 1 : sinon on affiche une page vide. */
  const rechercher = (valeur) => {
    setSearch(valeur);
    setPage(1);
  };

  return {
    elements, setElements, loading, recharger,
    search, rechercher, rechercheDifferee,
    page, setPage, totalPages, pageCourante,
    total: filtres.length,
  };
}
