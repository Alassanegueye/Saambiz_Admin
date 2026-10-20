import { useEffect, useState } from 'react';
import { getBoutiquesOptions } from '../service/catalogue.service';

/** Boutiques de la plateforme, pour les filtres et les formulaires. */
export default function useBoutiques() {
  const [boutiques, setBoutiques] = useState([]);
  useEffect(() => {
    let actif = true;
    getBoutiquesOptions()
      .then((res) => { if (actif) setBoutiques(res.data?.boutiques || []); })
      .catch(() => {});
    return () => { actif = false; };
  }, []);
  return boutiques;
}

/** Libellé d'une boutique dans une liste : « Nom — Prénom Nom du vendeur ». */
export const libelleBoutique = (b) => {
  const v = b?.vendeur ? `${b.vendeur.prenom || ''} ${b.vendeur.nom || ''}`.trim() : '';
  return v ? `${b.nom} — ${v}` : b?.nom || '—';
};
