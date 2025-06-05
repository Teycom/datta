import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

interface UserGuardProps {
  children: ReactNode;
}

export const UserGuard = ({ children }: UserGuardProps) => {
  // TODO: Implement actual auth check
  const isAuthenticated = true;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};