import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Grid,
  IconButton,
  Collapse,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Alert,
  LinearProgress
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Assignment as AssignmentIcon,
  Gavel as GavelIcon,
  Description as DescriptionIcon,
  Receipt as ReceiptIcon,
  LocalShipping as DeliveryIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Business as BusinessIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  AttachMoney as MoneyIcon,
  CalendarToday as CalendarIcon,
  ArrowForward as ArrowForwardIcon,
  FileDownload as FileDownloadIcon,
  PlayArrow as PlayArrowIcon,
  Stop as StopIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { RequestProcess, TenderProcess, DeliveryProcess, SupplierProposal } from '../types/requestProcess';
import { api } from '../utils/api';
import { formatPhone } from '../utils/phoneUtils';

interface RequestProcessMatryoshkaProps {
  request: RequestProcess;
}

const StyledCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  border: `2px solid ${theme.palette.primary.main}`,
  '&:hover': {
    boxShadow: theme.shadows[8],
    transform: 'translateY(-2px)',
    transition: 'all 0.3s ease-in-out'
  }
}));

const ProcessStep = styled(Box)<{ color: string }>(({ theme, color }) => ({
  padding: theme.spacing(1.5),
  borderRadius: theme.spacing(1),
  backgroundColor: color,
  color: theme.palette.getContrastText(color),
  marginBottom: theme.spacing(1),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  minHeight: '56px',
  cursor: 'pointer',
  '&:hover': {
    opacity: 0.8,
    transform: 'scale(1.02)',
    transition: 'all 0.2s ease-in-out'
  }
}));

const NestedStep = styled(Box)<{ color: string }>(({ theme, color }) => ({
  padding: theme.spacing(1),
  borderRadius: theme.spacing(1),
  backgroundColor: color,
  color: theme.palette.getContrastText(color),
  marginBottom: theme.spacing(0.5),
  marginLeft: theme.spacing(3),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  minHeight: '48px',
  cursor: 'pointer',
  '&:hover': {
    opacity: 0.8,
    transform: 'scale(1.01)',
    transition: 'all 0.2s ease-in-out'
  }
}));

const StatusChip = styled(Chip)<{ status: string }>(({ theme, status }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
      case 'PAID':
      case 'RECEIVED':
      case 'ACCEPTED':
      case 'DELIVERED':
        return theme.palette.success.main;
      case 'IN_PROGRESS':
      case 'PARTIALLY_PAID':
      case 'PARTIALLY_RECEIVED':
      case 'UNDER_REVIEW':
      case 'PLANNED':
      case 'CONFIRMED':
      case 'IN_TRANSIT':
      case 'ARRIVED':
      case 'PENDING':
        return theme.palette.warning.main;
      case 'CANCELLED':
      case 'REJECTED':
      case 'DRAFT':
        return theme.palette.error.main;
      default:
        return theme.palette.info.main;
    }
  };

  return {
    backgroundColor: getStatusColor(status),
    color: theme.palette.getContrastText(getStatusColor(status)),
    fontWeight: 'bold'
  };
});

