
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAppContext } from '../hooks/useAppContext';
import type { Role } from '../types';

interface ProtectedRouteProps {
  allowedRoles: Role[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { state } = useAppContext();
  const { user } = state;

  if (!user) {
    // Redirect to home if not logged in
    return <Navigate to="/" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    // Redirect to home if role is not allowed
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
