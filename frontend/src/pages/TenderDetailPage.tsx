import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  Alert,
  IconButton,
  Tooltip,
  MenuItem,
  Select,
  FormControl,
  CircularProgress
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  TrendingUp as TrendingUpIcon,
  Visibility as ViewIcon,
  Star as StarIcon,
  ArrowBack as ArrowBackIcon,
  Assessment as AssessmentIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import PriceAnalysisSummary from '../components/PriceAnalysisSummary';
import TenderSplitDialog from '../components/TenderSplitDialog';
import VisibilityIcon from '@mui/icons-material/Visibility';
import GavelIcon from '@mui/icons-material/Gavel';

interface TenderItemDto {
  id: string;
  itemNumber: number;
  description: string;
  quantity: number;
  unitName: string;
  specifications: string;
  deliveryRequirements: string;
  estimatedPrice: number;
  bestPrice?: number;
  materialName: string;
  materialTypeName: string;
  // awardedSupplierId?: string; // Удалить это поле
}

interface ProposalItemDto {
  id: string;
  itemNumber: number;
  description: string;
  brand: string;
  model: string;
  manufacturer: string;
  countryOfOrigin: string;
  quantity: number;
  unitName: string;
  unitPrice: number;
  totalPrice: number;
  specifications: string;
  deliveryPeriod: string;
  warranty: string;
  additionalInfo: string;
  isBestPrice: boolean;
  priceDifference: number;
}

interface SupplierProposalDto {
  id: string;
  supplierName: string;
  proposalNumber: string;
  submissionDate: string;
  status: string;
  totalPrice: number;
  currency: string;
  paymentTerms: string;
  deliveryTerms: string;
  warrantyTerms: string;
  isBestOffer: boolean;
  priceDifference: number;
  proposalItems: ProposalItemDto[];
  supplierId: string; // Добавляем supplierId
}

interface TenderDto {
  id: string;
  tenderNumber: string;
  title: string;
  description: string;
  customerName: string;
  startDate: string;
  endDate: string;
  submissionDeadline: string;
  status: string;
  requirements: string;
  termsAndConditions: string;
  tenderItems: TenderItemDto[];
  supplierProposals: SupplierProposalDto[];
  bestPrice: number;
  bestSupplierName: string;
  awardedSupplierId?: string;
  parentTenderId?: string;
}

const TenderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tender, setTender] = useState<TenderDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [closeDialogOpen, setCloseDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [startBiddingDialogOpen, setStartBiddingDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bestProposalOpenId, setBestProposalOpenId] = useState<string | null>(null);
  const [awarding, setAwarding] = useState<Record<string, boolean>>({});
  const [selectedWinner, setSelectedWinner] = useState<string>('');
  const [removeWinnerDialogOpen, setRemoveWinnerDialogOpen] = useState(false);
  const [removeWinnerItemId, setRemoveWinnerItemId] = useState<string | null>(null);
  const [autoAwardDialogOpen, setAutoAwardDialogOpen] = useState(false);
  const [autoAwardSupplier, setAutoAwardSupplier] = useState<{id: string, name: string} | null>(null);
  const [manualAwardDialogOpen, setManualAwardDialogOpen] = useState(false);
  const [manualAwardSupplier, setManualAwardSupplier] = useState<{id: string, name: string} | null>(null);
  const [resetAwardDialogOpen, setResetAwardDialogOpen] = useState(false);
  const [splitDialogOpen, setSplitDialogOpen] = useState(false);

  useEffect(() => {
    if (id) {
      loadTender();
    }
  }, [id]);

  useEffect(() => {
    setSelectedWinner(tender?.awardedSupplierId || '');
  }, [tender?.awardedSupplierId]);

  const loadTender = async () => {
    try {
      setLoading(true);
      
      // Получаем роль пользователя из localStorage
      const userRole = localStorage.getItem('userRole');
      
      // Для поставщика используем специальный эндпоинт
      const endpoint = userRole === 'SUPPLIER' 
        ? `/api/tenders/${id}/supplier-view`
        : `/api/tenders/${id}/with-best-offers`;
      
      const response = await api.get(endpoint);
      setTender(response.data);
    } catch (error) {
      console.error('Error loading tender:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'default';
      case 'PUBLISHED': return 'info';
      case 'BIDDING': return 'warning';
      case 'EVALUATION': return 'primary';
      case 'AWARDED': return 'success';
      case 'CANCELLED': return 'error';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      // Статусы тендера
      case 'DRAFT': return 'Черновик';
      case 'PUBLISHED': return 'Опубликован';
      case 'BIDDING': return 'Прием предложений';
      case 'EVALUATION': return 'Оценка';
      case 'AWARDED': return 'Присужден';
      case 'CANCELLED': return 'Отменен';
      // Статусы предложений поставщиков
      case 'SUBMITTED': return 'Подано';
      case 'UNDER_REVIEW': return 'На рассмотрении';
      case 'ACCEPTED': return 'Принято';
      case 'REJECTED': return 'Отклонено';
      case 'WITHDRAWN': return 'Отозвано';
      default: return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      currencyDisplay: 'symbol'
    }).format(price);
  };

  const handleCloseBidding = async () => {
    if (!id) return;
    try {
      await api.post(`/api/tenders/${id}/close`);
      setCloseDialogOpen(false);
      setError(null);
      await loadTender();
    } catch (e: any) {
      setError(e.response?.data?.message || 'Ошибка закрытия приема предложений');
    }
  };

  const handleCancelTender = async () => {
    if (!id) return;
    try {
      await api.post(`/api/tenders/${id}/cancel`);
      setCancelDialogOpen(false);
      setError(null);
      await loadTender();
    } catch (e: any) {
      setError(e.response?.data?.message || 'Ошибка отмены тендера');
    }
  };

  const getProposalTotal = (proposal: any) =>
    proposal.proposalItems
      ? proposal.proposalItems.reduce((sum: number, item: any) => sum + (item.totalPrice || 0), 0)
      : 0;

  const handleAwardSupplier = useCallback(async (itemId: string, supplierId: string) => {
    if (!tender) return;
    setAwarding(prev => ({ ...prev, [itemId]: true }));
    try {
      await api.post(`/api/tenders/${tender.id}/items/${itemId}/award`, { supplierId });
      // После успешного присвоения обновить тендер
      await loadTender();
    } finally {
      setAwarding(prev => ({ ...prev, [itemId]: false }));
    }
  }, [tender]);

  const handleAwardTender = async (supplierId: string) => {
    if (!tender) return;
    setAwarding(prev => ({ ...prev, tender: true }));
    try {
      await api.post(`/api/tenders/${tender.id}/award`, { supplierId });
      setSelectedWinner(supplierId);
      await loadTender();
    } catch (e: any) {
      setError(e.response?.data?.message || 'Ошибка назначения победителя. Endpoint /api/tenders/{id}/award не реализован или вернул ошибку.');
    } finally {
      setAwarding(prev => ({ ...prev, tender: false }));
    }
  };

  const handleRemoveWinnerClick = (itemId: string) => {
    setRemoveWinnerItemId(itemId);
    setRemoveWinnerDialogOpen(true);
  };

  const handleRemoveWinnerConfirm = () => {
    if (removeWinnerItemId) {
      handleAwardSupplier(removeWinnerItemId, '');
    }
    setRemoveWinnerDialogOpen(false);
    setRemoveWinnerItemId(null);
  };

  const handleRemoveWinnerCancel = () => {
    setRemoveWinnerDialogOpen(false);
    setRemoveWinnerItemId(null);
  };

  const handleAutoAwardClick = () => {
    if (!tender || tender.supplierProposals.length === 0) return;
    const best = tender.supplierProposals.reduce((min, p) =>
      min == null || (p.totalPrice != null && p.totalPrice < min.totalPrice) ? p : min
    );
    if (best) {
      setAutoAwardSupplier({ id: best.supplierId, name: best.supplierName });
      setAutoAwardDialogOpen(true);
    }
  };
  const handleAutoAwardConfirm = () => {
    if (autoAwardSupplier) handleAwardTender(autoAwardSupplier.id);
    setAutoAwardDialogOpen(false);
    setAutoAwardSupplier(null);
  };
  const handleAutoAwardCancel = () => {
    setAutoAwardDialogOpen(false);
    setAutoAwardSupplier(null);
  };

  const handleManualAwardClick = (supplierId: string) => {
    if (!tender) return;
    const supplier = tender.supplierProposals.find(p => p.supplierId === supplierId);
    if (supplier) {
      setManualAwardSupplier({ id: supplierId, name: supplier.supplierName });
      setManualAwardDialogOpen(true);
    }
  };
  const handleManualAwardConfirm = () => {
    if (manualAwardSupplier) handleAwardTender(manualAwardSupplier.id);
    setManualAwardDialogOpen(false);
    setManualAwardSupplier(null);
  };
  const handleManualAwardCancel = () => {
    setManualAwardDialogOpen(false);
    setManualAwardSupplier(null);
  };

  const handleResetAwardClick = () => {
    setResetAwardDialogOpen(true);
  };
  const handleResetAwardConfirm = () => {
    handleAwardTender('');
    setResetAwardDialogOpen(false);
  };
  const handleResetAwardCancel = () => {
    setResetAwardDialogOpen(false);
  };

  const handleSplitSuccess = (response: any) => {
    // Обновляем данные тендера после успешного разделения
    loadTender();
  };

  // Добавить функцию для завершения тендера
  const handleCompleteTender = async () => {
    if (!tender) return;
    try {
      await api.post(`/api/tenders/${tender.id}/complete`);
      await loadTender();
    } catch (e: any) {
      setError(e.response?.data?.message || 'Ошибка завершения тендера');
    }
  };

  // Получаем роль пользователя
  const userRole = localStorage.getItem('userRole');
  const isSupplier = userRole === 'SUPPLIER';

  if (loading) {
    return <Typography>Загрузка...</Typography>;
  }

  if (!tender) {
    return <Typography>Тендер не найден</Typography>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 1 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/tenders')}
          sx={{ minWidth: 0, p: 1 }}
        />
        <Typography variant="h4" component="h1">
          Тендер №{tender.tenderNumber}
        </Typography>
      </Box>

      {/* Управление статусом тендера - скрыто для поставщика */}
      {!isSupplier && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Управление статусом тендера</Typography>
              <Chip
                label={getStatusLabel(tender.status)}
                color={getStatusColor(tender.status)}
              />
            </Box>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {/* Кнопки смены статуса */}
              {tender.status === 'DRAFT' && (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => setPublishDialogOpen(true)}
                >
                  Опубликовать тендер
                </Button>
              )}
              {tender.status === 'PUBLISHED' && (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => setStartBiddingDialogOpen(true)}
                >
                  Принимать предложения
                </Button>
              )}
              {tender.status === 'BIDDING' && (
            <Button
                  variant="contained"
                  color="primary"
                  onClick={() => setCloseDialogOpen(true)}
            >
                  Закрыть прием
            </Button>
              )}
              {tender.status === 'BIDDING' && (
            <Button
              variant="contained"
                  color="success"
              onClick={() => navigate(`/tenders/${id}/proposals/new`)}
            >
              Подать предложение
            </Button>
              )}
              {/* Кнопка завершения тендера (Присудить) */}
              {tender.status === 'EVALUATION' && tender.awardedSupplierId && (
                <Button
                  variant="contained"
                  color="success"
                  onClick={handleCompleteTender}
                >
                  Завершить тендер (Присудить)
            </Button>
              )}
              {/* Кнопка анализа цен */}
              {(tender.status === 'EVALUATION' || tender.status === 'AWARDED') && (
                <Button
                  variant="outlined"
                  color="info"
                  startIcon={<AssessmentIcon />}
                  onClick={() => navigate(`/tenders/${id}/price-analysis`)}
                >
                  Анализ цен
                </Button>
              )}
              {/* Кнопка создания контракта */}
              {tender.status === 'AWARDED' && tender.awardedSupplierId && (
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="contained"
                    color="success"
                    onClick={() => {
                      navigate(`/contracts/new?tenderId=${tender.id}&supplierId=${tender.awardedSupplierId}&amount=${tender.bestPrice}&supplierName=${encodeURIComponent(tender.bestSupplierName)}`);
                    }}
                  >
                    Заключить контракт
                  </Button>
                  <Button
                    variant="outlined"
                    color="warning"
                    onClick={async () => {
                      try {
                        await api.post(`/api/tenders/${tender.id}/set-status`, { status: 'EVALUATION' });
                        await loadTender();
                      } catch (e) {
                        setError('Ошибка возврата на оценку');
                      }
                    }}
                  >
                    Вернуть на оценку
                  </Button>
                </Box>
              )}
              {/* Кнопка разделения тендера */}
              {tender.status === 'BIDDING' && (
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={() => setSplitDialogOpen(true)}
                >
                  Разделить тендер
                </Button>
              )}
              {/* Кнопка отмены */}
              {tender.status !== 'CANCELLED' && tender.status !== 'AWARDED' && (
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => setCancelDialogOpen(true)}
                >
                  Отменить тендер
                </Button>
              )}
          </Box>
          </CardContent>
        </Card>
      )}

      {/* Статус тендера для поставщика */}
      {isSupplier && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Статус тендера</Typography>
              <Chip
                label={getStatusLabel(tender.status)}
                color={getStatusColor(tender.status)}
              />
            </Box>
            {tender.status === 'BIDDING' && (
              <Button
                variant="contained"
                color="success"
                onClick={() => navigate(`/tenders/${id}/proposals/new`)}
              >
                Подать предложение
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      <Grid container spacing={3}>
        {/* Основная информация */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Typography variant="h5" component="h2">
                  {tender.title}
                </Typography>
              </Box>

              <Typography variant="body1" sx={{ mb: 2 }}>
                {tender.description}
              </Typography>

              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Заказчик
                  </Typography>
                  <Typography variant="body1">
                    {tender.customerName}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Срок подачи
                  </Typography>
                  <Typography variant="body1">
                    {formatDate(tender.submissionDeadline)}
                  </Typography>
                </Grid>
              </Grid>

              {/* Информация о родительском тендере */}
              {tender.parentTenderId && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    Этот тендер является частью разделенного тендера. 
                    Родительский тендер: {tender.parentTenderId}
                  </Typography>
                </Alert>
              )}

              {/* Лучшее предложение - скрыто для поставщика */}
              {!isSupplier && tender.bestPrice && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <TrendingUpIcon sx={{ mr: 1 }} />
                    <Typography>
                      Лучшее предложение: {tender.bestSupplierName} - {formatPrice(tender.bestPrice)}
                    </Typography>
                    {/* Кнопка для перехода к предложению */}
                    {(() => {
                      const bestProposal = tender.supplierProposals.find(
                        p =>
                          p.supplierName === tender.bestSupplierName &&
                          Number(p.totalPrice) === Number(tender.bestPrice)
                      );
                      return bestProposal ? (
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => navigate(`/proposals/${bestProposal.id}`)}
                          sx={{ ml: 2 }}
                        >
                          Посмотреть предложение
                        </Button>
                      ) : null;
                    })()}
                  </Box>
                </Alert>
              )}

              {/* Победитель тендера — скрыто для поставщика */}
              {!isSupplier && (tender.status === 'EVALUATION' || tender.status === 'AWARDED') && (
                <Box sx={{ mt: 2, mb: 2 }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>Победитель тендера</Typography>
                  {tender.supplierProposals.length > 0 ? (
                    tender.status !== 'AWARDED' && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <FormControl size="small" sx={{ minWidth: 300 }} disabled={awarding.tender}>
                          <Select
                            value={selectedWinner || ''}
                            onChange={e => {
                              if (e.target.value === '') {
                                handleResetAwardClick();
                              } else {
                                handleManualAwardClick(e.target.value);
                              }
                            }}
                            displayEmpty
                          >
                            <MenuItem value=""><em>Не выбран</em></MenuItem>
                            {tender.supplierProposals.map(p => (
                              <MenuItem key={p.supplierId} value={p.supplierId}>
                                {p.supplierName}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                        <Button
                          variant="outlined"
                          color="primary"
                          disabled={awarding.tender || !tender.supplierProposals.length}
                          onClick={handleAutoAwardClick}
                        >
                          Назначить автоматически (лучшая цена)
                        </Button>
                      </Box>
                    )
                  ) : (
                    <Typography color="text.secondary">Нет предложений</Typography>
                  )}
                  {selectedWinner && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 2, gap: 1 }}>
                      <StarIcon color="success" fontSize="small" />
                      <span style={{ color: '#2e7d32', fontWeight: 'bold' }}>
                        {tender.supplierProposals.find(p => p.supplierId === selectedWinner)?.supplierName || 'Победитель'}
                      </span>
                    </Box>
                  )}
                </Box>
              )}

              {tender.requirements && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    Требования
                  </Typography>
                  <Typography variant="body2">
                    {tender.requirements}
                  </Typography>
                </Box>
              )}

              {tender.termsAndConditions && (
                <Box>
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    Условия
                  </Typography>
                  <Typography variant="body2">
                    {tender.termsAndConditions}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Статистика */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Статистика
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Позиций в тендере
                </Typography>
                <Typography variant="h4">
                  {tender.tenderItems.length}
                </Typography>
              </Box>

              {/* Статистика предложений - скрыта для поставщика */}
              {!isSupplier && (
                <>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Предложений
                    </Typography>
                    <Typography variant="h4">
                      {tender.supplierProposals.length}
                    </Typography>
                  </Box>

                  {tender.bestPrice && (
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Лучшая цена
                      </Typography>
                      <Typography variant="h4" color="success.main">
                        {formatPrice(tender.bestPrice)}
                      </Typography>
                    </Box>
                  )}
                </>
              )}

            </CardContent>
          </Card>
        </Grid>

        {/* Анализ цен */}
        {!isSupplier && (tender.status === 'BIDDING' || tender.status === 'EVALUATION' || tender.status === 'AWARDED') && (
          <Grid item xs={12}>
            <PriceAnalysisSummary
              tenderId={tender.id}
              tenderTitle={tender.title}
              tenderNumber={tender.tenderNumber}
            />
          </Grid>
        )}

        {/* Позиции тендера */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Позиции тендера
              </Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>№</TableCell>
                      <TableCell>Описание</TableCell>
                      <TableCell>Материал</TableCell>
                      <TableCell>Количество</TableCell>
                      <TableCell>Ед. изм.</TableCell>
                      <TableCell>Сметная цена</TableCell>
                      {!isSupplier && <TableCell>Лучшая цена</TableCell>}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {tender.tenderItems.map((item) => {
                      let bestProposal = tender.supplierProposals.find(proposal =>
                        proposal.proposalItems.some(
                          pi =>
                            pi.description === item.description &&
                            Number(pi.totalPrice) === Number(item.bestPrice)
                        )
                      );
                      if (!bestProposal && item.bestPrice != null) {
                        let minPrice = Math.min(
                          ...tender.supplierProposals.flatMap(p =>
                            p.proposalItems
                              .filter(pi => pi.description === item.description)
                              .map(pi => Number(pi.totalPrice))
                          )
                        );
                        bestProposal = tender.supplierProposals.find(proposal =>
                          proposal.proposalItems.some(
                            pi => pi.description === item.description && Number(pi.totalPrice) === minPrice
                          )
                        );
                      }
                      const suppliersForItem = tender.supplierProposals.filter(proposal =>
                        proposal.proposalItems.some(pi => pi.description === item.description)
                      );
                      // Убираем дубликаты поставщиков
                      const uniqueSuppliers = suppliersForItem.filter((supplier, index, self) => 
                        index === self.findIndex(s => s.supplierId === supplier.supplierId)
                      );
                      return (
                        <TableRow 
                          key={item.id}
                          sx={item.isBestPrice ? { backgroundColor: 'rgba(76, 175, 80, 0.10)' } : {}}
                        >
                          <TableCell>{item.itemNumber}</TableCell>
                          <TableCell>{item.description}</TableCell>
                          <TableCell>{item.materialName}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>{item.unitName}</TableCell>
                          <TableCell>{formatPrice(item.estimatedPrice)}</TableCell>
                          {!isSupplier && (
                            <TableCell>
                              {item.bestPrice != null ? (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  {formatPrice(item.bestPrice)}
                                  {bestProposal ? (
                                    <IconButton size="small" onClick={() => setBestProposalOpenId(bestProposal.id)}>
                                      <VisibilityIcon />
                                    </IconButton>
                                  ) : (
                                    <Typography variant="caption" color="error">нет bestProposal</Typography>
                                  )}
                                </Box>
                              ) : ''}
                            </TableCell>
                          )}
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Предложения поставщиков */}
        {!isSupplier && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Предложения поставщиков
                </Typography>

                {tender.supplierProposals.map((proposal, index) => (
                  <Accordion key={proposal.id} expanded={bestProposalOpenId === proposal.id} onChange={() => setBestProposalOpenId(bestProposalOpenId === proposal.id ? null : proposal.id)}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                        <Typography sx={{ flex: 1 }}>
                          {proposal.supplierName} - {formatPrice(proposal.totalPrice != null ? proposal.totalPrice : getProposalTotal(proposal))}
                        </Typography>
                        {proposal.isBestOffer && (
                          <Tooltip title="Лучшее предложение">
                            <StarIcon color="primary" />
                          </Tooltip>
                        )}
                        <Box
                          sx={{
                            ml: 2,
                            px: 1.5,
                            py: 0.5,
                            borderRadius: 2,
                            backgroundColor: proposal.status === 'SUBMITTED' ? 'info.light' : 'grey.200',
                            display: 'inline-block',
                            fontWeight: 500,
                            fontSize: 14,
                          }}
                        >
                          {getStatusLabel(proposal.status)}
                        </Box>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                          <Typography variant="subtitle2" sx={{ mb: 1 }}>
                            Коммерческие условия
                          </Typography>
                          <Typography variant="body2" sx={{ mb: 2 }}>
                            {proposal.paymentTerms}
                          </Typography>
                          
                          <Typography variant="subtitle2" sx={{ mb: 1 }}>
                            Условия поставки
                          </Typography>
                          <Typography variant="body2" sx={{ mb: 2 }}>
                            {proposal.deliveryTerms}
                          </Typography>
                          
                          <Typography variant="subtitle2" sx={{ mb: 1 }}>
                            Гарантия
                          </Typography>
                          <Typography variant="body2">
                            {proposal.warrantyTerms}
                          </Typography>
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                          <Typography variant="subtitle2" sx={{ mb: 1 }}>
                            Позиции предложения
                          </Typography>
                          <TableContainer component={Paper} variant="outlined">
                            <Table size="small">
                              <TableHead>
                                <TableRow>
                                  <TableCell>№</TableCell>
                                  <TableCell>Описание</TableCell>
                                  <TableCell>Бренд/Модель</TableCell>
                                  <TableCell>Производитель</TableCell>
                                  <TableCell>Цена</TableCell>
                                  <TableCell>Лучшая</TableCell>
                                  {tender.status === 'EVALUATION' && <TableCell>Действия</TableCell>}
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {proposal.proposalItems.map((item) => (
                                  <TableRow key={item.id}>
                                    <TableCell>{item.itemNumber}</TableCell>
                                    <TableCell>{item.description}</TableCell>
                                    <TableCell>
                                      {item.brand && item.model ? `${item.brand} ${item.model}` : 
                                       item.brand || item.model || '-'}
                                    </TableCell>
                                    <TableCell>{item.manufacturer || '-'}</TableCell>
                                    <TableCell>{formatPrice(item.totalPrice)}</TableCell>
                                    <TableCell>
                                      {item.isBestPrice && (
                                        <StarIcon color="primary" fontSize="small" />
                                      )}
                                    </TableCell>
                                    {tender.status === 'EVALUATION' && (
                                      <TableCell>
                                        <Tooltip title="Посмотреть предложение">
                                          <IconButton
                                            size="small"
                                            color="primary"
                                            onClick={() => navigate(`/proposals/${proposal.id}`)}
                                          >
                                            <VisibilityIcon fontSize="small" />
                                          </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Заключить контракт">
                                          <IconButton
                                            size="small"
                                            color="secondary"
                                            onClick={() => navigate(`/tenders/${tender.id}/contract/new/${proposal.supplierId}`)}
                                          >
                                            <GavelIcon fontSize="small" />
                                          </IconButton>
                                        </Tooltip>
                                      </TableCell>
                                    )}
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        </Grid>
                      </Grid>
                    </AccordionDetails>
                  </Accordion>
                ))}
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

      <Dialog
        open={closeDialogOpen}
        onClose={() => setCloseDialogOpen(false)}
        aria-labelledby="close-bidding-dialog-title"
        aria-describedby="close-bidding-dialog-description"
      >
        <DialogTitle id="close-bidding-dialog-title">Закрыть прием предложений</DialogTitle>
        <DialogContent>
          <DialogContentText id="close-bidding-dialog-description">
            Вы уверены, что хотите закрыть прием предложений? После этого новые предложения приниматься не будут.
          </DialogContentText>
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCloseDialogOpen(false)} color="primary">
            Отмена
          </Button>
          <Button onClick={handleCloseBidding} color="secondary" autoFocus>
            Подтвердить
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={cancelDialogOpen}
        onClose={() => setCancelDialogOpen(false)}
        aria-labelledby="cancel-tender-dialog-title"
        aria-describedby="cancel-tender-dialog-description"
      >
        <DialogTitle id="cancel-tender-dialog-title">Отменить тендер</DialogTitle>
        <DialogContent>
          <DialogContentText id="cancel-tender-dialog-description">
            Вы уверены, что хотите отменить тендер? После отмены тендер будет недоступен для дальнейших действий.
          </DialogContentText>
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialogOpen(false)} color="primary">
            Отмена
          </Button>
          <Button onClick={handleCancelTender} color="secondary" autoFocus>
            Подтвердить
          </Button>
        </DialogActions>
      </Dialog>

      {/* Модальное окно подтверждения публикации */}
      <Dialog
        open={publishDialogOpen}
        onClose={() => setPublishDialogOpen(false)}
        aria-labelledby="publish-tender-dialog-title"
        aria-describedby="publish-tender-dialog-description"
      >
        <DialogTitle id="publish-tender-dialog-title">Опубликовать тендер</DialogTitle>
        <DialogContent>
          <DialogContentText id="publish-tender-dialog-description">
            Вы уверены, что хотите опубликовать тендер? После публикации его нельзя будет редактировать как черновик.
          </DialogContentText>
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPublishDialogOpen(false)} color="primary">
            Отмена
          </Button>
          <Button
            onClick={async () => {
              try {
                await api.post(`/api/tenders/${id}/publish`);
                setPublishDialogOpen(false);
                await loadTender();
              } catch (e: any) {
                setError(e.response?.data?.message || 'Ошибка публикации тендера');
              }
            }}
            color="primary"
            variant="contained"
            autoFocus
          >
            Подтвердить
          </Button>
        </DialogActions>
      </Dialog>

      {/* Модальное окно подтверждения открытия приема предложений */}
      <Dialog
        open={startBiddingDialogOpen}
        onClose={() => setStartBiddingDialogOpen(false)}
        aria-labelledby="start-bidding-dialog-title"
        aria-describedby="start-bidding-dialog-description"
      >
        <DialogTitle id="start-bidding-dialog-title">Открыть прием предложений</DialogTitle>
        <DialogContent>
          <DialogContentText id="start-bidding-dialog-description">
            Вы уверены, что хотите открыть прием предложений? После этого тендер перейдет в статус "Прием предложений" и станет доступен для подачи заявок.
          </DialogContentText>
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStartBiddingDialogOpen(false)} color="primary">
            Отмена
          </Button>
          <Button
            onClick={async () => {
              try {
                await api.post(`/api/tenders/${id}/start-bidding`);
                setStartBiddingDialogOpen(false);
                await loadTender();
              } catch (e: any) {
                setError(e.response?.data?.message || 'Ошибка открытия приема предложений');
              }
            }}
            color="primary"
            variant="contained"
            autoFocus
          >
            Подтвердить
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={removeWinnerDialogOpen}
        onClose={handleRemoveWinnerCancel}
        aria-labelledby="remove-winner-dialog-title"
        aria-describedby="remove-winner-dialog-description"
      >
        <DialogTitle id="remove-winner-dialog-title">Убрать победителя?</DialogTitle>
        <DialogContent>
          <DialogContentText id="remove-winner-dialog-description">
            Вы уверены, что хотите убрать победителя для этой позиции? Это действие можно отменить, выбрав победителя снова.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleRemoveWinnerCancel} color="primary">Отмена</Button>
          <Button onClick={handleRemoveWinnerConfirm} color="error" autoFocus>Да, убрать</Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={autoAwardDialogOpen}
        onClose={handleAutoAwardCancel}
        aria-labelledby="auto-award-dialog-title"
        aria-describedby="auto-award-dialog-description"
      >
        <DialogTitle id="auto-award-dialog-title">Назначить победителя?</DialogTitle>
        <DialogContent>
          <DialogContentText id="auto-award-dialog-description">
            Назначить победителем поставщика с лучшей ценой: <b>{autoAwardSupplier?.name}</b>?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAutoAwardCancel} color="primary">Отмена</Button>
          <Button onClick={handleAutoAwardConfirm} color="success" autoFocus>Да, назначить</Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={manualAwardDialogOpen}
        onClose={handleManualAwardCancel}
        aria-labelledby="manual-award-dialog-title"
        aria-describedby="manual-award-dialog-description"
      >
        <DialogTitle id="manual-award-dialog-title">Назначить победителя?</DialogTitle>
        <DialogContent>
          <DialogContentText id="manual-award-dialog-description">
            Назначить победителем выбранного поставщика: <b>{manualAwardSupplier?.name}</b>?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleManualAwardCancel} color="primary">Отмена</Button>
          <Button onClick={handleManualAwardConfirm} color="success" autoFocus>Да, назначить</Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={resetAwardDialogOpen}
        onClose={handleResetAwardCancel}
        aria-labelledby="reset-award-dialog-title"
        aria-describedby="reset-award-dialog-description"
      >
        <DialogTitle id="reset-award-dialog-title">Сбросить победителя?</DialogTitle>
        <DialogContent>
          <DialogContentText id="reset-award-dialog-description">
            Вы уверены, что хотите сбросить победителя тендера? Это действие можно отменить, выбрав победителя снова.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleResetAwardCancel} color="primary">Отмена</Button>
          <Button onClick={handleResetAwardConfirm} color="error" autoFocus>Да, сбросить</Button>
        </DialogActions>
      </Dialog>

      {/* Диалог разделения тендера */}
      <TenderSplitDialog
        open={splitDialogOpen}
        onClose={() => setSplitDialogOpen(false)}
        tenderId={tender.id}
        tenderItems={tender.tenderItems}
        onSplitSuccess={handleSplitSuccess}
      />
    </Box>
  );
};

export default TenderDetailPage; 