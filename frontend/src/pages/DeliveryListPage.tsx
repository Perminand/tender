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
  DialogContentText,
  TablePagination,
  Collapse,
  Divider,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Settings as SettingsIcon,
  Payment as PaymentIcon,
  FileUpload as FileUploadIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import dayjs, { Dayjs } from 'dayjs';
import DeliveryStatusManager from '../components/DeliveryStatusManager';
import { api } from '../utils/api';
import ResponsiveTable from '../components/ResponsiveTable';

interface Delivery {
  id: number;
  deliveryNumber: string;
  contractId: number;
  contractNumber?: string;
  contractTitle?: string;
  supplierId: number;
  supplierName?: string;
  warehouseId: number;
  warehouseName?: string;
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
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
  const [statusManagerOpen, setStatusManagerOpen] = useState(false);
  const [selectedDeliveryForStatus, setSelectedDeliveryForStatus] = useState<Delivery | null>(null);
  const [filters, setFilters] = useState({
    status: '',
    contractId: '',
    supplierId: '',
    dateFrom: null as Dayjs | null,
    dateTo: null as Dayjs | null,
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
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

  const [statusStats, setStatusStats] = useState<{ [key: string]: number }>({});
  const [createPaymentDialogOpen, setCreatePaymentDialogOpen] = useState(false);
  const [selectedDeliveryForPayment, setSelectedDeliveryForPayment] = useState<Delivery | null>(null);

  // Подгружаем списки при открытии диалога
  useEffect(() => {
    if (dialogOpen) {
      api.get('/api/companies?role=SUPPLIER').then(res => setSuppliers(Array.isArray(res.data) ? res.data : []));
      api.get('/api/contracts').then(res => setContracts(res.data));
      api.get('/api/warehouses').then(res => setWarehouses(res.data));
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
      console.log('Selected contract:', contract);
      
      // Получаем supplierId из тендера
      let supplierId = null;
      if (contract?.tender?.awardedSupplierId) {
        supplierId = contract.tender.awardedSupplierId;
        console.log('Found awardedSupplierId:', supplierId);
      }
      
      if (supplierId) {
        const supplier = suppliers.find(s => String(s.id) === String(supplierId));
        if (supplier) {
          setSelectedSupplierId(String(supplier.id));
          console.log('Set selected supplier ID:', supplier.id);
        }
      }
      
      // Устанавливаем склад из контракта
      if (contract?.warehouseId) {
        setSelectedWarehouseId(String(contract.warehouseId));
        console.log('Set selected warehouse ID:', contract.warehouseId);
      }
    }
  }, [selectedContractId, contracts, suppliers]);

  // Загружаем позиции контракта при выборе контракта
  useEffect(() => {
    if (selectedContractId && selectedContractId !== '') {
      api.get(`/api/contracts/${selectedContractId}/items`)
        .then(res => {
          setContractItems(res.data);
          // Инициализируем позиции поставки на основе позиций контракта
          const initialDeliveryItems: DeliveryItem[] = res.data.map((item: ContractItem, index: number) => ({
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
        api.get(`/api/deliveries/${editingDelivery.id}/items`)
          .then(res => setDeliveryItems(res.data))
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
  }, [filters, page, rowsPerPage]);

  const fetchDeliveries = async () => {
    setLoading(true);
    try {
      // Строим query параметры для фильтров
      const params = new URLSearchParams();
      
      if (filters.status) params.append('status', filters.status);
      if (filters.contractId) params.append('contractId', filters.contractId);
      if (filters.supplierId) params.append('supplierId', filters.supplierId);
      if (filters.dateFrom) params.append('dateFrom', filters.dateFrom.format('YYYY-MM-DD'));
      if (filters.dateTo) params.append('dateTo', filters.dateTo.format('YYYY-MM-DD'));
      
      // Добавляем параметры пагинации
      params.append('page', page.toString());
      params.append('size', rowsPerPage.toString());
      
      const response = await api.get(`/api/deliveries?${params.toString()}`);
      if (response.status === 200) {
      const data = response.data;
        setDeliveries(data.content || data);
        setTotalCount(data.totalElements || data.length);
      } else {
        showSnackbar('Ошибка при загрузке поставок', 'error');
      }
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
        await api.delete(`/api/deliveries/${selectedDeliveryId}`);
        showSnackbar('Поставка удалена', 'success');
        reloadAll();
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
      await api.post(`/api/deliveries/${id}/confirm`);
      showSnackbar('Поставка подтверждена', 'success');
      reloadAll();
    } catch (error) {
      showSnackbar('Ошибка при подтверждении поставки', 'error');
    }
  };

  const handleReject = async () => {
    if (!selectedDelivery || !rejectReason.trim()) return;
    
    try {
      await api.post(`/api/deliveries/${selectedDelivery.id}/reject?reason=${encodeURIComponent(rejectReason)}`);
      showSnackbar('Поставка отклонена', 'success');
      setRejectDialogOpen(false);
      setRejectReason('');
      setSelectedDelivery(null);
      reloadAll();
    } catch (error) {
      showSnackbar('Ошибка при отклонении поставки', 'error');
    }
  };

  const handleStatusChange = (delivery: Delivery) => {
    setSelectedDeliveryForStatus(delivery);
    setStatusManagerOpen(true);
  };

  const handleStatusChangeSubmit = async (newStatus: string, comment: string) => {
    if (!selectedDeliveryForStatus) return;
    
    try {
      const response = await api.patch(`/api/deliveries/${selectedDeliveryForStatus.id}/status`, {
        status: newStatus,
        comment: comment
      });

      if (response.status === 200) {
        showSnackbar('Статус поставки изменен', 'success');
        setStatusManagerOpen(false);
        reloadAll();
      } else {
        throw new Error('Ошибка при изменении статуса');
      }
    } catch (error) {
      showSnackbar('Ошибка при изменении статуса', 'error');
      throw error;
    }
  };

  const handleCreatePayment = (delivery: Delivery) => {
    setSelectedDeliveryForPayment(delivery);
    setCreatePaymentDialogOpen(true);
  };

  const handleConfirmCreatePayment = async () => {
    if (selectedDeliveryForPayment) {
      try {
        const response = await api.post(`/api/payments/from-delivery/${selectedDeliveryForPayment.id}`);
        if (response.status === 200 || response.status === 201) {
          showSnackbar('Платеж по поставке создан', 'success');
        } else {
          let message = 'Ошибка при создании платежа';
          if (response.data && response.data.message) {
            message = response.data.message;
          }
          showSnackbar(message, 'error');
        }
      } catch (error: any) {
        let message = 'Ошибка при создании платежа';
        if (error.response && error.response.data && error.response.data.message) {
          message = error.response.data.message;
        }
        showSnackbar(message, 'error');
      } finally {
        setCreatePaymentDialogOpen(false);
        setSelectedDeliveryForPayment(null);
      }
    }
  };

  // Функции для фильтров и пагинации
  const handleFilterChange = (field: string, value: any) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setPage(0); // Сбрасываем страницу при изменении фильтров
  };

  const handlePageChange = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleStatusFilter = (status: string) => {
    handleFilterChange('status', status);
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      contractId: '',
      supplierId: '',
      dateFrom: null,
      dateTo: null,
    });
    setPage(0);
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
        contractId: selectedContractId,
        supplierId: selectedSupplierId,
        warehouseId: selectedWarehouseId,
        plannedDate: plannedDate ? plannedDate.format('YYYY-MM-DD') : null,
        trackingNumber: formData.get('trackingNumber'),
        notes: formData.get('notes'),
        deliveryItems: itemsToSubmit
      };
      
      console.log('Submitting delivery data:', submitData);
      console.log('Selected contract ID:', selectedContractId);
      console.log('Selected supplier ID:', selectedSupplierId);
      console.log('Selected warehouse ID:', selectedWarehouseId);

      const url = editingDelivery 
        ? `/api/deliveries/${editingDelivery.id}` 
        : '/api/deliveries';
      
      const method = editingDelivery ? 'PUT' : 'POST';
      
      const response = await api.request({
        url,
        method,
        data: submitData,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 200) {
        showSnackbar(
          editingDelivery ? 'Поставка обновлена' : 'Поставка создана', 
          'success'
        );
      setDialogOpen(false);
        reloadAll();
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

  const stats = {
    total: Object.values(statusStats).reduce((a, b) => a + b, 0),
    planned: statusStats.PLANNED || 0,
    confirmed: statusStats.CONFIRMED || 0,
    inTransit: statusStats.IN_TRANSIT || 0,
    arrived: statusStats.ARRIVED || 0,
    delivered: statusStats.DELIVERED || 0,
    accepted: statusStats.ACCEPTED || 0,
    rejected: statusStats.REJECTED || 0,
    partiallyAccepted: statusStats.PARTIALLY_ACCEPTED || 0,
    cancelled: statusStats.CANCELLED || 0,
  };

  // Загрузка статистики по статусам
  const fetchStatusStats = async () => {
    try {
      const response = await api.get('/api/deliveries/status-stats');
      if (response.status === 200) {
        const data = response.data;
        setStatusStats(data);
      }
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    fetchStatusStats();
  }, []);

  // После создания/удаления/изменения статуса тоже обновлять статистику
  const reloadAll = () => {
    fetchDeliveries();
    fetchStatusStats();
  };

  const handleExportExcel = async () => {
    try {
      const response = await api.get('/api/delivery-registry/export', {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Реестр_поставок.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Ошибка при экспорте:', error);
      showSnackbar('Ошибка при экспорте в Excel', 'error');
    }
  };

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 3,
        flexDirection: { xs: 'column', sm: 'row' },
        gap: { xs: 2, sm: 0 }
      }}>
        <Typography variant={isMobile ? "h5" : "h4"} component="h1">
          Поставки
        </Typography>
        <Button
          variant="outlined"
          startIcon={<FileUploadIcon />}
          onClick={handleExportExcel}
          size={isMobile ? 'small' : 'medium'}
        >
          Экспорт в Excel
        </Button>
      </Box>

      {/* Статистика */}
      <Grid container spacing={isMobile ? 1 : 2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={1.5}>
          <Card sx={{ 
            cursor: 'pointer', 
            backgroundColor: filters.status === '' ? 'action.selected' : undefined, 
            '&:hover': { backgroundColor: 'action.hover' } 
          }} onClick={() => clearFilters()}>
            <CardContent sx={{ p: { xs: 1.5, md: 2 } }}>
              <Typography color="textSecondary" gutterBottom variant={isMobile ? "body2" : "body1"}>
                Всего
              </Typography>
              <Typography variant={isMobile ? "h6" : "h4"}>
                {stats.total}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={1.5}>
          <Card sx={{ cursor: 'pointer', backgroundColor: filters.status === 'PLANNED' ? 'action.selected' : undefined, '&:hover': { backgroundColor: 'action.hover' } }} onClick={() => handleStatusFilter('PLANNED')}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Запланированы
              </Typography>
              <Typography variant="h4">
                {stats.planned}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={1.5}>
          <Card sx={{ cursor: 'pointer', backgroundColor: filters.status === 'CONFIRMED' ? 'action.selected' : undefined, '&:hover': { backgroundColor: 'action.hover' } }} onClick={() => handleStatusFilter('CONFIRMED')}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Подтверждены
              </Typography>
              <Typography variant="h4">
                {stats.confirmed}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={1.5}>
          <Card sx={{ cursor: 'pointer', backgroundColor: filters.status === 'IN_TRANSIT' ? 'action.selected' : undefined, '&:hover': { backgroundColor: 'action.hover' } }} onClick={() => handleStatusFilter('IN_TRANSIT')}>
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
        <Grid item xs={1.5}>
          <Card sx={{ cursor: 'pointer', backgroundColor: filters.status === 'ARRIVED' ? 'action.selected' : undefined, '&:hover': { backgroundColor: 'action.hover' } }} onClick={() => handleStatusFilter('ARRIVED')}>
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
        <Grid item xs={1.5}>
          <Card sx={{ cursor: 'pointer', backgroundColor: filters.status === 'DELIVERED' ? 'action.selected' : undefined, '&:hover': { backgroundColor: 'action.hover' } }} onClick={() => handleStatusFilter('DELIVERED')}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Доставлены
              </Typography>
              <Typography variant="h4">
                {stats.delivered}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={1.5}>
          <Card sx={{ cursor: 'pointer', backgroundColor: filters.status === 'ACCEPTED' ? 'action.selected' : undefined, '&:hover': { backgroundColor: 'action.hover' } }} onClick={() => handleStatusFilter('ACCEPTED')}>
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
        <Grid item xs={1.5}>
          <Card sx={{ cursor: 'pointer', backgroundColor: filters.status === 'REJECTED' ? 'action.selected' : undefined, '&:hover': { backgroundColor: 'action.hover' } }} onClick={() => handleStatusFilter('REJECTED')}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Отклонены
              </Typography>
              <Typography variant="h4">
                {stats.rejected}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={1.5}>
          <Card sx={{ cursor: 'pointer', backgroundColor: filters.status === 'PARTIALLY_ACCEPTED' ? 'action.selected' : undefined, '&:hover': { backgroundColor: 'action.hover' } }} onClick={() => handleStatusFilter('PARTIALLY_ACCEPTED')}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Частично приняты
              </Typography>
              <Typography variant="h4">
                {stats.partiallyAccepted}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={1.5}>
          <Card sx={{ cursor: 'pointer', backgroundColor: filters.status === 'CANCELLED' ? 'action.selected' : undefined, '&:hover': { backgroundColor: 'action.hover' } }} onClick={() => handleStatusFilter('CANCELLED')}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Отменены
              </Typography>
              <Typography variant="h4">
                {stats.cancelled}
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
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  label="Статус"
                >
                  <MenuItem value="">Все статусы</MenuItem>
                  <MenuItem value="PLANNED">Запланирована</MenuItem>
                  <MenuItem value="CONFIRMED">Подтверждена</MenuItem>
                  <MenuItem value="IN_TRANSIT">В пути</MenuItem>
                  <MenuItem value="ARRIVED">Прибыла</MenuItem>
                  <MenuItem value="DELIVERED">Доставлена</MenuItem>
                  <MenuItem value="ACCEPTED">Принята</MenuItem>
                  <MenuItem value="REJECTED">Отклонена</MenuItem>
                  <MenuItem value="PARTIALLY_ACCEPTED">Частично принята</MenuItem>
                  <MenuItem value="CANCELLED">Отменена</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Контракт</InputLabel>
                <Select
                  value={filters.contractId}
                  onChange={(e) => handleFilterChange('contractId', e.target.value)}
                  label="Контракт"
                >
                  <MenuItem value="">Все контракты</MenuItem>
                  {contracts.map(contract => (
                    <MenuItem key={contract.id} value={contract.id}>
                      {contract.contractNumber}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Поставщик</InputLabel>
                <Select
                  value={filters.supplierId}
                  onChange={(e) => handleFilterChange('supplierId', e.target.value)}
                  label="Поставщик"
                >
                  <MenuItem value="">Все поставщики</MenuItem>
                  {suppliers.map(supplier => (
                    <MenuItem key={supplier.id} value={supplier.id}>
                      {supplier.shortName || supplier.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={2}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="Дата от"
                  value={filters.dateFrom}
                  onChange={(date) => handleFilterChange('dateFrom', date)}
                  format="DD.MM.YYYY"
                  slotProps={{
                    textField: {
                      size: 'small',
                      fullWidth: true,
                    },
                  }}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={2}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="Дата до"
                  value={filters.dateTo}
                  onChange={(date) => handleFilterChange('dateTo', date)}
                  format="DD.MM.YYYY"
                  slotProps={{
                    textField: {
                      size: 'small',
                      fullWidth: true,
                    },
                  }}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={2}>
              <Button
                variant="outlined"
                onClick={clearFilters}
                fullWidth
              >
                Очистить фильтры
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Кнопка создания */}
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreate}
        >
          Создать поставку
        </Button>
        <Typography variant="body2" color="textSecondary">
          Показано {deliveries.length} из {totalCount} поставок
        </Typography>
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
                  {delivery.contractNumber 
                    ? `${delivery.contractNumber}${delivery.contractTitle ? ` | ${delivery.contractTitle}` : ''}`
                    : delivery.contractId
                  }
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
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={() => handleStatusChange(delivery)}
                  >
                    <SettingsIcon />
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
                    color="primary"
                    onClick={() => handleCreatePayment(delivery)}
                    title="Создать платеж по поставке"
                  >
                    <PaymentIcon />
                  </IconButton>
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
      
      {/* Пагинация */}
      <TablePagination
        component="div"
        count={totalCount || 0}
        page={page}
        onPageChange={handlePageChange}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleRowsPerPageChange}
        labelRowsPerPage="Строк на странице:"
        labelDisplayedRows={({ from, to, count }) => `${from}-${to} из ${count}`}
        rowsPerPageOptions={[5, 10, 25, 50]}
      />

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
                    format="DD.MM.YYYY"
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

      {/* Диалог управления статусом */}
      {selectedDeliveryForStatus && (
        <DeliveryStatusManager
          open={statusManagerOpen}
          onClose={() => setStatusManagerOpen(false)}
          currentStatus={selectedDeliveryForStatus.status}
          deliveryNumber={selectedDeliveryForStatus.deliveryNumber}
          onStatusChange={handleStatusChangeSubmit}
        />
      )}

      {/* Диалог создания платежа */}
      <Dialog open={createPaymentDialogOpen} onClose={() => setCreatePaymentDialogOpen(false)}>
        <DialogTitle>Создать платеж по поставке</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Будет создан платеж по поставке:
          </DialogContentText>
          <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="body1">
              <strong>Номер поставки:</strong> {selectedDeliveryForPayment?.deliveryNumber}
            </Typography>
            <Typography variant="body1">
              <strong>Статус:</strong> {selectedDeliveryForPayment ? getStatusText(selectedDeliveryForPayment.status) : ''}
            </Typography>
            <Typography variant="body1">
              <strong>Контракт:</strong> {selectedDeliveryForPayment?.contractNumber}
            </Typography>
            <Typography variant="body1">
              <strong>Сумма:</strong> {selectedDeliveryForPayment?.deliveryItems?.reduce((sum, item) => sum + (item.orderedQuantity * item.unitPrice), 0)?.toLocaleString()} ₽
            </Typography>
          </Box>
          <DialogContentText sx={{ mt: 2 }}>
            Платеж будет создан со статусом "Ожидает оплаты" и привязан к данной поставке.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreatePaymentDialogOpen(false)}>Отмена</Button>
          <Button onClick={handleConfirmCreatePayment} color="primary" variant="contained">
            Создать платеж
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DeliveryListPage; 