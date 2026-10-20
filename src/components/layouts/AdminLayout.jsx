import { Suspense } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import TopNav from './TopNav';
import { usePermissions } from '../../hooks/usePermissions';
import useInactivityLogout from '../../hooks/useInactivityLogout';
import { useAuth } from '../../hooks/useAuth';
import ErrorBoundary from '../common/ErrorBoundary';
import LoadingSpinner from '../common/LoadingSpinner';

/**
 * Icônes des rubriques, indexées par le code du menu RBAC.
 * (Reprises telles quelles de l'ancien menu latéral.)
 */
const ICONES = {
  DASHBOARD: <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></>,
  VENDEURS: <><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></>,
  ACHETEURS: <><circle cx="9" cy="7" r="4"/><path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/></>,
  PRODUITS: <><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/></>,
  CATEGORIES: <><path d="M4 6h16M4 10h16M4 14h16M4 18h16"/></>,
  COMMANDES: <><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></>,
  PAIEMENTS: <><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></>,
  ABONNEMENTS: <><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></>,
  MODERATION: <><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></>,
  VALIDATION_VENDEURS: <><path d="M12 2 4 6v6c0 5 3.4 9.4 8 10 4.6-.6 8-5 8-10V6z"/><polyline points="9 12 11 14 15 10"/></>,
  SIGNALEMENTS: <><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></>,
  ADMINS: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></>,
  ACTIVITE: <><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></>,
  MENUS: <><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></>,
  CONFIG: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></>,
};

const ICONE_DEFAUT = <><circle cx="12" cy="12" r="3"/><path d="M12 2v2M12 20v2M4 12H2M22 12h-2"/></>;

export default function AdminLayout() {
  const { menus } = usePermissions();
  const { logout } = useAuth();
  const { pathname } = useLocation();

  useInactivityLogout(logout);

  // Les rubriques restent pilotées par le RBAC : un administrateur ne voit
  // que les menus sur lesquels il a le droit de lecture.
  const items = menus.map((menu) => ({
    code: menu.code,
    to: menu.path,
    label: menu.name,
    icon: ICONES[menu.code] || ICONE_DEFAUT,
    end: menu.path === '/',
  }));

  // Activité des admins : réservée à qui voit la page Administrateurs (même
  // droit côté serveur). Ajoutée ici, sans menu RBAC dédié en base.
  if (menus.some((m) => m.code === 'ADMINS')) {
    items.push({ code: 'ACTIVITE', to: '/audit-logs', label: 'Activité des admins', icon: ICONES.ACTIVITE });
  }

  return (
    <div className="admin-layout">
      {/* Pas de libellé d'espace : les 14 rubriques ont besoin de la place.
          L'espace vendeur, lui, garde le sien — il en a moins. */}
      <TopNav items={items} />
      <div className="admin-main">
        <div className="admin-content">
          {/* Chargement et erreurs gérés ICI, sous la barre de navigation.
              - Suspense : auparavant un seul Suspense entourait toutes les
                routes ; à chaque première visite d'une rubrique (page chargée
                à la demande), toute l'interface, barre comprise, laissait
                place à un spinner plein écran. La navigation reste désormais
                affichée et seul le contenu attend.
              - ErrorBoundary indexé sur l'adresse : chaque route avait le sien,
                mais tous à la même position dans l'arbre. React réutilisait
                donc l'instance d'une page à l'autre, et après une erreur sur
                une rubrique, cliquer sur une autre affichait toujours
                « Une erreur est survenue ». La clé force une instance neuve
                à chaque changement de page. */}
          <ErrorBoundary key={pathname}>
            <Suspense fallback={<LoadingSpinner />}>
              <Outlet />
            </Suspense>
          </ErrorBoundary>
        </div>
      </div>
    </div>
  );
}
