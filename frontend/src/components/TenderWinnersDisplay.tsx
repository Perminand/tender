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
  Button,
  Checkbox,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { 
  ExpandMore, 
  TrendingUp, 
  LocalShipping, 
  Receipt, 
  FileDownload,
  Assignment,
  CheckCircle
} from '@mui/icons-material';
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
  
  // Состояние для выбора победителей
  const [selectedWinners, setSelectedWinners] = useState<Map<string, string>>(new Map());
  const [contractDialogOpen, setContractDialogOpen] = useState(false);
  const [contractData, setContractData] = useState({
    title: '',
    startDate: '',
    endDate: '',
    description: ''
  });
  const [awardingItems, setAwardingItems] = useState<Record<string, boolean>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const noteKey = (tenderItemId: string, supplierId: string) => `${tenderItemId}:${supplierId}`;

  const loadNotesForItems = async (data: TenderWinnerDto) => {
    try {
      const entries = await Promise.all(
        data.itemWinners.flatMap(item =>
          item.allPrices.map(async (p) => {
            const res = await api.get(`/api/tender-item-notes/${item.tenderItemId}/${p.supplierId}`);
            return [noteKey(item.tenderItemId, p.supplierId), res.data?.note || ''] as [string, string];
          })
        )
      );
      const notesObj: Record<string, string> = {};
      entries.forEach(([k, v]) => { notesObj[k] = v; });
      setNotes(notesObj);
    } catch (e) {
      // тихо игнорируем, примечаний может не быть
    }
  };

  // Локальные хелперы для пересчета без перезагрузки
  const effectiveTotalForComparison = (sp: SupplierPriceDto) => {
    const delivery = sp.deliveryCost || 0;
    if (delivery > 0) {
      const withVat = sp.totalPriceWithVat ?? sp.totalPrice ?? 0;
      return withVat + delivery;
    }
    if (sp.totalPriceWithVat != null) return sp.totalPriceWithVat;
    return sp.totalPrice ?? 0;
  };

  const recomputeItemAfterSelection = (item: TenderItemWinnerDto, selectedSupplierId: string): TenderItemWinnerDto => {
    const allPrices = item.allPrices.map(p => ({ ...p }));
    // Найти выбранную цену
    const selected = allPrices.find(p => p.supplierId === selectedSupplierId);
    if (!selected) return item;

    // Сбросить флаги
    allPrices.forEach(p => {
      (p as any).isBestPrice = false;
      (p as any).isSecondPrice = false;
    });

    // Определить вторую лучшую среди остальных
    const others = allPrices.filter(p => p.supplierId !== selectedSupplierId);
    const second = others.length > 0
      ? others.slice().sort((a, b) => effectiveTotalForComparison(a) - effectiveTotalForComparison(b))[0]
      : null;

    (selected as any).isBestPrice = true;
    if (second) (second as any).isSecondPrice = true;

    const totalEstimatedPrice = (item.estimatedPrice || 0) * (item.quantity || 0);
    const totalWinnerPrice = effectiveTotalForComparison(selected);
    const totalSavings = totalEstimatedPrice - totalWinnerPrice;
    const savingsPercentage = totalEstimatedPrice > 0 ? (totalSavings / totalEstimatedPrice) * 100 : 0;

    return {
      ...item,
      winner: selected,
      secondPrice: second,
      allPrices,
      totalEstimatedPrice,
      totalWinnerPrice,
      totalSavings,
      savingsPercentage,
    } as TenderItemWinnerDto;
  };

  const recomputeSummary = (items: TenderItemWinnerDto[], baseTotalProposals: number) => {
    const totalEstimatedPrice = items.reduce((s, it) => s + (it.totalEstimatedPrice || 0), 0);
    const totalWinnerPrice = items.reduce((s, it) => s + (it.totalWinnerPrice || 0), 0);
    const totalSavings = totalEstimatedPrice - totalWinnerPrice;
    const savingsPercentage = totalEstimatedPrice > 0 ? (totalSavings / totalEstimatedPrice) * 100 : 0;
    const winnerSuppliers = Array.from(new Set(items.map(it => it.winner?.supplierId).filter(Boolean) as string[]));
    const secondPriceSuppliers = Array.from(new Set(items.map(it => it.secondPrice?.supplierId).filter(Boolean) as string[]));
    const averagePriceDeviation = items.length > 0 ? items.reduce((s, it) => s + (it.savingsPercentage || 0), 0) / items.length : 0;
    const totalVatAmount = items.reduce((s, it) => s + (it.winner?.vatAmount || 0), 0);
    const totalDeliveryCost = items.reduce((s, it) => s + (it.winner?.deliveryCost || 0), 0);

    return {
      totalEstimatedPrice,
      totalWinnerPrice,
      totalSavings,
      savingsPercentage,
      totalProposals: baseTotalProposals,
      uniqueWinners: winnerSuppliers.length,
      winnerSuppliers,
      secondPriceSuppliers,
      averagePriceDeviation,
      totalVatAmount,
      totalDeliveryCost,
    } as TenderWinnerSummaryDto;
  };

  useEffect(() => {
    loadWinners();
  }, [tenderId]);

  const loadWinners = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/tenders/${tenderId}/winners`);
      setWinners(response.data);
      await loadNotesForItems(response.data);
      
      // Инициализируем выбранных победителей
      const initialWinners = new Map();
      response.data.itemWinners.forEach((item: TenderItemWinnerDto) => {
        if (item.winner) {
          initialWinners.set(item.tenderItemId, item.winner.supplierId);
        }
      });
      setSelectedWinners(initialWinners);
      
      setError(null);
    } catch (err) {
      setError('Ошибка при загрузке победителей');
      console.error('Error loading winners:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleWinnerSelection = async (tenderItemId: string, supplierId: string) => {
    // Оптимистичное обновление UI без перезагрузки
    setSelectedWinners(prev => {
      const newMap = new Map(prev);
      newMap.set(tenderItemId, supplierId);
      return newMap;
    });

    // Сохраним предыдущее состояние для отката при ошибке
    const prevWinnersState = winners ? JSON.parse(JSON.stringify(winners)) as TenderWinnerDto : null;

    if (winners) {
      const newItems = winners.itemWinners.map(it =>
        it.tenderItemId === tenderItemId ? recomputeItemAfterSelection(it, supplierId) : it
      );
      const newSummary = recomputeSummary(newItems, winners.summary.totalProposals);
      setWinners({ ...winners, itemWinners: newItems, summary: newSummary });
    }

    // Запрос на бэк в фоне
    try {
      setAwardingItems(prev => ({ ...prev, [tenderItemId]: true }));
      await api.post(`/api/tenders/${tenderId}/items/${tenderItemId}/award`, { supplierId });
    } catch (err) {
      console.error('Error awarding tender item', err);
      alert('Ошибка назначения победителя по позиции');
      // Откатить локальные изменения при ошибке
      if (prevWinnersState) setWinners(prevWinnersState);
    } finally {
      setAwardingItems(prev => ({ ...prev, [tenderItemId]: false }));
    }
  };

  const handleCreateContract = () => {
    setContractDialogOpen(true);
  };

  const handleContractSubmit = async () => {
    try {
      const selectedItems = Array.from(selectedWinners.entries()).map(([tenderItemId, supplierId]) => ({
        tenderItemId,
        supplierId
      }));

      const contractRequest = {
        tenderId,
        title: contractData.title,
        startDate: contractData.startDate,
        endDate: contractData.endDate,
        description: contractData.description,
        selectedItems
      };

      await api.post('/api/contracts/create-from-winners', contractRequest);
      setContractDialogOpen(false);
      setContractData({ title: '', startDate: '', endDate: '', description: '' });
      
      // Показать уведомление об успехе
      alert('Контракт успешно создан!');
    } catch (err) {
      console.error('Error creating contract:', err);
      alert('Ошибка при создании контракта');
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

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
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
        Данные о победителях не найдены
      </Alert>
    );
  }

  const hasSelectedWinners = selectedWinners.size > 0;

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Победители тендера: {winners.tenderTitle}
      </Typography>

      {/* Кнопка создания контракта */}
      {hasSelectedWinners && (
        <Box sx={{ mb: 3 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Assignment />}
            onClick={handleCreateContract}
            sx={{ mr: 2 }}
          >
            Заключить контракт с выбранными победителями
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            startIcon={<FileDownload />}
            onClick={async () => {
              try {
                const res = await api.get(`/api/tenders/${tenderId}/winners/export/excel`, { responseType: 'blob' });
                const url = window.URL.createObjectURL(new Blob([res.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `winner-report-${tenderId}.xlsx`);
                document.body.appendChild(link);
                link.click();
                link.remove();
              } catch (e) {
                console.error('Ошибка выгрузки Excel победителей', e);
              }
            }}
            sx={{ mr: 2 }}
          >
            Выгрузить в Excel
          </Button>
          <Typography variant="caption" color="text.secondary">
            Выбрано позиций: {selectedWinners.size} из {winners.itemWinners.length}
          </Typography>
        </Box>
      )}

      {/* Общая сводка */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Общая сводка
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={3}>
              <Box textAlign="center">
                <Typography variant="h4" color="primary" gutterBottom>
                  {formatPrice(winners.summary.totalEstimatedPrice)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Сметная стоимость
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={3}>
              <Box textAlign="center">
                <Typography variant="h4" color="success.main" gutterBottom>
                  {formatPrice(winners.summary.totalWinnerPrice)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Стоимость победителей
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={3}>
              <Box textAlign="center">
                <Typography variant="h4" color="success.main" gutterBottom>
                  {formatPrice(winners.summary.totalSavings)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Экономия
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={3}>
              <Box textAlign="center">
                <Typography variant="h4" color="success.main" gutterBottom>
                  {formatPercentage(winners.summary.savingsPercentage)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Процент экономии
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

              {/* Таблица всех предложений с галочками */}
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
                      <TableCell>Примечание</TableCell>
                      <TableCell padding="checkbox">Выбрать</TableCell>
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
                        <TableCell>
                          <TextField
                            fullWidth
                            size="small"
                            placeholder="Введите примечание"
                            value={notes[noteKey(itemWinner.tenderItemId, price.supplierId)] || ''}
                            onChange={(e) =>
                              setNotes(prev => ({
                                ...prev,
                                [noteKey(itemWinner.tenderItemId, price.supplierId)]: e.target.value
                              }))
                            }
                            onBlur={async (e) => {
                              const value = e.target.value || '';
                              try {
                                await api.post(`/api/tender-item-notes/${itemWinner.tenderItemId}/${price.supplierId}`, { note: value });
                              } catch (err) {
                                console.error('Ошибка сохранения примечания', err);
                              }
                            }}
                          />
                        </TableCell>
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={selectedWinners.get(itemWinner.tenderItemId) === price.supplierId}
                            onChange={() => handleWinnerSelection(itemWinner.tenderItemId, price.supplierId)}
                            color="primary"
                            disabled={!!awardingItems[itemWinner.tenderItemId]}
                          />
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

      {/* Диалог создания контракта */}
      <Dialog open={contractDialogOpen} onClose={() => setContractDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Создание контракта с выбранными победителями
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Название контракта"
                value={contractData.title}
                onChange={(e) => setContractData({ ...contractData, title: e.target.value })}
                placeholder="Контракт по тендеру..."
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Дата начала"
                type="date"
                value={contractData.startDate}
                onChange={(e) => setContractData({ ...contractData, startDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Дата окончания"
                type="date"
                value={contractData.endDate}
                onChange={(e) => setContractData({ ...contractData, endDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Описание"
                multiline
                rows={3}
                value={contractData.description}
                onChange={(e) => setContractData({ ...contractData, description: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Выбранные позиции для контракта:
              </Typography>
              {Array.from(selectedWinners.entries()).map(([tenderItemId, supplierId]) => {
                const item = winners.itemWinners.find(i => i.tenderItemId === tenderItemId);
                const supplier = item?.allPrices.find(p => p.supplierId === supplierId);
                return (
                  <Box key={tenderItemId} sx={{ mb: 1, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
                    <Typography variant="body2">
                      <strong>Позиция {item?.itemNumber}:</strong> {item?.description}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Поставщик: {supplier?.supplierName} - {formatPrice(supplier?.totalPriceWithVatAndDelivery || 0)}
                    </Typography>
                  </Box>
                );
              })}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setContractDialogOpen(false)}>
            Отмена
          </Button>
          <Button 
            onClick={handleContractSubmit} 
            variant="contained"
            disabled={!contractData.title || !contractData.startDate || !contractData.endDate}
          >
            Создать контракт
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TenderWinnersDisplay;
