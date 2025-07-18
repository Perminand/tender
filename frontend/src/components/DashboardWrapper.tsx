import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import DashboardPage from '../pages/DashboardPage';
import SupplierRedirect from './SupplierRedirect';
import CustomerDashboard from './CustomerDashboard';

const DashboardWrapper: React.FC = () => {
  const { user } = useAuth();

  // Если пользователь поставщик, показываем страницу перенаправления
  if (user?.roles.includes('ROLE_SUPPLIER')) {
    return <SupplierRedirect />;
  }

  // Если пользователь заказчик, показываем специальный дашборд
  if (user?.roles.includes('ROLE_CUSTOMER')) {
    return <CustomerDashboard />;
  }

  // Для всех остальных ролей показываем стандартный дашборд
  return <DashboardPage />;
};

export default DashboardWrapper; 