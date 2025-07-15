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
  Edit as EditIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

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
  supplierId: string;
  warehouseId: string;
  status: string;
  plannedDate: string;
  actualDate?: string;
  trackingNumber?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  deliveryItems?: DeliveryItem[];
  contract?: {
    contractNumber: string;
    title: string;
    supplier?: {
      name: string;
      shortName?: string;
    };
  };
  supplier?: {
    name: string;
    shortName?: string;
  };
  warehouse?: {
    name: string;
  };
}

const DeliveryDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [delivery, setDelivery] = useState<Delivery | null>(null);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [acceptanceDialogOpen, setAcceptanceDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<DeliveryItem | null>(null);
  const [acceptanceData, setAcceptanceData] = useState({
    acceptedQuantity: 0,
    rejectedQuantity: 0,
    qualityNotes: '',
    rejectionReason: ''
  });

  useEffect(() => {
    if (id) {
      fetchDelivery();
    }
  }, [id]);

  const fetchDelivery = async () => {
    try {
      const response = await fetch(`/api/deliveries/${id}`);
      if (response.ok) {
        const data = await response.json();
        setDelivery(data);
      } else {
        showSnackbar('Поставка не найдена', 'error');
        navigate('/deliveries');
      }
    } catch (error) {
      showSnackbar('Ошибка при загрузке поставки', 'error');
    } finally {
      setLoading(false);
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
      const response = await fetch(`/api/deliveries/${id}/items/${selectedItem.id}/acceptance`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(acceptanceData),
      });

      if (response.ok) {
        showSnackbar('Приемка сохранена', 'success');
        setAcceptanceDialogOpen(false);
        fetchDelivery(); // Обновляем данные
      } else {
        showSnackbar('Ошибка при сохранении приемки', 'error');
      }
    } catch (error) {
      showSnackbar('Ошибка при сохранении приемки', 'error');
    }
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' } = {
      PLANNED: 'default',
      IN_TRANSIT: 'info',
      ARRIVED: 'warning',
      ACCEPTED: 'success',
      REJECTED: 'error',
    };
    return colors[status] || 'default';
  };

  const getStatusText = (status: string) => {
    const texts: { [key: string]: string } = {
      PLANNED: 'Запланирована',
      IN_TRANSIT: 'В пути',
      ARRIVED: 'Прибыла',
      ACCEPTED: 'Принята',
      REJECTED: 'Отклонена',
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
      <Typography variant="h4" gutterBottom>
        Поставка {delivery.deliveryNumber}
      </Typography>

      {/* Основная информация */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={6}>
              <Typography variant="h6" gutterBottom>
                Основная информация
              </Typography>
              <Typography><strong>Номер:</strong> {delivery.deliveryNumber}</Typography>
              <Typography><strong>Статус:</strong> 
                <Chip 
                  label={getStatusText(delivery.status)} 
                  color={getStatusColor(delivery.status)} 
                  size="small" 
                  sx={{ ml: 1 }}
                />
              </Typography>
              <Typography><strong>Контракт:</strong> {delivery.contract?.contractNumber}</Typography>
              <Typography><strong>Поставщик:</strong> {delivery.supplier?.shortName || delivery.supplier?.name}</Typography>
              <Typography><strong>Склад:</strong> {delivery.warehouse?.name}</Typography>
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
    </Box>
  );
};

export default DeliveryDetailPage; 