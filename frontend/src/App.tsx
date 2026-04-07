import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './layouts/AppLayout';
import LandingPage from './pages/LandingPage';
import PublicImpactPage from './pages/PublicImpactPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import DashboardPage from './pages/DashboardPage';
import CaseDashboardPage from './pages/CaseDashboardPage';
import DonorManagementPage from './pages/DonorManagementPage';
import AdminPortalPage from './pages/AdminPortalPage';
import DonorPortalPage from './pages/DonorPortalPage';
import ReportsPage from './pages/ReportsPage';
import CookieConsent from './components/CookieConsent';
import { isAuthenticated, hasRole } from './services/auth';

function RequireAuth({ children }: { children: React.ReactNode }) {
  return isAuthenticated() ? <>{children}</> : <Navigate to="/login" replace />;
}

function RequireStaff({ children }: { children: React.ReactNode }) {
  if (!isAuthenticated()) return <Navigate to="/login" replace />;
  if (!hasRole('Staff')) return <Navigate to="/donor-portal" replace />;
  return <>{children}</>;
}

function RequireAdmin({ children }: { children: React.ReactNode }) {
  if (!isAuthenticated()) return <Navigate to="/login" replace />;
  if (!hasRole('Admin')) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Navigate to="/welcome" replace />} />
        <Route path="/welcome" element={<LandingPage />} />
        <Route path="/impact" element={<PublicImpactPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/privacy" element={<PrivacyPolicyPage />} />

        {/* Protected routes inside AppLayout */}
        <Route element={<RequireAuth><AppLayout /></RequireAuth>}>
          {/* Any authenticated user */}
          <Route path="donor-portal" element={<DonorPortalPage />} />

          {/* Staff+ only */}
          <Route path="dashboard" element={<RequireStaff><DashboardPage /></RequireStaff>} />
          <Route path="cases" element={<RequireStaff><CaseDashboardPage /></RequireStaff>} />
          <Route path="donors" element={<RequireStaff><DonorManagementPage /></RequireStaff>} />
          <Route path="reports" element={<RequireStaff><ReportsPage /></RequireStaff>} />

          {/* Admin only */}
          <Route path="admin" element={<RequireAdmin><AdminPortalPage /></RequireAdmin>} />
        </Route>
      </Routes>
      <CookieConsent />
    </BrowserRouter>
  );
}
