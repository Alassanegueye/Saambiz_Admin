import api from './api';
import { ENDPOINTS } from '../constants/endpoints';

const R = ENDPOINTS.RBAC;

// ── Admins ────────────────────────────────────────────────────────────────
export const getAdmins           = ()           => api.get(R.ADMINS);
export const creerAdmin          = (data)       => api.post(R.ADMINS, data);
export const supprimerAdmin      = (id)         => api.delete(R.ADMIN_BY_ID(id));
export const modifierAdmin       = (id, data)   => api.put(R.ADMIN_BY_ID(id), data);
export const getAdminPermissions = (id)         => api.get(R.ADMIN_PERMISSIONS(id));
export const updateAdminPerms    = (id, perms)  => api.put(R.ADMIN_PERMISSIONS(id), { permissions: perms });

// ── Menus ─────────────────────────────────────────────────────────────────
export const getMenus    = ()         => api.get(R.MENUS);
