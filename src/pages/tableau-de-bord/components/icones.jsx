/**
 * Tracés SVG des cartes de statistiques.
 * Isolés ici pour que la page reste lisible : ce sont des données, pas de la mise en page.
 */
export const ICONE_BOUTIQUE = (
  <>
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </>
);

export const ICONE_BOUTIQUE_VIDE = (
  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
);

export const ICONE_PERSONNE = (
  <>
    <circle cx="9" cy="7" r="4" />
    <path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
  </>
);

export const ICONE_PANIER = (
  <>
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
    <line x1="3" y1="6" x2="21" y2="6" />
  </>
);

export const ICONE_MONNAIE = (
  <>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 6v12M15 9.5c0-1.4-1.3-2.5-3-2.5s-3 1.1-3 2.5 1.3 2.5 3 2.5 3 1.1 3 2.5-1.3 2.5-3 2.5-3-1.1-3-2.5" />
  </>
);

export const ICONE_VALIDE = <path d="M20 6 9 17l-5-5" />;
