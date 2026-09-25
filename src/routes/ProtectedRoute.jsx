import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { ROUTES } from '../constants/routes';

export default function ProtectedRoute() {
  const { user, isLoading } = useAuth();

  if (isLoading) return <LoadingSpinner fullPage />;
  if (!user) return <Navigate to={ROUTES.LOGIN} replace />;
  // Seule l'administration vit ici : l'espace vendeur est une application
  // distincte, l'écran de connexion oriente vers son adresse.
  if (user.role !== 'Admin' && user.role !== 'SuperAdmin') return <Navigate to={ROUTES.LOGIN} replace />;

  return <Outlet />;
}
