import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Button, 
  Paper, 
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar,
  Alert
} from '@mui/material';
import { CheckCircle, Cancel, Payment } from '@mui/icons-material';
import { api } from '../utils/api';

const PaymentDetailPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [payment, setPayment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  useEffect(() => {
    if (id) {
      fetchPayment();
    }
  }, [id]);

  const fetchPayment = async () => {
    try {
      const response = await api.get(`/payments/${id}`);
      if (response.ok) {
        const data = await response.json();
        setPayment(data);
      } else {
        showSnackbar('Платеж не найден', 'error');
        navigate('/payments');
      }
    } catch (error) {
      showSnackbar('Ошибка при загрузке платежа', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleConfirm = async () => {
    try {
      const response = await api.post(`/payments/${id}/confirm`);
      if (response.ok) {
        showSnackbar('Платеж подтвержден', 'success');
        setConfirmDialogOpen(false);
        fetchPayment(); // Обновляем данные
      } else {
        showSnackbar('Ошибка при подтверждении платежа', 'error');
      }
    } catch (error) {
      showSnackbar('Ошибка при подтверждении платежа', 'error');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'warning';
      case 'PAID': return 'success';
      case 'OVERDUE': return 'error';
      case 'CANCELLED': return 'default';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING': return 'Ожидает оплаты';
      case 'PAID': return 'Оплачен';
      case 'OVERDUE': return 'Просрочен';
      case 'CANCELLED': return 'Отменен';
      default: return status;
    }
  };

  if (loading) return <div>Загрузка...</div>;
  if (!payment) return <div>Платеж не найден</div>;

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3, mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography variant="h5" gutterBottom>
            Платеж №{payment.paymentNumber}
          </Typography>
          <Chip 
            label={getStatusText(payment.status)} 
            color={getStatusColor(payment.status)}
            size="medium"
          />
        </Box>
        
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 3 }}>
          <Typography><b>Контракт:</b> {payment.contractNumber}</Typography>
          <Typography><b>Поставка:</b> {payment.deliveryNumber || '-'}</Typography>
          <Typography><b>Тип:</b> {payment.paymentType}</Typography>
          <Typography><b>Сумма:</b> {payment.amount?.toLocaleString()} ₽</Typography>
          <Typography><b>Срок оплаты:</b> {payment.dueDate ? new Date(payment.dueDate).toLocaleDateString() : '-'}</Typography>
          <Typography><b>Дата оплаты:</b> {payment.paidDate ? new Date(payment.paidDate).toLocaleDateString() : '-'}</Typography>
          <Typography><b>Счет:</b> {payment.invoiceNumber || '-'}</Typography>
          <Typography><b>Описание:</b> {payment.notes || '-'}</Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
          <Button 
            variant="outlined" 
            onClick={() => navigate(-1)}
          >
            Назад
          </Button>
          
          {payment.status === 'PENDING' && (
            <Button 
              variant="contained" 
              color="success" 
              startIcon={<CheckCircle />}
              onClick={() => setConfirmDialogOpen(true)}
            >
              Подтвердить оплату
            </Button>
          )}
          
          <Button 
            variant="outlined" 
            color="primary"
            onClick={() => navigate(`/payments/${payment.id}/edit`)}
          >
            Редактировать
          </Button>
        </Box>
      </Paper>

      {/* Диалог подтверждения */}
      <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)}>
        <DialogTitle>Подтвердить оплату</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Вы уверены, что хотите подтвердить оплату платежа №{payment.paymentNumber}?
            После подтверждения статус платежа изменится на "Оплачен".
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)}>
            Отмена
          </Button>
          <Button onClick={handleConfirm} color="success" variant="contained">
            Подтвердить
          </Button>
        </DialogActions>
      </Dialog>

      {/* Снэкбар для уведомлений */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={4000} 
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PaymentDetailPage; 