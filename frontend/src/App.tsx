import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './layouts/AppLayout';
import LandingPage from './pages/LandingPage';
import PublicImpactPage from './pages/PublicImpactPage';
import LoginPage from './pages/LoginPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import DashboardPage from './pages/DashboardPage';
import CaseDashboardPage from './pages/CaseDashboardPage';
import DonorManagementPage from './pages/DonorManagementPage';
import AdminPortalPage from './pages/AdminPortalPage';
import DonorPortalPage from './pages/DonorPortalPage';
import ReportsPage from './pages/ReportsPage';
import AnnualReportPage from './pages/AnnualReportPage';
import CookieConsent from './components/CookieConsent';
import RegisterPage from './pages/RegisterPage';
import { ResidentIntakePage } from './pages/ResidentIntakePage';
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
        <Route path="/privacy" element={<PrivacyPolicyPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route element={<RequireAuth><AppLayout /></RequireAuth>}>
          <Route path="donor-portal" element={<DonorPortalPage />} />

          {/* Protected staff routes */}
          <Route path="dashboard" element={<RequireStaff><DashboardPage /></RequireStaff>} />
          <Route path="cases" element={<RequireStaff><CaseDashboardPage /></RequireStaff>} />
          <Route path="donors" element={<RequireStaff><DonorManagementPage /></RequireStaff>} />
          <Route path="reports" element={<RequireStaff><ReportsPage /></RequireStaff>} />
          <Route path="annual-report" element={<RequireStaff><AnnualReportPage /></RequireStaff>} />
          <Route path="/cases/new" element={<RequireStaff><ResidentIntakePage /></RequireStaff>} />

          {/* Admin-only route */}
          <Route path="admin" element={<RequireAdmin><AdminPortalPage /></RequireAdmin>} />
        </Route>
      </Routes>
      <CookieConsent />
    </BrowserRouter>
  );
}
