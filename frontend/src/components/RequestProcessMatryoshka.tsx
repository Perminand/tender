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
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { RequestProcess, TenderProcess, InvoiceProcess, DeliveryProcess, SupplierProposal, ReceiptProcess } from '../types/requestProcess';

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
        return theme.palette.success.main;
      case 'IN_PROGRESS':
      case 'PARTIALLY_PAID':
      case 'PARTIALLY_RECEIVED':
      case 'UNDER_REVIEW':
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

export default function RequestProcessMatryoshka({ request }: RequestProcessMatryoshkaProps) {
  const navigate = useNavigate();
  const theme = useTheme();
  const [expandedRequest, setExpandedRequest] = useState(false);
  const [expandedTenders, setExpandedTenders] = useState<string[]>([]);
  const [expandedProposals, setExpandedProposals] = useState<string[]>([]);
  const [expandedInvoices, setExpandedInvoices] = useState<string[]>([]);
  const [expandedContracts, setExpandedContracts] = useState<string[]>([]);
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

  const handleViewInvoiceDetail = (invoiceId: string) => {
    window.open(`/invoices/${invoiceId}`, '_blank');
  };

  const handleViewDeliveryDetail = (deliveryId: string) => {
    window.open(`/deliveries/${deliveryId}`, '_blank');
  };

  const handleViewRequestDetail = (requestId: string) => {
    window.open(`/requests/${requestId}`, '_blank');
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

  const handleInvoiceClick = (invoiceId: string) => {
    setExpandedInvoices(prev => 
      prev.includes(invoiceId) 
        ? prev.filter(id => id !== invoiceId)
        : [...prev, invoiceId]
    );
  };

  const handleDeliveryClick = (deliveryId: string) => {
    setExpandedDeliveries(prev => 
      prev.includes(deliveryId) 
        ? prev.filter(id => id !== deliveryId)
        : [...prev, deliveryId]
    );
  };

  const handleViewProposals = (tenderId: string) => {
    window.open(`/proposals?tenderId=${tenderId}`, '_blank');
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
                          </Grid>
                        </Paper>

                        {/* Поставка по контракту */}
                        <Paper sx={{ p: 2, mb: 2, bgcolor: 'lightblue.50', border: '1px solid', borderColor: 'lightblue.200' }}>
                          <Typography variant="subtitle2" gutterBottom color="primary.main">
                            Поставка по контракту
                          </Typography>
                          
                          {/* Находим счета для этого контракта */}
                          {request.invoices && request.invoices
                            .filter(invoice => invoice.contractId === contract.contractId)
                            .map((invoice) => (
                              <Box key={invoice.invoiceId} mb={2} p={2} bgcolor="white" borderRadius={1} border="1px solid" borderColor="grey.300">
                                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                                  <Typography variant="body1" fontWeight="bold">
                                    {invoice.supplierName}
                                  </Typography>
                                  <Typography variant="body2" color="textSecondary">
                                    {invoice.supplierContact} • {formatPhone(invoice.supplierPhone)}
                                  </Typography>
                                </Box>
                                
                                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                  <Typography variant="body2" fontWeight="bold">
                                    Счёт {invoice.invoiceNumber}
                                  </Typography>
                                  <Typography variant="body2">
                                    от {formatDate(invoice.invoiceDate)}
                                  </Typography>
                                </Box>
                                
                                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                                  <Typography variant="body2">
                                    с НДС {formatCurrency(invoice.totalAmount)}
                                  </Typography>
                                  <Typography variant="body2">
                                    Оплата {formatDate(invoice.dueDate)}
                                  </Typography>
                                </Box>
                                
                                <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
                                  <Typography variant="body2" fontWeight="bold">
                                    {formatCurrency(invoice.totalAmount)} долг {formatCurrency(invoice.remainingAmount)}
                                  </Typography>
                                  <Box sx={{ 
                                    width: 20, 
                                    height: 20, 
                                    borderRadius: '50%', 
                                    bgcolor: invoice.remainingAmount === 0 ? 'success.main' : 'warning.main', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    color: 'white',
                                    fontSize: '12px'
                                  }}>
                                    {invoice.remainingAmount === 0 ? '✓' : '!'}
                                  </Box>
                                </Box>
                                
                                {/* Поступления для этого счета */}
                                {invoice.receipts && invoice.receipts.length > 0 && (
                                  <Box mt={2}>
                                    {invoice.receipts.map((receipt) => (
                                      <Box key={receipt.receiptId} p={2} bgcolor="grey.50" borderRadius={1} border="1px solid" borderColor="grey.200">
                                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                                          <Typography variant="body1" fontWeight="bold">
                                            Поступление
                                          </Typography>
                                          <Typography variant="body2">
                                            УПД {receipt.receiptNumber}
                                          </Typography>
                                        </Box>
                                        
                                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                          <Typography variant="body2">
                                            от {formatDate(receipt.receiptDate)}
                                          </Typography>
                                          <Typography variant="body2" fontWeight="bold">
                                            {formatCurrency(receipt.totalAmount)}
                                          </Typography>
                                        </Box>
                                        
                                        <Box display="flex" justifyContent="space-between" alignItems="center">
                                          <Typography variant="caption" color="textSecondary">
                                            Статус: {getStatusLabel(receipt.status)}
                                          </Typography>
                                          <StatusChip
                                            label={getStatusLabel(receipt.status)}
                                            status={receipt.status}
                                            size="small"
                                          />
                                        </Box>
                                      </Box>
                                    ))}
                                  </Box>
                                )}
                              </Box>
                            ))}
                          
                          {/* Если нет счетов, показываем сообщение */}
                          {(!request.invoices || request.invoices.filter(invoice => invoice.contractId === contract.contractId).length === 0) && (
                            <Box p={2} bgcolor="grey.100" borderRadius={1} textAlign="center">
                              <Typography variant="body2" color="textSecondary">
                                Счета для данного контракта не найдены
                              </Typography>
                            </Box>
                          )}
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
                            Счёт {invoice.invoiceNumber}
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
                        <Typography variant="caption" color="textSecondary">
                          Оплачено: {formatCurrency(invoice.paidAmount)}
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
                                НДС: {formatCurrency(invoice.vatAmount)}
                              </Typography>
                              <Typography variant="body2">
                                Оплачено: {formatCurrency(invoice.paidAmount)}
                              </Typography>
                              <Typography variant="body2" color={invoice.remainingAmount > 0 ? 'error.main' : 'success.main'}>
                                Остаток: {formatCurrency(invoice.remainingAmount)}
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
                          </Grid>
                        </Paper>
                        
                        {/* УПД для счета */}
                        {invoice.receipts && invoice.receipts.length > 0 && (
                          <Box>
                            <Typography variant="subtitle2" gutterBottom>
                              УПД по счету ({invoice.receipts.length})
                            </Typography>
                            {invoice.receipts.map((receipt) => (
                          <NestedStep key={receipt.receiptId} color={getStepColor('receipt', 1)}>
                            <Box display="flex" alignItems="center" gap={1}>
                              <DescriptionIcon />
                              <Box>
                                <Typography variant="body2">
                                  УПД {receipt.receiptNumber}
                                </Typography>
                                <Typography variant="caption">
                                  {formatDate(receipt.receiptDate)}
                                </Typography>
                              </Box>
                            </Box>
                            <Box display="flex" alignItems="center" gap={1}>
                              <Typography variant="body2">
                                {formatCurrency(receipt.totalAmount)}
                              </Typography>
                              <StatusChip
                                label={getStatusLabel(receipt.status)}
                                status={receipt.status}
                                size="small"
                              />
                            </Box>
                          </NestedStep>
                        ))}
                          </Box>
                        )}
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
                            Поставка по Заявке № {request.requestNumber}
                          </Typography>
                          <Typography variant="body2">
                            {formatDate(delivery.deliveryDate)} • {request.project} • {request.location || 'Склад не указан'} • {delivery.supplierName}
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

                    {/* УПД для поставки */}
                    <Collapse in={expandedDeliveries.includes(delivery.deliveryId)}>
                      <Box ml={3}>
                        {delivery.receipts && delivery.receipts.map((receipt) => (
                          <NestedStep key={receipt.receiptId} color={getStepColor('receipt', 1)}>
                            <Box display="flex" alignItems="center" gap={1}>
                              <DescriptionIcon />
                              <Box>
                                <Typography variant="body2">
                                  УПД {receipt.receiptNumber}
                                </Typography>
                                                              <Typography variant="caption">
                                {formatDate(receipt.receiptDate)}
                              </Typography>
                            </Box>
                          </Box>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Typography variant="body2">
                              {formatCurrency(receipt.totalAmount)}
                            </Typography>
                            <StatusChip
                              label={getStatusLabel(receipt.status)}
                              status={receipt.status}
                              size="small"
                            />
                          </Box>
                          </NestedStep>
                        ))}
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