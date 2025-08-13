import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  Divider,
  Alert,
  CircularProgress,
  Button
} from '@mui/material';
import { ExpandMore, TrendingUp, LocalShipping, Receipt, FileDownload } from '@mui/icons-material';
import { api } from '../utils/api';

interface SupplierPriceDto {
  supplierId: string;
  supplierName: string;
  supplierEmail: string;
  proposalId: string;
  proposalNumber: string;
  tenderItemId: string;
  unitPrice: number;
  totalPrice: number;
  currency: string;
  deliveryPeriod: string;
  warranty: string;
  additionalInfo: string;
  isBestPrice: boolean;
  isSecondPrice: boolean;
  unitPriceWithVat: number;
  totalPriceWithVat: number;
  deliveryCost: number;
  totalPriceWithDelivery: number;
  totalPriceWithVatAndDelivery: number;
  vatRate: number;
  vatAmount: number;
  savings: number;
  savingsPercentage: number;
}

interface TenderItemWinnerDto {
  tenderItemId: string;
  itemNumber: number;
  description: string;
  quantity: number;
  unitName: string;
  estimatedPrice: number;
  winner: SupplierPriceDto;
  secondPrice: SupplierPriceDto | null;
  allPrices: SupplierPriceDto[];
  totalSavings: number;
  savingsPercentage: number;
  totalEstimatedPrice: number;
  totalWinnerPrice: number;
}

interface TenderWinnerSummaryDto {
  totalEstimatedPrice: number;
  totalWinnerPrice: number;
  totalSavings: number;
  savingsPercentage: number;
  totalProposals: number;
  uniqueWinners: number;
  winnerSuppliers: string[];
  secondPriceSuppliers: string[];
  averagePriceDeviation: number;
  totalVatAmount: number;
  totalDeliveryCost: number;
}

interface TenderWinnerDto {
  tenderId: string;
  tenderNumber: string;
  tenderTitle: string;
  itemWinners: TenderItemWinnerDto[];
  summary: TenderWinnerSummaryDto;
}

interface TenderWinnersDisplayProps {
  tenderId: string;
}

