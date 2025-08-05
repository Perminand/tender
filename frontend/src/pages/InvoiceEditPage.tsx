import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar,
  CircularProgress,
  Divider,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';
import { useParams, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import { api } from '../utils/api';

interface Invoice {
  id: string;
  invoiceNumber: string;
  contractId: string;
  supplierId: string;
  supplierName: string;
  customerId: string;
  customerName: string;
  status: string;
  totalAmount: number;
  vatAmount: number;
  paidAmount: number;
  invoiceDate: string;
  dueDate: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  invoiceItems?: InvoiceItem[];
}

interface InvoiceItem {
  id: string;
  materialId: string;
  materialName: string;
  quantity: number;
  unitId: string;
  unitName: string;
  unitPrice: number;
  totalPrice: number;
  description: string;
}

interface Contract {
  id: string;
  contractNumber: string;
  title: string;
  supplierId: string;
  supplierName: string;
  customerId: string;
  customerName: string;
  status: string;
  totalAmount: number;
}

interface Company {
  id: string;
  name: string;
  type: string;
}

// Функция для перевода статуса на русский
const getStatusLabel = (status: string) => {
  switch (status) {
    case 'DRAFT': return 'Черновик';
    case 'SENT': return 'Отправлен';
    case 'PAID': return 'Оплачен';
    case 'PARTIALLY_PAID': return 'Частично оплачен';
    case 'OVERDUE': return 'Просрочен';
    case 'CANCELLED': return 'Отменен';
    default: return status;
  }
};

const InvoiceEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  
  const isEditMode = !!id;
  const contractId = searchParams.get('contractId');
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success'
  });

  const [invoice, setInvoice] = useState<Partial<Invoice>>({
    invoiceNumber: '',
    contractId: contractId || '',
    supplierId: '',
    supplierName: '',
    customerId: '',
    customerName: '',
    status: 'DRAFT',
    totalAmount: 0,
    vatAmount: 0,
    paidAmount: 0,
    invoiceDate: dayjs().format('YYYY-MM-DD'),
    dueDate: dayjs().add(30, 'day').format('YYYY-MM-DD'),
    description: ''
  });

  const [contracts, setContracts] = useState<Contract[]>([]);
  const [suppliers, setSuppliers] = useState<Company[]>([]);
  const [customers, setCustomers] = useState<Company[]>([]);

  useEffect(() => {
    if (isEditMode) {
      fetchInvoice();
    }
    fetchContracts();
    fetchSuppliers();
    fetchCustomers();
  }, [id, isEditMode]);

  // Автоматическое заполнение данных контракта при загрузке
  useEffect(() => {
    if (contractId && contracts.length > 0) {
      const selectedContract = contracts.find(c => c.id === contractId);
      if (selectedContract) {
        setInvoice(prev => ({
          ...prev,
          contractId,
          supplierId: selectedContract.supplierId,
          supplierName: selectedContract.supplierName,
          customerId: selectedContract.customerId,
          customerName: selectedContract.customerName,
          totalAmount: selectedContract.totalAmount
        }));
      }
    }
  }, [contractId, contracts]);

  const fetchInvoice = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      const response = await api.get(`/api/invoices/${id}`);
      setInvoice(response.data);
      
      // Загружаем позиции счета
      try {
        const itemsResponse = await api.get(`/api/invoices/${id}/items`);
        setInvoice(prev => ({ ...prev, invoiceItems: itemsResponse.data }));
      } catch (itemsError) {
        console.warn('Не удалось загрузить позиции счета:', itemsError);
        // Если позиции не загрузились, это не критично
      }
    } catch (error) {
      console.error('Ошибка при загрузке счета:', error);
      showSnackbar('Ошибка при загрузке счета', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchContracts = async () => {
    try {
      const response = await api.get('/api/contracts');
      setContracts(response.data);
    } catch (error) {
      console.error('Ошибка при загрузке контрактов:', error);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const response = await api.get('/api/companies?type=SUPPLIER');
      setSuppliers(response.data);
    } catch (error) {
      console.error('Ошибка при загрузке поставщиков:', error);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await api.get('/api/companies?type=CUSTOMER');
      setCustomers(response.data);
    } catch (error) {
      console.error('Ошибка при загрузке заказчиков:', error);
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);

    try {
      if (isEditMode) {
        await api.put(`/api/invoices/${id}`, invoice);
        showSnackbar('Счет успешно обновлен', 'success');
      } else {
        await api.post('/api/invoices', invoice);
        showSnackbar('Счет успешно создан', 'success');
      }
      
      setTimeout(() => {
        navigate('/invoices');
      }, 1500);
    } catch (error: any) {
      console.error('Ошибка при сохранении счета:', error);
      const errorMessage = error.response?.data?.message || 'Ошибка при сохранении счета';
      showSnackbar(errorMessage, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setInvoice(prev => ({ ...prev, [field]: value }));
  };

  const handleContractChange = (contractId: string) => {
    const selectedContract = contracts.find(c => c.id === contractId);
    if (selectedContract) {
      setInvoice(prev => ({
        ...prev,
        contractId,
        supplierId: selectedContract.supplierId,
        supplierName: selectedContract.supplierName,
        customerId: selectedContract.customerId,
        customerName: selectedContract.customerName,
        totalAmount: selectedContract.totalAmount
      }));
    }
  };

  const handleCreateDelivery = async () => {
    if (!invoice.id) {
      showSnackbar('Сначала сохраните счет', 'error');
      return;
    }

    try {
      setSaving(true);
      const response = await api.post(`/api/deliveries/from-invoice/${invoice.id}`);
      showSnackbar('Поставка успешно создана', 'success');
      // Перенаправляем на страницу поставки
      navigate(`/deliveries/${response.data.id}`);
    } catch (error) {
      console.error('Ошибка при создании поставки:', error);
      showSnackbar('Ошибка при создании поставки', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ p: 3 }}>
        <Box display="flex" alignItems="center" mb={3}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/invoices')}
            sx={{ mr: 2 }}
          >
            Назад
          </Button>
          <Typography variant="h4" component="h1">
            {isEditMode ? 'Редактирование счета' : 'Создание счета'}
          </Typography>
        </Box>

        <Card>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                {/* Основная информация */}
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Основная информация
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Номер счета"
                    value={invoice.invoiceNumber}
                    onChange={(e) => handleInputChange('invoiceNumber', e.target.value)}
                    required
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Контракт</InputLabel>
                    <Select
                      value={invoice.contractId}
                      onChange={(e) => handleContractChange(e.target.value)}
                      label="Контракт"
                      disabled={!!contractId} // Блокируем если контракт передан в URL
                    >
                      {contracts.map((contract) => (
                        <MenuItem key={contract.id} value={contract.id}>
                          {contract.contractNumber} - {contract.title}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  {contractId && (
                    <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5, display: 'block' }}>
                      Контракт автоматически выбран из страницы управления контрактом
                    </Typography>
                  )}
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Поставщик"
                    value={invoice.supplierName}
                    disabled
                  />
                  <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5, display: 'block' }}>
                    Автоматически заполняется из контракта
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Заказчик"
                    value={invoice.customerName}
                    disabled
                  />
                  <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5, display: 'block' }}>
                    Автоматически заполняется из контракта
                  </Typography>
                </Grid>

                {/* Финансовая информация */}
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Финансовая информация
                  </Typography>
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Общая сумма"
                    type="number"
                    value={invoice.totalAmount}
                    onChange={(e) => handleInputChange('totalAmount', parseFloat(e.target.value) || 0)}
                    required
                  />
                  <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5, display: 'block' }}>
                    Автоматически заполняется из контракта
                  </Typography>
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Сумма НДС"
                    type="number"
                    value={invoice.vatAmount}
                    onChange={(e) => handleInputChange('vatAmount', parseFloat(e.target.value) || 0)}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Оплаченная сумма"
                    type="number"
                    value={invoice.paidAmount}
                    onChange={(e) => handleInputChange('paidAmount', parseFloat(e.target.value) || 0)}
                  />
                </Grid>

                {/* Даты */}
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Даты
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <DatePicker
                    label="Дата счета"
                    value={dayjs(invoice.invoiceDate)}
                    onChange={(date) => handleInputChange('invoiceDate', date?.format('YYYY-MM-DD'))}
                    slotProps={{ textField: { fullWidth: true, required: true } }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <DatePicker
                    label="Срок оплаты"
                    value={dayjs(invoice.dueDate)}
                    onChange={(date) => handleInputChange('dueDate', date?.format('YYYY-MM-DD'))}
                    slotProps={{ textField: { fullWidth: true, required: true } }}
                  />
                </Grid>

                {/* Описание */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Описание"
                    multiline
                    rows={4}
                    value={invoice.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                  />
                </Grid>

                {/* Материалы */}
                {isEditMode && invoice.invoiceItems && invoice.invoiceItems.length > 0 && (
                  <Grid item xs={12}>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="h6" gutterBottom>
                      Материалы
                    </Typography>
                    <TableContainer component={Paper}>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>№</TableCell>
                            <TableCell>Материал</TableCell>
                            <TableCell>Описание</TableCell>
                            <TableCell>Количество</TableCell>
                            <TableCell>Ед. изм.</TableCell>
                            <TableCell>Цена за ед.</TableCell>
                            <TableCell>Сумма</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {invoice.invoiceItems.map((item, index) => (
                            <TableRow key={item.id}>
                              <TableCell>{index + 1}</TableCell>
                              <TableCell>{item.materialName}</TableCell>
                              <TableCell>{item.description}</TableCell>
                              <TableCell>{item.quantity}</TableCell>
                              <TableCell>{item.unitName}</TableCell>
                              <TableCell>{item.unitPrice.toLocaleString()} ₽</TableCell>
                              <TableCell>{item.totalPrice.toLocaleString()} ₽</TableCell>
                            </TableRow>
                          ))}
                          <TableRow>
                            <TableCell colSpan={6} align="right">
                              <Typography variant="h6">Итого:</Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="h6" color="primary">
                                {invoice.totalAmount.toLocaleString()} ₽
                              </Typography>
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Grid>
                )}

                {/* Кнопки */}
                <Grid item xs={12}>
                  <Box display="flex" gap={2} justifyContent="flex-end">
                    {isEditMode && (
                      <Button
                        variant="outlined"
                        startIcon={<LocalShippingIcon />}
                        onClick={handleCreateDelivery}
                        disabled={saving}
                      >
                        Создать поставку
                      </Button>
                    )}
                    <Button
                      variant="outlined"
                      onClick={() => navigate('/invoices')}
                    >
                      Отмена
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={saving}
                    >
                      {saving ? <CircularProgress size={24} /> : (isEditMode ? 'Обновить' : 'Создать')}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </form>
          </CardContent>
        </Card>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        >
          <Alert
            onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </LocalizationProvider>
  );
};

export default InvoiceEditPage; 