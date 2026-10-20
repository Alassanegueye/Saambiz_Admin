import { useEffect } from 'react';

/**
 * Titre de l'onglet pour la page courante.
 *
 * Remplace `react-helmet` : la bibliothèque n'est plus maintenue, s'appuie
 * sur des cycles de vie dépréciés (avertissements en StrictMode) et pesait
 * 17 ko — tout cela pour poser `document.title`. Ce hook fait la même chose
 * en dix lignes, et rend le titre précédent en quittant la page.
 */
export default function useTitrePage(titre) {
  useEffect(() => {
    const precedent = document.title;
    document.title = titre;
    return () => { document.title = precedent; };
  }, [titre]);
}
