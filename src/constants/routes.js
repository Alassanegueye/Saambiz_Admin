export const ROUTES = {
  LOGIN:           '/login',
  CHANGE_PASSWORD: '/changer-mot-de-passe',
  PROFIL:          '/profil',
  DASHBOARD:       '/',
  VENDEURS:        '/vendeurs',
  ACHETEURS:       '/acheteurs',
  PRODUITS:        '/produits',
  CATEGORIES:      '/categories',
  COMMANDES:       '/commandes',
  PAIEMENTS:       '/paiements',
  ABONNEMENTS:     '/abonnements',
  MODERATION:      '/moderation',
  SIGNALEMENTS:    '/signalements',
  ADMINS:          '/admins',
  MENUS:           '/menus',
  CONFIG:          '/config',
  MESSAGES:        '/messages',
  RETOURS:         '/retours',
  AUDIT_LOGS:      '/audit-logs',
  VALIDATION_VENDEURS: '/validation-vendeurs',
};

/**
 * Espace vendeur — préfixé pour ne jamais entrer en collision avec les routes
 * d'administration. C'est là qu'atterrit le bouton « Se connecter » du site
 * vitrine quand le compte est un vendeur.
 */
/**
 * Espace vendeur : application séparée (dossier Dashboard_Vendeur), déployée
 * à sa propre adresse. On n'en garde ici que le lien, pour rediriger un
 * vendeur qui se tromperait de porte.
 */
export const URL_ESPACE_VENDEUR =
  import.meta.env.VITE_ESPACE_VENDEUR_URL || 'http://localhost:5190';
