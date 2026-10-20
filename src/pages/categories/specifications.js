// Types de spécification et conversions formulaire ↔ API (page Catégories).

export const TYPES_SPECIFICATION = [
  { valeur: 'variantes', libelle: 'Option à choisir', aide: 'Le vendeur tape ses valeurs (tailles, parfums, formats…) ; le client en choisit une à la commande.' },
  { valeur: 'choix',     libelle: 'Choix unique',                 aide: 'Le vendeur choisit une valeur (ex. État : Neuf).' },
  { valeur: 'liste',     libelle: 'Plusieurs valeurs (info)',     aide: 'Le vendeur coche plusieurs valeurs, affichées en information.' },
  { valeur: 'texte',     libelle: 'Information',                  aide: 'Un texte libre : matière, marque, zone…' },
  { valeur: 'nombre',    libelle: 'Nombre',                       aide: 'Valeur numérique, avec une unité facultative.' },
  { valeur: 'oui_non',   libelle: 'Oui / non',                    aide: 'Case à cocher.' },
];

export const AVEC_OPTIONS = ['variantes', 'choix', 'liste'];

/** Définition serveur → lignes éditables (options en texte). */
export const versLignes = (specs) => (Array.isArray(specs) ? specs : []).map((s) => ({
  ...s,
  options: Array.isArray(s.options) ? s.options.join(', ') : (s.options || ''),
}));

/** Lignes éditables → définition envoyée au serveur. */
export const versSpecifications = (lignes) => lignes
  .filter((l) => (l.libelle || '').trim())
  .map((l) => ({
    ...(l.cle ? { cle: l.cle } : {}),
    libelle: l.libelle.trim(),
    type: l.type,
    ...(AVEC_OPTIONS.includes(l.type)
      ? { options: String(l.options || '').split(/,(?!\d)/).map((o) => o.trim()).filter(Boolean) }
      : {}),
    // Le vendeur peut toujours taper ses propres valeurs pour une variante.
    ...(l.type === 'variantes' ? { libre: true } : {}),
    ...(l.type === 'nombre' && l.unite ? { unite: l.unite.trim() } : {}),
    ...(l.obligatoire ? { obligatoire: true } : {}),
    ...(l.aide && l.aide.trim() ? { aide: l.aide.trim() } : {}),
  }));
