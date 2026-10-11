import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { MainLayout } from './components/MainLayout';

// Pages
import { LoginPage } from './pages/LoginPage';
import { LoginAdminPage } from './pages/LoginAdminPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { MisCamposPage } from './pages/MisCamposPage';
import { ProduccionPage } from './pages/ProduccionPage';
import { CultivosPage } from './pages/CultivosPage';
import { ActividadesPage } from './pages/ActividadesPage';
import { EnfermedadesPage } from './pages/EnfermedadesPage';
import { CalidadPage } from './pages/CalidadPage';
import { PanelAdminPage } from './pages/PanelAdminPage';
import { MisDatosPage } from './pages/MisDatosPage';

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }
  return children;
}

function AdminRoute({ children }) {
  const { isAuthenticated, isAdmin } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/auth/login-admin" replace />;
  }
  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

function PublicRoute({ children }) {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

export default function App() {
  return (
    <Routes>
      {/* Default Landing */}
      <Route path="/" element={<Navigate to="/auth/login" replace />} />

      {/* Public Authentication Routes */}
      <Route
        path="/auth/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/auth/login-admin"
        element={
          <PublicRoute>
            <LoginAdminPage />
          </PublicRoute>
        }
      />
      <Route
        path="/auth/register"
        element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        }
      />

      {/* Protected App Routes inside MainLayout */}
      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/produccion" element={<ProduccionPage />} />
        <Route path="/mis-campos" element={<MisCamposPage />} />
        <Route path="/mis-datos" element={<MisDatosPage />} />
        <Route path="/cultivos" element={<CultivosPage />} />
        <Route path="/actividades" element={<ActividadesPage />} />
        <Route path="/enfermedades" element={<EnfermedadesPage />} />
        <Route path="/calidad" element={<CalidadPage />} />
        <Route
          path="/panel-admin"
          element={
            <AdminRoute>
              <PanelAdminPage />
            </AdminRoute>
          }
        />

        {/* Angular Legacy Redirects */}
        <Route path="/configuracion" element={<Navigate to="/dashboard" replace />} />
        <Route path="/clientes-export" element={<Navigate to="/cultivos" replace />} />
      </Route>

      {/* Catch-all Fallback */}
      <Route path="*" element={<Navigate to="/auth/login" replace />} />
    </Routes>
  );
}
