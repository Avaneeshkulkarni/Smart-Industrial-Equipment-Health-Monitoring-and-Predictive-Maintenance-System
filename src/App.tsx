import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { EquipmentList } from './pages/EquipmentList';
import { EquipmentDetails } from './pages/EquipmentDetails';
import { Alerts } from './pages/Alerts';
import { Maintenance } from './pages/Maintenance';
import { Analytics } from './pages/Analytics';
import { Settings } from './pages/Settings';
import { DashboardLayout } from './layouts/DashboardLayout';
import { useLiveSimulation } from './simulation/liveUpdater';

// ─── Route guard — redirects to /login if not authenticated ──────────────────
function ProtectedLayout(): React.ReactElement {
  const isAuth = !!localStorage.getItem('predictx_auth');
  if (!isAuth) return <Navigate to="/login" replace />;

  return (
    <SimulationProvider>
      <DashboardLayout>
        <Routes>
          <Route path="dashboard"      element={<Dashboard />} />
          <Route path="equipment"      element={<EquipmentList />} />
          <Route path="equipment/:id"  element={<EquipmentDetails />} />
          <Route path="alerts"         element={<Alerts />} />
          <Route path="maintenance"    element={<Maintenance />} />
          <Route path="analytics"      element={<Analytics />} />
          <Route path="settings"       element={<Settings />} />
          <Route path="*"              element={<Navigate to="dashboard" replace />} />
        </Routes>
      </DashboardLayout>
    </SimulationProvider>
  );
}

// ─── Simulation bootstrapper ─────────────────────────────────────────────────
// Isolated from components — swappable for WebSocket without touching any page.
function SimulationProvider({ children }: { children: React.ReactNode }): React.ReactElement {
  useLiveSimulation();
  return <>{children}</>;
}

export default function App(): React.ReactElement {
  return (
    <Routes>
      <Route path="/login"  element={<Login />} />
      <Route path="/*"      element={<ProtectedLayout />} />
    </Routes>
  );
}
