import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Button,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider,
  Chip,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  Badge,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Snackbar,
  DialogContentText
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Add as AddIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Visibility as VisibilityIcon,
  Payment as PaymentIcon,
  LocalShipping as DeliveryIcon,
  Description as DocumentIcon,
  History as HistoryIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Warning as WarningIcon,
  ExpandMore as ExpandMoreIcon,
  AttachFile as AttachFileIcon,
  Print as PrintIcon,
  Email as EmailIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';

interface ContractItem {
  id: string;
  contractId: string;
  materialId: string;
  materialName: string;
  quantity: number;
  unitName: string;
  unitPrice: number;
  totalPrice: number;
  description: string;
}

interface Delivery {
  id: string;
  deliveryNumber: string;
  deliveryDate: string;
  plannedDate: string;
  status: string;
  supplierId: string;
  supplierName: string;
  notes: string;
  deliveryItems: DeliveryItem[];
}

interface DeliveryItem {
  id: string;
  materialName: string;
  orderedQuantity: number;
  deliveredQuantity: number;
  acceptedQuantity: number;
  rejectedQuantity: number;
  unitName: string;
  unitPrice: number;
  totalPrice: number;
  acceptanceStatus: string;
  qualityNotes: string;
}

interface Payment {
  id: string;
  paymentNumber: string;
  paymentDate: string;
  dueDate: string;
  type: string;
  status: string;
  amount: number;
  description: string;
  invoiceNumber: string;
}

interface Document {
  id: string;
  fileName: string;
  originalFileName: string;
  type: string;
  status: string;
  uploadedAt: string;
  description: string;
  fileSize: number;
}

