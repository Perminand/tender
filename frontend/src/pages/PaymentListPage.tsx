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
  Check as CheckIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';

interface Payment {
  id: number;
  paymentNumber: string;
  contractId: number;
  supplierId: number;
  paymentType: string;
  status: string;
  amount: number;
  dueDate: string;
  paidDate: string;
  invoiceNumber: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

const PaymentListPage: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPaymentId, setSelectedPaymentId] = useState<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/payments');
      const data = await response.json();
      setPayments(data);
    } catch (error) {
      showSnackbar('Ошибка при загрузке платежей', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCreate = () => {
    setEditingPayment(null);
    setDialogOpen(true);
  };

  const handleEdit = (payment: Payment) => {
    setEditingPayment(payment);
    setDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    setSelectedPaymentId(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (selectedPaymentId) {
      try {
        await fetch(`/api/payments/${selectedPaymentId}`, { method: 'DELETE' });
        showSnackbar('Платеж удален', 'success');
        fetchPayments();
      } catch (error) {
        showSnackbar('Ошибка при удалении платежа', 'error');
      } finally {
        setDeleteDialogOpen(false);
        setSelectedPaymentId(null);
      }
    }
  };

  const handleConfirm = async (id: number) => {
    try {
      await fetch(`/api/payments/${id}/confirm`, { method: 'POST' });
      showSnackbar('Платеж подтвержден', 'success');
      fetchPayments();
    } catch (error) {
      showSnackbar('Ошибка при подтверждении платежа', 'error');
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    
    try {
      const submitData = {
        paymentNumber: formData.get('paymentNumber'),
        paymentType: formData.get('paymentType'),
        contractId: Number(formData.get('contractId')),
        supplierId: Number(formData.get('supplierId')),
        amount: Number(formData.get('amount')),
        dueDate: formData.get('dueDate'),
        invoiceNumber: formData.get('invoiceNumber'),
        notes: formData.get('notes'),
      };

      if (editingPayment) {
        await fetch(`/api/payments/${editingPayment.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(submitData),
        });
        showSnackbar('Платеж обновлен', 'success');
      } else {
        await fetch('/api/payments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(submitData),
        });
        showSnackbar('Платеж создан', 'success');
      }
      
      setDialogOpen(false);
      fetchPayments();
    } catch (error) {
      showSnackbar('Ошибка при сохранении платежа', 'error');
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

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Платежи
      </Typography>

      {/* Статистика */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={2}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Всего платежей
              </Typography>
              <Typography variant="h4">
                {stats.total}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={2}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Ожидают оплаты
              </Typography>
              <Typography variant="h4">
                {stats.pending}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={2}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Оплачены
              </Typography>
              <Typography variant="h4">
                {stats.paid}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={2}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Просрочены
              </Typography>
              <Typography variant="h4">
                {stats.overdue}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={2}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Общая сумма
              </Typography>
              <Typography variant="h4">
                {stats.totalAmount?.toLocaleString()} ₽
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={2}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Оплачено
              </Typography>
              <Typography variant="h4">
                {stats.paidAmount?.toLocaleString()} ₽
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Кнопка создания */}
      <Box sx={{ mb: 2 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreate}
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
            {payments.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell>{payment.paymentNumber}</TableCell>
                <TableCell>{payment.contractId}</TableCell>
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
                    onClick={() => handleEdit(payment)}
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
                    onClick={() => handleDelete(payment.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Диалог создания/редактирования */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingPayment ? 'Редактировать платеж' : 'Создать платеж'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  name="paymentNumber"
                  label="Номер платежа"
                  fullWidth
                  required
                  defaultValue={editingPayment?.paymentNumber}
                />
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth required>
                  <InputLabel>Тип платежа</InputLabel>
                  <Select name="paymentType" defaultValue={editingPayment?.paymentType || 'PAYMENT'}>
                    <MenuItem value="ADVANCE">Аванс</MenuItem>
                    <MenuItem value="PAYMENT">Оплата</MenuItem>
                    <MenuItem value="FINAL">Финальная оплата</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <TextField
                  name="contractId"
                  label="ID контракта"
                  type="number"
                  fullWidth
                  required
                  defaultValue={editingPayment?.contractId}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  name="supplierId"
                  label="ID поставщика"
                  type="number"
                  fullWidth
                  required
                  defaultValue={editingPayment?.supplierId}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  name="amount"
                  label="Сумма"
                  type="number"
                  fullWidth
                  required
                  defaultValue={editingPayment?.amount}
                />
              </Grid>
              <Grid item xs={6}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label="Срок оплаты"
                    slotProps={{
                      textField: {
                        name: 'dueDate',
                        fullWidth: true,
                        required: true,
                      },
                    }}
                    defaultValue={editingPayment?.dueDate ? dayjs(editingPayment.dueDate) : null}
                  />
                </LocalizationProvider>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name="invoiceNumber"
                  label="Номер счета"
                  fullWidth
                  defaultValue={editingPayment?.invoiceNumber}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name="notes"
                  label="Примечания"
                  multiline
                  rows={3}
                  fullWidth
                  defaultValue={editingPayment?.notes}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>
              Отмена
            </Button>
            <Button type="submit" variant="contained">
              {editingPayment ? 'Обновить' : 'Создать'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

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
          <Button onClick={handleConfirmDelete} color="error" autoFocus>
            Удалить
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PaymentListPage; 