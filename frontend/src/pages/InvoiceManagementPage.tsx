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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
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
import { api } from '../utils/api';

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
  status: string;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  currency: string;
  notes?: string;
}

interface InvoiceFormData {
  contractId?: string;
  supplierId: string;
  requestId?: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  totalAmount: number;
  vatAmount: number;
  currency: string;
  paymentTerms?: string;
  notes?: string;
}

export default function InvoiceManagementPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [formData, setFormData] = useState<InvoiceFormData>({
    supplierId: '',
    invoiceNumber: '',
    invoiceDate: '',
    dueDate: '',
    totalAmount: 0,
    vatAmount: 0,
    currency: 'RUB'
  });
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

  const handleOpenDialog = (invoice?: Invoice) => {
    if (invoice) {
      setEditingInvoice(invoice);
      setFormData({
        supplierId: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        invoiceDate: invoice.invoiceDate,
        dueDate: invoice.dueDate,
        totalAmount: invoice.totalAmount,
        vatAmount: 0,
        currency: invoice.currency
      });
    } else {
      setEditingInvoice(null);
      setFormData({
        supplierId: '',
        invoiceNumber: '',
        invoiceDate: '',
        dueDate: '',
        totalAmount: 0,
        vatAmount: 0,
        currency: 'RUB'
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingInvoice(null);
  };

  const handleFormChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleSubmit = async () => {
    try {
      if (editingInvoice) {
        await api.put(`/api/invoices/${editingInvoice.id}`, formData);
      } else {
        await api.post('/api/invoices', formData);
      }
      handleCloseDialog();
      fetchInvoices();
    } catch (err) {
      console.error('Ошибка при сохранении счета:', err);
      setError('Ошибка при сохранении данных');
    }
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

  const handlePayment = async (id: string) => {
    try {
      await api.post(`/api/invoices/${id}/pay`);
      fetchInvoices();
    } catch (err) {
      console.error('Ошибка при оплате счета:', err);
      setError('Ошибка при оплате счета');
    }
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
      case 'PAID':
        return 'success';
      case 'PARTIALLY_PAID':
        return 'warning';
      case 'CONFIRMED':
        return 'info';
      case 'DRAFT':
        return 'default';
      case 'CANCELLED':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return 'Черновик';
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
      case 'CANCELLED':
        return 'Отменен';
      default:
        return status;
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU');
  };

  const filteredInvoices = invoices.filter(invoice => 
    statusFilter === '' || invoice.status === statusFilter
  );

  if (loading) {
    return (
      <Container maxWidth="xl">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Управление счетами от поставщиков
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Создание и управление счетами от поставщиков-победителей тендеров
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Фильтры */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Статус</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Статус"
              >
                <MenuItem value="">Все статусы</MenuItem>
                <MenuItem value="DRAFT">Черновик</MenuItem>
                <MenuItem value="SENT">Отправлен</MenuItem>
                <MenuItem value="CONFIRMED">Подтвержден</MenuItem>
                <MenuItem value="PARTIALLY_PAID">Частично оплачен</MenuItem>
                <MenuItem value="PAID">Оплачен</MenuItem>
                <MenuItem value="OVERDUE">Просрочен</MenuItem>
                <MenuItem value="CANCELLED">Отменен</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={fetchInvoices}
            >
              Обновить
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Таблица счетов */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Номер счета</TableCell>
              <TableCell>Дата</TableCell>
              <TableCell>Поставщик</TableCell>
              <TableCell>Заявка</TableCell>
              <TableCell>Сумма</TableCell>
              <TableCell>Оплачено</TableCell>
              <TableCell>Статус</TableCell>
              <TableCell>Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredInvoices.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell>{invoice.invoiceNumber}</TableCell>
                <TableCell>{formatDate(invoice.invoiceDate)}</TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="body2">{invoice.supplierName}</Typography>
                    <Typography variant="caption" color="textSecondary">
                      {invoice.supplierContact}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>{invoice.requestNumber}</TableCell>
                <TableCell>{formatCurrency(invoice.totalAmount, invoice.currency)}</TableCell>
                <TableCell>{formatCurrency(invoice.paidAmount, invoice.currency)}</TableCell>
                <TableCell>
                  <Chip
                    label={getStatusLabel(invoice.status)}
                    color={getStatusColor(invoice.status) as any}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Box display="flex" gap={1}>
                    {invoice.status === 'DRAFT' && (
                      <>
                        <Tooltip title="Подтвердить">
                          <IconButton
                            size="small"
                            color="success"
                            onClick={() => handleConfirm(invoice.id)}
                          >
                            <ConfirmIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Редактировать">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenDialog(invoice)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Удалить">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDelete(invoice.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </>
                    )}
                    {(invoice.status === 'CONFIRMED' || invoice.status === 'PARTIALLY_PAID') && (
                      <Tooltip title="Оплатить">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handlePayment(invoice.id)}
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

      {/* Кнопка добавления */}
      <Fab
        color="primary"
        aria-label="add"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => handleOpenDialog()}
      >
        <AddIcon />
      </Fab>

      {/* Диалог создания/редактирования */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingInvoice ? 'Редактирование счета' : 'Создание нового счета'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Номер счета"
                value={formData.invoiceNumber}
                onChange={handleFormChange('invoiceNumber')}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Дата счета"
                type="date"
                value={formData.invoiceDate}
                onChange={handleFormChange('invoiceDate')}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Дата оплаты"
                type="date"
                value={formData.dueDate}
                onChange={handleFormChange('dueDate')}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Общая сумма"
                type="number"
                value={formData.totalAmount}
                onChange={handleFormChange('totalAmount')}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="НДС"
                type="number"
                value={formData.vatAmount}
                onChange={handleFormChange('vatAmount')}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Валюта"
                value={formData.currency}
                onChange={handleFormChange('currency')}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Условия оплаты"
                multiline
                rows={2}
                value={formData.paymentTerms}
                onChange={handleFormChange('paymentTerms')}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Примечания"
                multiline
                rows={3}
                value={formData.notes}
                onChange={handleFormChange('notes')}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Отмена</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingInvoice ? 'Сохранить' : 'Создать'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
} 