import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from './LoadingSpinner';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner text="Vérification de l'authentification..." size="xl" />
      </div>
    );
  }

  if (!isAuthenticated) {
    // Sauvegarder la page demandée pour rediriger après connexion
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}