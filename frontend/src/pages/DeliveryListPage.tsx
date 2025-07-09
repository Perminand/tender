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
  MenuItem
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Check as CheckIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import dayjs, { Dayjs } from 'dayjs';

interface Delivery {
  id: number;
  deliveryNumber: string;
  contractId: number;
  supplierId: number;
  warehouseId: number;
  status: string;
  plannedDate: string;
  actualDate: string;
  trackingNumber: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

const DeliveryListPage: React.FC = () => {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
  const [editingDelivery, setEditingDelivery] = useState<Delivery | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const navigate = useNavigate();

  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [contracts, setContracts] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);

  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [selectedContractId, setSelectedContractId] = useState('');
  const [selectedWarehouseId, setSelectedWarehouseId] = useState('');
  const [plannedDate, setPlannedDate] = useState<Dayjs | null>(null);

  // Подгружаем списки при открытии диалога
  useEffect(() => {
    if (dialogOpen) {
      fetch('/api/companies?role=SUPPLIER').then(res => res.json()).then(setSuppliers);
      fetch('/api/contracts').then(res => res.json()).then(setContracts);
      fetch('/api/warehouses').then(res => res.json()).then(setWarehouses);
    }
  }, [dialogOpen]);

  // При редактировании заполняем выбранные значения
  useEffect(() => {
    if (editingDelivery) {
      setSelectedSupplierId(editingDelivery.supplierId?.toString() || '');
      setSelectedContractId(editingDelivery.contractId?.toString() || '');
      setSelectedWarehouseId(editingDelivery.warehouseId?.toString() || '');
    } else {
      setSelectedSupplierId('');
      setSelectedContractId('');
      setSelectedWarehouseId('');
    }
  }, [editingDelivery, dialogOpen]);

