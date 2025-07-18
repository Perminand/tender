import React from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { getDefaultRoute as getDefaultRouteFromConfig } from './config/roles';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import CounterpartyListPage from './pages/CounterpartyListPage';
import CounterpartyEditPage from './pages/CounterpartyEditPage';
import MaterialListPage from './pages/MaterialListPage';
import MaterialEditPage from './pages/MaterialEditPage';
import UnitListPage from './pages/UnitListPage';
import CategoryListPage from './pages/CategoryListPage';
import MaterialTypeListPage from './pages/MaterialTypeListPage';
import ContactTypesPage from './pages/ContactTypesPage';
import ProjectListPage from './pages/ProjectListPage';
import ReferenceBooksPage from './pages/ReferenceBooksPage';
import SettingsPage from './pages/SettingsPage';
import Layout from './components/Layout';
import RequestRegistryPage from './pages/RequestRegistryPage';
import RequestEditPage from './pages/RequestEditPage';
import WarehouseListPage from './pages/WarehouseListPage';
import TenderListPage from './pages/TenderListPage';
import TenderDetailPage from './pages/TenderDetailPage';
import TenderEditPage from './pages/TenderEditPage';
import ProposalEditPage from './pages/ProposalEditPage';
import ProposalRegistryPage from './pages/ProposalRegistryPage';
import ProposalDetailPage from './pages/ProposalDetailPage';
import NotificationListPage from './pages/NotificationListPage';
import PriceAnalysisPage from './pages/PriceAnalysisPage';
import ContractListPage from './pages/ContractListPage';
import ContractEditPage from './pages/ContractEditPage';
import DeliveryListPage from './pages/DeliveryListPage';
import DeliveryDetailPage from './pages/DeliveryDetailPage';
import PaymentListPage from './pages/PaymentListPage';
import DocumentListPage from './pages/DocumentListPage';
import DocumentDetailPage from './pages/DocumentDetailPage';
import ContractDetailPage from './pages/ContractDetailPage';
import ContractManagementPage from './pages/ContractManagementPage';
import RequestDetailPage from './pages/RequestDetailPage';
import DeliveryEditPage from './pages/DeliveryEditPage';
import DashboardWrapper from './components/DashboardWrapper';
import PaymentEditPage from './pages/PaymentEditPage';
import PaymentDetailPage from './pages/PaymentDetailPage';
import UserManagementPage from './pages/UserManagementPage';
import PermissionSync from './components/PermissionSync';

// Функция для определения стартовой страницы по ролям
const getDefaultRoute = (roles: string[] = []) => {
  return getDefaultRouteFromConfig(roles);
};

const DefaultRedirect: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  React.useEffect(() => {
    if (!isLoading && isAuthenticated && user && user.roles) {
      navigate(getDefaultRoute(user.roles), { replace: true });
    }
  }, [isLoading, isAuthenticated, user, navigate]);
  return null;
};

