import api from './api';
import { ENDPOINTS } from '../constants/endpoints';

const E = ENDPOINTS.CATEGORIES;

export const getCategories        = ()                 => api.get(E.LIST);
export const createCategorie      = (data)             => api.post(E.CREATE, data);
export const updateCategorie      = (id, data)         => api.put(E.UPDATE(id), data);
// `remplacerPar` : catégorie qui reprend les produits et boutiques (fusion).
export const deleteCategorie      = (id, remplacerPar) => api.delete(E.DELETE(id), {
  params: remplacerPar ? { remplacerPar } : undefined,
});
export const reordonnerCategories = (ids)              => api.put(E.REORDER, { ids });
