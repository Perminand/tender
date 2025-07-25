import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Chip,
  Alert,
  CircularProgress,
  Button
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  CurrencyRuble as CurrencyRubleIcon,
  Assessment as AssessmentIcon,
  SaveAlt as SaveAltIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { api } from '../utils/api';

interface PriceAnalysisDto {
  tenderId: string;
  tenderNumber: string;
  tenderTitle: string;
  items: PriceAnalysisItemDto[];
  summary: PriceSummaryDto;
}

interface PriceAnalysisItemDto {
  tenderItemId: string;
  itemNumber: number;
  description: string;
  quantity: number;
  unitName: string;
  estimatedPrice: number;
  supplierPrices: SupplierPriceDto[];
  bestPrice: SupplierPriceDto | null;
  priceDeviation: number;
  proposalsCount: number;
}

interface SupplierPriceDto {
  supplierId: string;
  supplierName: string;
  supplierEmail: string;
  proposalId: string;
  proposalNumber: string;
  unitPrice: number;
  totalPrice: number;
  currency: string;
  deliveryPeriod: string;
  warranty: string;
  additionalInfo: string;
  isBestPrice: boolean;
}

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

const PriceAnalysisPage: React.FC = () => {
  const { tenderId } = useParams<{ tenderId: string }>();
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState<PriceAnalysisDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (tenderId) {
      loadPriceAnalysis();
    }
  }, [tenderId]);

  const loadPriceAnalysis = async () => {
    try {
      setLoading(true);
      console.log('Loading price analysis for tender:', tenderId);
      const response = await api.get(`/api/price-analysis/tender/${tenderId}`);
      console.log('Price analysis response:', response.data);
      setAnalysis(response.data);
      setError(null);
    } catch (error: any) {
      console.error('Error loading price analysis:', error);
      console.error('Error details:', error.response?.data);
      setError(`Ошибка загрузки анализа цен: ${error.response?.data?.message || error.message}`);
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

  const getDeviationIcon = (deviation: number) => {
    if (deviation < -10) return <TrendingDownIcon />;
    if (deviation > 10) return <TrendingUpIcon />;
    return <WarningIcon />;
  };

  const handleExport = async () => {
    if (!tenderId) return;
    try {
      const response = await api.get(`/api/price-analysis/tender/${tenderId}/export`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Анализ_цен_${tenderId}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      setError('Ошибка экспорта отчёта');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(`/tenders/${tenderId}`)}
          variant="outlined"
        >
          Вернуться к тендеру
        </Button>
      </Box>
    );
  }

  if (!analysis) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="info" sx={{ mb: 2 }}>
          Анализ цен недоступен для данного тендера. Возможно, по тендеру нет предложений поставщиков.
        </Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(`/tenders/${tenderId}`)}
          variant="outlined"
        >
          Вернуться к тендеру
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 1 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(`/tenders/${analysis.tenderId}`)}
          sx={{ minWidth: 0, p: 1 }}
        />
        <Typography variant="h4" gutterBottom sx={{ ml: 2 }}>
          Анализ цен - {analysis.tenderTitle}
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
        <Button
          variant="outlined"
          startIcon={<SaveAltIcon />}
          onClick={handleExport}
        >
          Скачать отчёт
        </Button>
      </Box>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Тендер №{analysis.tenderNumber}
      </Typography>

      {/* Сводка */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Typography variant="h6">Экономия</Typography>
              </Box>
              <Typography variant="h4" color="success.main">
                {analysis.summary.totalProposals === 0 ? '—' : formatPrice(analysis.summary.totalSavings)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {analysis.summary.totalProposals === 0 ? '—' : `${formatPercentage(analysis.summary.savingsPercentage)} от сметной стоимости`}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <AssessmentIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Предложений</Typography>
              </Box>
              <Typography variant="h4">
                {analysis.summary.totalProposals}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                от {analysis.summary.activeSuppliers} поставщиков
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <CheckCircleIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Сметная стоимость</Typography>
              </Box>
              <Typography variant="h4">
                {formatPrice(analysis.summary.totalEstimatedPrice)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Лучшая цена: {analysis.summary.totalProposals === 0 ? '—' : formatPrice(analysis.summary.totalBestPrice)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <TrendingUpIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Отклонение цен</Typography>
              </Box>
              <Typography variant="h4" color={getDeviationColor(analysis.summary.averagePriceDeviation)}>
                {analysis.summary.totalProposals === 0 ? '—' : formatPercentage(analysis.summary.averagePriceDeviation)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                среднее отклонение от сметы
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Детальный анализ по позициям */}
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Анализ по позициям
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>№</TableCell>
                <TableCell>Описание</TableCell>
                <TableCell>Кол-во</TableCell>
                <TableCell>Ед.изм.</TableCell>
                <TableCell>Сметная цена</TableCell>
                <TableCell>Лучшая цена</TableCell>
                <TableCell>Отклонение</TableCell>
                <TableCell>Предложений</TableCell>
                <TableCell>Лучший поставщик</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {analysis.items.map((item) => (
                <TableRow key={item.tenderItemId}>
                  <TableCell>{item.itemNumber}</TableCell>
                  <TableCell>{item.description}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>{item.unitName}</TableCell>
                  <TableCell>{formatPrice(item.estimatedPrice)}</TableCell>
                  <TableCell>
                    {item.bestPrice ? (
                      <Box>
                        <Typography variant="body2" color="success.main">
                          {formatPrice(item.bestPrice.unitPrice)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {item.bestPrice.supplierName}
                        </Typography>
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Нет предложений
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {item.bestPrice && (
                      <Chip
                        icon={getDeviationIcon(item.priceDeviation)}
                        label={formatPercentage(item.priceDeviation)}
                        color={getDeviationColor(item.priceDeviation)}
                        size="small"
                      />
                    )}
                  </TableCell>
                  <TableCell>{item.proposalsCount}</TableCell>
                  <TableCell>
                    {item.bestPrice ? (
                      <Box>
                        <Typography variant="body2">
                          {item.bestPrice.supplierName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {item.bestPrice.deliveryPeriod}
                        </Typography>
                      </Box>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Детальная таблица цен */}
      <Paper sx={{ p: 2, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Детальная таблица цен
        </Typography>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Позиция</TableCell>
                <TableCell>Поставщик</TableCell>
                <TableCell>Цена за ед.</TableCell>
                <TableCell>Общая цена</TableCell>
                <TableCell>Срок поставки</TableCell>
                <TableCell>Гарантия</TableCell>
                <TableCell>Статус</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {analysis.items.map((item) =>
                item.supplierPrices.map((price, index) => (
                  <TableRow key={`${item.tenderItemId}-${index}`}>
                    <TableCell>{item.itemNumber}</TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">
                          {price.supplierName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {price.proposalNumber}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{formatPrice(price.unitPrice)}</TableCell>
                    <TableCell>{formatPrice(price.totalPrice)}</TableCell>
                    <TableCell>{price.deliveryPeriod}</TableCell>
                    <TableCell>{price.warranty}</TableCell>
                    <TableCell>
                      {price.isBestPrice ? (
                        <Chip label="Лучшая цена" color="success" size="small" />
                      ) : (
                        <Chip label="Обычная" color="default" size="small" />
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default PriceAnalysisPage; 