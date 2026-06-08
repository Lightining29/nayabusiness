import React from 'react';
import { Navigate } from 'react-router-dom';

// Simple client‑side guard: if a JWT token exists in localStorage, allow rendering.
// In a real app you'd verify the token with the server.
export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" replace />;
}
