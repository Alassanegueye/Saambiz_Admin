// Icônes proposées pour les catégories. Le nom est celui d'une icône
// Material : l'application mobile fait la correspondance (voir
// lib/core/constants/icones_categories.dart). Ajouter une icône ici sans
// l'ajouter côté mobile l'afficherait avec l'icône par défaut.
export const ICONES_CATEGORIES = [
  { valeur: 'checkroom',       libelle: 'Vêtement' },
  { valeur: 'man',             libelle: 'Homme' },
  { valeur: 'woman',           libelle: 'Femme' },
  { valeur: 'shopping_bag',    libelle: 'Sac' },
  { valeur: 'spa',             libelle: 'Beauté / soin' },
  { valeur: 'diamond',         libelle: 'Bijou' },
  { valeur: 'watch',           libelle: 'Montre' },
  { valeur: 'smartphone',      libelle: 'Téléphone' },
  { valeur: 'computer',        libelle: 'Ordinateur' },
  { valeur: 'chair',           libelle: 'Maison / meuble' },
  { valeur: 'kitchen',         libelle: 'Cuisine' },
  { valeur: 'shopping_basket', libelle: 'Panier / épicerie' },
  { valeur: 'restaurant',      libelle: 'Plats / restaurant' },
  { valeur: 'lunch_dining',    libelle: 'Fast-food' },
  { valeur: 'local_drink',     libelle: 'Jus / boisson' },
  { valeur: 'local_cafe',      libelle: 'Café / thé' },
  { valeur: 'cake',            libelle: 'Gâteau / pâtisserie' },
  { valeur: 'bakery_dining',   libelle: 'Boulangerie' },
  { valeur: 'child_care',      libelle: 'Enfant' },
  { valeur: 'toys',            libelle: 'Jouet' },
  { valeur: 'favorite',        libelle: 'Santé / cœur' },
  { valeur: 'sports_soccer',   libelle: 'Sport' },
  { valeur: 'palette',         libelle: 'Artisanat / art' },
  { valeur: 'handyman',        libelle: 'Service / outil' },
  { valeur: 'content_cut',     libelle: 'Coiffure / couture' },
  { valeur: 'directions_car',  libelle: 'Auto' },
  { valeur: 'pets',            libelle: 'Animaux' },
  { valeur: 'menu_book',       libelle: 'Livre' },
  { valeur: 'local_florist',   libelle: 'Fleur' },
  { valeur: 'more_horiz',      libelle: 'Autre' },
];

export const libelleIcone = (valeur) =>
  ICONES_CATEGORIES.find((i) => i.valeur === valeur)?.libelle || valeur || '—';