const TenderWinnersDisplay: React.FC<TenderWinnersDisplayProps> = ({ tenderId }) => {
  const [winners, setWinners] = useState<TenderWinnerDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadWinners();
  }, [tenderId]);

  const loadWinners = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/api/tenders/${tenderId}/winners`);
      setWinners(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка загрузки победителей');
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
    return `${percentage.toFixed(2)}%`;
  };

  const handleExportToExcel = async () => {
    try {
      const response = await api.get(`/api/price-analysis/tender/${tenderId}/export`, {
        responseType: 'blob'
      });
      
      // Создаем ссылку для скачивания
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `tender-winners-${tenderId}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Ошибка при экспорте в Excel:', error);
      alert('Ошибка при экспорте отчета в Excel');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
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

  if (!winners) {
    return (
      <Alert severity="info">
        Нет данных о победителях
      </Alert>
    );
  }

  return (
    <Box>
      {/* Заголовок */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h5" gutterBottom>
                Победители тендера: {winners.tenderTitle}
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                Номер тендера: {winners.tenderNumber}
              </Typography>
            </Box>
            <Button
              variant="outlined"
              startIcon={<FileDownload />}
              onClick={handleExportToExcel}
              size="small"
            >
              Экспорт в Excel
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Сводная статистика */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Сводная статистика
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={3}>
              <Box textAlign="center">
                <Typography variant="h4" color="primary">
                  {formatPrice(winners.summary.totalSavings)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Общая экономия
                </Typography>
                <Typography variant="caption" color="success.main">
                  {formatPercentage(winners.summary.savingsPercentage)}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={3}>
              <Box textAlign="center">
                <Typography variant="h4" color="text.primary">
                  {formatPrice(winners.summary.totalEstimatedPrice)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Сметная стоимость
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={3}>
              <Box textAlign="center">
                <Typography variant="h4" color="success.main">
                  {formatPrice(winners.summary.totalWinnerPrice)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Стоимость победителей
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={3}>
              <Box textAlign="center">
                <Typography variant="h4" color="info.main">
                  {winners.summary.uniqueWinners}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Уникальных победителей
                </Typography>
              </Box>
            </Grid>
          </Grid>
          
          <Divider sx={{ my: 2 }} />
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Box display="flex" alignItems="center" gap={1}>
                <Receipt color="primary" />
                <Typography variant="body2">
                  НДС: {formatPrice(winners.summary.totalVatAmount)}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box display="flex" alignItems="center" gap={1}>
                <LocalShipping color="primary" />
                <Typography variant="body2">
                  Доставка: {formatPrice(winners.summary.totalDeliveryCost)}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box display="flex" alignItems="center" gap={1}>
                <TrendingUp color="primary" />
                <Typography variant="body2">
                  Предложений: {winners.summary.totalProposals}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Победители по позициям */}
      <Typography variant="h6" gutterBottom>
        Победители по позициям
      </Typography>
      
      {winners.itemWinners.map((itemWinner, index) => (
        <Accordion key={itemWinner.tenderItemId} sx={{ mb: 1 }}>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Box display="flex" alignItems="center" gap={2} width="100%">
              <Typography variant="subtitle1" fontWeight="bold">
                Позиция {itemWinner.itemNumber}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1 }}>
                {itemWinner.description}
              </Typography>
              {itemWinner.winner && (
                <Chip
                  label={`Победитель: ${itemWinner.winner.supplierName}`}
                  color="success"
                  size="small"
                />
              )}
              <Typography variant="body2" color="success.main" fontWeight="bold">
                Экономия: {formatPrice(itemWinner.totalSavings)} ({formatPercentage(itemWinner.savingsPercentage)})
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Box>
              {/* Информация о позиции */}
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2">
                    <strong>Количество:</strong> {itemWinner.quantity} {itemWinner.unitName}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Сметная цена:</strong> {formatPrice(itemWinner.estimatedPrice)}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Сметная стоимость:</strong> {formatPrice(itemWinner.totalEstimatedPrice)}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2">
                    <strong>Победитель:</strong> {itemWinner.winner?.supplierName}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Цена с НДС и доставкой:</strong> {formatPrice(itemWinner.totalWinnerPrice)}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Экономия:</strong> {formatPrice(itemWinner.totalSavings)}
                  </Typography>
                </Grid>
              </Grid>

              {/* Таблица всех предложений */}
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Поставщик</TableCell>
                      <TableCell align="right">Цена за ед.</TableCell>
                      <TableCell align="right">НДС</TableCell>
                      <TableCell align="right">Доставка</TableCell>
                      <TableCell align="right">Итого с НДС и доставкой</TableCell>
                      <TableCell align="right">Экономия</TableCell>
                      <TableCell>Статус</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {itemWinner.allPrices.map((price, priceIndex) => (
                      <TableRow
                        key={price.proposalId}
                        sx={{
                          backgroundColor: price.isBestPrice ? 'success.50' : 
                                          price.isSecondPrice ? 'warning.50' : 'inherit'
                        }}
                      >
                        <TableCell>
                          <Typography variant="body2" fontWeight={price.isBestPrice ? 'bold' : 'normal'}>
                            {price.supplierName}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          {formatPrice(price.unitPrice)}
                        </TableCell>
                        <TableCell align="right">
                          {formatPrice(price.vatAmount)}
                        </TableCell>
                        <TableCell align="right">
                          {formatPrice(price.deliveryCost)}
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight="bold">
                            {formatPrice(price.totalPriceWithVatAndDelivery)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography 
                            variant="body2" 
                            color={price.savings > 0 ? 'success.main' : 'error.main'}
                          >
                            {formatPrice(price.savings)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {price.isBestPrice && (
                            <Chip label="Победитель" color="success" size="small" />
                          )}
                          {price.isSecondPrice && (
                            <Chip label="Вторая цена" color="warning" size="small" />
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
};

export default TenderWinnersDisplay;
