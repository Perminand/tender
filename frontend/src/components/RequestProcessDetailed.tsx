import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Chip,
  Grid,
  IconButton,
  Collapse,
  Divider,
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
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Assignment as AssignmentIcon,
  Gavel as GavelIcon,
  Description as DescriptionIcon,
  Receipt as ReceiptIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Business as BusinessIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  AttachMoney as MoneyIcon,
  CalendarToday as CalendarIcon,
  LocalShipping as DeliveryIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { formatPhone } from '../utils/phoneUtils';

interface RequestProcessDetailedProps {
  request: {
    requestId: string;
    requestNumber: string;
    requestDate: string;
    organization: string;
    project: string;
    location: string;
    applicant: string;
    approver: string;
    performer: string;
    deliveryDeadline: string;
    status: string;
    notes: string;
    requestTotalAmount: number;
    tenderTotalAmount: number;
    deltaAmount: number;
    materialsCount: number;
    tendersCount: number;
    proposalsCount: number;
    contractsCount: number;
    invoicesCount: number;
    deliveriesCount: number;
    receiptsCount: number;
    tenders?: Array<{
      tenderId: string;
      tenderNumber: string;
      tenderDate: string;
      status: string;
      totalAmount: number;
      proposalsCount: number;
      selectedProposalsCount: number;
      proposals?: Array<{
        proposalId: string;
        proposalNumber: string;
        supplierName: string;
        supplierContact: string;
        supplierPhone: string;
        submissionDate: string;
        status: string;
        totalPrice: number;
        currency: string;
      }>;
    }>;
    invoices?: Array<{
      invoiceId: string;
      invoiceNumber: string;
      invoiceDate: string;
      paymentDate: string;
      supplierName: string;
      supplierContact: string;
      supplierPhone: string;
      status: string;
      totalAmount: number;
      paidAmount: number;
      remainingAmount: number;
      currency: string;
      receipts?: Array<{
        receiptId: string;
        receiptNumber: string;
        receiptDate: string;
        status: string;
        totalAmount: number;
        currency: string;
      }>;
    }>;
    deliveries?: Array<{
      deliveryId: string;
      deliveryNumber: string;
      deliveryDate: string;
      supplierName: string;
      status: string;
      totalAmount: number;
      receipts?: Array<{
        receiptId: string;
        receiptNumber: string;
        receiptDate: string;
        status: string;
        totalAmount: number;
        currency: string;
      }>;
    }>;
  };
}

const StyledCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  border: `2px solid ${theme.palette.primary.main}`,
  '&:hover': {
    boxShadow: theme.shadows[8],
    transition: 'all 0.3s ease-in-out'
  }
}));

const ProcessSection = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.spacing(1),
  border: `1px solid ${theme.palette.divider}`
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

