import React, { useState } from 'react';
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
  TableRow
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

const ProcessStep = styled(Box)(({ theme, color }: { theme: any; color: string }) => ({
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

const NestedStep = styled(Box)(({ theme, color }: { theme: any; color: string }) => ({
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

const StatusChip = styled(Chip)(({ theme, status }: { theme: any; status: string }) => {
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
  const [expandedRequest, setExpandedRequest] = useState(false);
  const [expandedTenders, setExpandedTenders] = useState<string[]>([]);
  const [expandedProposals, setExpandedProposals] = useState<string[]>([]);
  const [expandedInvoices, setExpandedInvoices] = useState<string[]>([]);
  const [expandedDeliveries, setExpandedDeliveries] = useState<string[]>([]);

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

  const getStepColor = (step: string, count: number) => {
    if (count === 0) return '#f5f5f5'; // Серый для отсутствующих шагов
    switch (step) {
      case 'request':
        return '#fff3cd'; // Желтый для заявки
      case 'tender':
        return '#d1ecf1'; // Голубой для тендера
      case 'proposal':
        return '#d4edda'; // Зеленый для предложений
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
                {formatDate(request.requestDate)} • {request.location}
              </Typography>
            </Box>
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="body2">
              {request.materialsCount} материалов
            </Typography>
            <StatusChip
              label={request.status}
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
            <Grid container spacing={2} mb={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2">
                  <strong>Организация:</strong> {request.organization}
                </Typography>
                <Typography variant="body2">
                  <strong>Проект:</strong> {request.project}
                </Typography>
                <Typography variant="body2">
                  <strong>Заявитель:</strong> {request.applicant}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2">
                  <strong>Согласователь:</strong> {request.approver}
                </Typography>
                <Typography variant="body2">
                  <strong>Исполнитель:</strong> {request.performer}
                </Typography>
                <Typography variant="body2">
                  <strong>Срок поставки:</strong> {formatDate(request.deliveryDeadline)}
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
                            {formatDate(tender.tenderDate)} • {tender.proposalsCount} предложений
                          </Typography>
                        </Box>
                      </Box>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="body2">
                          {formatCurrency(tender.totalAmount)}
                        </Typography>
                        <StatusChip
                          label={tender.status}
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
                        {tender.proposals && tender.proposals.map((proposal) => (
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
                                    {proposal.supplierContact} • {proposal.supplierPhone}
                                  </Typography>
                                </Box>
                              </Box>
                              <Box display="flex" alignItems="center" gap={1}>
                                <Typography variant="body2">
                                  {formatCurrency(proposal.totalPrice)}
                                </Typography>
                                <StatusChip
                                  label={proposal.status}
                                  status={proposal.status}
                                  size="small"
                                />
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
                        ))}
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
                            {formatDate(invoice.invoiceDate)} • {invoice.supplierName}
                          </Typography>
                        </Box>
                      </Box>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="body2">
                          {formatCurrency(invoice.totalAmount)}
                        </Typography>
                        <StatusChip
                          label={invoice.status}
                          status={invoice.status}
                          size="small"
                        />
                        <IconButton size="small">
                          {expandedInvoices.includes(invoice.invoiceId) ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        </IconButton>
                      </Box>
                    </NestedStep>

                    {/* УПД для счета */}
                    <Collapse in={expandedInvoices.includes(invoice.invoiceId)}>
                      <Box ml={3}>
                        {invoice.receipts && invoice.receipts.map((receipt) => (
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
                                label={receipt.status}
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
                            {formatDate(delivery.deliveryDate)} • {delivery.supplierName}
                          </Typography>
                        </Box>
                      </Box>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="body2">
                          {formatCurrency(delivery.totalAmount)}
                        </Typography>
                        <StatusChip
                          label={delivery.status}
                          status={delivery.status}
                          size="small"
                        />
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
                                label={receipt.status}
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
          </Box>
        </Collapse>
      </CardContent>
    </StyledCard>
  );
} 