import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Card,
  CardContent,
  Grid,
  Typography,
  IconButton,
  Box,
  Alert,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  DialogContentText
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Check as CheckIcon,
  FileUpload as FileUploadIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import { api } from '../utils/api';

interface DeliveryRef {
  id: string;
  deliveryNumber?: string;
}
interface Payment {
  id: number;
  paymentNumber: string;
  contractId: number;
  contractNumber?: string;
  supplierId: number;
  supplierName?: string;
  paymentType: string;
  status: string;
  amount: number;
  dueDate: string;
  paidDate: string;
  invoiceNumber: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
  delivery?: DeliveryRef | null;
  deliveryNumber?: string;
}

const PaymentListPage: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPaymentId, setSelectedPaymentId] = useState<number | null>(null);
  const [statusStats, setStatusStats] = useState<{ [key: string]: number }>({});
  const [statusFilter, setStatusFilter] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/payments');
      setPayments(response.data);
    } catch (error) {
      console.error('Ошибка при загрузке платежей:', error);
      showSnackbar('Ошибка при загрузке платежей', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleDelete = async () => {
    if (selectedPaymentId) {
      try {
        await api.delete(`/api/payments/${selectedPaymentId}`);
        showSnackbar('Платеж удален', 'success');
        fetchPayments();
      } catch (error) {
        console.error('Ошибка при удалении платежа:', error);
        showSnackbar('Ошибка при удалении платежа', 'error');
      } finally {
        setDeleteDialogOpen(false);
        setSelectedPaymentId(null);
      }
    }
  };

  const openDeleteDialog = (id: number) => {
    setSelectedPaymentId(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirm = async (id: number) => {
    try {
      await api.post(`/api/payments/${id}/confirm`);
      showSnackbar('Платеж подтвержден', 'success');
      fetchPayments();
    } catch (error) {
      console.error('Ошибка при подтверждении платежа:', error);
      showSnackbar('Ошибка при подтверждении платежа', 'error');
    }
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' } = {
      PENDING: 'warning',
      PAID: 'success',
      OVERDUE: 'error',
      CANCELLED: 'default',
    };
    return colors[status] || 'default';
  };

  const getStatusText = (status: string) => {
    const texts: { [key: string]: string } = {
      PENDING: 'Ожидает оплаты',
      PAID: 'Оплачен',
      OVERDUE: 'Просрочен',
      CANCELLED: 'Отменен',
    };
    return texts[status] || status;
  };

  const getPaymentTypeText = (type: string) => {
    const texts: { [key: string]: string } = {
      ADVANCE: 'Аванс',
      PAYMENT: 'Оплата',
      FINAL: 'Финальная оплата',
    };
    return texts[type] || type;
  };

  const stats = {
    total: payments.length,
    pending: payments.filter(p => p.status === 'PENDING').length,
    paid: payments.filter(p => p.status === 'PAID').length,
    overdue: payments.filter(p => p.status === 'OVERDUE').length,
    totalAmount: payments.reduce((sum, p) => sum + (p.amount || 0), 0),
    paidAmount: payments
      .filter(p => p.status === 'PAID')
      .reduce((sum, p) => sum + (p.amount || 0), 0),
  };

  // Загрузка статистики по статусам
  const fetchStatusStats = async () => {
    try {
      const response = await api.get('/api/payments/status-stats');
      const data = response.data;
        setStatusStats(data);
    } catch (error) {
      console.error('Ошибка при загрузке статистики статусов:', error);
      }
  };
  useEffect(() => { fetchStatusStats(); }, []);
  const reloadAll = () => { fetchPayments(); fetchStatusStats(); };

  const handleExportExcel = async () => {
    try {
      const response = await api.get('/api/payment-registry/export', {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Реестр_платежей.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Ошибка при экспорте:', error);
      showSnackbar('Ошибка при экспорте в Excel', 'error');
    }
  };

  // Фильтрация платежей по статусу
  const filteredPayments = statusFilter ? payments.filter(p => p.status === statusFilter) : payments;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Платежи
        </Typography>
        <Button
          variant="outlined"
          startIcon={<FileUploadIcon />}
          onClick={handleExportExcel}
        >
          Экспорт в Excel
        </Button>
      </Box>

      {/* Статистика */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={2}>
          <Card sx={{ cursor: 'pointer', backgroundColor: statusFilter === '' ? 'action.selected' : undefined, '&:hover': { backgroundColor: 'action.hover' } }} onClick={() => setStatusFilter('')}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Всего платежей
              </Typography>
              <Typography variant="h4">
                {Object.values(statusStats).reduce((a, b) => a + b, 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={2}>
          <Card sx={{ cursor: 'pointer', backgroundColor: statusFilter === 'PENDING' ? 'action.selected' : undefined, '&:hover': { backgroundColor: 'action.hover' } }} onClick={() => setStatusFilter('PENDING')}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Ожидают оплаты
              </Typography>
              <Typography variant="h4">
                {statusStats.PENDING || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={2}>
          <Card sx={{ cursor: 'pointer', backgroundColor: statusFilter === 'PAID' ? 'action.selected' : undefined, '&:hover': { backgroundColor: 'action.hover' } }} onClick={() => setStatusFilter('PAID')}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Оплачены
              </Typography>
              <Typography variant="h4">
                {statusStats.PAID || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={2}>
          <Card sx={{ cursor: 'pointer', backgroundColor: statusFilter === 'OVERDUE' ? 'action.selected' : undefined, '&:hover': { backgroundColor: 'action.hover' } }} onClick={() => setStatusFilter('OVERDUE')}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Просрочены
              </Typography>
              <Typography variant="h4">
                {statusStats.OVERDUE || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={2}>
          <Card sx={{ cursor: 'pointer', backgroundColor: statusFilter === 'CANCELLED' ? 'action.selected' : undefined, '&:hover': { backgroundColor: 'action.hover' } }} onClick={() => setStatusFilter('CANCELLED')}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Отменены
              </Typography>
              <Typography variant="h4">
                {statusStats.CANCELLED || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Панель фильтров */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Статус</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  label="Статус"
                >
                  <MenuItem value="">Все статусы</MenuItem>
                  <MenuItem value="PENDING">Ожидает оплаты</MenuItem>
                  <MenuItem value="PAID">Оплачен</MenuItem>
                  <MenuItem value="OVERDUE">Просрочен</MenuItem>
                  <MenuItem value="CANCELLED">Отменён</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={2}>
              <TextField
                label="Номер платежа"
                size="small"
                fullWidth
                value={''}
                // TODO: добавить фильтр по номеру платежа при необходимости
                disabled
              />
            </Grid>
            <Grid item xs={2}>
              <TextField
                label="Поставщик"
                size="small"
                fullWidth
                value={''}
                // TODO: добавить фильтр по поставщику при необходимости
                disabled
              />
            </Grid>
            <Grid item xs={2}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="Дата от"
                  value={null}
                  onChange={() => {}}
                  format="DD.MM.YYYY"
                  slotProps={{
                    textField: {
                      size: 'small',
                      fullWidth: true,
                    },
                  }}
                  disabled
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={2}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="Дата до"
                  value={null}
                  onChange={() => {}}
                  format="DD.MM.YYYY"
                  slotProps={{
                    textField: {
                      size: 'small',
                      fullWidth: true,
                    },
                  }}
                  disabled
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={2}>
              <Button
                variant="outlined"
                onClick={() => setStatusFilter('')}
                fullWidth
              >
                Очистить фильтры
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Кнопка создания */}
      <Box sx={{ mb: 2 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/payments/new')}
        >
          Создать платеж
        </Button>
      </Box>

      {/* Таблица */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Номер</TableCell>
              <TableCell>Контракт</TableCell>
              <TableCell>Поставщик</TableCell>
              <TableCell>Поставка</TableCell>
              <TableCell>Тип</TableCell>
              <TableCell>Статус</TableCell>
              <TableCell>Сумма</TableCell>
              <TableCell>Срок оплаты</TableCell>
              <TableCell>Дата оплаты</TableCell>
              <TableCell>Счет</TableCell>
              <TableCell>Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredPayments.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell>{payment.paymentNumber}</TableCell>
                <TableCell>{payment.contractNumber || payment.contractId}</TableCell>
                <TableCell>{payment.supplierName || payment.supplierId}</TableCell>
                <TableCell>
                  {payment.deliveryNumber ? (
                    <Button
                      size="small"
                      variant="text"
                      onClick={() => navigate(`/deliveries/${payment.delivery?.id}`)}
                    >
                      {payment.deliveryNumber}
                    </Button>
                  ) : (
                    <span style={{ color: '#aaa' }}>-</span>
                  )}
                </TableCell>
                <TableCell>{getPaymentTypeText(payment.paymentType)}</TableCell>
                <TableCell>
                  <Chip
                    label={getStatusText(payment.status)}
                    color={getStatusColor(payment.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>{payment.amount?.toLocaleString()} ₽</TableCell>
                <TableCell>
                  {payment.dueDate ? dayjs(payment.dueDate).format('DD.MM.YYYY') : '-'}
                </TableCell>
                <TableCell>
                  {payment.paidDate ? dayjs(payment.paidDate).format('DD.MM.YYYY') : '-'}
                </TableCell>
                <TableCell>{payment.invoiceNumber}</TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={() => navigate(`/payments/${payment.id}`)}
                  >
                    <VisibilityIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => navigate(`/payments/${payment.id}/edit`)}
                  >
                    <EditIcon />
                  </IconButton>
                  {payment.status === 'PENDING' && (
                    <IconButton
                      size="small"
                      color="success"
                      onClick={() => handleConfirm(payment.id)}
                    >
                      <CheckIcon />
                    </IconButton>
                  )}
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => openDeleteDialog(payment.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Снэкбар для уведомлений */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Диалог подтверждения удаления */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          Подтверждение удаления
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Вы уверены, что хотите удалить этот платеж? Это действие нельзя будет отменить.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="primary">
            Отмена
          </Button>
          <Button onClick={handleDelete} color="error" autoFocus>
            Удалить
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PaymentListPage; 