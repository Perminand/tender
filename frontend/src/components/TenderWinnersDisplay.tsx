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
  MenuItem,
  Tooltip
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
  const [proposalCache, setProposalCache] = useState<Record<string, any>>({});
  const [overrideDelivery, setOverrideDelivery] = useState<Record<string, number>>({});
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

      // Собираем уникальные proposalId
      const proposalIds = Array.from(new Set(
        data.itemWinners.flatMap(i => i.allPrices.map(p => p.proposalId).filter(Boolean)) as string[]
      ));
      // Загружаем данные предложений (с условиями)
      const proposals = await Promise.all(
        proposalIds.map(async (pid) => {
          try {
            const r = await api.get(`/api/proposals/${pid}/with-best-offers`);
            return [pid, r.data] as [string, any];
          } catch {
            return [pid, null] as [string, any];
          }
        })
      );
      const proposalById: Record<string, any> = {};
      proposals.forEach(([pid, dto]) => { if (pid) proposalById[pid] = dto; });
      setProposalCache(proposalById);

      const getDeliveryTypeLabel = (deliveryType?: string) => {
        switch (deliveryType) {
          case 'PICKUP': return 'Самовывоз';
          case 'DELIVERY_TO_WAREHOUSE': return 'Доставка на склад';
          case 'DELIVERY_TO_SITE': return 'Доставка на объект';
          default: return deliveryType || '';
        }
      };
      const getResponsibilityLabel = (resp?: string) => {
        switch (resp) {
          case 'SUPPLIER': return 'Поставщик';
          case 'CUSTOMER': return 'Заказчик';
          case 'SHARED': return 'Разделенная ответственность';
          default: return resp || '';
        }
      };

      const buildDefaultFromProposal = (proposal: any) => {
        if (!proposal) return '';
        const parts: string[] = [];
        // Условие оплаты
        if (proposal.paymentCondition?.name) {
          parts.push(`Условие оплаты: ${proposal.paymentCondition.name}`);
          if (proposal.paymentCondition.description) parts.push(proposal.paymentCondition.description);
        } else if (proposal.paymentTerms) {
          parts.push(`Условия оплаты: ${proposal.paymentTerms}`);
        }
        // Условие доставки
        const dc = proposal.deliveryCondition || null;
        if (dc?.name) {
          parts.push(`Условие доставки: ${dc.name}`);
          if (dc.deliveryType) parts.push(`Тип доставки: ${getDeliveryTypeLabel(dc.deliveryType)}`);
          if (dc.deliveryCost !== undefined && dc.deliveryCost !== null) parts.push(`Стоимость доставки: ${formatPrice(dc.deliveryCost)}`);
          if (dc.deliveryPeriod) parts.push(`Срок доставки: ${dc.deliveryPeriod}`);
          if (dc.deliveryResponsibility) parts.push(`Ответственность: ${getResponsibilityLabel(dc.deliveryResponsibility)}`);
          if (dc.deliveryAddress) parts.push(`Адрес: ${dc.deliveryAddress}`);
          if (dc.additionalTerms) parts.push(dc.additionalTerms);
        } else {
          // Фоллбэк на инлайновые
          if (proposal.deliveryType) parts.push(`Тип доставки: ${getDeliveryTypeLabel(proposal.deliveryType)}`);
          if (proposal.deliveryCost !== undefined && proposal.deliveryCost !== null) parts.push(`Стоимость доставки: ${formatPrice(proposal.deliveryCost)}`);
          if (proposal.deliveryPeriod) parts.push(`Срок доставки: ${proposal.deliveryPeriod}`);
          if (proposal.deliveryResponsibility) parts.push(`Ответственность: ${getResponsibilityLabel(proposal.deliveryResponsibility)}`);
          if (proposal.deliveryAddress) parts.push(`Адрес: ${proposal.deliveryAddress}`);
          if (proposal.deliveryAdditionalTerms) parts.push(proposal.deliveryAdditionalTerms);
        }
        return parts.join('; ');
      };

      // Автозаполнение: если примечание пустое, подставим из условий оплаты/доставки предложения
      data.itemWinners.forEach(item => {
        item.allPrices.forEach(p => {
          const key = noteKey(item.tenderItemId, p.supplierId);
          const note = notesObj[key] || '';
          const looksLegacyAuto = /НДС|Цена с НДС|^Доставка:/i.test(note) && !/Условие оплаты/i.test(note);
          if (!note || looksLegacyAuto) {
            const proposal = p.proposalId ? proposalById[p.proposalId] : null;
            notesObj[key] = buildDefaultFromProposal(proposal);
          }
        });
      });

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

  const computeLocalSummary = (items: any[]) => {
    const totalEstimatedPrice = items.reduce((s, it) => s + ((it.estimatedPrice || 0) * (it.quantity || 0)), 0);
    const totalWinnerPrice = items.reduce((s, it) => s + (it.winner ? calcTotalWithVatAndDelivery(it.winner, it) : 0), 0);
    const totalSavings = totalEstimatedPrice - totalWinnerPrice;
    const savingsPercentage = totalEstimatedPrice > 0 ? (totalSavings / totalEstimatedPrice) * 100 : 0;
    return { totalEstimatedPrice, totalWinnerPrice, totalSavings, savingsPercentage };
  };

  const calcUnitWithVat = (p: any) => {
    const base = p.unitPrice ?? 0;
    const dto = p.unitPriceWithVat ?? 0;
    const vatRate = p.vatRate ?? 0;
    if (dto && dto > 0) return dto;
    if (vatRate && vatRate > 0) return base * (1 + vatRate / 100);
    return base;
  };

  const calcTotalWithVatAndDelivery = (p: any, itemWinner?: any) => {
    const qty = itemWinner?.quantity ?? 0;
    const withVatPerUnit = calcUnitWithVat(p);
    const key = itemWinner ? `${itemWinner.tenderItemId}:${p.supplierId}` : '';
    const delivery = key && overrideDelivery[key] !== undefined ? overrideDelivery[key] : (p.deliveryCost ?? 0);
    return withVatPerUnit * qty + delivery;
  };

  const calcSavingsForItem = (itemWinner: any) => {
    const estimatedTotal = (itemWinner.estimatedPrice || 0) * (itemWinner.quantity || 0);
    const total = itemWinner.winner ? calcTotalWithVatAndDelivery(itemWinner.winner, itemWinner) : 0;
    return estimatedTotal - total;
  };

  const calcSavingsPctForItem = (itemWinner: any) => {
    const estimatedTotal = (itemWinner.estimatedPrice || 0) * (itemWinner.quantity || 0);
    const savings = calcSavingsForItem(itemWinner);
    return estimatedTotal > 0 ? (savings / estimatedTotal) * 100 : 0;
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

      // Загрузим сохраненные распределения доставки и применим
      try {
        const ids = response.data.itemWinners.map((it: any) => it.tenderItemId);
        const res = await api.post('/api/tender-item-delivery/by-items', ids);
        const overrides: Record<string, number> = {};
        (res.data || []).forEach((o: any) => {
          const key = `${o.tenderItemId}:${o.supplierId}`;
          overrides[key] = Number(o.amount);
        });
        setOverrideDelivery(overrides);
      } catch (e) {
        console.warn('Не удалось загрузить сохраненные распределения доставки', e);
      }
      
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

      // Предложить распределить доставку, если она указана в самом предложении
      const changedItem = newItems.find(it => it.tenderItemId === tenderItemId);
      const priceForSupplier = changedItem?.allPrices.find(p => p.supplierId === supplierId);
      const proposal = priceForSupplier?.proposalId ? proposalCache[priceForSupplier.proposalId] : null;
      const deliveryTotal = (proposal?.deliveryCost ?? proposal?.deliveryCondition?.deliveryCost ?? 0) as number;
      if (deliveryTotal && deliveryTotal > 0) {
        const ok = window.confirm(`У этого предложения указана стоимость доставки ${formatPrice(deliveryTotal)}. Распределить ее пропорционально между выбранными позициями этого поставщика?`);
        if (ok) {
          // Найдем все выбранные позиции данного поставщика
          const selectedItemsForSupplier = newItems.filter(it => it.winner && it.winner.supplierId === supplierId);
          const count = selectedItemsForSupplier.length || 1;
          const share = deliveryTotal / count;
          setOverrideDelivery(prev => {
            const next = { ...prev };
            // Очистим старые ключи для этого поставщика
            newItems.forEach(it => {
              const k = `${it.tenderItemId}:${supplierId}`;
              delete next[k];
            });
            // Установим новую долю для выбранных позиций
            selectedItemsForSupplier.forEach(it => {
              const k = `${it.tenderItemId}:${supplierId}`;
              next[k] = share;
            });
            return next;
          });

          // Сохранение на бэкенде
          try {
            const payload = selectedItemsForSupplier.map(it => ({
              tenderItemId: it.tenderItemId,
              supplierId: supplierId,
              amount: String(share)
            }));
            await api.post('/api/tender-item-delivery/batch-upsert', payload);
          } catch (e) {
            console.error('Не удалось сохранить распределение доставки', e);
          }
        }
      }
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
            onClick={async () => {
              try {
                await api.post('/api/contracts/create-from-all-winners', {
                  tenderId,
                  title: contractData.title || undefined,
                  startDate: contractData.startDate || undefined,
                  endDate: contractData.endDate || undefined,
                  description: contractData.description || undefined
                });
                alert('Контракты созданы для всех победителей');
              } catch (e) {
                console.error('Ошибка создания контрактов по всем победителям', e);
                alert('Ошибка создания контрактов');
              }
            }}
            sx={{ mr: 2 }}
          >
            Заключить контракт с победителями (по всем позициям)
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
          {(() => {
            const s = computeLocalSummary(winners.itemWinners);
            return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={3}>
              <Box textAlign="center">
                <Typography variant="h4" color="primary" gutterBottom>
                  {formatPrice(s.totalEstimatedPrice)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Сметная стоимость
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={3}>
              <Box textAlign="center">
                <Typography variant="h4" color="success.main" gutterBottom>
                  {formatPrice(s.totalWinnerPrice)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Стоимость победителей
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={3}>
              <Box textAlign="center">
                <Typography variant="h4" color="success.main" gutterBottom>
                  {formatPrice(s.totalSavings)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Экономия
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={3}>
              <Box textAlign="center">
                <Typography variant="h4" color="success.main" gutterBottom>
                  {formatPercentage(s.savingsPercentage)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Процент экономии
                </Typography>
              </Box>
            </Grid>
          </Grid>
            );
          })()}
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
                Экономия: {formatPrice(calcSavingsForItem(itemWinner))} ({formatPercentage(calcSavingsPctForItem(itemWinner))})
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
                    <strong>Цена с НДС и доставкой:</strong> {formatPrice(calcTotalWithVatAndDelivery(itemWinner.winner || {}, itemWinner))}
                  </Typography>
                  <Typography variant="body2">
                    {(() => {
                      const estimatedTotal = (itemWinner.estimatedPrice || 0) * (itemWinner.quantity || 0);
                      const total = calcTotalWithVatAndDelivery(itemWinner.winner || {}, itemWinner);
                      const savings = estimatedTotal - total;
                      return (
                        <>
                          <strong>Экономия:</strong> {formatPrice(savings)}
                        </>
                      );
                    })()}
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
                      <TableCell align="right">Цена с НДС</TableCell>
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
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2" fontWeight={price.isBestPrice ? 'bold' : 'normal'}>
                              {price.supplierName}
                            </Typography>
                            {(() => {
                              const proposal = price.proposalId ? proposalCache[price.proposalId] : null;
                              const dcCost = proposal?.deliveryCost ?? proposal?.deliveryCondition?.deliveryCost ?? 0;
                              return dcCost > 0 ? (
                                <Tooltip title={`Есть доставка в предложении: ${formatPrice(dcCost)}`}>
                                  <Chip size="small" icon={<LocalShipping fontSize="small" />} label="Доставка" color="info" variant="outlined" />
                                </Tooltip>
                              ) : null;
                            })()}
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          {formatPrice(price.unitPrice)}
                        </TableCell>
                        <TableCell align="right">
                          {formatPrice(calcUnitWithVat(price))}
                        </TableCell>
                        <TableCell align="right">
                          {(() => {
                            const key = `${itemWinner.tenderItemId}:${price.supplierId}`;
                            const v = (overrideDelivery[key] !== undefined) ? overrideDelivery[key] : (price.deliveryCost ?? 0);
                            return formatPrice(v);
                          })()}
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight="bold">
                            {formatPrice(calcTotalWithVatAndDelivery(price, itemWinner))}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          {(() => {
                            const estimatedTotal = (itemWinner.estimatedPrice || 0) * (itemWinner.quantity || 0);
                            const total = calcTotalWithVatAndDelivery(price, itemWinner);
                            const savings = estimatedTotal - total;
                            return (
                              <Typography variant="body2" color={savings > 0 ? 'success.main' : 'error.main'}>
                                {formatPrice(savings)}
                          </Typography>
                            );
                          })()}
                        </TableCell>
                        <TableCell>
                          {(() => {
                            const isWinner = itemWinner.winner && price.supplierId === itemWinner.winner.supplierId;
                            const isSecond = itemWinner.secondPrice && price.supplierId === itemWinner.secondPrice.supplierId;
                            return (
                              <>
                                {isWinner && (<Chip label="Победитель" color="success" size="small" />)}
                                {isSecond && (<Chip label="Вторая цена" color="warning" size="small" />)}
                              </>
                            );
                          })()}
                        </TableCell>
                        <TableCell>
                          <TextField
                            fullWidth
                            size="small"
                            multiline
                            minRows={2}
                            maxRows={6}
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
                      Поставщик: {supplier?.supplierName} - {formatPrice(calcTotalWithVatAndDelivery(supplier || {}, item))}
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
