import { useContext } from 'react';
import { PermissionsContext } from '../contexts/permissionsContexte';

/**
 * Droits de l'utilisateur courant, tels que le backend les a renvoyés à la
 * connexion.
 *
 * Confort d'affichage uniquement : masquer un bouton n'empêche personne
 * d'appeler l'API. L'autorité reste `requirePermission` côté serveur.
 */
export const usePermissions = () => useContext(PermissionsContext);
