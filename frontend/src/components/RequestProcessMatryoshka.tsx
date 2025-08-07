import React, { useState } from 'react';
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
  Button
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
  FileDownload as FileDownloadIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { RequestProcess, TenderProcess, DeliveryProcess, SupplierProposal } from '../types/requestProcess';

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


  // Логируем данные заявки для отладки
  console.log('=== ДАННЫЕ ЗАЯВКИ НА ФРОНТЕНДЕ ===');
  console.log('Заявка №:', request.requestNumber);
  console.log('Проект:', request.project);
  console.log('Склад (location):', request.location);
  console.log('Полная заявка:', request);
  console.log('===================================');

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

  const formatPhone = (phone: string) => {
    if (!phone) return '';
    
    // Убираем все нецифровые символы
    const digitsOnly = phone.replace(/\D/g, '');
    
    // Если 10 цифр, добавляем префикс +7
    if (digitsOnly.length === 10) {
      return `+7${digitsOnly}`;
    }
    
    // Если 11 цифр и начинается с 8, заменяем на +7
    if (digitsOnly.length === 11 && digitsOnly.startsWith('8')) {
      return `+7${digitsOnly.substring(1)}`;
    }
    
    // Если уже начинается с +7, возвращаем как есть
    if (phone.startsWith('+7')) {
      return phone;
    }
    
    // В остальных случаях возвращаем исходный номер
    return phone;
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return 'Черновик';
      case 'PUBLISHED':
        return 'Опубликован';
      case 'BIDDING':
        return 'Прием предложений';
      case 'EVALUATION':
        return 'Оценка';
      case 'AWARDED':
        return 'Присужден';
      case 'CANCELLED':
        return 'Отменен';
      case 'SUBMITTED':
        return 'Подана';
      case 'APPROVED':
        return 'Одобрена';
      case 'IN_PROGRESS':
        return 'В работе';
      case 'COMPLETED':
        return 'Завершена';
      case 'UNDER_REVIEW':
        return 'На рассмотрении';
      case 'ACCEPTED':
        return 'Принято';
      case 'REJECTED':
        return 'Отклонено';
      case 'WITHDRAWN':
        return 'Отозвано';
      // Статусы поставок
      case 'PLANNED':
        return 'Запланирована';
      case 'CONFIRMED':
        return 'Подтверждена';
      case 'IN_TRANSIT':
        return 'В пути';
      case 'ARRIVED':
        return 'Прибыла';
      case 'DELIVERED':
        return 'Доставлена';
      case 'PARTIALLY_ACCEPTED':
        return 'Частично принята';
      // Статусы приемки
      case 'PENDING':
        return 'Ожидает приемки';
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

  const handleViewTenderDetail = (tenderId: string) => {
    window.open(`/tenders/${tenderId}`, '_blank');
  };

  const handleViewDeliveryDetail = (deliveryId: string) => {
    window.open(`/deliveries/${deliveryId}`, '_blank');
  };

  const handleViewRequestDetail = (requestId: string) => {
    window.open(`/requests/${requestId}`, '_blank');
  };

  const handleDownloadExcelReport = async (requestId: string) => {
    try {
      const response = await fetch(`/api/reports/tender/${requestId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Ошибка при загрузке отчета');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Тендерная_таблица_заявка_${request.requestNumber}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Ошибка при скачивании отчета:', error);
      alert('Ошибка при скачивании отчета');
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
                                    <StatusChip
                          label={getStatusLabel(request.status)}
                          status={request.status}
                          size="small"
                        />
            <Button
              variant="outlined"
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleViewRequestDetail(request.requestId);
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
            <Button
              variant="outlined"
              size="small"
              startIcon={<FileDownloadIcon />}
              onClick={(e) => {
                e.stopPropagation();
                handleDownloadExcelReport(request.requestId);
              }}
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
            <IconButton size="small">
              {expandedRequest ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Box>
        </ProcessStep>

        {/* Детали заявки */}
        <Collapse in={expandedRequest}>
          <Box ml={3} mb={2}>
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
            {request.tenders && request.tenders.length > 0 && (
              <Box mb={2}>
                <Typography variant="subtitle2" gutterBottom>
                  Тендеры ({request.tenders.length})
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
                        <StatusChip
                          label={getStatusLabel(tender.status)}
                          status={tender.status}
                          size="small"
                        />
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewTenderDetail(tender.tenderId);
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
                          {expandedTenders.includes(tender.tenderId) ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        </IconButton>
                      </Box>
                    </NestedStep>

                    {/* Предложения в тендере */}
                    <Collapse in={expandedTenders.includes(tender.tenderId)}>
                      <Box ml={3}>
                        {tender.status === 'AWARDED' ? (
                          // Для присужденных тендеров показываем только победившее предложение (с лучшей ценой)
                          (() => {
                            const acceptedProposals = tender.proposals?.filter(proposal => proposal.status === 'ACCEPTED') || [];
                            console.log(`Тендер ${tender.tenderId}: найдено ${acceptedProposals.length} принятых предложений:`, acceptedProposals);
                            
                            // Сортируем по цене (самая низкая цена - победитель) и берем первое
                            const winnerProposal = acceptedProposals
                              .sort((a, b) => (a.totalPrice || 0) - (b.totalPrice || 0))
                              .slice(0, 1)[0];
                            
                            console.log(`Тендер ${tender.tenderId}: победитель:`, winnerProposal);
                            return winnerProposal ? [winnerProposal] : [];
                          })()
                            .map((proposal) => (
                              <Box key={proposal.proposalId}>
                                <NestedStep 
                                  color={getStepColor('proposal', 1)}
                                  onClick={() => handleProposalClick(proposal.proposalId)}
                                >
                                  <Box display="flex" alignItems="center" gap={1}>
                                    <BusinessIcon />
                                    <Box>
                                      <Typography variant="body2" fontWeight="bold" color="success.main">
                                        🏆 {proposal.supplierName} (ПОБЕДИТЕЛЬ)
                                      </Typography>
                                      <Typography variant="caption">
                                        {proposal.supplierContact} • {formatPhone(proposal.supplierPhone)}
                                      </Typography>
                                    </Box>
                                  </Box>
                                  <Box display="flex" alignItems="center" gap={1}>
                                    <Typography variant="body2" fontWeight="bold">
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

                                {/* Действия для победившего предложения */}
                                <Collapse in={expandedProposals.includes(proposal.proposalId)}>
                                  <Box ml={3}>
                                    <Paper sx={{ p: 2, mb: 2, bgcolor: 'success.50', border: '1px solid', borderColor: 'success.200' }}>
                                      <Typography variant="subtitle2" color="success.main" gutterBottom>
                                        🎉 Победившее предложение
                                      </Typography>
                                      
                                      {/* Проверяем, есть ли контракт */}
                                      {request.contractsCount === 0 ? (
                                        <Box>
                                          <Typography variant="body2" color="text.secondary" gutterBottom>
                                            Контракт еще не заключен
                                          </Typography>
                                          <Button
                                            variant="contained"
                                            color="success"
                                            size="small"
                                            onClick={() => window.open(`/tenders/${tender.tenderId}/contract/new/${proposal.supplierId}`, '_blank')}
                                            sx={{ mt: 1 }}
                                          >
                                            Заключить контракт
                                          </Button>
                                        </Box>
                                      ) : (
                                        <Box>
                                          <Typography variant="body2" color="text.secondary" gutterBottom>
                                            Контракт заключен
                                          </Typography>
                                          <Button
                                            variant="contained"
                                            color="primary"
                                            size="small"
                                            onClick={() => window.open(`/invoices/new?tenderId=${tender.tenderId}&supplierName=${encodeURIComponent(proposal.supplierName)}`, '_blank')}
                                            sx={{ mt: 1 }}
                                          >
                                            Создать счет
                                          </Button>
                                        </Box>
                                      )}
                                    </Paper>
                                  </Box>
                                </Collapse>
                              </Box>
                            ))
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
            {request.contracts && request.contracts.length > 0 && (
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
                            
                            <Grid item xs={12}>
                              <Box display="flex" justifyContent="flex-end" mt={2}>
                                <Button
                                  variant="contained"
                                  startIcon={<ReceiptIcon />}
                                  onClick={() => {
                                    // Создание счета из контракта с подстановкой данных
                                    const params = new URLSearchParams({
                                      contractId: contract.contractId,
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
            {request.invoices && request.invoices.length > 0 && (
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
                                                                             {(invoice.invoiceItems || []).map((item, index) => {
                                        console.log('Рендеринг элемента счета:', {
                                          index,
                                          item,
                                          materialName: item.materialName,
                                          quantity: item.quantity,
                                          unitName: item.unitName,
                                          unitPrice: item.unitPrice,
                                          totalPrice: item.totalPrice
                                        });
                                        return (
                                          <TableRow key={item.id || index}>
                                            <TableCell size="small" sx={{ p: 0.5, fontSize: '0.75rem' }}>{index + 1}</TableCell>
                                            <TableCell size="small" sx={{ p: 0.5, fontSize: '0.75rem' }}>{item.materialName}</TableCell>
                                            <TableCell size="small" sx={{ p: 0.5, fontSize: '0.75rem' }}>{item.quantity}</TableCell>
                                            <TableCell size="small" sx={{ p: 0.5, fontSize: '0.75rem' }}>{item.unitName}</TableCell>
                                            <TableCell size="small" sx={{ p: 0.5, fontSize: '0.75rem' }}>{formatCurrency(item.unitPrice)}</TableCell>
                                            <TableCell size="small" sx={{ p: 0.5, fontSize: '0.75rem' }}>{formatCurrency(item.totalPrice)}</TableCell>
                                          </TableRow>
                                        );
                                      })}
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
            {request.deliveries && request.deliveries.length > 0 && (
              <Box mb={2}>
                <Typography variant="subtitle2" gutterBottom>
                  Поставки ({request.deliveries.length})
                </Typography>
                {request.deliveries.map((delivery) => (
                  <Box key={delivery.deliveryId}>
                    <NestedStep 
                      color={getStepColor('delivery', 1)}
                      onClick={() => handleDeliveryClick(delivery.deliveryId)}
                    >
                      <Box display="flex" alignItems="center" gap={1}>
                        <DeliveryIcon />
                        <Box>
                          <Typography variant="body1">
                            Поставка {delivery.deliveryNumber}
                          </Typography>
                          <Typography variant="body2">
                            {formatDate(delivery.plannedDate)} • {request.project} • {request.location || 'Склад не указан'} • {delivery.supplierName}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            Контракт: {delivery.contractNumber}
                          </Typography>
                        </Box>
                      </Box>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="body2">
                          {formatCurrency(delivery.totalAmount)}
                        </Typography>
                        <StatusChip
                          label={getStatusLabel(delivery.status)}
                          status={delivery.status}
                          size="small"
                        />
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewDeliveryDetail(delivery.deliveryId);
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
                          {expandedDeliveries.includes(delivery.deliveryId) ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        </IconButton>
                      </Box>
                    </NestedStep>

                    {/* Детали поставки */}
                    <Collapse in={expandedDeliveries.includes(delivery.deliveryId)}>
                      <Box ml={3}>
                        {/* Информация о поставке */}
                        <Paper sx={{ p: 2, mb: 2, bgcolor: 'grey.50' }}>
                          <Typography variant="subtitle2" gutterBottom>
                            Детали поставки
                          </Typography>
                          <Grid container spacing={2}>
                            <Grid item xs={6}>
                              <Typography variant="caption" color="textSecondary">
                                Поставщик
                              </Typography>
                              <Typography variant="body2">
                                {delivery.supplierName}
                              </Typography>
                              <Typography variant="caption" color="textSecondary">
                                Контракт: {delivery.contractNumber}
                              </Typography>
                            </Grid>
                            <Grid item xs={6}>
                              <Typography variant="caption" color="textSecondary">
                                Финансы
                              </Typography>
                              <Typography variant="body2">
                                Общая сумма: {formatCurrency(delivery.totalAmount)}
                              </Typography>
                              <Typography variant="caption" color="textSecondary">
                                Статус: {getStatusLabel(delivery.status)}
                              </Typography>
                            </Grid>
                            <Grid item xs={6}>
                              <Typography variant="caption" color="textSecondary">
                                Даты
                              </Typography>
                              <Typography variant="body2">
                                Запланирована: {formatDate(delivery.plannedDate)}
                              </Typography>
                              {delivery.actualDate && (
                                <Typography variant="body2">
                                  Фактическая: {formatDate(delivery.actualDate)}
                                </Typography>
                              )}
                            </Grid>
                            <Grid item xs={6}>
                              <Typography variant="caption" color="textSecondary">
                                Склад
                              </Typography>
                              <Typography variant="body2">
                                {delivery.warehouseName || 'Не указан'}
                              </Typography>
                              {delivery.trackingNumber && (
                                <Typography variant="caption" color="textSecondary">
                                  Трек номер: {delivery.trackingNumber}
                                </Typography>
                              )}
                            </Grid>
                            {delivery.notes && (
                              <Grid item xs={12}>
                                <Typography variant="caption" color="textSecondary">
                                  Примечания
                                </Typography>
                                <Typography variant="body2">
                                  {delivery.notes}
                                </Typography>
                              </Grid>
                            )}
                            
                            {/* Материалы поставки */}
                            {delivery.deliveryItems && delivery.deliveryItems.length > 0 && (
                              <Grid item xs={12}>
                                <Typography variant="caption" color="textSecondary" display="block" gutterBottom>
                                  Материалы поставки ({delivery.deliveryItems.length})
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
                                        <TableCell size="small" sx={{ p: 0.5, fontSize: '0.75rem' }}>Статус</TableCell>
                                      </TableRow>
                                    </TableHead>
                                    <TableBody>
                                      {delivery.deliveryItems.map((item, index) => (
                                        <TableRow key={item.id || index}>
                                          <TableCell size="small" sx={{ p: 0.5, fontSize: '0.75rem' }}>{index + 1}</TableCell>
                                          <TableCell size="small" sx={{ p: 0.5, fontSize: '0.75rem' }}>{item.materialName}</TableCell>
                                          <TableCell size="small" sx={{ p: 0.5, fontSize: '0.75rem' }}>{item.orderedQuantity}</TableCell>
                                          <TableCell size="small" sx={{ p: 0.5, fontSize: '0.75rem' }}>{item.deliveredQuantity || 0}</TableCell>
                                          <TableCell size="small" sx={{ p: 0.5, fontSize: '0.75rem' }}>{item.acceptedQuantity || 0}</TableCell>
                                          <TableCell size="small" sx={{ p: 0.5, fontSize: '0.75rem' }}>{item.unitName}</TableCell>
                                          <TableCell size="small" sx={{ p: 0.5, fontSize: '0.75rem' }}>{formatCurrency(item.unitPrice)}</TableCell>
                                          <TableCell size="small" sx={{ p: 0.5, fontSize: '0.75rem' }}>{formatCurrency(item.totalPrice)}</TableCell>
                                          <TableCell size="small" sx={{ p: 0.5, fontSize: '0.75rem' }}>
                                            <StatusChip
                                              label={getStatusLabel(item.acceptanceStatus || 'PENDING')}
                                              status={item.acceptanceStatus || 'PENDING'}
                                              size="small"
                                            />
                                          </TableCell>
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
                                  onClick={() => {
                                    // Управление статусом поставки
                                    window.open(`/deliveries/${delivery.deliveryId}`, '_blank');
                                  }}
                                  sx={{
                                    bgcolor: 'success.main',
                                    color: 'white',
                                    '&:hover': {
                                      bgcolor: 'success.dark'
                                    }
                                  }}
                                >
                                  Управление статусом
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


      </CardContent>
    </StyledCard>
  );
} 

export default RequestProcessMatryoshka;