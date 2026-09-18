import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import LoadingState from './LoadingState.jsx';

export function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <LoadingState />;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return <Outlet />;
}

export function CompletedLevelRoute() {
  const { user } = useAuth();
  if (user.levelDeterminationStatus !== 'completed') return <Navigate to="/assessment" replace />;
  return <Outlet />;
}

