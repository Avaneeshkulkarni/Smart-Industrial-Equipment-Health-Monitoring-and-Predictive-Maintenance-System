import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { EquipmentList } from './pages/EquipmentList';
import { EquipmentDetails } from './pages/EquipmentDetails';
import { DashboardLayout } from './layouts/DashboardLayout';

// ─── Route guard — redirects to /login if not authenticated ──────────────────
function ProtectedLayout(): React.ReactElement {
  const isAuth = !!localStorage.getItem('predictx_auth');
  if (!isAuth) return <Navigate to="/login" replace />;

  return (
    <DashboardLayout>
      <Routes>
        <Route path="dashboard"      element={<Dashboard />} />
        <Route path="equipment"      element={<EquipmentList />} />
        <Route path="equipment/:id"  element={<EquipmentDetails />} />
        <Route path="*"              element={<Navigate to="dashboard" replace />} />
      </Routes>
    </DashboardLayout>
  );
}

export default function App(): React.ReactElement {
  return (
    <Routes>
      <Route path="/login"  element={<Login />} />
      <Route path="/*"      element={<ProtectedLayout />} />
    </Routes>
  );
}
