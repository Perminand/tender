import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Paper,
  Button,
  Chip,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
  Badge,
  Tabs,
  Tab,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import {
  Assignment as AssignmentIcon,
  Description as DescriptionIcon,
  LocalShipping as LocalShippingIcon,
  Payment as PaymentIcon,
  Business as BusinessIcon,
  Timeline as TimelineIcon,
  PriorityHigh as PriorityHighIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../utils/api';

interface CustomerDashboardData {
  totalContracts: number;
  activeContracts: number;
  completedContracts: number;
  totalValue: number;
  pendingDeliveries: number;
  overdueDeliveries: number;
  totalPayments: number;
  overduePayments: number;
  recentContracts: Array<{
    id: string;
    contractNumber: string;
    supplierName: string;
    status: string;
    totalValue: number;
    startDate: string;
    endDate: string;
  }>;
  pendingDeliveriesList: Array<{
    id: string;
    deliveryNumber: string;
    supplierName: string;
    contractNumber: string;
    dueDate: string;
    daysOverdue: number;
    status: string;
    totalValue: number;
  }>;
  overduePaymentsList: Array<{
    id: string;
    paymentNumber: string;
    supplierName: string;
    contractNumber: string;
    dueDate: string;
    daysOverdue: number;
    amount: number;
    status: string;
  }>;
}

const CustomerDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<CustomerDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const { user, token, isLoading: authLoading } = useAuth();
  const username = user?.username;

  useEffect(() => {
    if (!token || authLoading || !username) return;
    
    // Небольшая задержка для обновления Axios interceptor
    const timer = setTimeout(() => {
      fetchCustomerDashboardData();
    }, 100);
    
    return () => clearTimeout(timer);
  }, [token, authLoading, username]);

  const fetchCustomerDashboardData = async () => {
    if (!username) {
      setError('Имя пользователя не определено');
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      // Пока используем моковые данные, так как бэкенд может не иметь специального эндпоинта для заказчика
      const mockData: CustomerDashboardData = {
        totalContracts: 5,
        activeContracts: 3,
        completedContracts: 2,
        totalValue: 2500000,
        pendingDeliveries: 2,
        overdueDeliveries: 0,
        totalPayments: 8,
        overduePayments: 1,
        recentContracts: [
          {
            id: '1',
            contractNumber: 'CTR-2025-001',
            supplierName: 'ООО "СтройМаркет"',
            status: 'ACTIVE',
            totalValue: 500000,
            startDate: '2025-01-15',
            endDate: '2025-12-31'
          },
          {
            id: '2',
            contractNumber: 'CTR-2025-002',
            supplierName: 'ИП Иванов А.А.',
            status: 'ACTIVE',
            totalValue: 300000,
            startDate: '2025-02-01',
            endDate: '2025-08-31'
          }
        ],
        pendingDeliveriesList: [
          {
            id: '1',
            deliveryNumber: 'DEL-2025-001',
            supplierName: 'ООО "СтройМаркет"',
            contractNumber: 'CTR-2025-001',
            dueDate: '2025-07-25',
            daysOverdue: 0,
            status: 'PENDING',
            totalValue: 150000
          }
        ],
        overduePaymentsList: [
          {
            id: '1',
            paymentNumber: 'PAY-2025-001',
            supplierName: 'ИП Иванов А.А.',
            contractNumber: 'CTR-2025-002',
            dueDate: '2025-07-15',
            daysOverdue: 3,
            amount: 75000,
            status: 'OVERDUE'
          }
        ]
      };
      setDashboardData(mockData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при загрузке дашборда');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'success';
      case 'COMPLETED':
        return 'info';
      case 'PENDING':
        return 'warning';
      case 'OVERDUE':
        return 'error';
      default:
        return 'default';
    }
  };

  const handleExportReport = (type: string) => {
    console.log(`Экспорт отчета: ${type}`);
  };

  if (authLoading || !token) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!dashboardData) {
    return (
      <Alert severity="info">
        Данные дашборда недоступны
      </Alert>
    );
  }

  const { totalContracts, activeContracts, completedContracts, totalValue, pendingDeliveries, overdueDeliveries, totalPayments, overduePayments, recentContracts, pendingDeliveriesList, overduePaymentsList } = dashboardData;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Дашборд заказчика
        </Typography>
        <Box>
          <Tooltip title="Обновить данные">
            <IconButton onClick={fetchCustomerDashboardData}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Экспорт отчета">
            <IconButton onClick={() => handleExportReport('customer')}>
              <DownloadIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Ключевые показатели */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="textSecondary" gutterBottom>
                Контракты
              </Typography>
              <Typography variant="h4" component="div">
                {activeContracts}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Активных из {totalContracts}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="textSecondary" gutterBottom>
                Общая стоимость
              </Typography>
              <Typography variant="h4" component="div">
                {formatCurrency(totalValue)}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                По всем контрактам
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Вкладки */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
          <Tab label="ОБЗОР" />
          <Tab label="КОНТРАКТЫ" />
        </Tabs>
      </Paper>

      {/* Вкладка: Обзор */}
      {activeTab === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <DescriptionIcon />
                Последние контракты
              </Typography>
              <List>
                {recentContracts.map((contract) => (
                  <ListItem key={contract.id} divider>
                    <ListItemText
                      primary={contract.contractNumber}
                      secondary={`${contract.supplierName} - ${formatCurrency(contract.totalValue)}`}
                    />
                    <Chip 
                      label={contract.status} 
                      color={getStatusColor(contract.status) as any}
                      size="small" 
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PriorityHighIcon />
                Статус контрактов
              </Typography>
              <Alert severity="success">
                <Typography variant="body2">
                  Все контракты активны и выполняются в срок
                </Typography>
              </Alert>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Вкладка: Контракты */}
      {activeTab === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <DescriptionIcon />
                Мои контракты
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Номер контракта</TableCell>
                      <TableCell>Поставщик</TableCell>
                      <TableCell>Статус</TableCell>
                      <TableCell>Сумма</TableCell>
                      <TableCell>Дата начала</TableCell>
                      <TableCell>Дата окончания</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentContracts.map((contract) => (
                      <TableRow key={contract.id}>
                        <TableCell>{contract.contractNumber}</TableCell>
                        <TableCell>{contract.supplierName}</TableCell>
                        <TableCell>
                          <Chip 
                            label={contract.status} 
                            color={getStatusColor(contract.status) as any}
                            size="small" 
                          />
                        </TableCell>
                        <TableCell>{formatCurrency(contract.totalValue)}</TableCell>
                        <TableCell>{contract.startDate}</TableCell>
                        <TableCell>{contract.endDate}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        </Grid>
      )}


    </Box>
  );
};

export default CustomerDashboard; 