import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Alert,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Check as CheckIcon,
  Close as CloseIcon,
  Edit as EditIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { useParams, useNavigate, Link } from 'react-router-dom';
import dayjs from 'dayjs';
import DeliveryStatusManager from '../components/DeliveryStatusManager';
import { api } from '../utils/api';

interface DeliveryItem {
  id: string;
  deliveryId: string;
  contractItemId: string;
  materialId: string;
  materialName: string;
  description: string;
  itemNumber: number;
  orderedQuantity: number;
  deliveredQuantity?: number;
  acceptedQuantity?: number;
  rejectedQuantity?: number;
  unitId: string;
  unitName: string;
  unitPrice: number;
  totalPrice: number;
  qualityNotes?: string;
  rejectionReason?: string;
  acceptanceStatus?: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'PARTIALLY_ACCEPTED';
}

interface Delivery {
  id: string;
  deliveryNumber: string;
  contractId: string;
  contractNumber?: string;
  contractTitle?: string;
  supplierId: string;
  supplierName?: string;
  warehouseId: string;
  warehouseName?: string;
  status: string;
  plannedDate: string;
  actualDate?: string;
  trackingNumber?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  deliveryItems?: DeliveryItem[];
}

interface Payment {
  id: string;
  paymentNumber: string;
  amount: number;
  status: string;
  dueDate?: string;
  paymentDate?: string;
  description?: string;
}

const DeliveryDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [delivery, setDelivery] = useState<Delivery | null>(null);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [acceptanceDialogOpen, setAcceptanceDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<DeliveryItem | null>(null);
  const [statusManagerOpen, setStatusManagerOpen] = useState(false);
  const [acceptanceData, setAcceptanceData] = useState({
    acceptedQuantity: 0,
    rejectedQuantity: 0,
    qualityNotes: '',
    rejectionReason: ''
  });
  const [payments, setPayments] = useState<Payment[]>([]);

  useEffect(() => {
    if (id) {
      fetchDelivery();
      fetchPayments();
    }
  }, [id]);

  const fetchDelivery = async () => {
    try {
      const response = await api.get(`/api/deliveries/${id}`);
      setDelivery(response.data);
      
      // Загружаем позиции поставки
      try {
        const itemsResponse = await api.get(`/api/deliveries/${id}/items`);
        setDelivery(prev => ({ ...prev, deliveryItems: itemsResponse.data }));
      } catch (itemsError) {
        console.warn('Не удалось загрузить позиции поставки:', itemsError);
        // Если позиции не загрузились, это не критично
      }
    } catch (error) {
      console.error('Ошибка при загрузке поставки:', error);
      showSnackbar('Ошибка при загрузке поставки', 'error');
      navigate('/deliveries');
    } finally {
      setLoading(false);
    }
  };

  const fetchPayments = async () => {
    try {
      const response = await api.get(`/api/payments/delivery/${id}`);
      setPayments(response.data);
    } catch (error) {
      console.warn('Не удалось загрузить платежи для поставки:', error);
      // Если платежи не загрузились, это не критично
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleAcceptance = (item: DeliveryItem) => {
    setSelectedItem(item);
    setAcceptanceData({
      acceptedQuantity: item.acceptedQuantity || 0,
      rejectedQuantity: item.rejectedQuantity || 0,
      qualityNotes: item.qualityNotes || '',
      rejectionReason: item.rejectionReason || ''
    });
    setAcceptanceDialogOpen(true);
  };

  const handleSaveAcceptance = async () => {
    if (!selectedItem) return;

    try {
      const response = await api.put(`/api/deliveries/${id}/items/${selectedItem.id}/acceptance`, {
        acceptedQuantity: acceptanceData.acceptedQuantity,
        rejectedQuantity: acceptanceData.rejectedQuantity,
        qualityNotes: acceptanceData.qualityNotes,
        rejectionReason: acceptanceData.rejectionReason,
      });

      showSnackbar('Приемка сохранена', 'success');
      setAcceptanceDialogOpen(false);
      fetchDelivery(); // Обновляем данные
    } catch (error) {
      console.error('Ошибка при сохранении приемки:', error);
      showSnackbar('Ошибка при сохранении приемки', 'error');
    }
  };

  const handleStatusChange = async (newStatus: string, comment: string) => {
    try {
      const response = await api.patch(`/api/deliveries/${id}/status`, {
        status: newStatus,
        comment: comment
      });

      showSnackbar('Статус поставки изменен', 'success');
      fetchDelivery(); // Обновляем данные
    } catch (error) {
      console.error('Ошибка при изменении статуса:', error);
      showSnackbar('Ошибка при изменении статуса', 'error');
      throw error;
    }
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' } = {
      PLANNED: 'default',
      CONFIRMED: 'primary',
      IN_TRANSIT: 'info',
      ARRIVED: 'warning',
      DELIVERED: 'success',
      ACCEPTED: 'success',
      REJECTED: 'error',
      PARTIALLY_ACCEPTED: 'warning',
      CANCELLED: 'error',
    };
    return colors[status] || 'default';
  };

  const getStatusText = (status: string) => {
    const texts: { [key: string]: string } = {
      PLANNED: 'Запланирована',
      CONFIRMED: 'Подтверждена',
      IN_TRANSIT: 'В пути',
      ARRIVED: 'Прибыла',
      DELIVERED: 'Доставлена',
      ACCEPTED: 'Принята',
      REJECTED: 'Отклонена',
      PARTIALLY_ACCEPTED: 'Частично принята',
      CANCELLED: 'Отменена',
    };
    return texts[status] || status;
  };

  const getAcceptanceStatusColor = (status: string) => {
    const colors: { [key: string]: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' } = {
      PENDING: 'default',
      ACCEPTED: 'success',
      REJECTED: 'error',
      PARTIALLY_ACCEPTED: 'warning',
    };
    return colors[status] || 'default';
  };

  const getAcceptanceStatusText = (status: string) => {
    const texts: { [key: string]: string } = {
      PENDING: 'Ожидает приемки',
      ACCEPTED: 'Принято',
      REJECTED: 'Отклонено',
      PARTIALLY_ACCEPTED: 'Частично принято',
    };
    return texts[status] || status;
  };

  const getPaymentStatusText = (status: string) => {
    const texts: { [key: string]: string } = {
      PENDING: 'Ожидает оплаты',
      APPROVED: 'Одобрен',
      PAID: 'Оплачен',
      OVERDUE: 'Просрочен',
      CANCELLED: 'Отменен',
    };
    return texts[status] || status;
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Загрузка...</Typography>
      </Box>
    );
  }

  if (!delivery) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Поставка не найдена</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Поставка {delivery.deliveryNumber}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<EditIcon />}
            onClick={() => navigate(`/deliveries/${id}/edit`)}
          >
            Редактировать
          </Button>
          <Button
            variant="outlined"
            startIcon={<SettingsIcon />}
            onClick={() => setStatusManagerOpen(true)}
          >
            Управление статусом
          </Button>
        </Box>
      </Box>

      {/* Основная информация */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={6}>
              <Typography variant="h6" gutterBottom>
                Основная информация
              </Typography>
              <Typography><strong>Номер:</strong> {delivery.deliveryNumber}</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography><strong>Статус:</strong></Typography>
                <Chip 
                  label={getStatusText(delivery.status)} 
                  color={getStatusColor(delivery.status)} 
                  size="small"
                />
              </Box>
              <Typography><strong>Контракт:</strong> {delivery.contractNumber ? `${delivery.contractNumber} | ${delivery.contractTitle}` : '-'}</Typography>
              <Typography><strong>Поставщик:</strong> {delivery.supplierName || '-'}</Typography>
              <Typography><strong>Склад:</strong> {delivery.warehouseName || '-'}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="h6" gutterBottom>
                Даты
              </Typography>
              <Typography><strong>Запланирована:</strong> {dayjs(delivery.plannedDate).format('DD.MM.YYYY')}</Typography>
              {delivery.actualDate && (
                <Typography><strong>Фактическая:</strong> {dayjs(delivery.actualDate).format('DD.MM.YYYY')}</Typography>
              )}
              {delivery.trackingNumber && (
                <Typography><strong>Трек номер:</strong> {delivery.trackingNumber}</Typography>
              )}
              {delivery.notes && (
                <Typography><strong>Примечания:</strong> {delivery.notes}</Typography>
              )}
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Позиции поставки */}
      {delivery.deliveryItems && delivery.deliveryItems.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Позиции поставки
            </Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>№</TableCell>
                    <TableCell>Описание</TableCell>
                    <TableCell>Материал</TableCell>
                    <TableCell>Заказано</TableCell>
                    <TableCell>Доставлено</TableCell>
                    <TableCell>Принято</TableCell>
                    <TableCell>Отклонено</TableCell>
                    <TableCell>Ед. изм.</TableCell>
                    <TableCell>Цена за ед.</TableCell>
                    <TableCell>Сумма</TableCell>
                    <TableCell>Статус приемки</TableCell>
                    <TableCell>Действия</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {delivery.deliveryItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.itemNumber}</TableCell>
                      <TableCell>{item.description}</TableCell>
                      <TableCell>{item.materialName}</TableCell>
                      <TableCell>{item.orderedQuantity}</TableCell>
                      <TableCell>{item.deliveredQuantity || 0}</TableCell>
                      <TableCell>{item.acceptedQuantity || 0}</TableCell>
                      <TableCell>{item.rejectedQuantity || 0}</TableCell>
                      <TableCell>{item.unitName}</TableCell>
                      <TableCell>{item.unitPrice?.toLocaleString()} ₽</TableCell>
                      <TableCell>{item.totalPrice?.toLocaleString()} ₽</TableCell>
                      <TableCell>
                        <Chip 
                          label={getAcceptanceStatusText(item.acceptanceStatus || 'PENDING')} 
                          color={getAcceptanceStatusColor(item.acceptanceStatus || 'PENDING')} 
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          startIcon={<EditIcon />}
                          onClick={() => handleAcceptance(item)}
                        >
                          Приемка
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* Платежи по поставке */}
      {payments.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Платежи по поставке
            </Typography>
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Номер</TableCell>
                    <TableCell>Сумма</TableCell>
                    <TableCell>Статус</TableCell>
                    <TableCell>Срок оплаты</TableCell>
                    <TableCell>Действия</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {payments.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>{p.paymentNumber}</TableCell>
                      <TableCell>{p.amount?.toLocaleString()} ₽</TableCell>
                      <TableCell>{getPaymentStatusText(p.status)}</TableCell>
                      <TableCell>{p.dueDate ? dayjs(p.dueDate).format('DD.MM.YYYY') : '-'}</TableCell>
                      <TableCell>
                        <Button component={Link} to={`/payments/${p.id}`} size="small">Подробнее</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* Диалог приемки */}
      <Dialog open={acceptanceDialogOpen} onClose={() => setAcceptanceDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Приемка позиции: {selectedItem?.description}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={6}>
              <TextField
                label="Принятое количество"
                type="number"
                fullWidth
                value={acceptanceData.acceptedQuantity}
                onChange={(e) => setAcceptanceData({
                  ...acceptanceData,
                  acceptedQuantity: Number(e.target.value) || 0
                })}
                inputProps={{ min: 0, max: selectedItem?.orderedQuantity || 0 }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Отклоненное количество"
                type="number"
                fullWidth
                value={acceptanceData.rejectedQuantity}
                onChange={(e) => setAcceptanceData({
                  ...acceptanceData,
                  rejectedQuantity: Number(e.target.value) || 0
                })}
                inputProps={{ min: 0, max: selectedItem?.orderedQuantity || 0 }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Примечания по качеству"
                multiline
                rows={3}
                fullWidth
                value={acceptanceData.qualityNotes}
                onChange={(e) => setAcceptanceData({
                  ...acceptanceData,
                  qualityNotes: e.target.value
                })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Причина отклонения"
                multiline
                rows={3}
                fullWidth
                value={acceptanceData.rejectionReason}
                onChange={(e) => setAcceptanceData({
                  ...acceptanceData,
                  rejectionReason: e.target.value
                })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAcceptanceDialogOpen(false)}>
            Отмена
          </Button>
          <Button onClick={handleSaveAcceptance} variant="contained">
            Сохранить
          </Button>
        </DialogActions>
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

      {/* Диалог управления статусом */}
      <DeliveryStatusManager
        open={statusManagerOpen}
        onClose={() => setStatusManagerOpen(false)}
        currentStatus={delivery.status}
        deliveryNumber={delivery.deliveryNumber}
        onStatusChange={handleStatusChange}
      />
    </Box>
  );
};

export default DeliveryDetailPage; 