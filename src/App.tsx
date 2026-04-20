import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { ROLE_DEFAULT_ROUTES } from '@/constants/config';
import type { UserRole } from '@/types';
import { AppLayout } from '@/components/layout/AppLayout';
import LoginPage from '@/pages/LoginPage';
import DashboardPage from '@/pages/DashboardPage';
import ProductionPage from '@/pages/ProductionPage';
import StockPage from '@/pages/StockPage';
import LivraisonPage from '@/pages/LivraisonPage';
import FinancePage from '@/pages/FinancePage';
import ReportProductionPage from '@/pages/ReportProductionPage';
import ReportStockPage from '@/pages/ReportStockPage';
import ReportLivraisonPage from '@/pages/ReportLivraisonPage';
import ReportFinancePage from '@/pages/ReportFinancePage';
import SettingsPage from '@/pages/SettingsPage';
import ProductsManagementPage from '@/pages/ProductsManagementPage';
import AgentsManagementPage from '@/pages/AgentsManagementPage';
import UsersManagementPage from '@/pages/UsersManagementPage';

function ProtectedRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Outlet />;
}

function RoleGuard({ roles, children }: { roles: UserRole[]; children: React.ReactNode }) {
  const currentUser = useAuthStore((s) => s.currentUser);
  if (!currentUser || !roles.includes(currentUser.role)) {
    return <Navigate to={ROLE_DEFAULT_ROUTES[currentUser?.role ?? 'ADMIN']} replace />;
  }
  return <>{children}</>;
}

function HomeRedirect() {
  const currentUser = useAuthStore((s) => s.currentUser);
  const target = currentUser ? ROLE_DEFAULT_ROUTES[currentUser.role] : '/login';
  return <Navigate to={target} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route index element={<HomeRedirect />} />
          <Route path="/dashboard" element={<RoleGuard roles={['ADMIN']}><DashboardPage /></RoleGuard>} />
          <Route path="/production" element={<RoleGuard roles={['ADMIN', 'PRODUCTION']}><ProductionPage /></RoleGuard>} />
          <Route path="/stock" element={<RoleGuard roles={['ADMIN', 'STOCK']}><StockPage /></RoleGuard>} />
          <Route path="/livraison" element={<RoleGuard roles={['ADMIN', 'LIVRAISON']}><LivraisonPage /></RoleGuard>} />
          <Route path="/finance" element={<RoleGuard roles={['ADMIN', 'FINANCE']}><FinancePage /></RoleGuard>} />
          <Route path="/rapports/production" element={<RoleGuard roles={['ADMIN', 'PRODUCTION']}><ReportProductionPage /></RoleGuard>} />
          <Route path="/rapports/stock" element={<RoleGuard roles={['ADMIN', 'STOCK']}><ReportStockPage /></RoleGuard>} />
          <Route path="/rapports/livraison" element={<RoleGuard roles={['ADMIN', 'LIVRAISON']}><ReportLivraisonPage /></RoleGuard>} />
          <Route path="/rapports/finance" element={<RoleGuard roles={['ADMIN', 'FINANCE']}><ReportFinancePage /></RoleGuard>} />
          <Route path="/parametres" element={<RoleGuard roles={['ADMIN']}><SettingsPage /></RoleGuard>} />
          <Route path="/parametres/produits" element={<RoleGuard roles={['ADMIN']}><ProductsManagementPage /></RoleGuard>} />
          <Route path="/parametres/agents" element={<RoleGuard roles={['ADMIN']}><AgentsManagementPage /></RoleGuard>} />
          <Route path="/parametres/utilisateurs" element={<RoleGuard roles={['ADMIN']}><UsersManagementPage /></RoleGuard>} />
        </Route>
      </Route>
      <Route path="*" element={<HomeRedirect />} />
    </Routes>
  );
}
