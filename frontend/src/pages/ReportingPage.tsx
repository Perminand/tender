import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon,
  Download as DownloadIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';

interface ReportData {
  totalTenders: number;
  activeTenders: number;
  completedTenders: number;
  totalContracts: number;
  activeContracts: number;
  totalDeliveries: number;
  pendingDeliveries: number;
  totalPayments: number;
  pendingPayments: number;
  totalSavings: number;
  averageTenderDuration: number;
  topSuppliers: Array<{
    name: string;
    contracts: number;
    totalAmount: number;
  }>;
  recentActivity: Array<{
    type: string;
    description: string;
    date: string;
    status: string;
  }>;
}

const ReportingPage: React.FC = () => {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      // В реальном приложении здесь будут API вызовы
      // Пока используем моковые данные
      const mockData: ReportData = {
        totalTenders: 45,
        activeTenders: 12,
        completedTenders: 28,
        totalContracts: 32,
        activeContracts: 18,
        totalDeliveries: 156,
        pendingDeliveries: 23,
        totalPayments: 89,
        pendingPayments: 15,
        totalSavings: 1250000,
        averageTenderDuration: 14,
        topSuppliers: [
          { name: 'ООО "Стройматериалы"', contracts: 8, totalAmount: 4500000 },
          { name: 'ИП Иванов А.А.', contracts: 6, totalAmount: 3200000 },
          { name: 'ООО "МеталлСнаб"', contracts: 5, totalAmount: 2800000 },
        ],
        recentActivity: [
          { type: 'TENDER', description: 'Создан тендер №T-2024-001', date: '2024-01-15', status: 'PUBLISHED' },
          { type: 'CONTRACT', description: 'Подписан контракт №CON-2024-001', date: '2024-01-14', status: 'ACTIVE' },
          { type: 'DELIVERY', description: 'Поставка по контракту №CON-2024-001', date: '2024-01-13', status: 'COMPLETED' },
          { type: 'PAYMENT', description: 'Оплата по контракту №CON-2024-001', date: '2024-01-12', status: 'PAID' },
        ]
      };
      setReportData(mockData);
    } catch (error) {
      console.error('Ошибка при загрузке отчетов:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportReport = (type: string) => {
    // В реальном приложении здесь будет экспорт в Excel/PDF
    console.log(`Экспорт отчета: ${type}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'success';
      case 'COMPLETED': return 'info';
      case 'PENDING': return 'warning';
      case 'PUBLISHED': return 'primary';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (!reportData) {
    return <Alert severity="error">Ошибка загрузки данных</Alert>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Отчетность и аналитика
      </Typography>

      {/* Основные метрики */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <AssessmentIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography color="textSecondary">
                  Тендеры
                </Typography>
              </Box>
              <Typography variant="h4">
                {reportData.totalTenders}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Активных: {reportData.activeTenders}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TrendingUpIcon sx={{ mr: 1, color: 'success.main' }} />
                <Typography color="textSecondary">
                  Контракты
                </Typography>
              </Box>
              <Typography variant="h4">
                {reportData.totalContracts}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Активных: {reportData.activeContracts}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Поставки
              </Typography>
              <Typography variant="h4">
                {reportData.totalDeliveries}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Ожидают: {reportData.pendingDeliveries}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Экономия
              </Typography>
              <Typography variant="h4" color="success.main">
                {reportData.totalSavings.toLocaleString()} ₽
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Средняя: {(reportData.totalSavings / reportData.totalContracts).toLocaleString()} ₽
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Топ поставщиков */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Топ поставщиков
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Поставщик</TableCell>
                      <TableCell>Контракты</TableCell>
                      <TableCell>Сумма</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {reportData.topSuppliers.map((supplier, index) => (
                      <TableRow key={index}>
                        <TableCell>{supplier.name}</TableCell>
                        <TableCell>{supplier.contracts}</TableCell>
                        <TableCell>{supplier.totalAmount.toLocaleString()} ₽</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Последняя активность */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Последняя активность
              </Typography>
              <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                {reportData.recentActivity.map((activity, index) => (
                  <Box key={index} sx={{ mb: 2, p: 1, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="body2" fontWeight="bold">
                        {activity.description}
                      </Typography>
                      <Chip
                        label={activity.status}
                        color={getStatusColor(activity.status)}
                        size="small"
                      />
                    </Box>
                    <Typography variant="caption" color="textSecondary">
                      {new Date(activity.date).toLocaleDateString('ru-RU')}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

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
    </Box>
  );
};

export default ReportingPage; 