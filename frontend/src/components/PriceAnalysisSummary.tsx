import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  Chip,
  Button,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Assessment as AssessmentIcon,
  CurrencyRuble as CurrencyRubleIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';

interface PriceSummaryDto {
  totalEstimatedPrice: number;
  totalBestPrice: number;
  totalSavings: number;
  savingsPercentage: number;
  totalProposals: number;
  activeSuppliers: number;
  averagePriceDeviation: number;
  suppliersWithBestPrices: string[];
}

interface PriceAnalysisSummaryProps {
  tenderId: string;
  tenderTitle: string;
  tenderNumber: string;
}

const PriceAnalysisSummary: React.FC<PriceAnalysisSummaryProps> = ({
  tenderId,
  tenderTitle,
  tenderNumber
}) => {
  const [summary, setSummary] = useState<PriceSummaryDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadPriceSummary();
  }, [tenderId]);

  const loadPriceSummary = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/tenders/${tenderId}/statistics`);
      setSummary(response.data);
      setError(null);
    } catch (error) {
      console.error('Error loading price summary:', error);
      setError('Ошибка загрузки анализа цен');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      currencyDisplay: 'symbol'
    }).format(price);
  };

  const formatPercentage = (percentage: number) => {
    return `${percentage.toFixed(1)}%`;
  };

  const getDeviationColor = (deviation: number) => {
    if (deviation < -10) return 'success';
    if (deviation > 10) return 'error';
    return 'warning';
  };

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="100px">
            <CircularProgress size={24} />
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent>
          <Alert severity="error">{error}</Alert>
        </CardContent>
      </Card>
    );
  }

  if (!summary) {
    return null;
  }

  // Скрываем блок, если нет предложений
  if (summary.totalProposals === 0) {
    return null;
  }

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Анализ цен</Typography>
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                <Typography variant="h6" color={summary.totalSavings < 0 ? 'error.main' : 'success.main'}>
                  {formatPrice(summary.totalSavings)}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Экономия ({formatPercentage(summary.savingsPercentage)})
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6">
                {summary.totalProposals}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Предложений
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6">
                {summary.activeSuppliers}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Поставщиков
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Chip
                icon={summary.averagePriceDeviation < 0 ? <TrendingDownIcon /> : <TrendingUpIcon />}
                label={formatPercentage(summary.averagePriceDeviation)}
                color={getDeviationColor(summary.averagePriceDeviation)}
                size="small"
              />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Отклонение цен
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {summary.suppliersWithBestPrices.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Лучшие цены предлагают:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {summary.suppliersWithBestPrices.slice(0, 3).map((supplier, index) => (
                <Chip
                  key={index}
                  label={supplier}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              ))}
              {summary.suppliersWithBestPrices.length > 3 && (
                <Chip
                  label={`+${summary.suppliersWithBestPrices.length - 3}`}
                  size="small"
                  color="default"
                />
              )}
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default PriceAnalysisSummary; 