const App: React.FC = () => (
  <AuthProvider>
    <PermissionSync />
    <Routes>
      {/* Публичные маршруты */}
      <Route path="/login" element={<LoginPage />} />
      
      {/* Защищенные маршруты */}
      <Route path="/" element={
        <ProtectedRoute>
          <Layout>
            <DefaultRedirect />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Layout>
            <DashboardWrapper />
          </Layout>
        </ProtectedRoute>
      } />
      
      {/* Маршруты для всех аутентифицированных пользователей */}
      <Route path="/counterparties" element={
        <ProtectedRoute>
          <Layout>
            <CounterpartyListPage />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/counterparties/new" element={
        <ProtectedRoute>
          <Layout>
            <CounterpartyEditPage isEdit={false} />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/counterparties/:id/edit" element={
        <ProtectedRoute>
          <Layout>
            <CounterpartyEditPage isEdit={true} />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/materials" element={
        <ProtectedRoute>
          <Layout>
            <MaterialListPage />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/materials/new" element={
        <ProtectedRoute>
          <Layout>
            <MaterialEditPage isEdit={false} />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/materials/:id/edit" element={
        <ProtectedRoute>
          <Layout>
            <MaterialEditPage isEdit={true} />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/units" element={
        <ProtectedRoute>
          <Layout>
            <UnitListPage />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/reference" element={
        <ProtectedRoute>
          <Layout>
            <ReferenceBooksPage />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/reference/categories" element={
        <ProtectedRoute>
          <Layout>
            <CategoryListPage />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/reference/material-types" element={
        <ProtectedRoute>
          <Layout>
            <MaterialTypeListPage />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/reference/units" element={
        <ProtectedRoute>
          <Layout>
            <UnitListPage />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/reference/contact-types" element={
        <ProtectedRoute>
          <Layout>
            <ContactTypesPage />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/reference/projects" element={
        <ProtectedRoute>
          <Layout>
            <ProjectListPage />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/reference/counterparties" element={
        <ProtectedRoute>
          <Layout>
            <CounterpartyListPage />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/reference/counterparties/new" element={
        <ProtectedRoute>
          <Layout>
            <CounterpartyEditPage isEdit={false} />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/reference/counterparties/:id/edit" element={
        <ProtectedRoute>
          <Layout>
            <CounterpartyEditPage isEdit={true} />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/reference/materials" element={
        <ProtectedRoute>
          <Layout>
            <MaterialListPage />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/reference/materials/new" element={
        <ProtectedRoute>
          <Layout>
            <MaterialEditPage isEdit={false} />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/reference/materials/:id/edit" element={
        <ProtectedRoute>
          <Layout>
            <MaterialEditPage isEdit={true} />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/contact-types" element={
        <ProtectedRoute>
          <Layout>
            <ContactTypesPage />
          </Layout>
        </ProtectedRoute>
      } />
      
      {/* Маршруты для администраторов и менеджеров */}
      <Route path="/settings" element={
        <ProtectedRoute requiredRoles={['ROLE_ADMIN', 'ROLE_MANAGER']}>
          <Layout>
            <SettingsPage />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/requests/registry" element={
        <ProtectedRoute>
          <Layout>
            <RequestRegistryPage />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/reference/requests/registry" element={
        <ProtectedRoute>
          <Layout>
            <RequestRegistryPage />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/requests/new" element={
        <ProtectedRoute>
          <Layout>
            <RequestEditPage />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/requests/:id/edit" element={
        <ProtectedRoute>
          <Layout>
            <RequestEditPage />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/requests/:id" element={
        <ProtectedRoute>
          <Layout>
            <RequestDetailPage />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/reference/warehouses" element={
        <ProtectedRoute>
          <Layout>
            <WarehouseListPage />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/warehouses" element={
        <ProtectedRoute>
          <Layout>
            <WarehouseListPage />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/tenders" element={
        <ProtectedRoute>
          <Layout>
            <TenderListPage />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/tenders/new" element={
        <ProtectedRoute>
          <Layout>
            <TenderEditPage />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/tenders/:id" element={
        <ProtectedRoute>
          <Layout>
            <TenderDetailPage />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/tenders/:id/edit" element={
        <ProtectedRoute>
          <Layout>
            <TenderEditPage />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/tenders/:tenderId/proposals/new" element={
        <ProtectedRoute>
          <Layout>
            <ProposalEditPage />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/tenders/:tenderId/price-analysis" element={
        <ProtectedRoute>
          <Layout>
            <PriceAnalysisPage />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/tenders/:tenderId/contract/new/:supplierId" element={
        <ProtectedRoute>
          <Layout>
            <ContractEditPage />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/tenders/:tenderId/contract/new" element={
        <ProtectedRoute>
          <Layout>
            <ContractEditPage />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/proposals" element={
        <ProtectedRoute>
          <Layout>
            <ProposalRegistryPage />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/proposals/:id" element={
        <ProtectedRoute>
          <Layout>
            <ProposalDetailPage />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/notifications" element={
        <ProtectedRoute>
          <Layout>
            <NotificationListPage />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/contracts" element={
        <ProtectedRoute>
          <Layout>
            <ContractListPage />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/contracts/new" element={
        <ProtectedRoute>
          <Layout>
            <ContractEditPage />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/contracts/:id" element={
        <ProtectedRoute>
          <Layout>
            <ContractDetailPage />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/contracts/:id/edit" element={
        <ProtectedRoute>
          <Layout>
            <ContractEditPage />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/contracts/:id/manage" element={
        <ProtectedRoute>
          <Layout>
            <ContractManagementPage />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/deliveries" element={
        <ProtectedRoute>
          <Layout>
            <DeliveryListPage />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/deliveries/new" element={
        <ProtectedRoute>
          <Layout>
            <DeliveryEditPage />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/deliveries/:id" element={
        <ProtectedRoute>
          <Layout>
            <DeliveryDetailPage />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/payments" element={
        <ProtectedRoute>
          <Layout>
            <PaymentListPage />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/payments/new" element={
        <ProtectedRoute>
          <Layout>
            <PaymentEditPage />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/payments/:id" element={
        <ProtectedRoute>
          <Layout>
            <PaymentDetailPage />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/payments/:id/edit" element={
        <ProtectedRoute>
          <Layout>
            <PaymentEditPage />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/documents" element={
        <ProtectedRoute>
          <Layout>
            <DocumentListPage />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/documents/:id" element={
        <ProtectedRoute>
          <Layout>
            <DocumentDetailPage />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/price-analysis" element={
        <ProtectedRoute>
          <Layout>
            <PriceAnalysisPage />
          </Layout>
        </ProtectedRoute>
      } />
      
      {/* Маршрут для управления пользователями (только для администраторов) */}
      <Route path="/users" element={
        <ProtectedRoute requiredRoles={['ROLE_ADMIN']}>
          <Layout>
            <UserManagementPage />
          </Layout>
        </ProtectedRoute>
      } />
    </Routes>
  </AuthProvider>
);

export default App; 