function RequestProcessMatryoshka({ request }: RequestProcessMatryoshkaProps) {
  const navigate = useNavigate();
  const theme = useTheme();
  const [expandedRequest, setExpandedRequest] = useState(false);
  const [expandedTenders, setExpandedTenders] = useState<string[]>([]);
  const [expandedProposals, setExpandedProposals] = useState<string[]>([]);
  const [expandedContracts, setExpandedContracts] = useState<string[]>([]);
  const [expandedInvoices, setExpandedInvoices] = useState<string[]>([]);
  const [expandedDeliveries, setExpandedDeliveries] = useState<string[]>([]);
  const [expandedWinners, setExpandedWinners] = useState<string[]>([]);
  const [expandedWinnerGroups, setExpandedWinnerGroups] = useState<string[]>([]);
  const [awardingItems, setAwardingItems] = useState<Record<string, boolean>>({});
  const [createTenderLoading, setCreateTenderLoading] = useState(false);
  const [confirmCreateTender, setConfirmCreateTender] = useState(false);
  const [statusDialog, setStatusDialog] = useState<{
    open: boolean;
    tenderId: string | null;
    action: 'start-bidding' | 'close' | 'submit-proposal' | null;
    title: string;
    description: string;
    onConfirm: (() => void) | null;
  }>({
    open: false,
    tenderId: null,
    action: null,
    title: '',
    description: '',
    onConfirm: null
  });
  const [error, setError] = useState<string | null>(null);
  const [tenderWinners, setTenderWinners] = useState<Record<string, any>>({});

  // Логируем данные заявки для отладки
  console.log('=== ДАННЫЕ ЗАЯВКИ НА ФРОНТЕНДЕ ===');
  console.log('Заявка №:', request.requestNumber);
  console.log('Проект:', request.project);
  console.log('Склад (location):', request.location);
  console.log('Полная заявка:', request);
  console.log('===================================');

  // Отладочная информация для кнопки "Создать тендер"
  console.log(`Кнопка "Создать тендер": статус=${request.status}, тендеров=${request.tenders?.length || 0}, показывать=true (всегда)`);
  
  // Детальная информация о тендерах для отладки
  if (request.tenders && request.tenders.length > 0) {
    console.log('Детали существующих тендеров:');
    request.tenders.forEach((tender, index) => {
      console.log(`Тендер ${index + 1}:`, {
        tenderId: tender.tenderId,
        status: tender.status,
        proposalsCount: tender.proposalsCount,
        totalAmount: tender.totalAmount
      });
    });
    
    const allDraft = request.tenders.every(tender => tender.status === 'DRAFT');
    console.log(`Все тендеры в статусе DRAFT: ${allDraft}`);
  }

  // Отладочная информация
  console.log('RequestProcessMatryoshka - request:', request);
  console.log('RequestProcessMatryoshka - tenders:', request.tenders);
  console.log('RequestProcessMatryoshka - tendersCount:', request.tendersCount);
  console.log('RequestProcessMatryoshka - invoices:', request.invoices);
  console.log('RequestProcessMatryoshka - invoicesCount:', request.invoicesCount);
  if (request.invoices && request.invoices.length > 0) {
    console.log('Детали счетов:', request.invoices.map(invoice => ({
      invoiceNumber: invoice.invoiceNumber,
      invoiceItems: invoice.invoiceItems,
      invoiceItemsCount: invoice.invoiceItems?.length || 0
    })));
    
    // Детальное логирование каждого счета
    request.invoices.forEach(invoice => {
      console.log('Счет:', invoice.invoiceNumber, 'полные данные:', JSON.stringify(invoice, null, 2));
      if (invoice.invoiceItems) {
        invoice.invoiceItems.forEach((item, index) => {
          console.log(`Элемент ${index + 1} счета ${invoice.invoiceNumber}:`, {
            materialName: item.materialName,
            quantity: item.quantity,
            unitName: item.unitName,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice
          });
        });
      }
    });
  }
  console.log('RequestProcessMatryoshka - contracts:', request.contracts);
  console.log('RequestProcessMatryoshka - contractsCount:', request.contractsCount);
  console.log('RequestProcessMatryoshka - deliveries:', request.deliveries);
  console.log('RequestProcessMatryoshka - deliveriesCount:', request.deliveriesCount);

  // Логируем детали предложений для отладки
  if (request.tenders) {
    request.tenders.forEach(tender => {
      if (tender.proposals && tender.proposals.length > 0) {
        console.log(`Тендер ${tender.tenderId} - предложения:`, tender.proposals.map(p => ({
          proposalId: p.proposalId,
          supplierName: p.supplierName,
          status: p.status,
          totalPrice: p.totalPrice,
          // Проверяем наличие поля winningPositionsTotal
          hasWinningPositionsTotal: 'winningPositionsTotal' in p,
          winningPositionsTotal: (p as any).winningPositionsTotal,
          // Проверяем все доступные поля
          allFields: Object.keys(p),
          // Проверяем наличие полей, которые могут указывать на победителей
          isWinner: (p as any).isWinner,
          isBestPrice: (p as any).isBestPrice,
          winnerPositions: (p as any).winnerPositions,
          awardedPositions: (p as any).awardedPositions,
          // Полный объект для анализа
          fullObject: p
        })));
      }
    });
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('ru-RU');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 2
    }).format(amount);
  };



  // Функция для проверки наличия победителя тендера у заявки
  const hasTenderWinner = (): boolean => {
    if (!request.tenders || request.tenders.length === 0) {
      console.log(`Заявка ${request.requestNumber}: нет тендеров`);
      return false;
    }

    console.log(`Заявка ${request.requestNumber}: анализируем ${request.tenders.length} тендеров`);

    // Проверяем, есть ли тендер со статусом AWARDED и принятыми предложениями
    const hasWinner = request.tenders.some(tender => {
      console.log(`Тендер ${tender.tenderId}: статус = ${tender.status}, предложений = ${tender.proposals?.length || 0}`);
      
      // Тендер должен быть присужден
      if (tender.status !== 'AWARDED') {
        console.log(`Тендер ${tender.tenderId}: статус не AWARDED, пропускаем`);
        return false;
      }

      // Должны быть предложения со статусом ACCEPTED
      if (!tender.proposals || tender.proposals.length === 0) {
        console.log(`Тендер ${tender.tenderId}: нет предложений, пропускаем`);
        return false;
      }

      const acceptedProposals = tender.proposals.filter(proposal => proposal.status === 'ACCEPTED');
      console.log(`Тендер ${tender.tenderId}: найдено ${acceptedProposals.length} принятых предложений`);
      
      if (acceptedProposals.length > 0) {
        console.log(`Тендер ${tender.tenderId}: ПОБЕДИТЕЛЬ НАЙДЕН!`);
        return true;
      }
      
      return false;
    });

    console.log(`Заявка ${request.requestNumber}: наличие победителя тендера: ${hasWinner}`);
    return hasWinner;
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      // Статусы заявок
      case 'DRAFT':
        return 'Черновик';
      case 'SAVED':
        return 'Сохранено';
      case 'SUBMITTED':
        return 'Подана';
      case 'APPROVED':
        return 'Одобрена';
      case 'IN_PROGRESS':
        return 'В работе';
      case 'COMPLETED':
        return 'Завершена';
      case 'CANCELLED':
        return 'Отменена';
      case 'PUBLISHED':
        return 'Опубликован';
      case 'BIDDING':
        return 'Прием предложений';
      case 'EVALUATION':
        return 'Оценка предложений';
      case 'AWARDED':
        return 'Присужден';
      case 'UNDER_REVIEW':
        return 'На рассмотрении';
      case 'ACCEPTED':
        return 'Принято';
      case 'REJECTED':
        return 'Отклонено';
      case 'WITHDRAWN':
        return 'Отозвано';
      case 'ACTIVE':
        return 'Активен';
      case 'EXPIRED':
        return 'Истек';
      case 'TERMINATED':
        return 'Расторгнут';
      case 'SENT':
        return 'Отправлен';
      case 'CONFIRMED':
        return 'Подтверждено';
      case 'PARTIALLY_PAID':
        return 'Частично оплачен';
      case 'PAID':
        return 'Оплачен';
      case 'OVERDUE':
        return 'Просрочен';
      case 'PLANNED':
        return 'Запланирована';
      case 'IN_TRANSIT':
        return 'В пути';
      case 'ARRIVED':
        return 'Прибыла на склад';
      case 'DELIVERED':
        return 'Доставлена';
      case 'PARTIALLY_ACCEPTED':
        return 'Частично принята';
       case 'PENDING':
        return 'Ожидает приемки';
      case 'PARTIALLY_RECEIVED':
        return 'Частично получен';
      case 'RECEIVED':
        return 'Получен';
      default:
        return status;
    }
  };

  const getStepColor = (step: string, count: number) => {
    if (count === 0) return '#f5f5f5'; // Серый для отсутствующих шагов
    switch (step) {
      case 'request':
        return '#fff3cd'; // Желтый для заявки
      case 'tender':
        return '#d1ecf1'; // Голубой для тендера
      case 'proposal':
        return '#d4edda'; // Зеленый для предложений
      case 'contract':
        return '#e2d9f3'; // Фиолетовый для контрактов
      case 'invoice':
        return '#f8d7da'; // Красный для счетов
      case 'delivery':
        return '#fff3cd'; // Желтый для поставок
      case 'receipt':
        return '#e2e3e5'; // Серый для поступлений
      default:
        return '#f8f9fa';
    }
  };

  const handleRequestClick = () => {
    setExpandedRequest(!expandedRequest);
  };

  const handleTenderClick = (tenderId: string) => {
    setExpandedTenders(prev => 
      prev.includes(tenderId) 
        ? prev.filter(id => id !== tenderId)
        : [...prev, tenderId]
    );
    const tender = request.tenders?.find(t => t.tenderId === tenderId);
    if (tender && tender.status === 'AWARDED' && !tenderWinners[tenderId]) {
      loadTenderWinners(tenderId);
    }
  };

  const handleProposalClick = (proposalId: string) => {
    setExpandedProposals(prev => 
      prev.includes(proposalId) 
        ? prev.filter(id => id !== proposalId)
        : [...prev, proposalId]
    );
  };

  const handleViewProposalDetail = (proposalId: string) => {
    window.open(`/proposals/${proposalId}`, '_blank');
  };

  const handleViewTenderDetail = (tenderId: string, status?: string) => {
    const url = status === 'EVALUATION' ? `/tenders/${tenderId}?tab=winners` : `/tenders/${tenderId}`;
    window.open(url, '_blank');
  };

  const handleViewDeliveryDetail = (deliveryId: string) => {
    window.open(`/deliveries/${deliveryId}`, '_blank');
  };

  const handleViewRequestDetail = (requestId: string) => {
    window.open(`/requests/${requestId}`, '_blank');
  };

  const handleDownloadExcelReport = async (requestId: string) => {
    try {
      const response = await api.get(`/api/price-analysis/request/${requestId}/export`, {
        responseType: 'blob',
      });

      const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Анализ_цен_по_заявке_${request.requestNumber}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Ошибка при скачивании отчета:', error);
      alert('Ошибка при скачивании отчета');
    }
  };

  const handleCreateTender = (requestId: string) => {
    // Логируем действие создания тендера
    console.log(`Открытие диалога подтверждения для создания тендера по заявке ${request.requestNumber} (ID: ${requestId})`);
    console.log(`Статус заявки: ${request.status}`);
    console.log(`Количество существующих тендеров: ${request.tenders?.length || 0}`);
    
    // Открываем диалог подтверждения
    setConfirmCreateTender(true);
  };

  const handleConfirmCreateTender = async () => {
    if (!request.requestId) return;
    
    // Логируем подтверждение создания тендера
    console.log(`Подтверждено создание тендера для заявки ${request.requestNumber} (ID: ${request.requestId})`);
    
    setCreateTenderLoading(true);
    
    try {
      console.log(`Отправляем POST-запрос на /api/requests/${request.requestId}/create-tender`);
      const response = await api.post(`/api/requests/${request.requestId}/create-tender`);
      console.log('Ответ от сервера:', response);
      
      const tender = response.data;
      console.log('Данные созданного тендера:', tender);
      
      // Закрываем диалог
      setConfirmCreateTender(false);
      
      // После создания тендера открываем его в новом окне
      window.open(`/tenders/${tender.id}`, '_blank');
      
      // Показываем сообщение об успехе
      console.log(`Тендер успешно создан для заявки ${request.requestNumber}`);
      
    } catch (error: any) {
      console.error('Ошибка при создании тендера:', error);
      console.error('Детали ошибки:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      
      const errorMessage = error.response?.data?.message || error.message || 'Неизвестная ошибка';
      alert('Ошибка при создании тендера: ' + errorMessage);
    } finally {
      setCreateTenderLoading(false);
    }
  };

  const handleContractClick = (contractId: string) => {
    setExpandedContracts(prev => 
      prev.includes(contractId) 
        ? prev.filter(id => id !== contractId)
        : [...prev, contractId]
    );
  };

  const handleViewContractDetail = (contractId: string) => {
    window.open(`/contracts/${contractId}`, '_blank');
  };

  const handleViewProposals = (tenderId: string) => {
    window.open(`/proposals?tenderId=${tenderId}`, '_blank');
  };

  const handleInvoiceClick = (invoiceId: string) => {
    setExpandedInvoices(prev => 
      prev.includes(invoiceId) 
        ? prev.filter(id => id !== invoiceId)
        : [...prev, invoiceId]
    );
  };

  const handleViewInvoiceDetail = (invoiceId: string) => {
    window.open(`/invoices/${invoiceId}`, '_blank');
  };

  const handleDeliveryClick = (deliveryId: string) => {
    setExpandedDeliveries(prev => 
      prev.includes(deliveryId) 
        ? prev.filter(id => id !== deliveryId)
        : [...prev, deliveryId]
    );
  };

  const openStatusDialog = (tenderId: string, action: 'start-bidding' | 'close' | 'submit-proposal') => {
    let title = '';
    let description = '';
    let onConfirm: (() => void) | null = null;
    
    switch (action) {
      case 'start-bidding':
        title = 'Начать прием предложений';
        description = 'Вы уверены, что хотите начать прием предложений? После этого поставщики смогут подавать предложения.';
        onConfirm = () => handleStartBidding(tenderId);
        break;
      case 'close':
        title = 'Закрыть прием предложений';
        description = 'Вы уверены, что хотите закрыть прием предложений? После этого новые предложения приниматься не будут.';
        onConfirm = () => handleClose(tenderId);
        break;
      case 'submit-proposal':
        title = 'Подать предложение';
        description = 'Вы уверены, что хотите подать предложение по этому тендеру? После подачи вы будете перенаправлены на страницу создания предложения.';
        onConfirm = () => handleSubmitProposal(tenderId);
        break;
    }
    
    setStatusDialog({ open: true, tenderId, action, title, description, onConfirm });
  };

  const handleStartBidding = async (tenderId: string) => {
    try {
      await api.post(`/api/tenders/${tenderId}/start-bidding`);
      setStatusDialog(prev => ({ ...prev, open: false }));
      setError(null);
      // Здесь можно добавить обновление данных, если нужно
    } catch (error: any) {
      console.error('Error starting bidding:', error);
      const errorMessage = error.response?.data?.message || 'Ошибка начала приема предложений';
      setError(errorMessage);
    }
  };

  const handleClose = async (tenderId: string) => {
    try {
      await api.post(`/api/tenders/${tenderId}/close`);
      setStatusDialog(prev => ({ ...prev, open: false }));
      setError(null);
      // Здесь можно добавить обновление данных, если нужно
    } catch (error: any) {
      console.error('Error closing bidding:', error);
      const errorMessage = error.response?.data?.message || 'Ошибка закрытия приема предложений';
      setError(errorMessage);
    }
  };

  const handleSubmitProposal = (tenderId: string) => {
    setStatusDialog(prev => ({ ...prev, open: false }));
    setError(null);
    // Перенаправляем на страницу создания предложения
    window.open(`/tenders/${tenderId}/proposals/new`, '_blank');
  };

  // Функция для загрузки победителей тендера
  const loadTenderWinners = async (tenderId: string) => {
    try {
      const response = await api.get(`/api/tenders/${tenderId}/winners`);
      setTenderWinners(prev => ({ ...prev, [tenderId]: response.data }));
    } catch (err) {
      console.error('Error loading tender winners:', err);
    }
  };

  useEffect(() => {
    if (request.tenders && request.tenders.length > 0) {
      request.tenders.forEach(t => {
        if (t.status === 'AWARDED' && !tenderWinners[t.tenderId]) {
          loadTenderWinners(t.tenderId);
        }
      });
    }
  }, [request.tenders]);

  return (
    <StyledCard>
      <CardContent>
        {/* Основная заявка - всегда видна */}
        <ProcessStep 
          color={getStepColor('request', 1)}
          onClick={handleRequestClick}
        >
          <Box display="flex" alignItems="center" gap={1}>
            <AssignmentIcon />
            <Box>
              <Typography variant="h6">
                Заявка № {request.requestNumber}
              </Typography>
              <Typography variant="body2">
                {formatDate(request.requestDate)} • {request.project} • {request.location || 'Склад не указан'}
              </Typography>
            </Box>
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="h6" color="primary.main" fontWeight="bold">
              {formatCurrency(request.requestTotalAmount)}
            </Typography>
            {(() => {
              const tenders = request.tenders || [];
              const contracts = request.contracts || [];
              const totalTenders = tenders.length;
              const completedTenders = tenders.filter(t => t.status === 'AWARDED').length;
              const allTendersCompleted = totalTenders > 0 && completedTenders === totalTenders;

              const totalContracts = contracts.length;
              const completedContracts = contracts.filter(c => c.status === 'COMPLETED').length;
              const allContractsCompleted = totalContracts > 0 && completedContracts === totalContracts;

              // Основная логика: если тендеры завершены — показываем прогресс по контрактам,
              // если контракты завершены — показываем прогресс по тендерам,
              // иначе показываем комбинированный прогресс: среднее двух процентов.
              const pctT = totalTenders ? Math.round((completedTenders / totalTenders) * 100) : 0;
              const pctC = totalContracts ? Math.round((completedContracts / totalContracts) * 100) : 0;

              let label = 'Прогресс';
              let pct = 0;
              if (allTendersCompleted && totalContracts > 0) {
                label = 'Контракты завершены';
                pct = pctC;
              } else if (allContractsCompleted && totalTenders > 0) {
                label = 'Тендеры завершены';
                pct = pctT;
              } else {
                label = 'Тендеры/Контракты';
                // среднее, но если один из массивов пустой — берем другой
                if (totalTenders && totalContracts) pct = Math.round((pctT + pctC) / 2);
                else pct = totalTenders ? pctT : pctC;
              }

              return (
                <Box sx={{ minWidth: 160 }}>
                  <Typography variant="caption" color="text.secondary">{label}</Typography>
                  <Typography variant="caption" sx={{ display: 'block', fontWeight: 500 }}>{pct}%</Typography>
                  <LinearProgress variant="determinate" value={pct} sx={{ height: 6, borderRadius: 1, mt: 0.25 }} />
                </Box>
              );
            })()}
            <StatusChip
              label={getStatusLabel(request.status)}
              status={request.status}
              size="small"
            />
            <IconButton size="small">
              {expandedRequest ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Box>
        </ProcessStep>

        {/* Детали заявки */}
        <Collapse in={expandedRequest}>
          <Box ml={3} mb={2}>
            {/* Кнопки действий */}
            <Box display="flex" gap={1} mb={2} flexWrap="wrap">
              <Button
                variant="outlined"
                size="small"
                onClick={() => handleViewRequestDetail(request.requestId)}
                sx={{ 
                  minWidth: 'auto', 
                  px: 1, 
                  py: 0.5,
                  fontSize: '0.75rem',
                  borderColor: 'primary.main',
                  color: 'primary.main',
                  '&:hover': {
                    borderColor: 'primary.dark',
                    bgcolor: 'primary.50'
                  }
                }}
              >
                Просмотр
              </Button>
              {(
                <Button
                  variant="contained"
                  size="small"
                  startIcon={createTenderLoading ? <CircularProgress size={16} color="inherit" /> : <GavelIcon />}
                  onClick={() => handleCreateTender(request.requestId)}
                  disabled={createTenderLoading}
                  sx={{ 
                    minWidth: 'auto', 
                    px: 1, 
                    py: 0.5,
                    fontSize: '0.75rem',
                    bgcolor: 'success.main',
                    color: 'white',
                    '&:hover': {
                      bgcolor: 'success.dark'
                    }
                  }}
                >
                  {createTenderLoading ? 'Создание...' : 'Создать тендер'}
                </Button>
              )}
              {(request.tenders && request.tenders.length > 0) && (
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<FileDownloadIcon />}
                  onClick={() => handleDownloadExcelReport(request.requestId)}
                  sx={{ 
                    minWidth: 'auto', 
                    px: 1, 
                    py: 0.5,
                    fontSize: '0.75rem',
                    borderColor: 'success.main',
                    color: 'success.main',
                    '&:hover': {
                      borderColor: 'success.dark',
                      bgcolor: 'success.50'
                    }
                  }}
                >
                  Excel
                </Button>
              )}
            </Box>

            {/* Материалы и номенклатура */}
            <Box p={2} bgcolor="grey.50" borderRadius={1} mb={2}>
              <Typography variant="subtitle2" gutterBottom>
                Материалы ({request.materialsCount} номенклатур)
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {request.materials && request.materials.length > 0 
                  ? (request.materials.length > 5 
                      ? `${request.materials.slice(0, 5).join(', ')}... и еще ${request.materials.length - 5}`
                      : request.materials.join(', '))
                  : 'Материалы не указаны'
                }
              </Typography>
            </Box>

            {/* Роли и сроки */}
            <Grid container spacing={2} mb={2}>
              <Grid item xs={12} sm={4}>
                <Typography variant="body2">
                  <strong>Заявитель:</strong> {request.applicant}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="body2">
                  <strong>Согласователь:</strong> {request.approver}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="body2">
                  <strong>Исполнитель:</strong> {request.performer}
                </Typography>
              </Grid>
            </Grid>

            <Grid container spacing={2} mb={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2">
                  <strong>Организация:</strong> {request.organization}
                </Typography>
                <Typography variant="body2">
                  <strong>Проект:</strong> {request.project}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2">
                  <strong>Срок поставки:</strong> {formatDate(request.deliveryDeadline)}
                </Typography>
                <Typography variant="body2">
                  <strong>Количество номенклатур:</strong> {request.materialsCount}
                </Typography>
              </Grid>
            </Grid>

            {/* Финансовые показатели */}
            <Box p={2} bgcolor="grey.50" borderRadius={1} mb={2}>
              <Typography variant="subtitle2" gutterBottom>
                Финансовые показатели
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Typography variant="body2" color="textSecondary">
                    Заявка
                  </Typography>
                  <Typography variant="h6" color="error.main">
                    {formatCurrency(request.requestTotalAmount)}
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="body2" color="textSecondary">
                    Тендер
                  </Typography>
                  <Typography variant="h6" color="success.main">
                    {formatCurrency(request.tenderTotalAmount)}
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="body2" color="textSecondary">
                    Дельта
                  </Typography>
                  <Typography variant="h6" color={request.deltaAmount >= 0 ? 'success.main' : 'error.main'}>
                    {formatCurrency(request.deltaAmount)}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </Box>
        </Collapse>

            {/* Тендеры */}
            {expandedRequest && request.tenders && request.tenders.length > 0 && (
              <Box mb={2}>
                <Typography variant="subtitle2" gutterBottom>
                  Тендеры ({request.tenders.length})
                  {(() => {
                    const total = request.tenders.length;
                    const completed = request.tenders.filter(t => t.status === 'AWARDED').length; // завершимый тендер — присужден
                    const pct = total ? Math.round((completed / total) * 100) : 0;
                    return (
                      <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                        Завершено: {pct}%
                      </Typography>
                    );
                  })()}
                </Typography>
                {request.tenders.map((tender) => (
                  <Box key={tender.tenderId}>
                    <NestedStep 
                      color={getStepColor('tender', tender.proposalsCount)}
                      onClick={() => handleTenderClick(tender.tenderId)}
                    >
                      <Box display="flex" alignItems="center" gap={1}>
                        <GavelIcon />
                        <Box>
                          <Typography variant="body1">
                            Тендер к Заявке № {request.requestNumber}
                          </Typography>
                          <Typography variant="body2">
                            {formatDate(tender.tenderDate)} • {request.project} • {request.location || 'Склад не указан'} • {tender.proposalsCount} предложений
                          </Typography>
                        </Box>
                      </Box>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="body2">
                          {formatCurrency(tender.totalAmount)}
                        </Typography>
                        {(() => {
                          // Индикатор завершенности тендера по контрактам: считаем контракты, привязанные к этому тендеру, завершенные COMPLETED
                          const relatedContracts = (request.contracts || []).filter(c => (c as any).tenderId === tender.tenderId);
                          const totalC = relatedContracts.length;
                          const completedC = relatedContracts.filter(c => c.status === 'COMPLETED').length;
                          const pctC = totalC ? Math.round((completedC / totalC) * 100) : 0;
                          return (
                            <Box sx={{ minWidth: 120, mx: 1 }}>
                              <Typography variant="caption" color="text.secondary">Контракты завершены</Typography>
                              <Typography variant="caption" sx={{ display: 'block', fontWeight: 500 }}>{pctC}%</Typography>
                              <LinearProgress variant="determinate" value={pctC} sx={{ height: 6, borderRadius: 1, mt: 0.25 }} />
                            </Box>
                          );
                        })()}
                        <StatusChip
                          label={getStatusLabel(tender.status)}
                          status={tender.status}
                          size="small"
                        />
                        <IconButton size="small">
                          {expandedTenders.includes(tender.tenderId) ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        </IconButton>
                      </Box>
                    </NestedStep>

                    {/* Предложения в тендере */}
                    <Collapse in={expandedTenders.includes(tender.tenderId)}>
                      <Box ml={3}>
                        {/* Кнопки управления приемом предложений */}
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="subtitle2" gutterBottom>
                            Управление тендером
                          </Typography>
                          <Box display="flex" gap={1} flexWrap="wrap">
                            <Button
                              variant="outlined"
                              size="small"
                              onClick={() => handleViewTenderDetail(tender.tenderId, tender.status)}
                              sx={{ 
                                borderColor: 'primary.main',
                                color: 'primary.main',
                                '&:hover': {
                                  borderColor: 'primary.dark',
                                  bgcolor: 'primary.50'
                                }
                              }}
                            >
                              Просмотр тендера
                            </Button>
                             
                            {(tender.status === 'DRAFT' || tender.status === 'PUBLISHED') && (
                              <Button
                                variant="contained"
                                color="warning"
                                size="small"
                                startIcon={<PlayArrowIcon />}
                                onClick={() => openStatusDialog(tender.tenderId, 'start-bidding')}
                              >
                                Начать прием предложений
                              </Button>
                            )}
                            {tender.status === 'BIDDING' && (
                              <>
                                <Button
                                  variant="contained"
                                  color="success"
                                  size="small"
                                  onClick={() => openStatusDialog(tender.tenderId, 'submit-proposal')}
                                >
                                  Подать предложение
                                </Button>
                                <Button
                                  variant="contained"
                                  color="error"
                                  size="small"
                                  startIcon={<StopIcon />}
                                  onClick={() => openStatusDialog(tender.tenderId, 'close')}
                                >
                                  Закрыть прием предложений
                                </Button>
                              </>
                            )}
                          </Box>
                        </Box>
                        {tender.status === 'AWARDED' ? (
                          (() => {
                            // Собираем массив победителей, как и раньше
                            let winnersArray: any[] = [];
                            const winnersData = tenderWinners[tender.tenderId];
                            if (winnersData && winnersData.itemWinners) {
                              const uniqueWinners = new Map();
                              winnersData.itemWinners.forEach((item: any) => {
                                if (item.winner) {
                                  uniqueWinners.set(item.winner.supplierId, {
                                    proposalId: item.winner.proposalId,
                                    supplierId: item.winner.supplierId,
                                    supplierName: item.winner.supplierName,
                                    totalPrice: item.totalWinnerPrice,
                                    status: 'ACCEPTED',
                                    winningPositions: [item.itemNumber]
                                  });
                                }
                              });
                              winnersArray = Array.from(uniqueWinners.values()).map(winner => ({
                                ...winner,
                                winningPositions: winnersData.itemWinners
                                  .filter((it: any) => it.winner?.supplierId === winner.supplierId)
                                  .map((it: any) => it.itemNumber),
                                totalPrice: winnersData.itemWinners
                                  .filter((it: any) => it.winner?.supplierId === winner.supplierId)
                                  .reduce((sum: number, it: any) => sum + (it.totalWinnerPrice || 0), 0)
                              }));
                            } else {
                              winnersArray = (tender.proposals || []).filter((proposal: any) => {
                                const isWinner = (proposal as any).isWinner;
                                const isBestPrice = (proposal as any).isBestPrice;
                                const hasWinningPositions = (proposal as any).winningPositionsTotal > 0;
                                const hasAwardedPositions = (proposal as any).awardedPositions?.length > 0;
                                return proposal.status === 'ACCEPTED' && (isWinner || isBestPrice || hasWinningPositions || hasAwardedPositions);
                              });
                            }

                            const groupKey = tender.tenderId;
                            const isGroupExpanded = expandedWinnerGroups.includes(groupKey);
                            const totalW = winnersArray.length;
                            const relatedContracts = (request.contracts || []).filter(c => (c as any).tenderId === tender.tenderId);
                            const completedW = winnersArray.filter(w => relatedContracts.some(c => (c as any).supplierId === w.supplierId || c.supplierName === w.supplierName)).length;
                            const pctW = totalW ? Math.round((completedW / totalW) * 100) : 0;

                            return (
                              <>
                                <NestedStep color={getStepColor('proposal', 1)} onClick={() => setExpandedWinnerGroups(prev => prev.includes(groupKey) ? prev.filter(id => id !== groupKey) : [...prev, groupKey])}>
                                  <Box display="flex" alignItems="center" gap={1}>
                                    <GavelIcon />
                                    <Typography variant="body1">Победители ({totalW})</Typography>
                                  </Box>
                                  <Box display="flex" alignItems="center" gap={1}>
                                    <Box sx={{ minWidth: 120 }}>
                                      <Typography variant="caption" color="text.secondary">Контракты заключены</Typography>
                                      <Typography variant="caption" sx={{ display: 'block', fontWeight: 500 }}>{pctW}%</Typography>
                                      <LinearProgress variant="determinate" value={pctW} sx={{ height: 6, borderRadius: 1, mt: 0.25 }} />
                                    </Box>
                                    <IconButton size="small">{isGroupExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}</IconButton>
                                  </Box>
                                </NestedStep>
                                <Collapse in={isGroupExpanded}>
                                  <Box ml={3}>
                                    {winnersArray.map((proposal: any) => {
                                      const winnerKey = `${tender.tenderId}:${proposal.supplierId}`;
                                      const isExpanded = expandedWinners.includes(winnerKey);
                                      return (
                              <Box key={proposal.proposalId}>
                                          <NestedStep color={getStepColor('proposal', 1)} onClick={() => setExpandedWinners(prev => prev.includes(winnerKey) ? prev.filter(id => id !== winnerKey) : [...prev, winnerKey])}>
                                  <Box display="flex" alignItems="center" gap={1}>
                                    <BusinessIcon />
                                    <Box>
                                                <Typography variant="body2" fontWeight="bold" color="success.main">🏆 {proposal.supplierName} (ПОБЕДИТЕЛЬ)</Typography>
                                    </Box>
                                  </Box>
                                            <IconButton size="small">{isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}</IconButton>
                                </NestedStep>
                                          <Collapse in={isExpanded}>
                                  <Box ml={3}>
                                    <Paper sx={{ p: 2, mb: 2, bgcolor: 'success.50', border: '1px solid', borderColor: 'success.200' }}>
                                                <Typography variant="subtitle2" color="success.main" gutterBottom>🎉 Победившее предложение</Typography>
                                                {(request.contractsCount === 0) ? (
                                        <Box>
                                                    <Typography variant="body2" color="text.secondary" gutterBottom>Контракт еще не заключен</Typography>
                                                    <Button variant="contained" color="success" size="small" onClick={() => window.open(`/tenders/${tender.tenderId}/contract/new/${proposal.supplierId}`, '_blank')} sx={{ mt: 1 }}>Заключить контракт</Button>
                                        </Box>
                                      ) : (
                                        <Box>
                                                    <Typography variant="body2" color="text.secondary" gutterBottom>Контракт заключен</Typography>
                                        </Box>
                                      )}
                                    </Paper>
                                  </Box>
                                </Collapse>
                              </Box>
                                      );
                                    })}
                                  </Box>
                                </Collapse>
                              </>
                            );
                          })()
                        ) : (
                          // Для остальных статусов показываем все предложения
                          tender.proposals && tender.proposals.map((proposal) => (
                          <Box key={proposal.proposalId}>
                            <NestedStep 
                              color={getStepColor('proposal', 1)}
                              onClick={() => handleProposalClick(proposal.proposalId)}
                            >
                              <Box display="flex" alignItems="center" gap={1}>
                                <BusinessIcon />
                                <Box>
                                  <Typography variant="body2">
                                    {proposal.supplierName}
                                  </Typography>
                                  <Typography variant="caption">
                                        {proposal.supplierContact} • {formatPhone(proposal.supplierPhone)}
                                  </Typography>
                                </Box>
                              </Box>
                              <Box display="flex" alignItems="center" gap={1}>
                                <Typography variant="body2">
                                  {formatCurrency(proposal.totalPrice)}
                                </Typography>
                                <StatusChip
                                  label={getStatusLabel(proposal.status)}
                                  status={proposal.status}
                                  size="small"
                                />
                                <Button
                                  variant="outlined"
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleViewProposalDetail(proposal.proposalId);
                                  }}
                                  sx={{ 
                                    minWidth: 'auto', 
                                    px: 1, 
                                    py: 0.5,
                                    fontSize: '0.75rem',
                                    borderColor: 'primary.main',
                                    color: 'primary.main',
                                    '&:hover': {
                                      borderColor: 'primary.dark',
                                      bgcolor: 'primary.50'
                                    }
                                  }}
                                >
                                  Просмотр
                                </Button>
                                <IconButton size="small">
                                  {expandedProposals.includes(proposal.proposalId) ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                </IconButton>
                              </Box>
                            </NestedStep>

                            {/* Счета и УПД для предложения */}
                            <Collapse in={expandedProposals.includes(proposal.proposalId)}>
                              <Box ml={3}>
                                {/* Здесь будут счета и УПД для конкретного предложения */}
                                <Typography variant="body2" color="textSecondary" sx={{ p: 1 }}>
                                  Счета и УПД для {proposal.supplierName}
                                </Typography>
                              </Box>
                            </Collapse>
                          </Box>
                        ))
                        )}
                              </Box>
                            </Collapse>
                          </Box>
                        ))}
              </Box>
            )}

            {/* Контракты */}
            {expandedRequest && expandedTenders.length > 0 && request.contracts && request.contracts.length > 0 && (
              <Box mb={2}>
                <Typography variant="subtitle2" gutterBottom>
                  Контракты ({request.contracts.length})
                </Typography>
                {request.contracts.map((contract) => (
                  <Box key={contract.contractId}>
                    <NestedStep 
                      color={getStepColor('contract', 1)}
                      onClick={() => handleContractClick(contract.contractId)}
                    >
                      <Box display="flex" alignItems="center" gap={1}>
                        <DescriptionIcon />
                        <Box>
                          <Typography variant="body1">
                            Контракт {contract.contractNumber}
                          </Typography>
                          <Typography variant="body2">
                            {formatDate(contract.contractDate)} • {request.project} • {request.location || 'Склад не указан'} • {contract.supplierName}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            Срок действия: {formatDate(contract.startDate)} - {formatDate(contract.endDate)}
                          </Typography>
                        </Box>
                      </Box>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="body2">
                          {formatCurrency(contract.totalAmount)}
                        </Typography>
                        {(() => {
                          const relatedDeliveries = (request.deliveries || []).filter(d => d.contractId === contract.contractId);
                          let acceptedSum = 0;
                          if (relatedDeliveries.length > 0) {
                            acceptedSum = relatedDeliveries.reduce((sum, d) => {
                              if (d.deliveryItems && d.deliveryItems.length > 0) {
                                const itemsSum = d.deliveryItems.reduce((s, it) => s + (Number((it as any).acceptedQuantity || 0) * Number((it as any).unitPrice || 0)), 0);
                                return sum + itemsSum;
                              }
                              if (['RECEIVED', 'ACCEPTED', 'DELIVERED'].includes(d.status)) {
                                return sum + (Number((d as any).totalAmount) || 0);
                              }
                              return sum;
                            }, 0);
                          }
                          const pct = contract.totalAmount ? Math.min(100, Math.round((acceptedSum / contract.totalAmount) * 100)) : 0;
                          return (
                            <Box sx={{ minWidth: 140, mx: 1 }}>
                              <Typography variant="caption" color="text.secondary">Принято</Typography>
                              <Typography variant="caption" sx={{ display: 'block', fontWeight: 500 }}>
                                {formatCurrency(acceptedSum)} ({pct}%)
                              </Typography>
                              <LinearProgress variant="determinate" value={pct} sx={{ height: 6, borderRadius: 1, mt: 0.25 }} />
                            </Box>
                          );
                        })()}
                        <StatusChip
                          label={getStatusLabel(contract.status)}
                          status={contract.status}
                          size="small"
                        />
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewContractDetail(contract.contractId);
                          }}
                          sx={{ 
                            minWidth: 'auto', 
                            px: 1, 
                            py: 0.5,
                            fontSize: '0.75rem',
                            borderColor: 'primary.main',
                            color: 'primary.main',
                            '&:hover': {
                              borderColor: 'primary.dark',
                              bgcolor: 'primary.50'
                            }
                          }}
                        >
                          Просмотр
                        </Button>

                        <IconButton size="small">
                          {expandedContracts.includes(contract.contractId) ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        </IconButton>
                      </Box>
                    </NestedStep>

                    {/* Детали контракта */}
                    <Collapse in={expandedContracts.includes(contract.contractId)}>
                      <Box ml={3}>
                        {/* Информация о контракте */}
                        <Paper sx={{ p: 2, mb: 2, bgcolor: 'grey.50' }}>
                          <Typography variant="subtitle2" gutterBottom>
                            Детали контракта
                          </Typography>
                          <Grid container spacing={2}>
                            <Grid item xs={6}>
                              <Typography variant="caption" color="textSecondary">
                                Поставщик
                              </Typography>
                              <Typography variant="body2">
                                {contract.supplierName}
                              </Typography>
                              <Typography variant="caption" color="textSecondary">
                                Контакт: {contract.supplierContact} • {formatPhone(contract.supplierPhone)}
                              </Typography>
                            </Grid>
                            <Grid item xs={6}>
                              <Typography variant="caption" color="textSecondary">
                                Финансы
                              </Typography>
                              <Typography variant="body2">
                                Общая сумма: {formatCurrency(contract.totalAmount)}
                              </Typography>
                              <Typography variant="caption" color="textSecondary">
                                Статус: {getStatusLabel(contract.status)}
                              </Typography>
                              {/* Прогресс оплаты и поставки */}
                              <Box sx={{ mt: 1 }}>
                                {/* Оплата */}
                                {(() => {
                                  const relatedInvoices = (request.invoices || []).filter(inv => inv.contractId === contract.contractId);
                                  const totalPaid = relatedInvoices.reduce((s, inv) => s + (Number(inv.paidAmount) || 0), 0);
                                  const totalInvoiced = relatedInvoices.reduce((s, inv) => s + (Number(inv.totalAmount) || 0), 0);
                                  const paidPct = contract.totalAmount ? Math.min(100, Math.round((totalPaid / contract.totalAmount) * 100)) : 0;
                                  const invoicedPct = contract.totalAmount ? Math.min(100, Math.round((totalInvoiced / contract.totalAmount) * 100)) : 0;
                                  return (
                                    <Box sx={{ mb: 1 }}>
                                      <Typography variant="caption" color="textSecondary">
                                        Оплата: {formatCurrency(totalPaid)} из {formatCurrency(contract.totalAmount)} ({paidPct}%)
                                      </Typography>
                                      <LinearProgress variant="determinate" value={paidPct} sx={{ height: 8, borderRadius: 1, mb: 0.5 }} />
                                      <Typography variant="caption" color="textSecondary">
                                        Выставлено счетов: {formatCurrency(totalInvoiced)} ({invoicedPct}%)
                                      </Typography>
                                      <LinearProgress variant="determinate" value={invoicedPct} color="secondary" sx={{ height: 6, borderRadius: 1 }} />
                                    </Box>
                                  );
                                })()}
                                {/* Поставка */}
                                {(() => {
                                  const relatedDeliveries = (request.deliveries || []).filter(d => d.contractId === contract.contractId);
                                  // Процент рассчитываем от принятого объема (acceptedQuantity), либо 100% по статусу, либо по сумме как фолбэк
                                  const byQuantityPossible = (contract.contractItems && contract.contractItems.length > 0);
                                  let deliveredPct = 0;
                                  if (byQuantityPossible) {
                                    const totalQty = contract.contractItems.reduce((s, it) => s + (Number(it.quantity) || 0), 0);
                                    const acceptedQty = relatedDeliveries.reduce((sum, del) => sum + (del.deliveryItems || []).reduce((s, di) => s + (Number((di as any).acceptedQuantity || 0)), 0), 0);
                                    deliveredPct = totalQty ? Math.min(100, Math.round((acceptedQty / totalQty) * 100)) : 0;
                                  } else {
                                    const acceptedSum = relatedDeliveries.reduce((s, d) => {
                                      if (d.deliveryItems && d.deliveryItems.length > 0) {
                                        const itemsSum = d.deliveryItems.reduce((si: number, it: any) => si + (Number(it.acceptedQuantity || 0) * Number(it.unitPrice || 0)), 0);
                                        return s + itemsSum;
                                      }
                                      if (['RECEIVED','ACCEPTED','DELIVERED'].includes(d.status)) {
                                        return s + (Number((d as any).totalAmount) || 0);
                                      }
                                      return s;
                                    }, 0);
                                    deliveredPct = contract.totalAmount ? Math.min(100, Math.round((acceptedSum / contract.totalAmount) * 100)) : 0;
                                  }
                                  return (
                                    <Box>
                                      <Typography variant="caption" color="textSecondary">
                                        Поставка: {deliveredPct}%
                                      </Typography>
                                      <LinearProgress variant="determinate" value={deliveredPct} color="success" sx={{ height: 8, borderRadius: 1 }} />
                                    </Box>
                                  );
                                })()}
                              </Box>
                            </Grid>
                            <Grid item xs={12}>
                              <Typography variant="caption" color="textSecondary">
                                Описание
                              </Typography>
                              <Typography variant="body2">
                                {contract.description || 'Описание отсутствует'}
                              </Typography>
                            </Grid>
                            
                            {/* Материалы контракта */}
                            {contract.contractItems && contract.contractItems.length > 0 && (
                              <Grid item xs={12}>
                                <Typography variant="caption" color="textSecondary" display="block" gutterBottom>
                                  Материалы контракта ({contract.contractItems.length})
                                </Typography>
                                <Box sx={{ maxHeight: 200, overflow: 'auto', border: '1px solid', borderColor: 'grey.300', borderRadius: 1, p: 1 }}>
                                  <Table size="small">
                                    <TableHead>
                                      <TableRow>
                                        <TableCell size="small" sx={{ p: 0.5, fontSize: '0.75rem' }}>№</TableCell>
                                        <TableCell size="small" sx={{ p: 0.5, fontSize: '0.75rem' }}>Материал</TableCell>
                                        <TableCell size="small" sx={{ p: 0.5, fontSize: '0.75rem' }}>Кол-во</TableCell>
                                        <TableCell size="small" sx={{ p: 0.5, fontSize: '0.75rem' }}>Ед.</TableCell>
                                        <TableCell size="small" sx={{ p: 0.5, fontSize: '0.75rem' }}>Цена</TableCell>
                                        <TableCell size="small" sx={{ p: 0.5, fontSize: '0.75rem' }}>Сумма</TableCell>
                                      </TableRow>
                                    </TableHead>
                                    <TableBody>
                                      {contract.contractItems.map((item, index) => (
                                        <TableRow key={item.id || index}>
                                          <TableCell size="small" sx={{ p: 0.5, fontSize: '0.75rem' }}>{index + 1}</TableCell>
                                          <TableCell size="small" sx={{ p: 0.5, fontSize: '0.75rem' }}>{item.materialName}</TableCell>
                                          <TableCell size="small" sx={{ p: 0.5, fontSize: '0.75rem' }}>{item.quantity}</TableCell>
                                          <TableCell size="small" sx={{ p: 0.5, fontSize: '0.75rem' }}>{item.unitName}</TableCell>
                                          <TableCell size="small" sx={{ p: 0.5, fontSize: '0.75rem' }}>{formatCurrency(item.unitPrice)}</TableCell>
                                          <TableCell size="small" sx={{ p: 0.5, fontSize: '0.75rem' }}>{formatCurrency(item.totalPrice)}</TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </Box>
                              </Grid>
                            )}
                            
                            {/* Счета по контракту */}
                            {(() => {
                              const contractInvoices = (request.invoices || []).filter(inv => inv.contractId === contract.contractId);
                              if (contractInvoices.length === 0) return null;
                              return (
                                <Grid item xs={12}>
                                  <Typography variant="subtitle2" sx={{ mt: 3, mb: 1 }}>
                                    Счета по контракту
                                  </Typography>
                                  <TableContainer component={Paper} variant="outlined">
                                    <Table size="small">
                                      <TableHead>
                                        <TableRow>
                                          <TableCell>Номер</TableCell>
                                          <TableCell>Дата</TableCell>
                                          <TableCell>Поставщик</TableCell>
                                          <TableCell align="right">Сумма</TableCell>
                                          <TableCell>Статус</TableCell>
                                          <TableCell align="right">Действия</TableCell>
                                        </TableRow>
                                      </TableHead>
                                      <TableBody>
                                        {contractInvoices.map((invoice) => (
                                          <React.Fragment key={invoice.invoiceId}>
                                            <TableRow hover onClick={() => {
                                              setExpandedInvoices(prev => prev.includes(invoice.invoiceId) ? prev.filter(id => id !== invoice.invoiceId) : [...prev, invoice.invoiceId]);
                                            }}>
                                              <TableCell>{invoice.invoiceNumber}</TableCell>
                                              <TableCell>{formatDate(invoice.invoiceDate)}</TableCell>
                                              <TableCell>{invoice.supplierName}</TableCell>
                                              <TableCell align="right">{formatCurrency(invoice.totalAmount)}</TableCell>
                                              <TableCell>
                                                <StatusChip label={getStatusLabel(invoice.status)} status={invoice.status} size="small" />
                                              </TableCell>
                                              <TableCell align="right">
                                                <Button size="small" variant="outlined" sx={{ mr: 1 }} onClick={(e) => { e.stopPropagation(); handleViewInvoiceDetail(invoice.invoiceId); }}>Просмотр</Button>
                                              </TableCell>
                                            </TableRow>
                                            {expandedInvoices.includes(invoice.invoiceId) && (
                                              <TableRow>
                                                <TableCell colSpan={6} sx={{ p: 0 }}>
                                                  <Box sx={{ p: 2, bgcolor: 'grey.50' }}>
                                                    <Grid container spacing={2}>
                                                      <Grid item xs={6}>
                                                        <Typography variant="caption" color="textSecondary">Поставщик</Typography>
                                                        <Typography variant="body2">{invoice.supplierName}</Typography>
                                                        <Typography variant="caption" color="textSecondary">Контакт: {invoice.supplierContact} • {formatPhone(invoice.supplierPhone)}</Typography>
                                                      </Grid>
                                                      <Grid item xs={6}>
                                                        <Typography variant="caption" color="textSecondary">Финансы</Typography>
                                                        <Typography variant="body2">Общая сумма: {formatCurrency(invoice.totalAmount)}</Typography>
                                                        <Typography variant="body2">Оплачено: {formatCurrency(invoice.paidAmount)}</Typography>
                                                        <Typography variant="body2">Остаток: {formatCurrency(invoice.remainingAmount)}</Typography>
                                                        <Typography variant="caption" color="textSecondary">Статус: {getStatusLabel(invoice.status)}</Typography>
                                                      </Grid>
                                                      <Grid item xs={12}>
                                                        <Typography variant="caption" color="textSecondary">Срок оплаты</Typography>
                                                        <Typography variant="body2">{formatDate(invoice.dueDate)}</Typography>
                                                      </Grid>
                                                      {invoice.paymentTerms && (
                                                        <Grid item xs={12}>
                                                          <Typography variant="caption" color="textSecondary">Условия оплаты</Typography>
                                                          <Typography variant="body2">{invoice.paymentTerms}</Typography>
                                                        </Grid>
                                                      )}
                                                      {invoice.notes && (
                                                        <Grid item xs={12}>
                                                          <Typography variant="caption" color="textSecondary">Примечания</Typography>
                                                          <Typography variant="body2">{invoice.notes}</Typography>
                                                        </Grid>
                                                      )}
                                                      {(invoice.invoiceItems || []).length > 0 && (
                                                        <Grid item xs={12}>
                                                          <Typography variant="caption" color="textSecondary" display="block" gutterBottom>
                                                            Материалы счета ({invoice.invoiceItems?.length || 0})
                                                          </Typography>
                                                          <Box sx={{ maxHeight: 200, overflow: 'auto', border: '1px solid', borderColor: 'grey.300', borderRadius: 1, p: 1 }}>
                                                            <Table size="small">
                                                              <TableHead>
                                                                <TableRow>
                                                                  <TableCell size="small" sx={{ p: 0.5, fontSize: '0.75rem' }}>№</TableCell>
                                                                  <TableCell size="small" sx={{ p: 0.5, fontSize: '0.75rem' }}>Материал</TableCell>
                                                                  <TableCell size="small" sx={{ p: 0.5, fontSize: '0.75rem' }}>Кол-во</TableCell>
                                                                  <TableCell size="small" sx={{ p: 0.5, fontSize: '0.75rem' }}>Ед.</TableCell>
                                                                  <TableCell size="small" sx={{ p: 0.5, fontSize: '0.75rem' }}>Цена</TableCell>
                                                                  <TableCell size="small" sx={{ p: 0.5, fontSize: '0.75rem' }}>Сумма</TableCell>
                                                                </TableRow>
                                                              </TableHead>
                                                              <TableBody>
                                                                {(invoice.invoiceItems || []).map((item, index) => (
                                                                  <TableRow key={item.id || index}>
                                                                    <TableCell size="small" sx={{ p: 0.5, fontSize: '0.75rem' }}>{index + 1}</TableCell>
                                                                    <TableCell size="small" sx={{ p: 0.5, fontSize: '0.75rem' }}>{item.materialName}</TableCell>
                                                                    <TableCell size="small" sx={{ p: 0.5, fontSize: '0.75rem' }}>{item.quantity}</TableCell>
                                                                    <TableCell size="small" sx={{ p: 0.5, fontSize: '0.75rem' }}>{item.unitName}</TableCell>
                                                                    <TableCell size="small" sx={{ p: 0.5, fontSize: '0.75rem' }}>{formatCurrency(item.unitPrice)}</TableCell>
                                                                    <TableCell size="small" sx={{ p: 0.5, fontSize: '0.75rem' }}>{formatCurrency(item.totalPrice)}</TableCell>
                                                                  </TableRow>
                                                                ))}
                                                              </TableBody>
                                                            </Table>
                                                          </Box>
                                                        </Grid>
                                                      )}
                                                      <Grid item xs={12}>
                                                        <Box display="flex" justifyContent="flex-end" mt={2}>
                                                          <Button
                                                            variant="contained"
                                                            startIcon={<DeliveryIcon />}
                                                            onClick={() => {
                                                              const params = new URLSearchParams({
                                                                invoiceId: invoice.invoiceId,
                                                                supplierName: encodeURIComponent(invoice.supplierName),
                                                                totalAmount: invoice.totalAmount.toString(),
                                                                supplierContact: encodeURIComponent(invoice.supplierContact || ''),
                                                                supplierPhone: encodeURIComponent(invoice.supplierPhone || ''),
                                                                source: 'matryoshka',
                                                                requestId: request.requestId,
                                                                requestNumber: encodeURIComponent(request.requestNumber)
                                                              });
                                                              if (invoice.contractId) {
                                                                params.append('contractId', invoice.contractId);
                                                              }
                                                              window.open(`/deliveries/new?${params.toString()}`, '_blank');
                                                            }}
                                                            sx={{ bgcolor: 'info.main', color: 'white', '&:hover': { bgcolor: 'info.dark' } }}
                                                          >
                                                            Создать поставку
                                                          </Button>
                                                        </Box>
                                                      </Grid>
                                                    </Grid>
                                                  </Box>
                                                </TableCell>
                                              </TableRow>
                                            )}
                                          </React.Fragment>
                                        ))}
                                      </TableBody>
                                    </Table>
                                  </TableContainer>
                                </Grid>
                              );
                            })()}

                            {/* Поставки по контракту */}
                            {(() => {
                              const contractDeliveries = (request.deliveries || []).filter(d => d.contractId === contract.contractId);
                              if (contractDeliveries.length === 0) return null;
                              return (
                                <Grid item xs={12}>
                                  <Typography variant="subtitle2" sx={{ mt: 3, mb: 1 }}>
                                    Поставки по контракту
                                  </Typography>
                                  <TableContainer component={Paper} variant="outlined">
                                    <Table size="small">
                                      <TableHead>
                                        <TableRow>
                                          <TableCell>Номер</TableCell>
                                          <TableCell>Дата</TableCell>
                                          <TableCell>Поставщик</TableCell>
                                          <TableCell align="right">Сумма</TableCell>
                                          <TableCell align="right">Принято</TableCell>
                                          <TableCell>Статус</TableCell>
                                          <TableCell align="right">Действия</TableCell>
                                        </TableRow>
                                      </TableHead>
                                      <TableBody>
                                        {contractDeliveries.map((delivery) => (
                                          <React.Fragment key={delivery.deliveryId}>
                                            <TableRow hover onClick={() => {
                                              setExpandedDeliveries(prev => prev.includes(delivery.deliveryId) ? prev.filter(id => id !== delivery.deliveryId) : [...prev, delivery.deliveryId]);
                                            }}>
                                              <TableCell>{delivery.deliveryNumber}</TableCell>
                                              <TableCell>{formatDate((delivery as any).deliveryDate || (delivery as any).plannedDate || (delivery as any).actualDate || '')}</TableCell>
                                              <TableCell>{delivery.supplierName}</TableCell>
                                              <TableCell align="right">{formatCurrency(delivery.totalAmount)}</TableCell>
                                              <TableCell align="right">
                                                {(() => {
                                                  let acceptedPct = 0;
                                                  if (delivery.deliveryItems && delivery.deliveryItems.length > 0) {
                                                    const totalOrdered = delivery.deliveryItems.reduce((s: number, it: any) => s + (Number(it.orderedQuantity || 0)), 0);
                                                    const totalAccepted = delivery.deliveryItems.reduce((s: number, it: any) => s + (Number(it.acceptedQuantity || 0)), 0);
                                                    acceptedPct = totalOrdered ? Math.round((totalAccepted / totalOrdered) * 100) : 0;
                                                  } else if (['RECEIVED','ACCEPTED','DELIVERED'].includes(delivery.status)) {
                                                    acceptedPct = 100;
                                                  }
                                                  return `${acceptedPct}%`;
                                                })()}
                                              </TableCell>
                                              <TableCell>
                                                <StatusChip label={getStatusLabel(delivery.status)} status={delivery.status} size="small" />
                                              </TableCell>
                                              <TableCell align="right">
                                                <Button size="small" variant="outlined" sx={{ mr: 1 }} onClick={(e) => { e.stopPropagation(); handleViewDeliveryDetail(delivery.deliveryId); }}>Просмотр</Button>
                                              </TableCell>
                                            </TableRow>
                                            {expandedDeliveries.includes(delivery.deliveryId) && (
                                              <TableRow>
                                                <TableCell colSpan={6} sx={{ p: 0 }}>
                                                  <Box sx={{ p: 2, bgcolor: 'grey.50' }}>
                                                    <Grid container spacing={2}>
                                                      <Grid item xs={6}>
                                                        <Typography variant="caption" color="textSecondary">Поставщик</Typography>
                                                        <Typography variant="body2">{delivery.supplierName}</Typography>
                                                        <Typography variant="caption" color="textSecondary">Контракт: {delivery.contractNumber}</Typography>
                                                      </Grid>
                                                      <Grid item xs={6}>
                                                        <Typography variant="caption" color="textSecondary">Финансы</Typography>
                                                        <Typography variant="body2">Общая сумма: {formatCurrency(delivery.totalAmount)}</Typography>
                                                        <Typography variant="caption" color="textSecondary">Статус: {getStatusLabel(delivery.status)}</Typography>
                                                      </Grid>
                                                      <Grid item xs={6}>
                                                        <Typography variant="caption" color="textSecondary">Даты</Typography>
                                                        <Typography variant="body2">Дата: {formatDate(delivery.deliveryDate)}</Typography>
                                                      </Grid>
                                                      {delivery.warehouseName && (
                                                        <Grid item xs={6}>
                                                          <Typography variant="caption" color="textSecondary">Склад</Typography>
                                                          <Typography variant="body2">{delivery.warehouseName}</Typography>
                                                          {delivery.trackingNumber && (
                                                            <Typography variant="caption" color="textSecondary">Трек номер: {delivery.trackingNumber}</Typography>
                                                          )}
                                                        </Grid>
                                                      )}
                                                      {delivery.notes && (
                                                        <Grid item xs={12}>
                                                          <Typography variant="caption" color="textSecondary">Примечания</Typography>
                                                          <Typography variant="body2">{delivery.notes}</Typography>
                                                        </Grid>
                                                      )}
                                                      {(delivery.deliveryItems || []).length > 0 && (
                                                        <Grid item xs={12}>
                                                          <Typography variant="caption" color="textSecondary" display="block" gutterBottom>
                                                            Материалы поставки ({delivery.deliveryItems?.length || 0})
                                                          </Typography>
                                                          <Box sx={{ maxHeight: 200, overflow: 'auto', border: '1px solid', borderColor: 'grey.300', borderRadius: 1, p: 1 }}>
                                                            <Table size="small">
                                                              <TableHead>
                                                                <TableRow>
                                                                  <TableCell size="small" sx={{ p: 0.5, fontSize: '0.75rem' }}>№</TableCell>
                                                                  <TableCell size="small" sx={{ p: 0.5, fontSize: '0.75rem' }}>Материал</TableCell>
                                                                  <TableCell size="small" sx={{ p: 0.5, fontSize: '0.75rem' }}>Заказано</TableCell>
                                                                  <TableCell size="small" sx={{ p: 0.5, fontSize: '0.75rem' }}>Доставлено</TableCell>
                                                                  <TableCell size="small" sx={{ p: 0.5, fontSize: '0.75rem' }}>Принято</TableCell>
                                                                  <TableCell size="small" sx={{ p: 0.5, fontSize: '0.75rem' }}>Ед.</TableCell>
                                                                  <TableCell size="small" sx={{ p: 0.5, fontSize: '0.75rem' }}>Цена</TableCell>
                                                                  <TableCell size="small" sx={{ p: 0.5, fontSize: '0.75rem' }}>Сумма</TableCell>
                                                                </TableRow>
                                                              </TableHead>
                                                              <TableBody>
                                                                {(delivery.deliveryItems || []).map((item, index) => (
                                                                  <TableRow key={item.id || index}>
                                                                    <TableCell size="small" sx={{ p: 0.5, fontSize: '0.75rem' }}>{index + 1}</TableCell>
                                                                    <TableCell size="small" sx={{ p: 0.5, fontSize: '0.75rem' }}>{item.materialName}</TableCell>
                                                                    <TableCell size="small" sx={{ p: 0.5, fontSize: '0.75rem' }}>{item.orderedQuantity}</TableCell>
                                                                    <TableCell size="small" sx={{ p: 0.5, fontSize: '0.75rem' }}>{item.deliveredQuantity || 0}</TableCell>
                                                                    <TableCell size="small" sx={{ p: 0.5, fontSize: '0.75rem' }}>{item.acceptedQuantity || 0}</TableCell>
                                                                    <TableCell size="small" sx={{ p: 0.5, fontSize: '0.75rem' }}>{item.unitName}</TableCell>
                                                                    <TableCell size="small" sx={{ p: 0.5, fontSize: '0.75rem' }}>{formatCurrency(item.unitPrice)}</TableCell>
                                                                    <TableCell size="small" sx={{ p: 0.5, fontSize: '0.75rem' }}>{formatCurrency(item.totalPrice)}</TableCell>
                                                                  </TableRow>
                                                                ))}
                                                              </TableBody>
                                                            </Table>
                                                          </Box>
                                                        </Grid>
                                                      )}
                                                      <Grid item xs={12}>
                                                        <Box display="flex" justifyContent="flex-end" mt={2}>
                                                          <Button
                                                            variant="contained"
                                                            startIcon={<CheckCircleIcon />}
                                                            onClick={() => window.open(`/deliveries/${delivery.deliveryId}`, '_blank')}
                                                            sx={{ bgcolor: 'success.main', color: 'white', '&:hover': { bgcolor: 'success.dark' } }}
                                                          >
                                                            Управление статусом
                                                          </Button>
                                                        </Box>
                                                      </Grid>
                                                    </Grid>
                                                  </Box>
                                                </TableCell>
                                              </TableRow>
                                            )}
                                          </React.Fragment>
                                         ))}
                                      </TableBody>
                                    </Table>
                                  </TableContainer>
                                </Grid>
                              );
                            })()}
                            
                            <Grid item xs={12}>
                              <Box display="flex" justifyContent="flex-end" mt={2}>
                                <Button
                                  variant="contained"
                                  startIcon={<ReceiptIcon />}
                                  onClick={() => {
                                    // Создание счета из контракта с подстановкой данных
                                    const params = new URLSearchParams({
                                      contractId: contract.contractId,
                                      supplierId: (contract as any).supplierId || contract.tender?.awardedSupplierId || '',
                                      supplierName: encodeURIComponent(contract.supplierName),
                                      totalAmount: contract.totalAmount.toString(),
                                      supplierContact: encodeURIComponent(contract.supplierContact || ''),
                                      supplierPhone: encodeURIComponent(contract.supplierPhone || ''),
                                      source: 'matryoshka',
                                      requestId: request.requestId,
                                      requestNumber: encodeURIComponent(request.requestNumber)
                                    });
                                    window.open(`/invoices/new?${params.toString()}`, '_blank');
                                  }}
                                  sx={{
                                    bgcolor: 'success.main',
                                    color: 'white',
                                    '&:hover': {
                                      bgcolor: 'success.dark'
                                    }
                                  }}
                                >
                                  Создать счет
                                </Button>
                                <Button
                                  variant="outlined"
                                  startIcon={<DeliveryIcon />}
                                  onClick={() => {
                                    // Создание поставки из контракта с подстановкой данных
                                    const params = new URLSearchParams({
                                      contractId: contract.contractId,
                                      supplierId: (contract as any).supplierId || contract.tender?.awardedSupplierId || '',
                                      supplierName: encodeURIComponent(contract.supplierName),
                                      totalAmount: contract.totalAmount.toString(),
                                      supplierContact: encodeURIComponent(contract.supplierContact || ''),
                                      supplierPhone: encodeURIComponent(contract.supplierPhone || ''),
                                      source: 'matryoshka',
                                      requestId: request.requestId,
                                      requestNumber: encodeURIComponent(request.requestNumber)
                                    });
                                    window.open(`/deliveries/new?${params.toString()}`, '_blank');
                                  }}
                                  sx={{ ml: 1 }}
                                >
                                  Создать поставку
                                </Button>
                              </Box>
                            </Grid>

                          </Grid>
                        </Paper>


                      </Box>
                    </Collapse>
                  </Box>
                ))}
              </Box>
            )}

            {/* Счета */}
            {false && request.invoices && request.invoices.length > 0 && (
              <Box mb={2}>
                <Typography variant="subtitle2" gutterBottom>
                  Счета ({request.invoices.length})
                </Typography>
                {request.invoices.map((invoice) => (
                  <Box key={invoice.invoiceId}>
                    <NestedStep 
                      color={getStepColor('invoice', 1)}
                      onClick={() => handleInvoiceClick(invoice.invoiceId)}
                    >
                      <Box display="flex" alignItems="center" gap={1}>
                        <ReceiptIcon />
                        <Box>
                          <Typography variant="body1">
                            Счет {invoice.invoiceNumber}
                          </Typography>
                          <Typography variant="body2">
                            {formatDate(invoice.invoiceDate)} • {request.project} • {request.location || 'Склад не указан'} • {invoice.supplierName}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            Срок оплаты: {formatDate(invoice.dueDate)}
                          </Typography>
                        </Box>
                      </Box>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="body2">
                          {formatCurrency(invoice.totalAmount)}
                        </Typography>
                        <StatusChip
                          label={getStatusLabel(invoice.status)}
                          status={invoice.status}
                          size="small"
                        />
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewInvoiceDetail(invoice.invoiceId);
                          }}
                          sx={{ 
                            minWidth: 'auto', 
                            px: 1, 
                            py: 0.5,
                            fontSize: '0.75rem',
                            borderColor: 'primary.main',
                            color: 'primary.main',
                            '&:hover': {
                              borderColor: 'primary.dark',
                              bgcolor: 'primary.50'
                            }
                          }}
                        >
                          Просмотр
                        </Button>

                        <IconButton size="small">
                          {expandedInvoices.includes(invoice.invoiceId) ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        </IconButton>
                      </Box>
                    </NestedStep>

                    {/* Детали счета */}
                    <Collapse in={expandedInvoices.includes(invoice.invoiceId)}>
                      <Box ml={3}>
                        {/* Информация о счете */}
                        <Paper sx={{ p: 2, mb: 2, bgcolor: 'grey.50' }}>
                          <Typography variant="subtitle2" gutterBottom>
                            Детали счета
                          </Typography>
                          <Grid container spacing={2}>
                            <Grid item xs={6}>
                              <Typography variant="caption" color="textSecondary">
                                Поставщик
                              </Typography>
                              <Typography variant="body2">
                                {invoice.supplierName}
                              </Typography>
                              <Typography variant="caption" color="textSecondary">
                                Контакт: {invoice.supplierContact} • {formatPhone(invoice.supplierPhone)}
                              </Typography>
                            </Grid>
                            <Grid item xs={6}>
                              <Typography variant="caption" color="textSecondary">
                                Финансы
                              </Typography>
                              <Typography variant="body2">
                                Общая сумма: {formatCurrency(invoice.totalAmount)}
                              </Typography>
                              <Typography variant="body2">
                                Оплачено: {formatCurrency(invoice.paidAmount)}
                              </Typography>
                              <Typography variant="body2">
                                Остаток: {formatCurrency(invoice.remainingAmount)}
                              </Typography>
                              <Typography variant="caption" color="textSecondary">
                                Статус: {getStatusLabel(invoice.status)}
                              </Typography>
                            </Grid>
                            <Grid item xs={12}>
                              <Typography variant="caption" color="textSecondary">
                                Срок оплаты
                              </Typography>
                              <Typography variant="body2">
                                {formatDate(invoice.dueDate)}
                              </Typography>
                            </Grid>
                            {invoice.paymentTerms && (
                              <Grid item xs={12}>
                                <Typography variant="caption" color="textSecondary">
                                  Условия оплаты
                                </Typography>
                                <Typography variant="body2">
                                  {invoice.paymentTerms}
                                </Typography>
                              </Grid>
                            )}
                            {invoice.notes && (
                              <Grid item xs={12}>
                                <Typography variant="caption" color="textSecondary">
                                  Примечания
                                </Typography>
                                <Typography variant="body2">
                                  {invoice.notes}
                                </Typography>
                              </Grid>
                            )}
                            
                            {/* Материалы счета */}
                            {(() => {
                              console.log('Проверка материалов счета:', {
                                invoiceNumber: invoice.invoiceNumber,
                                hasInvoiceItems: !!invoice.invoiceItems,
                                invoiceItemsLength: (invoice.invoiceItems || []).length,
                                invoiceItems: invoice.invoiceItems,
                                shouldShow: invoice.invoiceItems && invoice.invoiceItems.length > 0
                              });
                              
                              if (invoice.invoiceItems) {
                                invoice.invoiceItems.forEach((item, index) => {
                                  console.log(`Проверка элемента ${index + 1}:`, {
                                    materialName: item.materialName,
                                    quantity: item.quantity,
                                    unitName: item.unitName,
                                    unitPrice: item.unitPrice
                                  });
                                });
                              }
                              return (invoice.invoiceItems || []).length > 0;
                            })() && (
                              <Grid item xs={12}>
                                <Typography variant="caption" color="textSecondary" display="block" gutterBottom>
                                  Материалы счета ({invoice.invoiceItems.length})
                                </Typography>
                                <Box sx={{ maxHeight: 200, overflow: 'auto', border: '1px solid', borderColor: 'grey.300', borderRadius: 1, p: 1 }}>
                                  <Table size="small">
                                    <TableHead>
                                      <TableRow>
                                        <TableCell size="small" sx={{ p: 0.5, fontSize: '0.75rem' }}>№</TableCell>
                                        <TableCell size="small" sx={{ p: 0.5, fontSize: '0.75rem' }}>Материал</TableCell>
                                        <TableCell size="small" sx={{ p: 0.5, fontSize: '0.75rem' }}>Кол-во</TableCell>
                                        <TableCell size="small" sx={{ p: 0.5, fontSize: '0.75rem' }}>Ед.</TableCell>
                                        <TableCell size="small" sx={{ p: 0.5, fontSize: '0.75rem' }}>Цена</TableCell>
                                        <TableCell size="small" sx={{ p: 0.5, fontSize: '0.75rem' }}>Сумма</TableCell>
                                      </TableRow>
                                    </TableHead>
                                    <TableBody>
                                      {(invoice.invoiceItems || []).map((item, index) => (
                                          <TableRow key={item.id || index}>
                                            <TableCell size="small" sx={{ p: 0.5, fontSize: '0.75rem' }}>{index + 1}</TableCell>
                                            <TableCell size="small" sx={{ p: 0.5, fontSize: '0.75rem' }}>{item.materialName}</TableCell>
                                            <TableCell size="small" sx={{ p: 0.5, fontSize: '0.75rem' }}>{item.quantity}</TableCell>
                                            <TableCell size="small" sx={{ p: 0.5, fontSize: '0.75rem' }}>{item.unitName}</TableCell>
                                            <TableCell size="small" sx={{ p: 0.5, fontSize: '0.75rem' }}>{formatCurrency(item.unitPrice)}</TableCell>
                                            <TableCell size="small" sx={{ p: 0.5, fontSize: '0.75rem' }}>{formatCurrency(item.totalPrice)}</TableCell>
                                          </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </Box>
                              </Grid>
                            )}
                            
                            <Grid item xs={12}>
                              <Box display="flex" justifyContent="flex-end" mt={2}>
                                <Button
                                  variant="contained"
                                  startIcon={<DeliveryIcon />}
                                  onClick={() => {
                                    // Создание поставки из счета
                                    const params = new URLSearchParams({
                                      invoiceId: invoice.invoiceId,
                                      supplierId: (invoice as any).supplierId || '',
                                      supplierName: encodeURIComponent(invoice.supplierName),
                                      totalAmount: invoice.totalAmount.toString(),
                                      supplierContact: encodeURIComponent(invoice.supplierContact || ''),
                                      supplierPhone: encodeURIComponent(invoice.supplierPhone || ''),
                                      source: 'matryoshka',
                                      requestId: request.requestId,
                                      requestNumber: encodeURIComponent(request.requestNumber)
                                    });
                                    
                                    // Добавляем contractId, если он доступен
                                    if (invoice.contractId) {
                                      params.append('contractId', invoice.contractId);
                                    }
                                    
                                    window.open(`/deliveries/new?${params.toString()}`, '_blank');
                                  }}
                                  sx={{
                                    bgcolor: 'info.main',
                                    color: 'white',
                                    '&:hover': {
                                      bgcolor: 'info.dark'
                                    }
                                  }}
                                >
                                  Создать поставку
                                </Button>
                              </Box>
                            </Grid>

                          </Grid>
                        </Paper>


                      </Box>
                    </Collapse>
                  </Box>
                ))}
              </Box>
            )}

            {/* Поставки */}
            {false && request.deliveries && request.deliveries.length > 0 && (
              <Box mb={2}>
                <Typography variant="subtitle2" gutterBottom>
                  Поставки ({request.deliveries.length})
                          </Typography>
                        </Box>
            )}


      </CardContent>
      
      {/* Диалог подтверждения создания тендера */}
      <Dialog open={confirmCreateTender} onClose={() => setConfirmCreateTender(false)}>
        <DialogTitle>
          Создать тендер?
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Вы уверены, что хотите создать тендер по заявке №{request.requestNumber}? 
            После создания статус заявки изменится на "Тендер".
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmCreateTender(false)} disabled={createTenderLoading}>
            Отмена
          </Button>
          <Button 
            onClick={handleConfirmCreateTender} 
            color="primary" 
            variant="contained"
            disabled={createTenderLoading}
            startIcon={createTenderLoading ? <CircularProgress size={16} /> : null}
          >
            {createTenderLoading ? 'Создание...' : 'Создать'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог подтверждения управления статусом тендера */}
      <Dialog
        open={statusDialog.open}
        onClose={() => setStatusDialog(prev => ({ ...prev, open: false }))}
        aria-labelledby="status-dialog-title"
        aria-describedby="status-dialog-description"
      >
        <DialogTitle id="status-dialog-title">
          {statusDialog.title}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="status-dialog-description">
            {statusDialog.description}
          </DialogContentText>
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusDialog(prev => ({ ...prev, open: false }))} color="primary">
            Отмена
          </Button>
          <Button
            onClick={statusDialog.onConfirm}
            color="primary"
            variant="contained"
            autoFocus
          >
            Подтвердить
          </Button>
        </DialogActions>
      </Dialog>


    </StyledCard>
  );
} 

export default RequestProcessMatryoshka;