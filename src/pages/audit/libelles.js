/**
 * Libellés lisibles des actions tracées dans le journal d'audit.
 * L'action arrive sous la forme `verbe_cible` (ex. `suspendre_vendeur`).
 */

const VERBES = {
  creer: { texte: 'Création', ton: 'success' },
  modifier: { texte: 'Modification', ton: 'info' },
  supprimer: { texte: 'Suppression', ton: 'danger' },
  suspendre: { texte: 'Suspension', ton: 'warning' },
  activer: { texte: 'Réactivation', ton: 'success' },
  approuver: { texte: 'Approbation', ton: 'success' },
  rejeter: { texte: 'Rejet', ton: 'danger' },
  valider: { texte: 'Validation', ton: 'success' },
  verifier: { texte: 'Vérification', ton: 'success' },
  traiter: { texte: 'Traitement', ton: 'info' },
  revoquer: { texte: 'Révocation', ton: 'danger' },
  abonnement: { texte: 'Abonnement offert', ton: 'success' },
  connexion: { texte: 'Connexion', ton: 'default' },
};

export const CIBLES = {
  session: 'Dashboard',
  admin: 'Administrateur',
  vendeur: 'Vendeur',
  acheteur: 'Client',
  produit: 'Produit',
  commande: 'Commande',
  boutique: 'Boutique',
  categorie: 'Catégorie',
  signalement: 'Signalement',
  abonnement: 'Abonnement',
  config: 'Configuration',
  menu: 'Menu',
  utilisateur: 'Compte',
  demande_retour: 'Retour',
};

/** Précisions pour les actions dont le verbe seul ne dit pas tout. */
const PARTICULIERS = {
  modifier_permissions: { texte: 'Accès modifiés', ton: 'info' },
  valider_profil_vendeur: { texte: 'Profil validé', ton: 'success' },
  rejeter_profil_vendeur: { texte: 'Profil refusé', ton: 'danger' },
  modifier_prix_abonnement: { texte: "Prix de l'abonnement", ton: 'info' },
  modifier_config: { texte: 'Réglage modifié', ton: 'info' },
};

export const libelleAction = (action = '') => {
  if (PARTICULIERS[action]) return PARTICULIERS[action];
  const verbe = action.split('_')[0];
  return VERBES[verbe] || { texte: action.replace(/_/g, ' ') || '—', ton: 'default' };
};

export const libelleCible = (cible) => CIBLES[cible] || (cible ? cible.charAt(0).toUpperCase() + cible.slice(1) : '—');

export const nomAdmin = (a) => (a ? `${a.prenom || ''} ${a.nom || ''}`.trim() || a.email : 'Compte supprimé');

/** « il y a 5 min », « il y a 3 h », « hier »… puis la date. */
export function ilYA(date) {
  if (!date) return '—';
  const d = new Date(date);
  const s = Math.round((Date.now() - d.getTime()) / 1000);
  if (s < 60) return "à l'instant";
  if (s < 3600) return `il y a ${Math.floor(s / 60)} min`;
  if (s < 86400) return `il y a ${Math.floor(s / 3600)} h`;
  if (s < 172800) return 'hier';
  if (s < 7 * 86400) return `il y a ${Math.floor(s / 86400)} jours`;
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

export const PERIODES = [
  { valeur: '7', libelle: '7 jours' },
  { valeur: '30', libelle: '30 jours' },
  { valeur: '90', libelle: '90 jours' },
  { valeur: 'tout', libelle: 'Tout' },
];

/** Date ISO (YYYY-MM-DD) du début de la période, ou rien pour « Tout ». */
export const debutPeriode = (periode) => {
  if (periode === 'tout') return undefined;
  const d = new Date();
  d.setDate(d.getDate() - Number(periode) + 1);
  return d.toISOString().slice(0, 10);
};
