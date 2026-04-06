import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppLayout from './layouts/AppLayout';
import DashboardPage from './pages/DashboardPage';
import CaseDashboardPage from './pages/CaseDashboardPage';
import DonorManagementPage from './pages/DonorManagementPage';
import AdminPortalPage from './pages/AdminPortalPage';
import DonorPortalPage from './pages/DonorPortalPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="cases" element={<CaseDashboardPage />} />
          <Route path="donors" element={<DonorManagementPage />} />
          <Route path="admin" element={<AdminPortalPage />} />
          <Route path="donor-portal" element={<DonorPortalPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
