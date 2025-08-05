import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  IconButton,
  Alert,
  CircularProgress,
  Tooltip,
  Fab
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as ConfirmIcon,
  Payment as PaymentIcon,
  Cancel as CancelIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { formatDate } from '../utils/dateUtils';

interface Invoice {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  paymentDate?: string;
  supplierName: string;
  supplierContact: string;
  supplierPhone: string;
  requestNumber: string;
  contractNumber?: string;
  contractId?: string;
  status: string;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  currency: string;
  notes?: string;
}

export default function InvoiceManagementPage() {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');

  const fetchInvoices = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get<Invoice[]>('/api/invoices');
      setInvoices(response.data);
    } catch (err) {
      console.error('Ошибка при загрузке счетов:', err);
      setError('Ошибка при загрузке данных');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleCreateInvoice = () => {
    navigate('/invoices/new');
  };

  const handleEditInvoice = (invoice: Invoice) => {
    navigate(`/invoices/${invoice.id}`);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Вы уверены, что хотите удалить этот счет?')) {
      try {
        await api.delete(`/api/invoices/${id}`);
        fetchInvoices();
      } catch (err) {
        console.error('Ошибка при удалении счета:', err);
        setError('Ошибка при удалении данных');
      }
    }
  };

  const handleConfirm = async (id: string) => {
    try {
      await api.post(`/api/invoices/${id}/confirm`);
      fetchInvoices();
    } catch (err) {
      console.error('Ошибка при подтверждении счета:', err);
      setError('Ошибка при подтверждении счета');
    }
  };

  const handlePayment = (invoice: Invoice) => {
    // Перенаправляем на создание платежа с данными счета
    navigate(`/payments/new?invoiceId=${invoice.id}&contractId=${invoice.contractId || ''}&amount=${invoice.remainingAmount}&invoiceNumber=${invoice.invoiceNumber}`);
  };

  const handleCancel = async (id: string) => {
    if (window.confirm('Вы уверены, что хотите отменить этот счет?')) {
      try {
        await api.post(`/api/invoices/${id}/cancel`);
        fetchInvoices();
      } catch (err) {
        console.error('Ошибка при отмене счета:', err);
        setError('Ошибка при отмене счета');
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'default';
      case 'SENT': return 'info';
      case 'PAID': return 'success';
      case 'PARTIALLY_PAID': return 'warning';
      case 'OVERDUE': return 'error';
      case 'CANCELLED': return 'error';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'Черновик';
      case 'SENT': return 'Отправлен';
      case 'PAID': return 'Оплачен';
      case 'PARTIALLY_PAID': return 'Частично оплачен';
      case 'OVERDUE': return 'Просрочен';
      case 'CANCELLED': return 'Отменен';
      default: return status;
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };



  const filteredInvoices = statusFilter
    ? invoices.filter(invoice => invoice.status === statusFilter)
    : invoices;

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Управление счетами от поставщиков
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchInvoices}
            sx={{ mr: 1 }}
          >
            Обновить
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Номер счета</TableCell>
                <TableCell>Дата счета</TableCell>
                <TableCell>Дата оплаты</TableCell>
                <TableCell>Поставщик</TableCell>
                <TableCell>Номер заявки</TableCell>
                <TableCell>Статус</TableCell>
                <TableCell>Сумма</TableCell>
                <TableCell>Оплачено</TableCell>
                <TableCell>Остаток</TableCell>
                <TableCell>Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredInvoices.map((invoice) => (
                <TableRow key={invoice.id} hover>
                  <TableCell>{invoice.invoiceNumber}</TableCell>
                  <TableCell>{formatDate(invoice.invoiceDate)}</TableCell>
                  <TableCell>{formatDate(invoice.dueDate)}</TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2">{invoice.supplierName}</Typography>
                      <Typography variant="caption" color="textSecondary">
                        {invoice.supplierContact} • {invoice.supplierPhone}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{invoice.requestNumber}</TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusLabel(invoice.status)}
                      color={getStatusColor(invoice.status) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{formatCurrency(invoice.totalAmount, invoice.currency)}</TableCell>
                  <TableCell>{formatCurrency(invoice.paidAmount, invoice.currency)}</TableCell>
                  <TableCell>{formatCurrency(invoice.remainingAmount, invoice.currency)}</TableCell>
                  <TableCell>
                    <Box display="flex" gap={0.5}>
                      <Tooltip title="Редактировать">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleEditInvoice(invoice)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      {invoice.status === 'DRAFT' && (
                        <Tooltip title="Удалить">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDelete(invoice.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                      {invoice.status === 'SENT' && (
                        <Tooltip title="Подтвердить">
                          <IconButton
                            size="small"
                            color="success"
                            onClick={() => handleConfirm(invoice.id)}
                          >
                            <ConfirmIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                                             {invoice.status !== 'PAID' && invoice.status !== 'CANCELLED' && (
                         <Tooltip title="Создать платеж">
                           <IconButton
                             size="small"
                             color="primary"
                             onClick={() => handlePayment(invoice)}
                           >
                             <PaymentIcon />
                           </IconButton>
                         </Tooltip>
                       )}
                      {invoice.status !== 'PAID' && invoice.status !== 'CANCELLED' && (
                        <Tooltip title="Отменить">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleCancel(invoice.id)}
                          >
                            <CancelIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Кнопка добавления */}
      <Fab
        color="primary"
        aria-label="add"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={handleCreateInvoice}
      >
        <AddIcon />
      </Fab>
    </Container>
  );
} 