import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CircularProgress, Box } from '@mui/material';

const ProtectedRoute = ({ children, requireAdmin, requireCanBook }) => {
  const { user, loading, isSuperAdmin, canBook } = useAuth();

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="80vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && !isSuperAdmin()) {
    return <Navigate to="/" replace />;
  }

  if (requireCanBook && !canBook()) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
