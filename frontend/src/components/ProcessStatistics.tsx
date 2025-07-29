import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  LinearProgress
} from '@mui/material';
import {
  Assignment as AssignmentIcon,
  Gavel as GavelIcon,
  Description as DescriptionIcon,
  Receipt as ReceiptIcon,
  LocalShipping as DeliveryIcon,
  CheckCircle as CheckCircleIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

interface ProcessStatisticsProps {
  requests: any[];
}

const StatCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  '&:hover': {
    boxShadow: theme.shadows[8],
    transform: 'translateY(-2px)',
    transition: 'all 0.3s ease-in-out'
  }
}));

const StatIcon = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 48,
  height: 48,
  borderRadius: '50%',
  marginBottom: theme.spacing(2),
  color: theme.palette.common.white
}));

export default function ProcessStatistics({ requests }: ProcessStatisticsProps) {
  const calculateStats = () => {
    if (!requests || requests.length === 0) {
      return {
        totalRequests: 0,
        totalAmount: 0,
        completedRequests: 0,
        inProgressRequests: 0,
        cancelledRequests: 0,
        averageAmount: 0,
        totalTenders: 0,
        totalInvoices: 0,
        totalDeliveries: 0
      };
    }

    const totalRequests = requests.length;
    const totalAmount = requests.reduce((sum, req) => sum + (req.requestTotalAmount || 0), 0);
    const completedRequests = requests.filter(req => req.status === 'COMPLETED').length;
    const inProgressRequests = requests.filter(req => 
      ['SUBMITTED', 'APPROVED', 'IN_PROGRESS'].includes(req.status)
    ).length;
    const cancelledRequests = requests.filter(req => req.status === 'CANCELLED').length;
    const averageAmount = totalAmount / totalRequests;
    
    const totalTenders = requests.reduce((sum, req) => sum + (req.tendersCount || 0), 0);
    const totalInvoices = requests.reduce((sum, req) => sum + (req.invoicesCount || 0), 0);
    const totalDeliveries = requests.reduce((sum, req) => sum + (req.deliveriesCount || 0), 0);

    return {
      totalRequests,
      totalAmount,
      completedRequests,
      inProgressRequests,
      cancelledRequests,
      averageAmount,
      totalTenders,
      totalInvoices,
      totalDeliveries
    };
  };

  const stats = calculateStats();
  const completionRate = stats.totalRequests > 0 ? (stats.completedRequests / stats.totalRequests) * 100 : 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
        Статистика процесса заявок
      </Typography>
      
      <Grid container spacing={3}>
        {/* Общая статистика */}
        <Grid item xs={12} md={3}>
          <StatCard>
            <CardContent>
              <StatIcon sx={{ backgroundColor: 'primary.main' }}>
                <AssignmentIcon />
              </StatIcon>
              <Typography variant="h4" component="div" gutterBottom>
                {stats.totalRequests}
              </Typography>
              <Typography color="text.secondary" variant="body2">
                Всего заявок
              </Typography>
            </CardContent>
          </StatCard>
        </Grid>

        <Grid item xs={12} md={3}>
          <StatCard>
            <CardContent>
              <StatIcon sx={{ backgroundColor: 'success.main' }}>
                <TrendingUpIcon />
              </StatIcon>
              <Typography variant="h4" component="div" gutterBottom>
                {formatCurrency(stats.totalAmount)}
              </Typography>
              <Typography color="text.secondary" variant="body2">
                Общая сумма
              </Typography>
            </CardContent>
          </StatCard>
        </Grid>

        <Grid item xs={12} md={3}>
          <StatCard>
            <CardContent>
              <StatIcon sx={{ backgroundColor: 'info.main' }}>
                <CheckCircleIcon />
              </StatIcon>
              <Typography variant="h4" component="div" gutterBottom>
                {stats.completedRequests}
              </Typography>
              <Typography color="text.secondary" variant="body2">
                Завершенные
              </Typography>
            </CardContent>
          </StatCard>
        </Grid>

        <Grid item xs={12} md={3}>
          <StatCard>
            <CardContent>
              <StatIcon sx={{ backgroundColor: 'warning.main' }}>
                <TrendingDownIcon />
              </StatIcon>
              <Typography variant="h4" component="div" gutterBottom>
                {formatCurrency(stats.averageAmount)}
              </Typography>
              <Typography color="text.secondary" variant="body2">
                Средняя сумма
              </Typography>
            </CardContent>
          </StatCard>
        </Grid>

        {/* Прогресс завершения */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Прогресс завершения
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box sx={{ flexGrow: 1, mr: 2 }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={completionRate} 
                    sx={{ height: 10, borderRadius: 5 }}
                  />
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {completionRate.toFixed(1)}%
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Chip 
                  label={`Завершено: ${stats.completedRequests}`} 
                  color="success" 
                  size="small" 
                />
                <Chip 
                  label={`В работе: ${stats.inProgressRequests}`} 
                  color="warning" 
                  size="small" 
                />
                <Chip 
                  label={`Отменено: ${stats.cancelledRequests}`} 
                  color="error" 
                  size="small" 
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Детальная статистика */}
        <Grid item xs={12} md={4}>
          <StatCard>
            <CardContent>
              <StatIcon sx={{ backgroundColor: 'secondary.main' }}>
                <GavelIcon />
              </StatIcon>
              <Typography variant="h5" component="div" gutterBottom>
                {stats.totalTenders}
              </Typography>
              <Typography color="text.secondary" variant="body2">
                Тендеров
              </Typography>
            </CardContent>
          </StatCard>
        </Grid>

        <Grid item xs={12} md={4}>
          <StatCard>
            <CardContent>
              <StatIcon sx={{ backgroundColor: 'info.main' }}>
                <DescriptionIcon />
              </StatIcon>
              <Typography variant="h5" component="div" gutterBottom>
                {stats.totalInvoices}
              </Typography>
              <Typography color="text.secondary" variant="body2">
                Счетов
              </Typography>
            </CardContent>
          </StatCard>
        </Grid>

        <Grid item xs={12} md={4}>
          <StatCard>
            <CardContent>
              <StatIcon sx={{ backgroundColor: 'success.main' }}>
                <DeliveryIcon />
              </StatIcon>
              <Typography variant="h5" component="div" gutterBottom>
                {stats.totalDeliveries}
              </Typography>
              <Typography color="text.secondary" variant="body2">
                Поставок
              </Typography>
            </CardContent>
          </StatCard>
        </Grid>
      </Grid>
    </Box>
  );
} 