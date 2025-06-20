import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import CompanyListPage from './pages/CompanyListPage';
import CompanyEditPage from './pages/CompanyEditPage';
import Layout from './components/Layout';

const App: React.FC = () => (
  <Layout>
    <Routes>
      <Route path="/" element={<Navigate to="/companies" replace />} />
      <Route path="/companies" element={<CompanyListPage />} />
      <Route path="/companies/new" element={<CompanyEditPage isEdit={false} />} />
      <Route path="/companies/:id/edit" element={<CompanyEditPage isEdit={true} />} />
    </Routes>
  </Layout>
);

export default App; 