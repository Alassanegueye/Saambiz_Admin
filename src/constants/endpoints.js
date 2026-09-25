/**
 * Centralisation de tous les endpoints de l'API SaamBiz.
 * Toute modification d'URL backend se fait uniquement ici.
 */

export const ENDPOINTS = {

  // ── Authentification ──────────────────────────────────────────────────────
  AUTH: {
    LOGIN:               '/auth/login',
    LOGOUT:              '/auth/logout',
    REFRESH:             '/auth/refresh',
    ME:                  '/account/me',
    CHANGER_MOT_DE_PASSE: '/auth/changer-mot-de-passe',
  },

  // ── Compte de l'utilisateur connecté ──────────────────────────────────────
  COMPTE: {
    MODIFIER_PROFIL: '/account/modifier-profil',
  },

  // ── RBAC Administration ───────────────────────────────────────────────────
  RBAC: {
    // Admins
    ADMINS:            '/admin/rbac/admins',
    ADMIN_BY_ID:       (id) => `/admin/rbac/admins/${id}`,
    ADMIN_PERMISSIONS: (id) => `/admin/rbac/admins/${id}/permissions`,
    // Menus
    MENUS:             '/admin/rbac/menus',
    MENU_BY_ID:        (id) => `/admin/rbac/menus/${id}`,
  },

  // ── Administration ────────────────────────────────────────────────────────
  ADMIN: {
    // Listes (alignées sur les vraies routes backend)
    VENDEURS:                '/admin/liste-vendeurs',
    CLIENTS:                 '/admin/liste-clients',
    PRODUITS_ACTIFS:         '/admin/liste-produits-actifs',

    // Compteurs (attention : vendeurs = singulier "actif/inactif" côté backend)
    NOMBRE_VENDEURS_ACTIFS:  '/admin/nombre-vendeurs-actif',
    NOMBRE_VENDEURS_INACTIFS:'/admin/nombre-vendeurs-inactif',
    NOMBRE_PRODUITS_ACTIFS:  '/admin/nombre-produits-actifs',
    NOMBRE_CLIENTS_ACTIFS:   '/admin/nombre-clients-actifs',
    NOMBRE_CLIENTS_INACTIFS: '/admin/nombre-clients-inactifs',

    // Validation des profils vendeurs (pièce justificative)
    VENDEURS_A_VALIDER:      '/admin/vendeurs-a-valider',
    VALIDER_VENDEUR:         (id) => `/admin/vendeur/${id}/valider`,
    REJETER_VENDEUR:         (id) => `/admin/vendeur/${id}/rejeter`,

    // Actions sur vendeurs
    ABONNEMENT_MANUEL:   (vendeurId) => `/admin/abonnement-manuel/${vendeurId}`,
    SUSPENDRE_VENDEUR:   (vendeurId) => `/admin/vendeur/${vendeurId}/suspendre`,
    ACTIVER_VENDEUR:     (vendeurId) => `/admin/vendeur/${vendeurId}/activer`,
    SUSPENDRE_ACHETEUR:  (acheteurId) => `/admin/acheteur/${acheteurId}/suspendre`,
    VERIFIER_VENDEUR:    (vendeurId) => `/admin/vendeur/${vendeurId}/verifier`,

    // Actions sur utilisateurs
    SUPPRIMER_UTILISATEUR: (userId) => `/admin/supprimer-utilisateur/${userId}`,
    ACTIVER_UTILISATEUR:   (userId) => `/admin/vendeur/${userId}/activer`,

    // Modération produits
    PRODUITS_EN_ATTENTE: '/admin/produits-en-attente',
    APPROUVER_PRODUIT:   (id) => `/admin/produit/${id}/approuver`,
    REJETER_PRODUIT:     (id) => `/admin/produit/${id}/rejeter`,
    SUPPRIMER_PRODUIT:   (id) => `/admin/produit/${id}`,

    // Boutique
    SUPPRIMER_BOUTIQUE: (id) => `/admin/boutique/${id}`,

    // Statistiques avancées
    REVENUS_MENSUELS:        '/admin/revenus-mensuels',
    INSCRIPTIONS_MENSUELLES: '/admin/inscriptions-mensuelles',

    // Configuration
    PRIX_ABONNEMENT:        '/prix-abonnement',
    UPDATE_PRIX_ABONNEMENT: '/admin/prix-abonnement',

    // Commandes (e-commerce) — routes backend réelles
    COMMANDES:        '/admin/commandes',
    STATS_ECOMMERCE:  '/admin/stats-ecommerce',

    // Paiements
    PAIEMENTS:        '/admin/paiements',
    PAIEMENTS_ECHECS: '/admin/paiements/echecs',

    // Abonnements
    ABONNEMENTS:             '/admin/abonnements',
    ABONNEMENTS_EXPIRATION:  '/admin/abonnements-expiration',
    REVOQUER_ABONNEMENT:     (id) => `/admin/abonnement/${id}/revoquer`,

    // Notification globale
    NOTIFICATION_GLOBALE: '/admin/notification-globale',
  },

  // ── Commandes ─────────────────────────────────────────────────────────────
  COMMANDES: {
    LIST:            '/admin/commandes',
    STATS_ECOMMERCE: '/admin/stats-ecommerce',
  },

  // ── Abonnements ───────────────────────────────────────────────────────────
  ABONNEMENTS: {
    LIST:         '/admin/abonnements',
    CREER_MANUEL: (vendeurId) => `/admin/abonnement-manuel/${vendeurId}`,
    REVOQUER:     (id) => `/admin/abonnement/${id}/revoquer`,
    EXPIRATION:   '/admin/abonnements-expiration',
  },

  // ── Paiements ─────────────────────────────────────────────────────────────
  PAIEMENTS: {
    LIST:   '/admin/paiements',
    ECHECS: '/admin/paiements/echecs',
  },

  // ── Demandes de retour ────────────────────────────────────────────────────
  RETOURS: {
    LIST:    '/admin/demandes-retour',
    TRAITER: (id) => `/admin/demandes-retour/${id}/traiter`,
  },

  // ── Logs d'audit ──────────────────────────────────────────────────────────
  AUDIT_LOGS: {
    LIST: '/admin/audit-logs',
  },

  // ── Configuration générale ────────────────────────────────────────────────
  CONFIGS: {
    LIST:   '/admin/configs',
    CREATE: '/admin/configs',
    UPDATE: (cle) => `/admin/configs/${cle}`,
  },

  // ── Notification globale ─────────────────────────────────────────────────
  NOTIFICATION_GLOBALE: {
    ENVOYER: '/admin/notification-globale',
  },

  // ── Catégories ────────────────────────────────────────────────────────────
  CATEGORIES: {
    LIST:   '/categories/',                         // GET public
    CREATE: '/admin/ajout-categorie',               // POST (admin)
    UPDATE: (id) => `/admin/categorie/${id}`,       // PUT (admin)
    DELETE: (id) => `/admin/categorie/${id}`,       // DELETE (admin)
  },

  // ── Signalements (liste admin) ────────────────────────────────────────────
  SIGNALEMENTS: {
    LIST: '/admin/signalements',
  },

  // ── Messages clients ──────────────────────────────────────────────────────
  MESSAGES: {
    STATS:    '/admin/messages/stats',
    LIST:     '/admin/messages',
    REPONDRE: (id) => `/admin/messages/${id}/repondre`,
  },

  // ── Espace vendeur (mêmes routes que l'application mobile) ────────────────
  // Le vendeur gère sa boutique depuis le web exactement comme depuis son
  // téléphone : ce sont les endpoints /vendeur, /commandes et /promotions,
  // filtrés côté backend sur le vendeur porté par le jeton.
  VENDEUR: {
    DASHBOARD:        '/vendeur/dashboard',
    STATISTIQUES:     '/vendeur/statistiques',
    STATISTIQUES_VUES:'/vendeur/statistiques-vues',

    // Produits
    PRODUITS:         '/vendeur/liste-produits',
    RECHERCHE:        '/vendeur/recherche-produits',
    NOMBRE_PRODUITS:  '/vendeur/nombre-produit',
    AJOUT_PRODUIT:    '/vendeur/ajout-produit',
    MODIF_PRODUIT:    (id) => `/vendeur/modifier-produit/${id}`,
    SUPPR_PRODUIT:    (id) => `/vendeur/supprimer-produit/${id}`,
    DISPONIBILITE:    (id) => `/vendeur/produit/${id}/disponibilite`,
    DUPLIQUER:        (id) => `/vendeur/produit/${id}/dupliquer`,
    IMAGES:           (id) => `/vendeur/produit/${id}/images`,

    // Boutique
    MA_BOUTIQUE:      '/vendeur/ma-boutique',
    CREER_BOUTIQUE:   '/vendeur/creer-boutique',
    MODIFIER_BOUTIQUE:'/vendeur/modifier-boutique',
    BOUTIQUE_PAUSE:   '/vendeur/boutique/pause',
    BOUTIQUE_REACTIVER:'/vendeur/boutique/reactiver',

    // Abonnement
    MON_ABONNEMENT:   '/vendeur/mon-abonnement',
    RENOUVELER:       '/vendeur/initier-renouvellement',
    HISTORIQUE_PAIEMENTS: '/vendeur/historique-paiements',

    // Conversations
    CONVERSATIONS:    '/vendeur/mes-conversations',

    // Vérification du profil (pièce justificative examinée par un admin)
    SOUMETTRE_VERIFICATION: '/vendeur/soumettre-verification',
    STATUT_VERIFICATION:    '/vendeur/statut-verification',
  },

  // ── Commandes (vue vendeur) ───────────────────────────────────────────────
  COMMANDES_VENDEUR: {
    LIST:    '/commandes/vendeur',
    DETAIL:  (id) => `/commandes/${id}`,
    STATUT:  (id) => `/commandes/${id}/statut`,
  },

  // ── Promotions du vendeur ─────────────────────────────────────────────────
  PROMOTIONS: {
    LIST:   '/promotions/',
    CREATE: '/promotions/',
    UPDATE: (id) => `/promotions/${id}`,
    DELETE: (id) => `/promotions/${id}`,
  },
};
