import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import CounterpartyListPage from './pages/CounterpartyListPage';
import CounterpartyEditPage from './pages/CounterpartyEditPage';
import SettingsPage from './pages/SettingsPage';
import Layout from './components/Layout';

const App: React.FC = () => (
  <Layout>
    <Routes>
      <Route path="/" element={<Navigate to="/counterparties" replace />} />
      <Route path="/counterparties" element={<CounterpartyListPage />} />
      <Route path="/counterparties/new" element={<CounterpartyEditPage isEdit={false} />} />
      <Route path="/counterparties/:id/edit" element={<CounterpartyEditPage isEdit={true} />} />
      <Route path="/settings" element={<SettingsPage />} />
    </Routes>
  </Layout>
);

export default App; 