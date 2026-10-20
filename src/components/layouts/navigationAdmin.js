/**
 * Regroupement des rubriques de l'administration, comme sur le dashboard
 * Yobante Boutique : les pages d'un même sujet vivent derrière un menu
 * dépliant (Commerce, Vendeurs, Clients, Finance, Administration), si bien
 * que toute la navigation tient sur une ligne, sans menu « Plus ».
 *
 * Les rubriques elles-mêmes restent pilotées par le RBAC (menus renvoyés
 * par l'API) : on ne fait ici que les ranger par code. Un groupe dont
 * l'administrateur ne voit qu'une page devient un lien direct ; un groupe
 * sans aucune page disparaît. Un code inconnu (menu ajouté plus tard côté
 * serveur) s'affiche en lien direct à la fin, pour ne jamais être perdu.
 *
 * Module séparé du composant : un fichier qui exporte à la fois un
 * composant et des constantes désactive le Fast Refresh de Vite.
 */
export const GROUPES = [
  { codes: ['DASHBOARD'] },
  {
    label: 'Commerce',
    icone: 'COMMANDES',
    codes: ['COMMANDES', 'PRODUITS', 'CATEGORIES'],
  },
  {
    label: 'Vendeurs',
    icone: 'VENDEURS',
    codes: ['VENDEURS', 'VALIDATION_VENDEURS', 'ABONNEMENTS'],
  },
  {
    label: 'Clients',
    icone: 'ACHETEURS',
    codes: ['ACHETEURS', 'MODERATION'],
  },
  {
    label: 'Finance',
    icone: 'PAIEMENTS',
    codes: ['PAIEMENTS'],
  },
  {
    label: 'Administration',
    icone: 'ADMINS',
    codes: ['ADMINS', 'ACTIVITE', 'CONFIG'],
  },
];

/** Phrase d'aide sous chaque page dans les menus dépliants. */
export const AIDES = {
  COMMANDES: 'Suivi et statut des commandes',
  PRODUITS: 'Catalogue de toutes les boutiques',
  CATEGORIES: 'Rangement du catalogue',
  VENDEURS: 'Comptes et boutiques',
  VALIDATION_VENDEURS: 'Pièces justificatives à examiner',
  ABONNEMENTS: 'Essais et renouvellements',
  ACHETEURS: 'Comptes clients',
  MODERATION: 'Contenus en attente de validation',
  PAIEMENTS: 'Transactions et statuts',
  ADMINS: 'Accès au dashboard',
  ACTIVITE: 'Qui a fait quoi, et quand',
  CONFIG: 'Réglages de la plateforme',
};

/**
 * Construit la navigation à partir des rubriques autorisées.
 * @param items [{ code, to, label, icon, end }]
 * @returns [{ type: 'lien', item } | { type: 'groupe', label, icone, enfants }]
 */
export function construireNavigation(items) {
  const parCode = new Map(items.map((i) => [i.code, i]));
  const ranges = new Set();
  const nav = [];

  for (const g of GROUPES) {
    const enfants = g.codes.map((c) => parCode.get(c)).filter(Boolean);
    enfants.forEach((e) => ranges.add(e.code));
    if (enfants.length === 0) continue;
    if (!g.label || enfants.length === 1) {
      // `groupe` : le tiroir mobile garde l'intitulé de la section.
      enfants.forEach((item) => nav.push({ type: 'lien', item, groupe: g.label }));
    } else {
      nav.push({ type: 'groupe', label: g.label, icone: parCode.get(g.icone)?.icon || enfants[0].icon, enfants });
    }
  }

  for (const item of items) {
    if (!ranges.has(item.code)) nav.push({ type: 'lien', item });
  }
  return nav;
}

/** La rubrique `item` correspond-elle à l'adresse courante ? */
export function estActif(item, pathname) {
  if (item.end || item.to === '/') return pathname === item.to;
  return pathname === item.to || pathname.startsWith(`${item.to}/`);
}

/**
 * Rubriques retirées du dashboard (pages Menus et Signalements). Le serveur
 * les désactive (migration 20261026) ; on les écarte aussi ici, au cas où
 * une ancienne session ou une base pas encore migrée les renverrait.
 */
export const CODES_RETIRES = ['MENUS', 'SIGNALEMENTS'];
