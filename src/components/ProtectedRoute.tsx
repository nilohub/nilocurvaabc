import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireSupervisor?: boolean;
}

export function ProtectedRoute({ children, requireSupervisor = false }: ProtectedRouteProps) {
  const { isAuthenticated, isSupervisor } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireSupervisor && !isSupervisor) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}