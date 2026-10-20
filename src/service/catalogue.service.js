import api from './api';
import { ENDPOINTS } from '../constants/endpoints';

const E = ENDPOINTS.ADMIN;

/**
 * Produits et commandes administrés par boutique : chaque produit et chaque
 * commande appartient à une boutique, choisie dans les formulaires.
 */

/** Le backend attend du multipart pour l'image ; les champs vides partent tels quels. */
function enFormData(valeurs, image) {
  const form = new FormData();
  Object.entries(valeurs).forEach(([cle, valeur]) => {
    if (valeur === undefined || valeur === null) return;
    form.append(cle, typeof valeur === 'object' ? JSON.stringify(valeur) : valeur);
  });
  if (image) form.append('image', image);
  return form;
}
const MULTIPART = { headers: { 'Content-Type': 'multipart/form-data' } };

export const getBoutiquesOptions = () => api.get(E.BOUTIQUES_OPTIONS);
export const getCategoriesActives = () => api.get(ENDPOINTS.CATEGORIES.PUBLIC);

// ── Produits ──
export const getProduits      = (params) => api.get(E.PRODUITS, { params });
export const getProduit       = (id) => api.get(E.PRODUIT(id));
export const creerProduit     = (valeurs, image) => api.post(E.PRODUITS, enFormData(valeurs, image), MULTIPART);
export const modifierProduit  = (id, valeurs, image) => api.put(E.PRODUIT(id), enFormData(valeurs, image), MULTIPART);
export const supprimerProduit = (id) => api.delete(E.PRODUIT(id));

// ── Commandes ──
export const getCommande       = (id) => api.get(E.COMMANDE(id));
export const creerCommande     = (data) => api.post(E.COMMANDES, data);
export const modifierCommande  = (id, data) => api.put(E.COMMANDE(id), data);
export const supprimerCommande = (id) => api.delete(E.COMMANDE(id));
