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
const ConfigPage        = lazy(() => import('../pages/config/ConfigPage'));
const AdminsPage        = lazy(() => import('../pages/admins/AdminsPage'));
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
            {/* Pages sans ErrorBoundary individuel : AdminLayout en pose un
                par adresse autour de son Outlet (voir le commentaire là-bas). */}
            <Route element={<AdminLayout />}>
              <Route path={ROUTES.DASHBOARD}    element={<TableauDeBordPage />} />
              <Route path={ROUTES.VENDEURS}     element={<VendeursPage />} />
              <Route path={ROUTES.ACHETEURS}    element={<AcheteursPage />} />
              <Route path={ROUTES.PRODUITS}     element={<ProduitsPage />} />
              <Route path={ROUTES.CATEGORIES}   element={<CategoriesPage />} />
              <Route path={ROUTES.COMMANDES}    element={<CommandesPage />} />
              <Route path={ROUTES.PAIEMENTS}    element={<PaiementsPage />} />
              <Route path={ROUTES.ABONNEMENTS}  element={<AbonnementsPage />} />
              <Route path={ROUTES.MODERATION}   element={<ModerationPage />} />
              <Route path={ROUTES.ADMINS}       element={<AdminsPage />} />
              <Route path={ROUTES.CONFIG}       element={<ConfigPage />} />
              <Route path={ROUTES.RETOURS}      element={<RetoursPage />} />
              <Route path={ROUTES.AUDIT_LOGS}   element={<AuditLogsPage />} />
              <Route path={ROUTES.VALIDATION_VENDEURS} element={<ValidationVendeursPage />} />
              {/* Hors menu RBAC : accessible par le menu du compte, à droite
                  de la barre de navigation. */}
              <Route path={ROUTES.PROFIL}       element={<ProfilPage />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}