interface AuditLog {
  id: string;
  action: string;
  entityType: string;
  oldValue: string;
  newValue: string;
  timestamp: string;
  userAgent: string;
  description: string;
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

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`contract-tabpanel-${index}`}
      aria-labelledby={`contract-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const ContractManagementPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [contract, setContract] = useState<Contract | null>(null);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  // Диалоги
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [documentDialogOpen, setDocumentDialogOpen] = useState(false);
  const [deliveryDialogOpen, setDeliveryDialogOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [createPaymentDialogOpen, setCreatePaymentDialogOpen] = useState(false);
  const [selectedDeliveryForPayment, setSelectedDeliveryForPayment] = useState<Delivery | null>(null);

  useEffect(() => {
    if (id) {
      fetchContractData();
    }
  }, [id]);

  const fetchContractData = async () => {
    setLoading(true);
    try {
      // Загружаем контракт
      const contractResponse = await fetch(`/api/contracts/${id}`);
      if (!contractResponse.ok) throw new Error('Ошибка загрузки контракта');
      const contractData = await contractResponse.json();
      setContract(contractData);

      // Загружаем поставки
      const deliveriesResponse = await fetch(`/api/deliveries/contract/${id}`);
      if (deliveriesResponse.ok) {
        const deliveriesData = await deliveriesResponse.json();
        setDeliveries(deliveriesData);
      }

      // Загружаем платежи
      const paymentsResponse = await fetch(`/api/payments/contract/${id}`);
      if (paymentsResponse.ok) {
        const paymentsData = await paymentsResponse.json();
        setPayments(paymentsData);
      }

      // Загружаем документы
      const documentsResponse = await fetch(`/api/documents/entity/${id}?entityType=CONTRACT`);
      if (documentsResponse.ok) {
        const documentsData = await documentsResponse.json();
        setDocuments(documentsData);
      }

      // Загружаем аудит
      const auditResponse = await fetch(`/api/audit/entity/${id}?entityType=CONTRACT`);
      if (auditResponse.ok) {
        const auditData = await auditResponse.json();
        setAuditLogs(auditData);
      }

      setError(null);
    } catch (e) {
      setError('Ошибка загрузки данных контракта');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB'
    }).format(price);
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'Черновик';
      case 'ACTIVE': return 'Активный';
      case 'COMPLETED': return 'Завершен';
      case 'TERMINATED': return 'Расторгнут';
      case 'SUSPENDED': return 'Приостановлен';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'default';
      case 'ACTIVE': return 'success';
      case 'COMPLETED': return 'info';
      case 'TERMINATED': return 'error';
      case 'SUSPENDED': return 'warning';
      default: return 'default';
    }
  };

  const getDeliveryStatusLabel = (status: string) => {
    switch (status) {
      case 'PLANNED': return 'Запланирована';
      case 'IN_TRANSIT': return 'В пути';
      case 'DELIVERED': return 'Доставлена';
      case 'ACCEPTED': return 'Принята';
      case 'REJECTED': return 'Отклонена';
      default: return status;
    }
  };

  const getPaymentStatusLabel = (status: string) => {
    switch (status) {
      case 'PENDING': return 'Ожидает оплаты';
      case 'PAID': return 'Оплачен';
      case 'OVERDUE': return 'Просрочен';
      case 'CANCELLED': return 'Отменен';
      default: return status;
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      const response = await fetch(`/api/contracts/${id}/status?status=${newStatus}`, {
        method: 'PATCH'
      });
      if (response.ok) {
        await fetchContractData();
        showSnackbar('Статус контракта обновлен', 'success');
        setStatusDialogOpen(false);
      }
    } catch (error) {
      showSnackbar('Ошибка при изменении статуса', 'error');
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCreatePaymentFromDelivery = (delivery: Delivery) => {
    setSelectedDeliveryForPayment(delivery);
    setCreatePaymentDialogOpen(true);
  };

  const handleConfirmCreatePayment = async () => {
    if (selectedDeliveryForPayment) {
      try {
        const response = await fetch(`/api/payments/from-delivery/${selectedDeliveryForPayment.id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });
        if (response.ok) {
          showSnackbar('Платеж по поставке создан', 'success');
          // Обновляем данные контракта, чтобы показать новый платеж
          fetchContractData();
        } else {
          showSnackbar('Ошибка при создании платежа', 'error');
        }
      } catch (error) {
        showSnackbar('Ошибка при создании платежа', 'error');
      } finally {
        setCreatePaymentDialogOpen(false);
        setSelectedDeliveryForPayment(null);
      }
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  if (loading) {
    return <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px"><CircularProgress /></Box>;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!contract) {
    return <Alert severity="info">Контракт не найден</Alert>;
  }

  const totalDelivered = (deliveries || []).reduce((sum, delivery) => 
    sum + (delivery.deliveryItems || []).reduce((itemSum, item) => itemSum + item.deliveredQuantity, 0), 0
  );

  const totalPaid = (payments || [])
    .filter(p => p.status === 'PAID')
    .reduce((sum, payment) => sum + payment.amount, 0);

  const overduePayments = (payments || []).filter(p => p.status === 'OVERDUE');
  const pendingDeliveries = (deliveries || []).filter(d => d.status === 'PLANNED' || d.status === 'IN_TRANSIT');

  return (
    <Box sx={{ p: 3 }}>
      {/* Заголовок и навигация */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)}>
            Назад
          </Button>
          <Typography variant="h4">
            Управление контрактом №{contract.contractNumber}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Редактировать контракт">
            <IconButton onClick={() => setEditDialogOpen(true)}>
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Изменить статус">
            <IconButton onClick={() => setStatusDialogOpen(true)}>
              <CheckCircleIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Печать">
            <IconButton>
              <PrintIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Отправить по email">
            <IconButton>
              <EmailIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Основная информация */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>Основная информация</Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography color="textSecondary" variant="body2">Название:</Typography>
                  <Typography variant="body1">{contract.title}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography color="textSecondary" variant="body2">Статус:</Typography>
                  <Chip 
                    label={getStatusLabel(contract.status)} 
                    color={getStatusColor(contract.status) as any}
                    size="small"
                  />
                </Grid>
                <Grid item xs={6}>
                  <Typography color="textSecondary" variant="body2">Сумма:</Typography>
                  <Typography variant="h6" color="primary">
                    {formatPrice(contract.totalAmount)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography color="textSecondary" variant="body2">Валюта:</Typography>
                  <Typography variant="body1">{contract.currency || 'RUB'}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography color="textSecondary" variant="body2">Дата начала:</Typography>
                  <Typography variant="body1">
                    {contract.startDate ? dayjs(contract.startDate).format('DD.MM.YYYY') : '-'}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography color="textSecondary" variant="body2">Дата окончания:</Typography>
                  <Typography variant="body1">
                    {contract.endDate ? dayjs(contract.endDate).format('DD.MM.YYYY') : '-'}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography color="textSecondary" variant="body2">Склад:</Typography>
                  <Typography variant="body1">
                    {contract.warehouseName || 'Не указан'}
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>Участники</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography color="textSecondary">Поставщик:</Typography>
                  <Typography>
                    {contract.tender?.awardedSupplier?.shortName || contract.tender?.awardedSupplier?.name || contract.tender?.awardedSupplierId || 'Не указан'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography color="textSecondary">Заказчик:</Typography>
                  <Typography>
                    {contract.tender?.customer?.shortName || contract.tender?.customer?.name || 'Не указан'}
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Статистика */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Поставки</Typography>
              <Typography variant="h4">{(deliveries || []).length}</Typography>
              <Typography variant="body2" color="textSecondary">
                {pendingDeliveries.length} ожидают
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Платежи</Typography>
              <Typography variant="h4">{(payments || []).length}</Typography>
              <Typography variant="body2" color="textSecondary">
                {overduePayments.length} просрочены
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Оплачено</Typography>
              <Typography variant="h4" color="success.main">
                {formatPrice(totalPaid)}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {((totalPaid / contract.totalAmount) * 100).toFixed(1)}% от суммы
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Документы</Typography>
              <Typography variant="h4">{(documents || []).length}</Typography>
              <Typography variant="body2" color="textSecondary">
                Прикреплено файлов
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Табы */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="contract management tabs">
            <Tab label="Позиции" />
            <Tab label="Поставки" />
            <Tab label="Платежи" />
            <Tab label="Документы" />
            <Tab label="История" />
          </Tabs>
        </Box>

        {/* Позиции контракта */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">Позиции контракта</Typography>
          </Box>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>№</TableCell>
                  <TableCell>Описание</TableCell>
                  <TableCell>Материал</TableCell>
                  <TableCell>Количество</TableCell>
                  <TableCell>Ед. изм.</TableCell>
                  <TableCell>Цена за ед.</TableCell>
                  <TableCell>Сумма</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {contract.contractItems?.map((item, index) => (
                  <TableRow key={item.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{item.description}</TableCell>
                    <TableCell>{item.materialName || '-'}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>{item.unitName}</TableCell>
                    <TableCell>{formatPrice(item.unitPrice)}</TableCell>
                    <TableCell>{formatPrice(item.totalPrice)}</TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell colSpan={6} align="right">
                    <Typography variant="h6">Итого:</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="h6" color="primary">
                      {formatPrice(contract.totalAmount)}
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Поставки */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">Поставки</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate(`/deliveries/new?contractId=${contract.id}`)}
            >
              Добавить поставку
            </Button>
          </Box>
          {(deliveries || []).length > 0 ? (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Номер</TableCell>
                    <TableCell>Дата поставки</TableCell>
                    <TableCell>Статус</TableCell>
                    <TableCell>Сумма</TableCell>
                    <TableCell>Действия</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(deliveries || []).map((delivery) => (
                    <TableRow key={delivery.id}>
                      <TableCell>{delivery.deliveryNumber}</TableCell>
                      <TableCell>
                        {delivery.plannedDate ? dayjs(delivery.plannedDate).format('DD.MM.YYYY') : '-'}
                      </TableCell>
                      <TableCell>{getDeliveryStatusLabel(delivery.status)}</TableCell>
                      <TableCell>{formatPrice((delivery.deliveryItems || []).reduce((sum, item) => sum + item.totalPrice, 0))}</TableCell>
                      <TableCell>
                        <IconButton onClick={() => navigate(`/deliveries/${delivery.id}`)}>
                          <VisibilityIcon />
                        </IconButton>
                        <IconButton 
                          onClick={() => handleCreatePaymentFromDelivery(delivery)}
                          title="Создать платеж по поставке"
                        >
                          <PaymentIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Alert severity="info">Поставки не найдены</Alert>
          )}
        </TabPanel>

        {/* Платежи */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">Платежи</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate(`/payments/new?contractId=${contract.id}`)}
            >
              Добавить платеж
            </Button>
          </Box>
          {(payments || []).length > 0 ? (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Номер</TableCell>
                    <TableCell>Дата</TableCell>
                    <TableCell>Тип</TableCell>
                    <TableCell>Статус</TableCell>
                    <TableCell>Сумма</TableCell>
                    <TableCell>Действия</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(payments || []).map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>{payment.paymentNumber}</TableCell>
                      <TableCell>
                        {payment.paymentDate ? dayjs(payment.paymentDate).format('DD.MM.YYYY') : '-'}
                      </TableCell>
                      <TableCell>{payment.type}</TableCell>
                      <TableCell>
                        <Chip 
                          label={getPaymentStatusLabel(payment.status)} 
                          color={payment.status === 'PAID' ? 'success' : payment.status === 'OVERDUE' ? 'error' : 'default' as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{formatPrice(payment.amount)}</TableCell>
                      <TableCell>
                        <IconButton size="small">
                          <VisibilityIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Alert severity="info">Платежи не найдены</Alert>
          )}
        </TabPanel>

        {/* Документы */}
        <TabPanel value={tabValue} index={3}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">Документы</Typography>
            <Button
              variant="contained"
              startIcon={<UploadIcon />}
              onClick={() => setDocumentDialogOpen(true)}
            >
              Загрузить документ
            </Button>
          </Box>
          {(documents || []).length > 0 ? (
            <List>
                              {(documents || []).map((document) => (
                <ListItem key={document.id} divider>
                  <ListItemIcon>
                    <AttachFileIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary={document.originalFileName}
                    secondary={`${document.type} • ${dayjs(document.uploadedAt).format('DD.MM.YYYY HH:mm')} • ${(document.fileSize / 1024).toFixed(1)} KB`}
                  />
                  <IconButton size="small">
                    <DownloadIcon />
                  </IconButton>
                  <IconButton size="small">
                    <VisibilityIcon />
                  </IconButton>
                  <IconButton size="small" color="error">
                    <DeleteIcon />
                  </IconButton>
                </ListItem>
              ))}
            </List>
          ) : (
            <Alert severity="info">Документы не найдены</Alert>
          )}
        </TabPanel>

        {/* История изменений */}
        <TabPanel value={tabValue} index={4}>
          <Typography variant="h6" gutterBottom>История изменений</Typography>
          {(auditLogs || []).length > 0 ? (
            <List>
                              {(auditLogs || []).map((log) => (
                <ListItem key={log.id} divider>
                  <ListItemIcon>
                    <HistoryIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary={log.action}
                    secondary={`${dayjs(log.timestamp).format('DD.MM.YYYY HH:mm')} • ${log.description}`}
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Alert severity="info">История изменений не найдена</Alert>
          )}
        </TabPanel>
      </Card>

      {/* Диалог изменения статуса */}
      <Dialog open={statusDialogOpen} onClose={() => setStatusDialogOpen(false)}>
        <DialogTitle>Изменить статус контракта</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Новый статус</InputLabel>
            <Select
              value=""
              onChange={(e) => handleStatusChange(e.target.value)}
              label="Новый статус"
            >
              <MenuItem value="DRAFT">Черновик</MenuItem>
              <MenuItem value="ACTIVE">Активный</MenuItem>
              <MenuItem value="COMPLETED">Завершен</MenuItem>
              <MenuItem value="TERMINATED">Расторгнут</MenuItem>
              <MenuItem value="SUSPENDED">Приостановлен</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusDialogOpen(false)}>Отмена</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar для уведомлений */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Диалог создания платежа по поставке */}
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
              <strong>Статус:</strong> {selectedDeliveryForPayment ? getDeliveryStatusLabel(selectedDeliveryForPayment.status) : ''}
            </Typography>
            <Typography variant="body1">
              <strong>Контракт:</strong> {contract?.contractNumber}
            </Typography>
            <Typography variant="body1">
              <strong>Сумма:</strong> {selectedDeliveryForPayment?.deliveryItems?.reduce((sum, item) => sum + item.totalPrice, 0)?.toLocaleString()} ₽
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

export default ContractManagementPage; 