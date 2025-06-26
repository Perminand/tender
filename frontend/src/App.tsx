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
import SupplierMaterialNamesPage from './pages/SupplierMaterialNamesPage';
import { WarehouseListPage } from './pages';

const App: React.FC = () => (
  <Layout>
    <Routes>
      <Route path="/" element={<Navigate to="/reference" replace />} />
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
      <Route path="/reference/warehouses" element={<WarehouseListPage />} />
      <Route path="/reference/supplier-material-names" element={<SupplierMaterialNamesPage />} />
    </Routes>
  </Layout>
);

export default App; 