  // При открытии диалога или редактировании заполняем plannedDate
  useEffect(() => {
    if (editingDelivery) {
      setPlannedDate(editingDelivery.plannedDate ? dayjs(editingDelivery.plannedDate) : null);
    } else {
      setPlannedDate(null);
    }
  }, [editingDelivery, dialogOpen]);

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const fetchDeliveries = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/deliveries');
      const data = await response.json();
      setDeliveries(data);
    } catch (error) {
      showSnackbar('Ошибка при загрузке поставок', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCreate = () => {
    setEditingDelivery(null);
    setDialogOpen(true);
  };

  const handleEdit = (delivery: Delivery) => {
    setEditingDelivery(delivery);
    setDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await fetch(`/api/deliveries/${id}`, { method: 'DELETE' });
      showSnackbar('Поставка удалена', 'success');
      fetchDeliveries();
    } catch (error) {
      showSnackbar('Ошибка при удалении поставки', 'error');
    }
  };

  const handleConfirm = async (id: number) => {
    try {
      await fetch(`/api/deliveries/${id}/confirm`, { method: 'POST' });
      showSnackbar('Поставка подтверждена', 'success');
      fetchDeliveries();
    } catch (error) {
      showSnackbar('Ошибка при подтверждении поставки', 'error');
    }
  };

  const handleReject = async () => {
    if (!selectedDelivery || !rejectReason.trim()) return;
    
    try {
      await fetch(`/api/deliveries/${selectedDelivery.id}/reject?reason=${encodeURIComponent(rejectReason)}`, { 
        method: 'POST' 
      });
      showSnackbar('Поставка отклонена', 'success');
      setRejectDialogOpen(false);
      setRejectReason('');
      setSelectedDelivery(null);
      fetchDeliveries();
    } catch (error) {
      showSnackbar('Ошибка при отклонении поставки', 'error');
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    
    try {
      const submitData = {
        deliveryNumber: formData.get('deliveryNumber'),
        contractId: Number(selectedContractId),
        supplierId: Number(selectedSupplierId),
        warehouseId: Number(selectedWarehouseId),
        plannedDate: plannedDate ? plannedDate.format('YYYY-MM-DD') : null,
        trackingNumber: formData.get('trackingNumber'),
        notes: formData.get('notes'),
      };

      if (editingDelivery) {
        await fetch(`/api/deliveries/${editingDelivery.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(submitData),
        });
        showSnackbar('Поставка обновлена', 'success');
      } else {
        await fetch('/api/deliveries', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(submitData),
        });
        showSnackbar('Поставка создана', 'success');
      }
      
      setDialogOpen(false);
      fetchDeliveries();
    } catch (error) {
      showSnackbar('Ошибка при сохранении поставки', 'error');
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

  const stats = {
    total: deliveries.length,
    planned: deliveries.filter(d => d.status === 'PLANNED').length,
    inTransit: deliveries.filter(d => d.status === 'IN_TRANSIT').length,
    arrived: deliveries.filter(d => d.status === 'ARRIVED').length,
    accepted: deliveries.filter(d => d.status === 'ACCEPTED').length,
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Поставки
      </Typography>

      {/* Статистика */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={2.4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Всего поставок
              </Typography>
              <Typography variant="h4">
                {stats.total}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={2.4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Запланированные
              </Typography>
              <Typography variant="h4">
                {stats.planned}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={2.4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                В пути
              </Typography>
              <Typography variant="h4">
                {stats.inTransit}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={2.4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Прибыли
              </Typography>
              <Typography variant="h4">
                {stats.arrived}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={2.4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Приняты
              </Typography>
              <Typography variant="h4">
                {stats.accepted}
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
          Создать поставку
        </Button>
      </Box>

      {/* Таблица */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Номер</TableCell>
              <TableCell>Контракт</TableCell>
              <TableCell>Статус</TableCell>
              <TableCell>Запланированная дата</TableCell>
              <TableCell>Фактическая дата</TableCell>
              <TableCell>Трек номер</TableCell>
              <TableCell>Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {deliveries.map((delivery) => (
              <TableRow key={delivery.id}>
                <TableCell>{delivery.deliveryNumber}</TableCell>
                <TableCell>
                  {(() => {
                    const contract = contracts.find(c => c.id === delivery.contractId || c.id === String(delivery.contractId));
                    return contract
                      ? `${contract.contractNumber} | ${contract.supplier?.shortName || contract.supplier?.name}`
                      : delivery.contractId;
                  })()}
                </TableCell>
                <TableCell>
                  <Chip
                    label={getStatusText(delivery.status)}
                    color={getStatusColor(delivery.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {delivery.plannedDate ? dayjs(delivery.plannedDate).format('DD.MM.YYYY') : '-'}
                </TableCell>
                <TableCell>
                  {delivery.actualDate ? dayjs(delivery.actualDate).format('DD.MM.YYYY') : '-'}
                </TableCell>
                <TableCell>{delivery.trackingNumber}</TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={() => navigate(`/deliveries/${delivery.id}`)}
                  >
                    <VisibilityIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleEdit(delivery)}
                  >
                    <EditIcon />
                  </IconButton>
                  {delivery.status === 'ARRIVED' && (
                    <>
                      <IconButton
                        size="small"
                        color="success"
                        onClick={() => handleConfirm(delivery.id)}
                      >
                        <CheckIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => {
                          setSelectedDelivery(delivery);
                          setRejectDialogOpen(true);
                        }}
                      >
                        <CloseIcon />
                      </IconButton>
                    </>
                  )}
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDelete(delivery.id)}
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
          {editingDelivery ? 'Редактировать поставку' : 'Создать поставку'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  name="deliveryNumber"
                  label="Номер поставки"
                  fullWidth
                  required
                  defaultValue={editingDelivery?.deliveryNumber}
                />
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth required>
                  <InputLabel>Контракт</InputLabel>
                  <Select
                    value={selectedContractId}
                    onChange={e => setSelectedContractId(e.target.value)}
                    label="Контракт"
                  >
                    {contracts.map(c => (
                      <MenuItem key={c.id} value={c.id}>
                        {c.contractNumber} | {c.supplier?.shortName || c.supplier?.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth required>
                  <InputLabel>Поставщик</InputLabel>
                  <Select
                    value={selectedSupplierId}
                    onChange={e => setSelectedSupplierId(e.target.value)}
                    label="Поставщик"
                  >
                    {suppliers.map(s => (
                      <MenuItem key={s.id} value={s.id}>
                        {s.shortName || s.legalName || s.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth required>
                  <InputLabel>Склад</InputLabel>
                  <Select
                    value={selectedWarehouseId}
                    onChange={e => setSelectedWarehouseId(e.target.value)}
                    label="Склад"
                  >
                    {warehouses.map(w => (
                      <MenuItem key={w.id} value={w.id}>
                        {w.name} {w.project ? `| ${w.project.name}` : ''}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label="Запланированная дата"
                    value={plannedDate}
                    onChange={setPlannedDate}
                    slotProps={{
                      textField: {
                        name: 'plannedDate',
                        fullWidth: true,
                        required: true,
                      },
                    }}
                  />
                </LocalizationProvider>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name="trackingNumber"
                  label="Трек номер"
                  fullWidth
                  defaultValue={editingDelivery?.trackingNumber}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name="notes"
                  label="Примечания"
                  multiline
                  rows={3}
                  fullWidth
                  defaultValue={editingDelivery?.notes}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>
              Отмена
            </Button>
            <Button type="submit" variant="contained">
              {editingDelivery ? 'Обновить' : 'Создать'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Диалог отклонения */}
      <Dialog open={rejectDialogOpen} onClose={() => setRejectDialogOpen(false)}>
        <DialogTitle>Отклонить поставку</DialogTitle>
        <DialogContent>
          <TextField
            label="Причина отклонения"
            multiline
            rows={3}
            fullWidth
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectDialogOpen(false)}>
            Отмена
          </Button>
          <Button onClick={handleReject} variant="contained" color="error">
            Отклонить
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

export default DeliveryListPage; 