export default function RequestProcessDetailed({ request }: RequestProcessDetailedProps) {
  const [expandedTenders, setExpandedTenders] = useState<string[]>([]);
  const [expandedInvoices, setExpandedInvoices] = useState<string[]>([]);

  // Отладочная информация
  console.log('RequestProcessDetailed - request:', request);
  console.log('RequestProcessDetailed - tenders:', request.tenders);
  console.log('RequestProcessDetailed - tendersCount:', request.tendersCount);

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
      
      // Статусы тендеров
      case 'PUBLISHED':
        return 'Опубликован';
      case 'BIDDING':
        return 'Прием предложений';
      case 'EVALUATION':
        return 'Оценка предложений';
      case 'AWARDED':
        return 'Присужден';
      
      // Статусы предложений поставщиков
      case 'UNDER_REVIEW':
        return 'На рассмотрении';
      case 'ACCEPTED':
        return 'Принято';
      case 'REJECTED':
        return 'Отклонено';
      case 'WITHDRAWN':
        return 'Отозвано';
      
      // Статусы счетов
      case 'SENT':
        return 'Отправлен';
      case 'CONFIRMED':
        return 'Подтвержден';
      case 'PARTIALLY_PAID':
        return 'Частично оплачен';
      case 'PAID':
        return 'Оплачен';
      case 'OVERDUE':
        return 'Просрочен';
      
      // Статусы поставок
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
      
      // Статусы поступлений
      case 'PARTIALLY_RECEIVED':
        return 'Частично получен';
      case 'RECEIVED':
        return 'Получен';
      
      default:
        return status;
    }
  };

  const handleTenderExpand = (tenderId: string) => {
    setExpandedTenders(prev => 
      prev.includes(tenderId) 
        ? prev.filter(id => id !== tenderId)
        : [...prev, tenderId]
    );
  };

  const handleInvoiceExpand = (invoiceId: string) => {
    setExpandedInvoices(prev => 
      prev.includes(invoiceId) 
        ? prev.filter(id => id !== invoiceId)
        : [...prev, invoiceId]
    );
  };



  return (
    <Box>
      {/* Заголовок заявки */}
      <StyledCard>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Box>
              <Typography variant="h5" component="h1" color="primary">
                Заявка № {request.requestNumber}
              </Typography>
              <Typography variant="body1" color="textSecondary">
                {formatDate(request.requestDate)} • {request.location}
              </Typography>
            </Box>
                                <StatusChip
                      label={getStatusLabel(request.status)}
                      status={request.status}
                      icon={<AssignmentIcon />}
                    />
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Основная информация
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon><BusinessIcon /></ListItemIcon>
                  <ListItemText primary="Организация" secondary={request.organization} />
                </ListItem>
                <ListItem>
                  <ListItemIcon><AssignmentIcon /></ListItemIcon>
                  <ListItemText primary="Проект" secondary={request.project} />
                </ListItem>
                <ListItem>
                  <ListItemIcon><BusinessIcon /></ListItemIcon>
                  <ListItemText primary="Заявитель" secondary={request.applicant} />
                </ListItem>
                <ListItem>
                  <ListItemIcon><BusinessIcon /></ListItemIcon>
                  <ListItemText primary="Согласователь" secondary={request.approver} />
                </ListItem>
                <ListItem>
                  <ListItemIcon><BusinessIcon /></ListItemIcon>
                  <ListItemText primary="Исполнитель" secondary={request.performer} />
                </ListItem>
              </List>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Финансовые показатели
              </Typography>
              <Box p={2} bgcolor="grey.50" borderRadius={1}>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">
                      Заявка
                    </Typography>
                    <Typography variant="h6" color="error.main">
                      {formatCurrency(request.requestTotalAmount)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">
                      Тендер
                    </Typography>
                    <Typography variant="h6" color="success.main">
                      {formatCurrency(request.tenderTotalAmount)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="textSecondary">
                      Дельта
                    </Typography>
                    <Typography variant="h6" color={request.deltaAmount >= 0 ? 'success.main' : 'error.main'}>
                      {formatCurrency(request.deltaAmount)}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            </Grid>
          </Grid>

          {request.notes && (
            <Box mt={2}>
              <Typography variant="h6" gutterBottom>
                Примечания
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {request.notes}
              </Typography>
            </Box>
          )}
        </CardContent>
      </StyledCard>

      {/* Тендеры */}
      {request.tenders && request.tenders.length > 0 && (
        <ProcessSection>
          <Typography variant="h6" gutterBottom>
            <GavelIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Тендеры ({request.tenders.length})
          </Typography>
          {request.tenders.map((tender) => (
            <Card key={tender.tenderId} sx={{ mb: 2 }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Box>
                    <Typography variant="h6">
                      Тендер к Заявке № {request.requestNumber}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {formatDate(tender.tenderDate)} • {tender.proposalsCount} предложений
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={1}>
                    <StatusChip
                      label={getStatusLabel(tender.status)}
                      status={tender.status}
                      icon={<GavelIcon />}
                    />
                    <IconButton onClick={() => handleTenderExpand(tender.tenderId)}>
                      {expandedTenders.includes(tender.tenderId) ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </IconButton>
                  </Box>
                </Box>

                <Typography variant="body1" color="primary" gutterBottom>
                  {formatCurrency(tender.totalAmount)}
                </Typography>

                <Collapse in={expandedTenders.includes(tender.tenderId)}>
                  <Divider sx={{ my: 2 }} />
                  {tender.proposals && tender.proposals.length > 0 && (
                    <Box>
                      <Typography variant="subtitle1" gutterBottom>
                        Предложения поставщиков
                      </Typography>
                      <TableContainer component={Paper} variant="outlined">
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Поставщик</TableCell>
                              <TableCell>Контакт</TableCell>
                              <TableCell>Дата подачи</TableCell>
                              <TableCell>Статус</TableCell>
                              <TableCell align="right">Сумма</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {tender.proposals.map((proposal) => (
                              <TableRow key={proposal.proposalId}>
                                <TableCell>{proposal.supplierName}</TableCell>
                                <TableCell>
                                  <Box>
                                    <Typography variant="body2">{proposal.supplierContact}</Typography>
                                    <Typography variant="caption" color="textSecondary">
                                      {formatPhone(proposal.supplierPhone)}
                                    </Typography>
                                  </Box>
                                </TableCell>
                                <TableCell>{formatDate(proposal.submissionDate)}</TableCell>
                                <TableCell>
                                  <StatusChip
                                    label={getStatusLabel(proposal.status)}
                                    status={proposal.status}
                                    size="small"
                                  />
                                </TableCell>
                                <TableCell align="right">
                                  {formatCurrency(proposal.totalPrice)}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Box>
                  )}
                </Collapse>
              </CardContent>
            </Card>
          ))}
        </ProcessSection>
      )}

      {/* Счета */}
      <ProcessSection>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">
            <ReceiptIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Счета ({request.invoicesCount || 0})
          </Typography>
          {(!request.invoices || request.invoices.length === 0) && (
            <Button
              variant="contained"
              startIcon={<ReceiptIcon />}
              onClick={() => window.open(`/invoices/new?requestId=${request.requestId}&requestNumber=${encodeURIComponent(request.requestNumber)}`, '_blank')}
              sx={{
                bgcolor: 'primary.main',
                color: 'white',
                '&:hover': {
                  bgcolor: 'primary.dark'
                }
              }}
            >
              Создать счет
            </Button>
          )}
        </Box>
        
        {request.invoices && request.invoices.length > 0 ? (
          request.invoices.map((invoice) => (
            <Card key={invoice.invoiceId} sx={{ mb: 2 }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Box>
                    <Typography variant="h6">
                      Счёт {invoice.invoiceNumber}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {formatDate(invoice.invoiceDate)} • {invoice.supplierName}
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={1}>
                    <StatusChip
                      label={getStatusLabel(invoice.status)}
                      status={invoice.status}
                      icon={<ReceiptIcon />}
                    />
                    <IconButton onClick={() => handleInvoiceExpand(invoice.invoiceId)}>
                      {expandedInvoices.includes(invoice.invoiceId) ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </IconButton>
                  </Box>
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <Typography variant="body2" color="textSecondary">
                      Общая сумма
                    </Typography>
                    <Typography variant="h6" color="primary">
                      {formatCurrency(invoice.totalAmount)}
                    </Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="body2" color="textSecondary">
                      Оплачено
                    </Typography>
                    <Typography variant="h6" color="success.main">
                      {formatCurrency(invoice.paidAmount)}
                    </Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="body2" color="textSecondary">
                      Остаток
                    </Typography>
                    <Typography variant="h6" color={invoice.remainingAmount > 0 ? 'error.main' : 'success.main'}>
                      {formatCurrency(invoice.remainingAmount)}
                    </Typography>
                  </Grid>
                </Grid>

                <Collapse in={expandedInvoices.includes(invoice.invoiceId)}>
                  <Divider sx={{ my: 2 }} />
                  <Box>
                    <Typography variant="subtitle1" gutterBottom>
                      Информация о поставщике
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemIcon><BusinessIcon /></ListItemIcon>
                        <ListItemText primary="Название" secondary={invoice.supplierName} />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><BusinessIcon /></ListItemIcon>
                        <ListItemText primary="Контактное лицо" secondary={invoice.supplierContact} />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><PhoneIcon /></ListItemIcon>
                        <ListItemText primary="Телефон" secondary={formatPhone(invoice.supplierPhone)} />
                      </ListItem>
                    </List>
                  </Box>

                  {invoice.receipts && invoice.receipts.length > 0 && (
                    <Box mt={2}>
                      <Typography variant="subtitle1" gutterBottom>
                        Поступления по счету
                      </Typography>
                      <TableContainer component={Paper} variant="outlined">
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Номер поступления</TableCell>
                              <TableCell>Дата</TableCell>
                              <TableCell>Статус</TableCell>
                              <TableCell align="right">Сумма</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {invoice.receipts.map((receipt) => (
                              <TableRow key={receipt.receiptId}>
                                <TableCell>{receipt.receiptNumber}</TableCell>
                                <TableCell>{formatDate(receipt.receiptDate)}</TableCell>
                                <TableCell>
                                  <StatusChip
                                    label={getStatusLabel(receipt.status)}
                                    status={receipt.status}
                                    size="small"
                                  />
                                </TableCell>
                                <TableCell align="right">
                                  {formatCurrency(receipt.totalAmount)}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Box>
                  )}
                </Collapse>
              </CardContent>
            </Card>
          ))
        ) : (
          <Box 
            sx={{ 
              p: 3, 
              border: '2px dashed #ccc', 
              borderRadius: 1, 
              textAlign: 'center',
              bgcolor: 'grey.50'
            }}
          >
            <ReceiptIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Счета не созданы
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              Создайте счет для заявки №{request.requestNumber}
            </Typography>
          </Box>
        )}
      </ProcessSection>

      {/* Поставки */}
      <ProcessSection>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">
            <DeliveryIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Поставки ({request.deliveriesCount || 0})
          </Typography>
          {(!request.deliveries || request.deliveries.length === 0) && (
            <Button
              variant="contained"
              startIcon={<DeliveryIcon />}
              onClick={() => window.open(`/deliveries/new?requestId=${request.requestId}&requestNumber=${encodeURIComponent(request.requestNumber)}`, '_blank')}
              sx={{
                bgcolor: 'primary.main',
                color: 'white',
                '&:hover': {
                  bgcolor: 'primary.dark'
                }
              }}
            >
              Создать поставку
            </Button>
          )}
        </Box>
        
        {request.deliveries && request.deliveries.length > 0 ? (
          request.deliveries.map((delivery) => (
            <Card key={delivery.deliveryId} sx={{ mb: 2 }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Box>
                    <Typography variant="h6">
                      Поставка {delivery.deliveryNumber}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {formatDate(delivery.deliveryDate)} • {delivery.supplierName}
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={1}>
                    <StatusChip
                      label={getStatusLabel(delivery.status)}
                      status={delivery.status}
                      icon={<DeliveryIcon />}
                    />
                  </Box>
                </Box>

                <Typography variant="body1" color="primary" gutterBottom>
                  {formatCurrency(delivery.totalAmount)}
                </Typography>

                {delivery.receipts && delivery.receipts.length > 0 && (
                  <Box mt={2}>
                    <Typography variant="subtitle1" gutterBottom>
                      Поступления по поставке
                    </Typography>
                    <TableContainer component={Paper} variant="outlined">
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Номер поступления</TableCell>
                            <TableCell>Дата</TableCell>
                            <TableCell>Статус</TableCell>
                            <TableCell align="right">Сумма</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {delivery.receipts.map((receipt) => (
                            <TableRow key={receipt.receiptId}>
                              <TableCell>{receipt.receiptNumber}</TableCell>
                              <TableCell>{formatDate(receipt.receiptDate)}</TableCell>
                              <TableCell>
                                <StatusChip
                                  label={getStatusLabel(receipt.status)}
                                  status={receipt.status}
                                  size="small"
                                />
                              </TableCell>
                              <TableCell align="right">
                                {formatCurrency(receipt.totalAmount)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <Box 
            sx={{ 
              p: 3, 
              border: '2px dashed #ccc', 
              borderRadius: 1, 
              textAlign: 'center',
              bgcolor: 'grey.50'
            }}
          >
            <DeliveryIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Поставки не созданы
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              Создайте поставку для заявки №{request.requestNumber}
            </Typography>
          </Box>
        )}
      </ProcessSection>
    </Box>
  );
}