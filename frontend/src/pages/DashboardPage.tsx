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
  TableRow
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Assessment as AssessmentIcon,
  Notifications as NotificationsIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Settings as SettingsIcon,
  Visibility as VisibilityIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  TableChart as TableChartIcon
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { api } from '../utils/api';

interface DashboardData {
  dashboardDate: string;
  metrics: {
    totalTenders: number;
    activeTenders: number;
    completedTenders: number;
    totalSavings: number;
    savingsPercentage: number;
    totalDeliveries: number;
    pendingDeliveries: number;
    overdueDeliveries: number;
    qualityAcceptanceRate: number;
    activeSuppliers: number;
    averageSupplierRating: number;
    totalBudget: number;
    spentBudget: number;
    remainingBudget: number;
    budgetUtilization: number;
    totalContracts: number;
    activeContracts: number;
    totalPayments: number;
    overduePayments: number;
  };
  activeTenders: Array<{
    id: string;
    tenderNumber: string;
    title: string;
    status: string;
    deadline: string;
    daysRemaining: number;
    proposalsCount: number;
    estimatedValue: number;
    bestOffer: number;
    potentialSavings: number;
  }>;
  urgentDeliveries: Array<{
    id: string;
    deliveryNumber: string;
    supplierName: string;
    contractNumber: string;
    plannedDate: string;
    dueDate: string;
    daysOverdue: number;
    status: string;
    totalValue: number;
  }>;
  overduePayments: Array<{
    id: string;
    paymentNumber: string;
    supplierName: string;
    contractNumber: string;
    dueDate: string;
    daysOverdue: number;
    amount: number;
    status: string;
  }>;
  topSuppliers: Array<{
    id: string;
    name: string;
    rating: number;
    totalContracts: number;
    totalValue: number;
    averageSavings: number;
    onTimeDeliveries: number;
    totalDeliveries: number;
    performanceScore: number;
  }>;
  problematicSuppliers: Array<{
    id: string;
    name: string;
    rating: number;
    qualityIssues: number;
    delayedDeliveries: number;
    riskScore: number;
    riskLevel: string;
    recommendations: string;
  }>;
  recentActivities: Array<{
    id: string;
    type: string;
    description: string;
    activityDate: string;
    status: string;
    entityType: string;
    entityId: string;
  }>;
  alerts: Array<{
    id: string;
    title: string;
    type: string;
    severity: string;
    isRead: boolean;
    createdAt: string;
    actionUrl: string;
  }>;
  unreadAlertsCount: number;
  urgentAlertsCount: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const DashboardPage: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [username] = useState('admin'); // В реальном приложении получать из контекста

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/api/dashboard?username=${username}`);
      setDashboardData(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при загрузке дашборда');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB'
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'success';
      case 'PENDING': return 'warning';
      case 'OVERDUE': return 'error';
      case 'COMPLETED': return 'info';
      case 'BIDDING': return 'primary';
      case 'DRAFT': return 'default';
      case 'AWARDED': return 'success';
      case 'CANCELLED': return 'error';
      default: return 'default';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'error';
      case 'HIGH': return 'warning';
      case 'MEDIUM': return 'info';
      case 'LOW': return 'success';
      default: return 'default';
    }
  };

  const handleExportReport = (type: string) => {
    // В реальном приложении здесь будет экспорт в Excel/PDF
    console.log(`Экспорт отчета: ${type}`);
  };

  if (loading) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={fetchDashboardData}>
          Попробовать снова
        </Button>
      </Box>
    );
  }

  if (!dashboardData) {
    return null;
  }

  const { metrics, activeTenders, urgentDeliveries, overduePayments, topSuppliers, problematicSuppliers, alerts } = dashboardData;

  return (
    <Box sx={{ p: 3 }}>
      {/* Заголовок */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Дашборд отдела снабжения
        </Typography>
        <Box>
          <Tooltip title="Обновить данные">
            <IconButton onClick={fetchDashboardData}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Экспорт в Excel">
            <IconButton onClick={() => handleExportReport('dashboard')}>
              <DownloadIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Настройки">
            <IconButton>
              <SettingsIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Вкладки */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
          <Tab label="Обзор" icon={<AssessmentIcon />} />
          <Tab label="Аналитика" icon={<BarChartIcon />} />
          <Tab label="Отчетность" icon={<TableChartIcon />} />
        </Tabs>
      </Paper>

      {/* Вкладка: Обзор */}
      {activeTab === 0 && (
        <>
          {/* Ключевые метрики */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <AssessmentIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography color="textSecondary">Активные тендеры</Typography>
                  </Box>
                  <Typography variant="h4">{metrics.activeTenders}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    Всего: {metrics.totalTenders}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <TrendingUpIcon sx={{ mr: 1, color: 'success.main' }} />
                    <Typography color="textSecondary">Экономия</Typography>
                  </Box>
                  <Typography variant="h4" color="success.main">
                    {formatCurrency(metrics.totalSavings)}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {formatPercentage(metrics.savingsPercentage)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <WarningIcon sx={{ mr: 1, color: 'warning.main' }} />
                    <Typography color="textSecondary">Просроченные поставки</Typography>
                  </Box>
                  <Typography variant="h4" color="warning.main">
                    {metrics.overdueDeliveries}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Всего: {metrics.totalDeliveries}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <CheckCircleIcon sx={{ mr: 1, color: 'info.main' }} />
                    <Typography color="textSecondary">Качество приемки</Typography>
                  </Box>
                  <Typography variant="h4" color="info.main">
                    {formatPercentage(metrics.qualityAcceptanceRate)}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Активных поставщиков: {metrics.activeSuppliers}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Графики */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, height: 400 }}>
                <Typography variant="h6" gutterBottom>Экономия по месяцам</Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={[
                    { month: 'Янв', savings: 1200000 },
                    { month: 'Фев', savings: 1500000 },
                    { month: 'Мар', savings: 1800000 },
                    { month: 'Апр', savings: 1600000 },
                    { month: 'Май', savings: 2000000 },
                    { month: 'Июн', savings: 2200000 }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <RechartsTooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Line type="monotone" dataKey="savings" stroke="#8884d8" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, height: 400 }}>
                <Typography variant="h6" gutterBottom>Статусы поставок</Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Выполнено', value: metrics.totalDeliveries - metrics.pendingDeliveries - metrics.overdueDeliveries },
                        { name: 'В процессе', value: metrics.pendingDeliveries },
                        { name: 'Просрочено', value: metrics.overdueDeliveries }
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {COLORS.map((color, index) => (
                        <Cell key={`cell-${index}`} fill={color} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
          </Grid>

          {/* Активные тендеры */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>Активные тендеры</Typography>
            <Grid container spacing={2}>
              {activeTenders.slice(0, 4).map((tender) => (
                <Grid item xs={12} sm={6} md={3} key={tender.id}>
                  <Card>
                    <CardContent>
                      <Typography variant="subtitle2" gutterBottom>
                        {tender.tenderNumber}
                      </Typography>
                      <Typography variant="body2" color="textSecondary" noWrap>
                        {tender.title}
                      </Typography>
                      <Box sx={{ mt: 1 }}>
                        <Chip 
                          label={tender.status} 
                          size="small" 
                          color={getStatusColor(tender.status) as any}
                        />
                      </Box>
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        Осталось дней: {tender.daysRemaining}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Предложений: {tender.proposalsCount}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>

          {/* Срочные поставки и просроченные платежи */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>Срочные поставки</Typography>
                {urgentDeliveries.slice(0, 3).map((delivery) => (
                  <Box key={delivery.id} sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                    <Typography variant="subtitle2">{delivery.deliveryNumber}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      {delivery.supplierName} - {delivery.contractNumber}
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                      <Chip 
                        label={`Просрочено на ${delivery.daysOverdue} дней`} 
                        size="small" 
                        color="error"
                      />
                    </Box>
                  </Box>
                ))}
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>Просроченные платежи</Typography>
                {overduePayments.slice(0, 3).map((payment) => (
                  <Box key={payment.id} sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                    <Typography variant="subtitle2">{payment.paymentNumber}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      {payment.supplierName} - {payment.contractNumber}
                    </Typography>
                    <Typography variant="body2" color="error">
                      {formatCurrency(payment.amount)} - Просрочено на {payment.daysOverdue} дней
                    </Typography>
                  </Box>
                ))}
              </Paper>
            </Grid>
          </Grid>

          {/* Топ поставщики */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>Топ поставщики</Typography>
            <Grid container spacing={2}>
              {topSuppliers.slice(0, 4).map((supplier) => (
                <Grid item xs={12} sm={6} md={3} key={supplier.id}>
                  <Card>
                    <CardContent>
                      <Typography variant="subtitle2" gutterBottom>
                        {supplier.name}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Typography variant="h6" color="primary">
                          {supplier.rating.toFixed(1)}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" sx={{ ml: 1 }}>
                          / 5.0
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="textSecondary">
                        Контрактов: {supplier.totalContracts}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Своевременность: {supplier.onTimeDeliveries}/{supplier.totalDeliveries}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>

          {/* Алерты */}
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Уведомления</Typography>
              <Badge badgeContent={dashboardData.unreadAlertsCount} color="error">
                <NotificationsIcon />
              </Badge>
            </Box>
            {alerts.slice(0, 5).map((alert) => (
              <Box key={alert.id} sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="subtitle2">{alert.title}</Typography>
                  <Chip 
                    label={alert.severity} 
                    size="small" 
                    color={getSeverityColor(alert.severity) as any}
                  />
                </Box>
                <Typography variant="body2" color="textSecondary">
                  {alert.type} - {new Date(alert.createdAt).toLocaleDateString('ru-RU')}
                </Typography>
              </Box>
            ))}
          </Paper>
        </>
      )}

      {/* Вкладка: Аналитика */}
      {activeTab === 1 && (
        <>
          {/* Статистика тендеров */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" color="textSecondary">Всего тендеров</Typography>
                  <Typography variant="h4" color="primary">{metrics.totalTenders}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    Активных: {metrics.activeTenders} | Завершённых: {metrics.completedTenders}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" color="textSecondary">Контракты</Typography>
                  <Typography variant="h4" color="primary">{metrics.totalContracts}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    Активных: {metrics.activeContracts}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" color="textSecondary">Поставки</Typography>
                  <Typography variant="h4" color="primary">{metrics.totalDeliveries}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    В процессе: {metrics.pendingDeliveries} | Просрочено: {metrics.overdueDeliveries}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Графики аналитики */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, height: 400 }}>
                <Typography variant="h6" gutterBottom>Статусы тендеров</Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Активные', value: metrics.activeTenders },
                        { name: 'Завершённые', value: metrics.completedTenders },
                        { name: 'Черновики', value: metrics.totalTenders - metrics.activeTenders - metrics.completedTenders }
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {COLORS.map((color, index) => (
                        <Cell key={`cell-${index}`} fill={color} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, height: 400 }}>
                <Typography variant="h6" gutterBottom>Бюджет и экономия</Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={[
                    { name: 'Бюджет', value: metrics.totalBudget },
                    { name: 'Потрачено', value: metrics.spentBudget },
                    { name: 'Экономия', value: metrics.totalSavings }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <RechartsTooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Bar dataKey="value" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
          </Grid>

          {/* Проблемные поставщики */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>Проблемные поставщики</Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Поставщик</TableCell>
                    <TableCell>Рейтинг</TableCell>
                    <TableCell>Проблемы качества</TableCell>
                    <TableCell>Задержки поставок</TableCell>
                    <TableCell>Уровень риска</TableCell>
                    <TableCell>Рекомендации</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {problematicSuppliers.map((supplier) => (
                    <TableRow key={supplier.id}>
                      <TableCell>{supplier.name}</TableCell>
                      <TableCell>{supplier.rating.toFixed(1)}</TableCell>
                      <TableCell>{supplier.qualityIssues}</TableCell>
                      <TableCell>{supplier.delayedDeliveries}</TableCell>
                      <TableCell>
                        <Chip 
                          label={supplier.riskLevel} 
                          size="small" 
                          color={supplier.riskLevel === 'ВЫСОКИЙ' ? 'error' : 
                                 supplier.riskLevel === 'СРЕДНИЙ' ? 'warning' : 'success'}
                        />
                      </TableCell>
                      <TableCell>{supplier.recommendations}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </>
      )}

      {/* Вкладка: Отчетность */}
      {activeTab === 2 && (
        <>
          {/* Основные метрики отчетности */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <AssessmentIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography color="textSecondary">Тендеры</Typography>
                  </Box>
                  <Typography variant="h4">{metrics.totalTenders}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    Активных: {metrics.activeTenders}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <TrendingUpIcon sx={{ mr: 1, color: 'success.main' }} />
                    <Typography color="textSecondary">Контракты</Typography>
                  </Box>
                  <Typography variant="h4">{metrics.totalContracts}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    Активных: {metrics.activeContracts}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>Поставки</Typography>
                  <Typography variant="h4">{metrics.totalDeliveries}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    Ожидают: {metrics.pendingDeliveries}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>Экономия</Typography>
                  <Typography variant="h4" color="success.main">
                    {formatCurrency(metrics.totalSavings)}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {formatPercentage(metrics.savingsPercentage)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Топ поставщики в таблице */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>Топ поставщики</Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Поставщик</TableCell>
                    <TableCell>Рейтинг</TableCell>
                    <TableCell>Контракты</TableCell>
                    <TableCell>Общая стоимость</TableCell>
                    <TableCell>Средняя экономия</TableCell>
                    <TableCell>Своевременность</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {topSuppliers.map((supplier) => (
                    <TableRow key={supplier.id}>
                      <TableCell>{supplier.name}</TableCell>
                      <TableCell>{supplier.rating.toFixed(1)}</TableCell>
                      <TableCell>{supplier.totalContracts}</TableCell>
                      <TableCell>{formatCurrency(supplier.totalValue)}</TableCell>
                      <TableCell>{formatCurrency(supplier.averageSavings)}</TableCell>
                      <TableCell>
                        {supplier.totalDeliveries > 0 
                          ? `${Math.round((supplier.onTimeDeliveries / supplier.totalDeliveries) * 100)}%`
                          : '0%'
                        }
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          {/* Последняя активность */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>Последняя активность</Typography>
            <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
              {dashboardData.recentActivities.map((activity, index) => (
                <Box key={index} sx={{ mb: 2, p: 1, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" fontWeight="bold">
                      {activity.description}
                    </Typography>
                    <Chip
                      label={activity.status}
                      color={getStatusColor(activity.status) as any}
                      size="small"
                    />
                  </Box>
                  <Typography variant="caption" color="textSecondary">
                    {new Date(activity.activityDate).toLocaleDateString('ru-RU')}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Paper>

          {/* Кнопки экспорта */}
          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={() => handleExportReport('tenders')}
            >
              Экспорт тендеров
            </Button>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={() => handleExportReport('contracts')}
            >
              Экспорт контрактов
            </Button>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={() => handleExportReport('deliveries')}
            >
              Экспорт поставок
            </Button>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={() => handleExportReport('payments')}
            >
              Экспорт платежей
            </Button>
          </Box>
        </>
      )}
    </Box>
  );
};

export default DashboardPage; 