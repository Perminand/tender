import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  IconButton,
  Collapse,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Business as BusinessIcon,
  Phone as PhoneIcon,
  Receipt as ReceiptIcon,
  Payment as PaymentIcon,
  Add as AddIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { api } from '../utils/api';

interface ContactPerson {
  name: string;
  phone: string;
}

interface InvoiceItem {
  materialName: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
}

interface Invoice {
  invoiceNumber: string;
  invoiceDate: string;
  amount: number;
  vatAmount: number;
  paymentDate: string;
  items: InvoiceItem[];
  totalAmount: number;
  debt: number;
}

interface PaymentItem {
  materialName: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
}

interface Payment {
  documentNumber: string;
  documentDate: string;
  amount: number;
  documentType: string;
  items: PaymentItem[];
}

interface SupplierInfo {
  supplierId: string;
  supplier: {
    id: string;
    name: string;
    shortName: string;
  };
  contact: ContactPerson | null;
  invoices: Invoice[];
  payments: Payment[];
}

interface CustomerInfo {
  customerId: string;
  customer: {
    id: string;
    name: string;
    shortName: string;
  };
  request: {
    id: string;
    requestNumber: string;
    date: string;
    status: string;
    organization: {
      name: string;
      shortName: string;
    };
    project: {
      name: string;
    };
  };
  tender: {
    id: string;
    tenderNumber: string;
    title: string;
    status: string;
    startDate: string;
    endDate: string;
  } | null;
  suppliers: SupplierInfo[];
}

const CustomerInfoPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const { requestId } = useParams<{ requestId: string }>();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [expandedSuppliers, setExpandedSuppliers] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (requestId) {
      fetchCustomerInfo();
    }
  }, [requestId]);

  const fetchCustomerInfo = async () => {
    setLoading(true);
    try {
      // Запрашиваем по ID заявки, чтобы избежать путаницы с номером
      const response = await api.get(`/api/customer-info/request-id/${requestId}`);
      setCustomerInfo(response.data);
      setError(null);
    } catch (err: any) {
      console.error('Ошибка при загрузке информации о заказчике:', err);
      
      // Показываем понятное сообщение пользователю
      if (err.response?.status === 400 || err.response?.status === 404) {
        const message = err.response?.data?.message || 'Заявка не найдена';
        setError(`Заявка с идентификатором "${requestId}" не найдена в системе`);
      } else {
        setError('Ошибка при загрузке данных. Попробуйте позже.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSupplierToggle = (supplierId: string) => {
    const newExpanded = new Set(expandedSuppliers);
    if (newExpanded.has(supplierId)) {
      newExpanded.delete(supplierId);
    } else {
      newExpanded.add(supplierId);
    }
    setExpandedSuppliers(newExpanded);
  };

  const formatDate = (dateString: string) => {
    return dayjs(dateString).format('DD.MM.YYг.');
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'DRAFT': return 'default';
      case 'PUBLISHED': return 'primary';
      case 'BIDDING': return 'info';
      case 'EVALUATION': return 'warning';
      case 'AWARDED': return 'success';
      case 'CANCELLED': return 'error';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status.toUpperCase()) {
      case 'DRAFT': return 'Черновик';
      case 'PUBLISHED': return 'Опубликован';
      case 'BIDDING': return 'Прием предложений';
      case 'EVALUATION': return 'Оценка';
      case 'AWARDED': return 'Присужден';
      case 'CANCELLED': return 'Отменен';
      default: return status;
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
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!customerInfo) {
    return (
      <Box p={3}>
        <Alert severity="info">Информация о заказчике не найдена</Alert>
      </Box>
    );
  }

  return (
    <Box p={3}>
      {/* Header */}
      <Box display="flex" alignItems="center" mb={3}>
        <IconButton onClick={() => navigate(-1)} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1">
          Информация о заказчике
        </Typography>
      </Box>

      {/* Request Header */}
      <Card sx={{ mb: 2 }}>
        <CardContent sx={{ p: 0 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              p: 2,
              backgroundColor: 'warning.light',
              color: 'warning.contrastText'
            }}
          >
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              Заявка № {customerInfo.request.requestNumber}
            </Typography>
            <Typography variant="h6">
              {/* Здесь должна быть сумма заявки */}
            </Typography>
          </Box>
          <Box sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: "space-between", mb: 1 }}>
              <Typography variant="body2">{formatDate(customerInfo.request.date)}</Typography>
              <Typography variant="body2">{customerInfo.request.project?.name || '-'}</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              Заказчик: {customerInfo.customer.shortName || customerInfo.customer.name}
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Tender Information */}
      {customerInfo.tender && (
        <Card sx={{ mb: 2 }}>
          <CardContent sx={{ p: 0 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                p: 2,
                backgroundColor: 'success.light',
                color: 'success.contrastText'
              }}
            >
              <Typography variant="h6" sx={{ flexGrow: 1 }}>
                Тендер к Заявке № {customerInfo.request.requestNumber}
              </Typography>
              <Typography variant="h6">
                {/* Здесь должна быть сумма тендера */}
              </Typography>
            </Box>
            <Box sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: "space-between", mb: 1 }}>
                <Typography variant="body2">{formatDate(customerInfo.tender.startDate)}</Typography>
                <Typography variant="body2">{customerInfo.request.project?.name || '-'}</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Статус: {getStatusLabel(customerInfo.tender.status)}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Delivery Section */}
      <Card sx={{ mb: 2 }}>
        <CardContent sx={{ p: 0 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              p: 2,
              backgroundColor: 'info.light',
              color: 'info.contrastText'
            }}
          >
            <Typography variant="h6">
              Поставка по Заявке № {customerInfo.request.requestNumber}
            </Typography>
          </Box>

          {/* Suppliers */}
          {customerInfo.suppliers.map((supplier) => (
            <Box key={supplier.supplierId}>
              {/* Supplier Header */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  p: 2,
                  cursor: 'pointer',
                  '&:hover': { backgroundColor: 'action.hover' }
                }}
                onClick={() => handleSupplierToggle(supplier.supplierId)}
              >
                <BusinessIcon sx={{ mr: 1 }} />
                <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>
                  {supplier.supplier.shortName || supplier.supplier.name}
                </Typography>
                {supplier.contact && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                    <PhoneIcon sx={{ mr: 0.5, fontSize: 'small' }} />
                    <Typography variant="body2">
                      {supplier.contact.name} {supplier.contact.phone}
                    </Typography>
                  </Box>
                )}
                <IconButton size="small">
                  {expandedSuppliers.has(supplier.supplierId) ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              </Box>

              {/* Supplier Details */}
              <Collapse in={expandedSuppliers.has(supplier.supplierId)}>
                <Box sx={{ pl: 2, pr: 2, pb: 2 }}>
                  {/* Invoices */}
                  {supplier.invoices.map((invoice) => (
                    <Card key={invoice.invoiceNumber} sx={{ mb: 1 }}>
                      <CardContent sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <ReceiptIcon sx={{ mr: 1, color: 'primary.main' }} />
                          <Typography variant="subtitle2" sx={{ flexGrow: 1 }}>
                            Счёт {invoice.invoiceNumber}
                          </Typography>
                          <Typography variant="subtitle2">
                            с НДС {formatAmount(invoice.amount)}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: "space-between", mb: 1 }}>
                          <Typography variant="body2">
                            от {formatDate(invoice.invoiceDate)}
                          </Typography>
                          <Typography variant="body2">
                            Оплата {formatDate(invoice.paymentDate)}
                          </Typography>
                        </Box>
                        
                        {/* Invoice Items */}
                        <List dense>
                          {invoice.items.map((item, index) => (
                            <ListItem key={index} sx={{ py: 0 }}>
                              <ListItemText
                                primary={item.materialName}
                                secondary={`${item.quantity} ${item.unit}, ${formatAmount(item.unitPrice)}`}
                              />
                              <Typography variant="body2">
                                {formatAmount(item.totalPrice)}
                              </Typography>
                            </ListItem>
                          ))}
                        </List>
                        
                        <Box sx={{ display: 'flex', justifyContent: "space-between", mt: 1 }}>
                          <Typography variant="body2">
                            Итого: {formatAmount(invoice.totalAmount)}
                          </Typography>
                          {invoice.debt > 0 && (
                            <Typography variant="body2" color="error">
                              Долг: {formatAmount(invoice.debt)}
                            </Typography>
                          )}
                        </Box>
                      </CardContent>
                    </Card>
                  ))}

                  {/* Payments */}
                  {supplier.payments.map((payment) => (
                    <Card key={payment.documentNumber} sx={{ mb: 1 }}>
                      <CardContent sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <PaymentIcon sx={{ mr: 1, color: 'success.main' }} />
                          <Typography variant="subtitle2" sx={{ flexGrow: 1 }}>
                            Поступление {payment.documentType} {payment.documentNumber}
                          </Typography>
                          <Typography variant="subtitle2">
                            {formatAmount(payment.amount)}
                          </Typography>
                        </Box>
                        <Typography variant="body2">
                          от {formatDate(payment.documentDate)}
                        </Typography>
                        
                        {/* Payment Items */}
                        <List dense>
                          {payment.items.map((item, index) => (
                            <ListItem key={index} sx={{ py: 0 }}>
                              <ListItemText
                                primary={item.materialName}
                                secondary={`${item.quantity} ${item.unit}, ${formatAmount(item.unitPrice)}`}
                              />
                              <Typography variant="body2">
                                {formatAmount(item.totalPrice)}
                              </Typography>
                            </ListItem>
                          ))}
                        </List>
                      </CardContent>
                    </Card>
                  ))}

                  {supplier.invoices.length === 0 && supplier.payments.length === 0 && (
                    <Box sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>
                      <Typography variant="body2">
                        Нет счетов и платежей
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Collapse>
            </Box>
          ))}

          {customerInfo.suppliers.length === 0 && (
            <Box sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>
              <Typography variant="body2">
                Нет поставщиков для этой заявки
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default CustomerInfoPage; 