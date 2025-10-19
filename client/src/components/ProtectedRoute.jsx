// src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

// Wrapper to protect pages that require login
export default function ProtectedRoute({ children }) {
  const { user } = useUser();
  console.log("User in ProtectedRoute:", user);
  return user ? children : <Navigate to="/login" />;
}
