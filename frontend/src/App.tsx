import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
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
import AnalyticsPage from './pages/AnalyticsPage';
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
import ReportingPage from './pages/ReportingPage';
import DeliveryEditPage from './pages/DeliveryEditPage';
import PaymentEditPage from './pages/PaymentEditPage';
import PaymentDetailPage from './pages/PaymentDetailPage';

const App: React.FC = () => (
  <Layout>
    <Routes>
      <Route path="/" element={<Navigate to="/reporting" replace />} />
      <Route path="/counterparties" element={<CounterpartyListPage />} />
      <Route path="/counterparties/new" element={<CounterpartyEditPage isEdit={false} />} />
      <Route path="/counterparties/:id/edit" element={<CounterpartyEditPage isEdit={true} />} />
      <Route path="/materials" element={<MaterialListPage />} />
      <Route path="/materials/new" element={<MaterialEditPage isEdit={false} />} />
      <Route path="/materials/:id/edit" element={<MaterialEditPage isEdit={true} />} />
      <Route path="/units" element={<UnitListPage />} />
      <Route path="/reference" element={<ReferenceBooksPage />} />
      <Route path="/reference/categories" element={<CategoryListPage />} />
      <Route path="/reference/material-types" element={<MaterialTypeListPage />} />
      <Route path="/reference/units" element={<UnitListPage />} />
      <Route path="/reference/contact-types" element={<ContactTypesPage />} />
      <Route path="/reference/projects" element={<ProjectListPage />} />
      <Route path="/reference/counterparties" element={<CounterpartyListPage />} />
      <Route path="/reference/counterparties/new" element={<CounterpartyEditPage isEdit={false} />} />
      <Route path="/reference/counterparties/:id/edit" element={<CounterpartyEditPage isEdit={true} />} />
      <Route path="/reference/materials" element={<MaterialListPage />} />
      <Route path="/reference/materials/new" element={<MaterialEditPage isEdit={false} />} />
      <Route path="/reference/materials/:id/edit" element={<MaterialEditPage isEdit={true} />} />
      <Route path="/contact-types" element={<ContactTypesPage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="/requests/registry" element={<RequestRegistryPage />} />
      <Route path="/reference/requests/registry" element={<RequestRegistryPage />} />
      <Route path="/requests/new" element={<RequestEditPage />} />
      <Route path="/requests/:id/edit" element={<RequestEditPage />} />
      <Route path="/requests/:id" element={<RequestDetailPage />} />
      <Route path="/reference/warehouses" element={<WarehouseListPage />} />
      <Route path="/tenders" element={<TenderListPage />} />
      <Route path="/tenders/new" element={<TenderEditPage />} />
      <Route path="/tenders/:id" element={<TenderDetailPage />} />
      <Route path="/tenders/:id/edit" element={<TenderEditPage />} />
      <Route path="/tenders/:tenderId/proposals/new" element={<ProposalEditPage />} />
      <Route path="/tenders/:tenderId/price-analysis" element={<PriceAnalysisPage />} />
      <Route path="/tenders/:tenderId/contract/new/:supplierId" element={<ContractEditPage />} />
      <Route path="/tenders/:tenderId/contract/new" element={<ContractEditPage />} />
      <Route path="/proposals" element={<ProposalRegistryPage />} />
      <Route path="/proposals/:id" element={<ProposalDetailPage />} />
      <Route path="/notifications" element={<NotificationListPage />} />
      <Route path="/analytics" element={<AnalyticsPage />} />
      <Route path="/reporting" element={<ReportingPage />} />
      <Route path="/contracts" element={<ContractListPage />} />
      <Route path="/contracts/new" element={<ContractEditPage />} />
      <Route path="/contracts/:id" element={<ContractDetailPage />} />
      <Route path="/contracts/:id/edit" element={<ContractEditPage />} />
      <Route path="/contracts/:id/manage" element={<ContractManagementPage />} />
      <Route path="/deliveries" element={<DeliveryListPage />} />
      <Route path="/deliveries/new" element={<DeliveryEditPage />} />
      <Route path="/deliveries/:id" element={<DeliveryDetailPage />} />
      <Route path="/payments" element={<PaymentListPage />} />
      <Route path="/payments/new" element={<PaymentEditPage />} />
      <Route path="/payments/:id" element={<PaymentDetailPage />} />
      <Route path="/payments/:id/edit" element={<PaymentEditPage />} />
      <Route path="/documents" element={<DocumentListPage />} />
      <Route path="/documents/:id" element={<DocumentDetailPage />} />
    </Routes>
  </Layout>
);

export default App; 