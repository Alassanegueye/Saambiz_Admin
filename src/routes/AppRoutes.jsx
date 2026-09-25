import { Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import ProtectedRoute from './ProtectedRoute';
import GuestRoute from './GuestRoute';
import FirstLoginRoute from './FirstLoginRoute';
import AdminLayout from '../components/layouts/AdminLayout';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorBoundary from '../components/common/ErrorBoundary';
import { ROUTES } from '../constants/routes';

const LoginPage         = lazy(() => import('../pages/auth/LoginPage'));
const ChangePasswordPage = lazy(() => import('../pages/auth/ChangePasswordPage'));
const ProfilPage         = lazy(() => import('../pages/profil/ProfilPage'));
const TableauDeBordPage = lazy(() => import('../pages/tableau-de-bord/TableauDeBordPage'));
const VendeursPage      = lazy(() => import('../pages/vendeurs/VendeursPage'));
const AcheteursPage     = lazy(() => import('../pages/acheteurs/AcheteursPage'));
const ProduitsPage      = lazy(() => import('../pages/produits/ProduitsPage'));
const CategoriesPage    = lazy(() => import('../pages/categories/CategoriesPage'));
const CommandesPage     = lazy(() => import('../pages/commandes/CommandesPage'));
const PaiementsPage     = lazy(() => import('../pages/paiements/PaiementsPage'));
const AbonnementsPage   = lazy(() => import('../pages/abonnements/AbonnementsPage'));
const ModerationPage    = lazy(() => import('../pages/moderation/ModerationPage'));
const SignalementsPage  = lazy(() => import('../pages/signalements/SignalementsPage'));
const ConfigPage        = lazy(() => import('../pages/config/ConfigPage'));
const AdminsPage        = lazy(() => import('../pages/admins/AdminsPage'));
const MenusPage         = lazy(() => import('../pages/menus/MenusPage'));
const RetoursPage       = lazy(() => import('../pages/retours/RetoursPage'));
const AuditLogsPage     = lazy(() => import('../pages/audit/AuditPage'));
const ValidationVendeursPage = lazy(() => import('../pages/validation-vendeurs/ValidationVendeursPage'));

export default function AppRoutes() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingSpinner fullPage />}>
        <Routes>
          <Route element={<GuestRoute />}>
            <Route path={ROUTES.LOGIN} element={
              <ErrorBoundary><LoginPage /></ErrorBoundary>
            } />
          </Route>

          {/* Route changement mdp — accessible si connecté même avec isFirstLogin=true */}
          <Route element={<FirstLoginRoute />}>
            <Route path={ROUTES.CHANGE_PASSWORD} element={
              <ErrorBoundary><ChangePasswordPage /></ErrorBoundary>
            } />
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route element={<AdminLayout />}>
              <Route path={ROUTES.DASHBOARD}    element={<ErrorBoundary><TableauDeBordPage /></ErrorBoundary>} />
              <Route path={ROUTES.VENDEURS}     element={<ErrorBoundary><VendeursPage /></ErrorBoundary>} />
              <Route path={ROUTES.ACHETEURS}    element={<ErrorBoundary><AcheteursPage /></ErrorBoundary>} />
              <Route path={ROUTES.PRODUITS}     element={<ErrorBoundary><ProduitsPage /></ErrorBoundary>} />
              <Route path={ROUTES.CATEGORIES}   element={<ErrorBoundary><CategoriesPage /></ErrorBoundary>} />
              <Route path={ROUTES.COMMANDES}    element={<ErrorBoundary><CommandesPage /></ErrorBoundary>} />
              <Route path={ROUTES.PAIEMENTS}    element={<ErrorBoundary><PaiementsPage /></ErrorBoundary>} />
              <Route path={ROUTES.ABONNEMENTS}  element={<ErrorBoundary><AbonnementsPage /></ErrorBoundary>} />
              <Route path={ROUTES.MODERATION}   element={<ErrorBoundary><ModerationPage /></ErrorBoundary>} />
              <Route path={ROUTES.SIGNALEMENTS} element={<ErrorBoundary><SignalementsPage /></ErrorBoundary>} />
              <Route path={ROUTES.ADMINS}       element={<ErrorBoundary><AdminsPage /></ErrorBoundary>} />
              <Route path={ROUTES.MENUS}        element={<ErrorBoundary><MenusPage /></ErrorBoundary>} />
              <Route path={ROUTES.CONFIG}       element={<ErrorBoundary><ConfigPage /></ErrorBoundary>} />
              <Route path={ROUTES.RETOURS}      element={<ErrorBoundary><RetoursPage /></ErrorBoundary>} />
              <Route path={ROUTES.AUDIT_LOGS}   element={<ErrorBoundary><AuditLogsPage /></ErrorBoundary>} />
              <Route path={ROUTES.VALIDATION_VENDEURS} element={<ErrorBoundary><ValidationVendeursPage /></ErrorBoundary>} />
              {/* Hors menu RBAC : accessible par le menu du compte, à droite
                  de la barre de navigation. */}
              <Route path={ROUTES.PROFIL}       element={<ErrorBoundary><ProfilPage /></ErrorBoundary>} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}
