import { createContext } from 'react';

/**
 * Contexte des permissions, isolé de son fournisseur.
 *
 * Un fichier qui exporte autre chose qu'un composant casse le rafraîchissement
 * à chaud de Vite : le contexte vit donc ici, le fournisseur dans
 * PermissionsContext.jsx.
 */
export const PermissionsContext = createContext(null);
