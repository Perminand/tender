import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import CounterpartyListPage from './pages/CounterpartyListPage';
import CounterpartyEditPage from './pages/CounterpartyEditPage';
import MaterialListPage from './pages/MaterialListPage';
import MaterialEditPage from './pages/MaterialEditPage';
import SettingsPage from './pages/SettingsPage';
import Layout from './components/Layout';

const App: React.FC = () => (
  <Layout>
    <Routes>
      <Route path="/" element={<Navigate to="/counterparties" replace />} />
      <Route path="/counterparties" element={<CounterpartyListPage />} />
      <Route path="/counterparties/new" element={<CounterpartyEditPage isEdit={false} />} />
      <Route path="/counterparties/:id/edit" element={<CounterpartyEditPage isEdit={true} />} />
      <Route path="/materials" element={<MaterialListPage />} />
      <Route path="/materials/new" element={<MaterialEditPage isEdit={false} />} />
      <Route path="/materials/:id/edit" element={<MaterialEditPage isEdit={true} />} />
      <Route path="/settings" element={<SettingsPage />} />
    </Routes>
  </Layout>
);

export default App; 