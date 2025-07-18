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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import UserInfo from '../components/UserInfo';
import QuickActions from '../components/QuickActions';
import { useAuth } from '../contexts/AuthContext';
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
  TableChart as TableChartIcon,
  ExpandMore as ExpandMoreIcon,
  Assignment as AssignmentIcon,
  LocalShipping as LocalShippingIcon,
  Payment as PaymentIcon,
  Business as BusinessIcon,
  Timeline as TimelineIcon,
  PriorityHigh as PriorityHighIcon
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
  const { user } = useAuth();
  const username = user?.username;

  useEffect(() => {
    if (username) {
    fetchDashboardData();
    }
  }, [username]);

  const fetchDashboardData = async () => {
    if (!username) {
      setError('Имя пользователя не определено');
      setLoading(false);
      return;
    }
    
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
      case 'ACTIVE':
      case 'COMPLETED':
        return 'success';
      case 'PENDING':
      case 'IN_PROGRESS':
        return 'warning';
      case 'CANCELLED':
      case 'OVERDUE':
        return 'error';
      default:
        return 'default';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'HIGH':
        return 'error';
      case 'MEDIUM':
        return 'warning';
      case 'LOW':
        return 'info';
      default:
        return 'default';
    }
  };

  const handleExportReport = (type: string) => {
    // Логика экспорта
    console.log(`Экспорт ${type}`);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!dashboardData) {
    return null;
  }

  const { metrics, activeTenders, urgentDeliveries, overduePayments, topSuppliers, problematicSuppliers, alerts } = dashboardData;

  return (
    <Box sx={{ p: 3 }}>
      <UserInfo />
      
      {/* Быстрые действия */}
      <QuickActions />
      
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
          <Tab label="Тендеры" icon={<AssignmentIcon />} />
          <Tab label="Поставки" icon={<LocalShippingIcon />} />
          <Tab label="Финансы" icon={<PaymentIcon />} />
          <Tab label="Поставщики" icon={<BusinessIcon />} />
          <Tab label="Аналитика" icon={<BarChartIcon />} />
        </Tabs>
      </Paper>

      {/* Вкладка: Обзор */}
      {activeTab === 0 && (
        <Grid container spacing={3}>
          {/* Ключевые метрики */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AssessmentIcon />
                Ключевые показатели
              </Typography>
              <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <AssignmentIcon sx={{ mr: 1, color: 'primary.main' }} />
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
            </Paper>
          </Grid>

          {/* Графики */}
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
                                              label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
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

          {/* Срочные уведомления */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PriorityHighIcon />
                Срочные уведомления
              </Typography>
              <Grid container spacing={2}>
                {urgentDeliveries.slice(0, 3).map((delivery) => (
                  <Grid item xs={12} md={4} key={delivery.id}>
                    <Alert severity="warning" sx={{ mb: 1 }}>
                      <Typography variant="subtitle2">
                        Поставка {delivery.deliveryNumber}
                      </Typography>
                      <Typography variant="body2">
                        {delivery.supplierName} - {delivery.daysOverdue} дней просрочки
                      </Typography>
                    </Alert>
                  </Grid>
                ))}
                {overduePayments.slice(0, 3).map((payment) => (
                  <Grid item xs={12} md={4} key={payment.id}>
                    <Alert severity="error" sx={{ mb: 1 }}>
                      <Typography variant="subtitle2">
                        Платеж {payment.paymentNumber}
                      </Typography>
                      <Typography variant="body2">
                        {formatCurrency(payment.amount)} - {payment.daysOverdue} дней просрочки
                      </Typography>
                    </Alert>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Вкладка: Тендеры */}
      {activeTab === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AssignmentIcon />
                Активные тендеры
              </Typography>
            <Grid container spacing={2}>
                {activeTenders.map((tender) => (
                  <Grid item xs={12} sm={6} md={4} key={tender.id}>
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
                        <Typography variant="body2" color="textSecondary">
                          Экономия: {formatCurrency(tender.potentialSavings)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
          </Grid>
        </Grid>
      )}

      {/* Вкладка: Поставки */}
      {activeTab === 2 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocalShippingIcon />
                Срочные поставки
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Номер поставки</TableCell>
                      <TableCell>Поставщик</TableCell>
                      <TableCell>Контракт</TableCell>
                      <TableCell>Срок поставки</TableCell>
                      <TableCell>Просрочка</TableCell>
                      <TableCell>Статус</TableCell>
                      <TableCell>Сумма</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {urgentDeliveries.map((delivery) => (
                      <TableRow key={delivery.id}>
                        <TableCell>{delivery.deliveryNumber}</TableCell>
                        <TableCell>{delivery.supplierName}</TableCell>
                        <TableCell>{delivery.contractNumber}</TableCell>
                        <TableCell>{delivery.dueDate}</TableCell>
                        <TableCell>
                          <Chip 
                            label={`${delivery.daysOverdue} дн.`} 
                            color="error" 
                            size="small" 
                          />
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={delivery.status} 
                            color={getStatusColor(delivery.status) as any}
                            size="small" 
                          />
                        </TableCell>
                        <TableCell>{formatCurrency(delivery.totalValue)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Вкладка: Финансы */}
      {activeTab === 3 && (
        <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PaymentIcon />
                Просроченные платежи
                    </Typography>
              <List>
                {overduePayments.map((payment) => (
                  <ListItem key={payment.id} divider>
                    <ListItemIcon>
                      <ErrorIcon color="error" />
                    </ListItemIcon>
                    <ListItemText
                      primary={payment.paymentNumber}
                      secondary={`${payment.supplierName} - ${formatCurrency(payment.amount)}`}
                    />
                      <Chip 
                      label={`${payment.daysOverdue} дн.`} 
                      color="error" 
                        size="small" 
                      />
                  </ListItem>
                ))}
              </List>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Бюджет</Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Общий бюджет
                </Typography>
                <Typography variant="h5">
                  {formatCurrency(metrics.totalBudget)}
                </Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Потрачено
                </Typography>
                <Typography variant="h5" color="warning.main">
                  {formatCurrency(metrics.spentBudget)}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Остаток
                    </Typography>
                <Typography variant="h5" color="success.main">
                  {formatCurrency(metrics.remainingBudget)}
                    </Typography>
                  </Box>
              </Paper>
            </Grid>
          </Grid>
      )}

      {/* Вкладка: Поставщики */}
      {activeTab === 4 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <BusinessIcon />
                Топ поставщики
                      </Typography>
              <List>
                {topSuppliers.map((supplier) => (
                  <ListItem key={supplier.id} divider>
                    <ListItemText
                      primary={supplier.name}
                      secondary={`Рейтинг: ${supplier.rating}/5 | Контрактов: ${supplier.totalContracts}`}
                    />
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="body2" color="success.main">
                        {formatCurrency(supplier.averageSavings)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        средняя экономия
                      </Typography>
                    </Box>
                  </ListItem>
              ))}
              </List>
            </Paper>
            </Grid>

          <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <WarningIcon />
                Проблемные поставщики
              </Typography>
              <List>
                {problematicSuppliers.map((supplier) => (
                  <ListItem key={supplier.id} divider>
                    <ListItemIcon>
                      <WarningIcon color="warning" />
                    </ListItemIcon>
                    <ListItemText
                      primary={supplier.name}
                      secondary={`Риск: ${supplier.riskLevel} | Просрочек: ${supplier.delayedDeliveries}`}
                    />
                  <Chip 
                      label={supplier.riskLevel} 
                      color={supplier.riskLevel === 'HIGH' ? 'error' : 'warning'}
                    size="small" 
                  />
                  </ListItem>
                ))}
              </List>
          </Paper>
          </Grid>
        </Grid>
      )}

      {/* Вкладка: Аналитика */}
      {activeTab === 5 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <BarChartIcon />
                Аналитические графики
                  </Typography>
              <Grid container spacing={3}>
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
                          label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
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
              </Paper>
            </Grid>
          </Grid>
      )}
    </Box>
  );
};

export default DashboardPage; 