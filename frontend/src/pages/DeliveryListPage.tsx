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
  Close as CloseIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
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
  deliveryItems?: DeliveryItem[];
}

interface ContractItem {
  id: string;
  contractId: string;
  materialId: string;
  materialName: string;
  description: string;
  quantity: number;
  unitId: string;
  unitName: string;
  unitPrice: number;
  totalPrice: number;
}

interface DeliveryItem {
  id?: string;
  deliveryId?: string;
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

interface Contract {
  id: string;
  contractNumber: string;
  title: string;
  tenderId: string;
  supplierId: string;
  customerId: string;
  status: string;
  totalAmount: number;
  startDate: string;
  endDate: string;
  terms: string;
  description: string;
  paymentTerms: string;
  deliveryTerms: string;
  warrantyTerms: string;
  specialConditions: string;
  currency: string;
  createdAt: string;
  updatedAt: string;
  contractItems: ContractItem[];
  warehouseId?: string;
  warehouseName?: string;
  supplier?: {
    name: string;
    shortName: string;
  };
  customer?: {
    name: string;
    shortName: string;
  };
  tender?: {
    awardedSupplierId?: string;
    awardedSupplier?: {
      name: string;
      shortName: string;
    };
    customer?: {
      name: string;
      shortName: string;
    };
  };
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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedDeliveryId, setSelectedDeliveryId] = useState<number | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);

  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [selectedContractId, setSelectedContractId] = useState('');
  const [selectedWarehouseId, setSelectedWarehouseId] = useState('');
  const [plannedDate, setPlannedDate] = useState<Dayjs | null>(null);

  // Состояние для позиций контракта и поставки
  const [contractItems, setContractItems] = useState<ContractItem[]>([]);
  const [deliveryItems, setDeliveryItems] = useState<DeliveryItem[]>([]);
  const [selectedContract, setSelectedContract] = useState<any>(null);

  // Подгружаем списки при открытии диалога
  useEffect(() => {
    if (dialogOpen) {
      fetch('/api/companies?role=SUPPLIER').then(res => res.json()).then(setSuppliers);
      fetch('/api/contracts').then(res => res.json()).then(setContracts);
      fetch('/api/warehouses').then(res => res.json()).then(setWarehouses);
    }
  }, [dialogOpen]);

  // Получаем contractId из query string
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const contractIdFromQuery = params.get('contractId');
    if (contractIdFromQuery) {
      setSelectedContractId(contractIdFromQuery);
    }
  }, [location.search]);

  // При выборе контракта — подставлять supplierId и warehouseId (после загрузки контрактов и поставщиков)
  useEffect(() => {
    if (selectedContractId && contracts.length > 0 && suppliers.length > 0) {
      const contract = contracts.find(c => String(c.id) === String(selectedContractId));
      let supplierId = contract?.supplierId;
      if (!supplierId && contract?.tender) {
        supplierId = contract.tender.awardedSupplierId || contract.tender.awardedSupplier?.id;
      }
      if (supplierId) {
        const supplier = suppliers.find(s => String(s.id) === String(supplierId));
        if (supplier) {
          setSelectedSupplierId(String(supplier.id));
        }
      }
      
      // Устанавливаем склад из контракта
      if (contract?.warehouseId) {
        setSelectedWarehouseId(String(contract.warehouseId));
      }
    }
  }, [selectedContractId, contracts, suppliers]);

  // Загружаем позиции контракта при выборе контракта
  useEffect(() => {
    if (selectedContractId && selectedContractId !== '') {
      fetch(`/api/contracts/${selectedContractId}/items`)
        .then(res => res.json())
        .then((items: ContractItem[]) => {
          setContractItems(items);
          // Инициализируем позиции поставки на основе позиций контракта
          const initialDeliveryItems: DeliveryItem[] = items.map((item, index) => ({
            contractItemId: item.id,
            materialId: item.materialId,
            materialName: item.materialName,
            description: item.description,
            itemNumber: index + 1,
            orderedQuantity: 0, // Пользователь сам укажет количество
            unitId: item.unitId,
            unitName: item.unitName,
            unitPrice: item.unitPrice,
            totalPrice: 0,
            acceptanceStatus: 'PENDING'
          }));
          setDeliveryItems(initialDeliveryItems);
        })
        .catch(error => {
          console.error('Ошибка при загрузке позиций контракта:', error);
          setContractItems([]);
          setDeliveryItems([]);
        });
    } else {
      setContractItems([]);
      setDeliveryItems([]);
    }
  }, [selectedContractId]);

  // При редактировании заполняем выбранные значения
  useEffect(() => {
    if (editingDelivery) {
      setSelectedSupplierId(editingDelivery.supplierId?.toString() || '');
      setSelectedContractId(editingDelivery.contractId?.toString() || '');
      setSelectedWarehouseId(editingDelivery.warehouseId?.toString() || '');
      // Загружаем позиции поставки для редактирования
      if (editingDelivery.id) {
        fetch(`/api/deliveries/${editingDelivery.id}/items`)
          .then(res => res.json())
          .then(setDeliveryItems)
          .catch(error => {
            console.error('Ошибка при загрузке позиций поставки:', error);
            setDeliveryItems([]);
          });
      }
    } else {
      setSelectedSupplierId('');
      setSelectedContractId('');
      setSelectedWarehouseId('');
      setDeliveryItems([]);
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
    setSelectedDeliveryId(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (selectedDeliveryId) {
      try {
        await fetch(`/api/deliveries/${selectedDeliveryId}`, { method: 'DELETE' });
        showSnackbar('Поставка удалена', 'success');
        fetchDeliveries();
      } catch (error) {
        showSnackbar('Ошибка при удалении поставки', 'error');
      } finally {
        setDeleteDialogOpen(false);
        setSelectedDeliveryId(null);
      }
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
    
    // Фильтруем позиции с ненулевым количеством
    const itemsToSubmit = deliveryItems.filter(item => item.orderedQuantity > 0);
    
    if (itemsToSubmit.length === 0) {
      showSnackbar('Укажите количество хотя бы для одной позиции', 'error');
      return;
    }
    
    try {
      const submitData = {
        deliveryNumber: formData.get('deliveryNumber'),
        contractId: Number(selectedContractId),
        supplierId: Number(selectedSupplierId),
        warehouseId: Number(selectedWarehouseId),
        plannedDate: plannedDate ? plannedDate.format('YYYY-MM-DD') : null,
        trackingNumber: formData.get('trackingNumber'),
        notes: formData.get('notes'),
        deliveryItems: itemsToSubmit
      };

      const url = editingDelivery 
        ? `/api/deliveries/${editingDelivery.id}` 
        : '/api/deliveries';
      
      const method = editingDelivery ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        showSnackbar(
          editingDelivery ? 'Поставка обновлена' : 'Поставка создана', 
          'success'
        );
        setDialogOpen(false);
        fetchDeliveries();
      } else {
        showSnackbar('Ошибка при сохранении поставки', 'error');
      }
    } catch (error) {
      showSnackbar('Ошибка при сохранении поставки', 'error');
    }
  };

  // Функция для обновления количества в позиции поставки
  const handleQuantityChange = (index: number, quantity: number) => {
    const updatedItems = [...deliveryItems];
    updatedItems[index] = {
      ...updatedItems[index],
      orderedQuantity: quantity,
      totalPrice: quantity * updatedItems[index].unitPrice
    };
    setDeliveryItems(updatedItems);
  };

  // Функция для получения статистики по позиции контракта
  const getContractItemStats = (contractItemId: string) => {
    // Здесь можно добавить логику для получения статистики поставок по позиции
    // Пока возвращаем базовые значения
    return {
      totalOrdered: 0,
      totalDelivered: 0,
      totalAccepted: 0,
      totalRejected: 0
    };
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
                      ? `${contract.contractNumber} | ${contract.tender?.awardedSupplier?.shortName || contract.tender?.awardedSupplier?.name || contract.tender?.awardedSupplierId}`
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
                {selectedContractId ? (
                  <TextField
                    label="Поставщик"
                    value={(() => {
                      const supplier = suppliers.find(s => String(s.id) === String(selectedSupplierId));
                      return supplier ? (supplier.shortName || supplier.legalName || supplier.name) : '';
                    })()}
                    fullWidth
                    InputProps={{ readOnly: true }}
                    disabled
                  />
                ) : (
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
                )}
                {/* Скрытое поле для supplierId, чтобы оно отправлялось в submitData */}
                {selectedContractId && (
                  <input type="hidden" name="supplierId" value={selectedSupplierId} />
                )}
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth required>
                  <InputLabel>Склад</InputLabel>
                  <Select
                    value={selectedWarehouseId}
                    onChange={e => setSelectedWarehouseId(e.target.value)}
                    label="Склад"
                    disabled={!!selectedContractId && !!selectedWarehouseId} // Блокируем, если контракт выбран и склад определён
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
              
              {/* Позиции поставки */}
              {contractItems.length > 0 && (
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                    Позиции поставки
                  </Typography>
                  <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>№</TableCell>
                          <TableCell>Описание</TableCell>
                          <TableCell>Материал</TableCell>
                          <TableCell>По контракту</TableCell>
                          <TableCell>Количество</TableCell>
                          <TableCell>Ед. изм.</TableCell>
                          <TableCell>Цена за ед.</TableCell>
                          <TableCell>Сумма</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {deliveryItems.map((item, index) => {
                          const contractItem = contractItems.find(ci => ci.id === item.contractItemId);
                          const stats = getContractItemStats(item.contractItemId);
                          const remainingQuantity = (contractItem?.quantity || 0) - stats.totalOrdered;
                          
                          return (
                            <TableRow key={index}>
                              <TableCell>{item.itemNumber}</TableCell>
                              <TableCell>{item.description}</TableCell>
                              <TableCell>{item.materialName}</TableCell>
                              <TableCell>
                                <Typography variant="body2" color="textSecondary">
                                  {contractItem?.quantity || 0} {contractItem?.unitName}
                                </Typography>
                                <Typography variant="caption" color="textSecondary">
                                  Осталось: {Math.max(0, remainingQuantity)} {contractItem?.unitName}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <TextField
                                  type="number"
                                  size="small"
                                  value={item.orderedQuantity}
                                  onChange={(e) => handleQuantityChange(index, Number(e.target.value) || 0)}
                                  inputProps={{ 
                                    min: 0, 
                                    max: remainingQuantity,
                                    step: 0.01
                                  }}
                                  sx={{ width: 100 }}
                                />
                              </TableCell>
                              <TableCell>{item.unitName}</TableCell>
                              <TableCell>{item.unitPrice?.toLocaleString()} ₽</TableCell>
                              <TableCell>
                                <Typography variant="body2" fontWeight="bold">
                                  {item.totalPrice?.toLocaleString()} ₽
                                </Typography>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  <Box sx={{ mt: 2, textAlign: 'right' }}>
                    <Typography variant="h6">
                      Итого: {deliveryItems.reduce((sum, item) => sum + (item.totalPrice || 0), 0).toLocaleString()} ₽
                    </Typography>
                  </Box>
                </Grid>
              )}
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
            Вы уверены, что хотите удалить эту поставку? Это действие нельзя будет отменить.
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

export default DeliveryListPage; 