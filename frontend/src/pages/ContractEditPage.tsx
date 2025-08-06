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
import { api } from '../utils/api';

interface Contract {
  id: string;
  contractNumber: string;
  title: string;
  tenderId: string;
  supplierId: string;
  supplierName: string;
  customerId: string;
  customerName: string;
  status: string;
  totalAmount: number;
  startDate: string;
  endDate: string;
  terms: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

interface Tender {
  id: string;
  tenderNumber: string;
  title: string;
  status: string;
  customerId: string;
  customerName: string;
  startDate: string;
  endDate: string;
  submissionDeadline: string;
}

interface SupplierProposal {
  id: string;
  supplierId: string;
  supplierName: string;
  proposalNumber: string;
  status: string;
  totalPrice: number;
  currency: string;
  proposalItems: any[]; // Assuming proposalItems is an array of objects
  tenderNumber?: string;
  tenderTitle?: string;
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
    case 'ACTIVE': return 'Активный';
    case 'COMPLETED': return 'Завершен';
    case 'TERMINATED': return 'Расторгнут';
    case 'SUSPENDED': return 'Приостановлен';
    case 'SUBMITTED': return 'Подано';
    case 'UNDER_REVIEW': return 'На рассмотрении';
    case 'ACCEPTED': return 'Принято';
    case 'REJECTED': return 'Отклонено';
    case 'WITHDRAWN': return 'Отозвано';
    default: return status;
  }
};

const ContractEditPage: React.FC = () => {
  const { id, tenderId: tenderIdFromPath, supplierId: supplierIdFromPath } = useParams<{ 
    id: string; 
    tenderId: string; 
    supplierId: string; 
  }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Получаем значения из query string
  const tenderIdFromQuery = searchParams.get('tenderId') || '';
  const supplierIdFromQuery = searchParams.get('supplierId') || '';
  const amount = Number(searchParams.get('amount')) || 0;
  const supplierName = searchParams.get('supplierName') || '';

  // Приоритет отдаем параметрам из URL path, затем из query string
  const tenderId = tenderIdFromPath || tenderIdFromQuery;
  const supplierId = supplierIdFromPath || supplierIdFromQuery;

  const isCreatingFromTender = Boolean(tenderId && supplierId);

  // Логируем параметры для отладки
  console.log('ContractEditPage - URL params:', { id, tenderIdFromPath, supplierIdFromPath });
  console.log('ContractEditPage - Query params:', { tenderIdFromQuery, supplierIdFromQuery, amount, supplierName });
  console.log('ContractEditPage - Final params:', { tenderId, supplierId });
  console.log('ContractEditPage - isCreatingFromTender:', isCreatingFromTender);

  const [contract, setContract] = useState<Contract | null>(null);
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [suppliers, setSuppliers] = useState<Company[]>([]);
  const [proposals, setProposals] = useState<SupplierProposal[]>([]);
  const [tenderData, setTenderData] = useState<Tender | null>(null);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const [formData, setFormData] = useState({
    contractNumber: '',
    title: '',
    tenderId: tenderId || '',
    supplierId: supplierId || '',
    status: 'DRAFT',
    totalAmount: amount,
    startDate: dayjs(),
    endDate: dayjs().add(1, 'year'),
    terms: '',
    description: ''
  });

  useEffect(() => {
    console.log('ContractEditPage useEffect - id:', id, 'isCreatingFromTender:', isCreatingFromTender);
    if (id) {
      fetchContract();
    } else if (isCreatingFromTender) {
      fetchTenderData();
    }
    fetchTenders();
    fetchSuppliers();
  }, [id, isCreatingFromTender, tenderId, supplierId, amount]);

  useEffect(() => {
    console.log('tenders:', tenders);
    console.log('tenderId from query:', tenderId);
    const foundTender = tenders.find(t => t.id === tenderId);
    console.log('foundTender:', foundTender);

    console.log('suppliers:', suppliers);
    console.log('supplierId from query:', supplierId);
    const foundSupplier = Array.isArray(suppliers) ? suppliers.find(s => s.id === supplierId) : undefined;
    console.log('foundSupplier:', foundSupplier);

    console.log('amount from query:', amount);

    // Обновляем formData если найдены соответствующие данные
    if (foundTender) {
      setFormData(prev => ({ ...prev, tenderId: foundTender.id }));
    }
    
    if (foundSupplier) {
      setFormData(prev => ({ ...prev, supplierId: foundSupplier.id }));
    }
    
    if (amount > 0) {
      setFormData(prev => ({ ...prev, totalAmount: amount }));
    }
  }, [tenders, suppliers, tenderId, supplierId, amount]);

  const fetchContract = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/api/contracts/${id}`);
      const data = response.data;
      setContract(data);
      setFormData({
        contractNumber: data.contractNumber || '',
        title: data.title || '',
        tenderId: data.tenderId || '',
        supplierId: data.supplierId || '',
        status: data.status || 'DRAFT',
        totalAmount: data.totalAmount || 0,
        startDate: data.startDate ? dayjs(data.startDate) : dayjs(),
        endDate: data.endDate ? dayjs(data.endDate) : dayjs().add(1, 'year'),
        terms: data.terms || '',
        description: data.description || ''
      });
    } catch (error) {
      showSnackbar('Ошибка при загрузке контракта', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchTenderData = async () => {
    console.log('fetchTenderData - tenderId:', tenderId, 'supplierId:', supplierId);
    setLoading(true);
    try {
      // Получаем данные тендера (именно по id)
      const tenderResponse = await api.get(`/api/tenders/${tenderId}`);
      const tenderData = tenderResponse.data;
      console.log('fetchTenderData - tenderData:', tenderData);
      setTenderData(tenderData);
      
      // Получаем предложения поставщика
      const proposalsResponse = await api.get(`/api/proposals/tender/${tenderId}`);
      const proposalsData = proposalsResponse.data;
      console.log('fetchTenderData - proposalsData:', proposalsData);
      
      setProposals(proposalsData);
      
      // Находим выбранное предложение поставщика
      const selectedProposal = proposalsData.find((p: SupplierProposal) => p.supplierId === supplierId);
      console.log('fetchTenderData - selectedProposal:', selectedProposal);
      
      // Логируем позиции предложения для отладки единиц измерения
      if (selectedProposal && selectedProposal.proposalItems) {
        console.log('Позиции предложения с единицами измерения:');
        selectedProposal.proposalItems.forEach((item: any, index: number) => {
          console.log(`Позиция ${index + 1}: ${item.description} - Ед.изм.: ${item.unitName}`);
        });
      }
      
      // Устанавливаем данные по умолчанию
      const startDate = dayjs();
      const endDate = startDate.add(1, 'year');
      
      setFormData(prev => ({
        ...prev,
        tenderId: tenderId,
        supplierId: supplierId,
        title: `Контракт по тендеру ${tenderData.tenderNumber || ''}`,
        contractNumber: `CON-${Date.now()}`,
        totalAmount: selectedProposal?.totalPrice || 0,
        startDate: startDate,
        endDate: endDate,
        terms: tenderData.termsAndConditions || tenderData.terms || '',
        description: tenderData.description || ''
      }));
    } catch (error) {
      showSnackbar('Ошибка при загрузке данных тендера', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchTenders = async () => {
    try {
      const response = await api.get('/api/tenders');
      const data = response.data;
      const tendersArray = Array.isArray(data) ? data : (data.content || data.items || []);
      setTenders(tendersArray.filter((tender: Tender) => tender.status === 'AWARDED'));
    } catch (error) {
      console.error('Ошибка при загрузке тендеров:', error);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const response = await api.get('/api/companies?type=SUPPLIER');
      const data = response.data;
      setSuppliers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Ошибка при загрузке поставщиков:', error);
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    // Проверка дат
    if (formData.startDate && formData.endDate && 
        (formData.endDate.isSame(formData.startDate) || formData.endDate.isBefore(formData.startDate))) {
      showSnackbar('Ошибка: Дата окончания должна быть больше даты начала!', 'error');
      setLoading(false);
      return;
    }

    // Проверка и логирование UUID только при создании из тендера
    if (isCreatingFromTender) {
      console.log('tenderId:', tenderId, 'supplierId:', supplierId);
      const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
      if (!tenderId || !supplierId || !uuidRegex.test(tenderId) || !uuidRegex.test(supplierId)) {
        showSnackbar('Ошибка: tenderId или supplierId отсутствует или невалиден!', 'error');
        setLoading(false);
        return;
      }
    }

    try {
      const submitData = {
        ...formData,
        startDate: formData.startDate.format('YYYY-MM-DD'),
        endDate: formData.endDate.format('YYYY-MM-DD')
      };

      if (id) {
        // Обновление существующего контракта
        await api.put(`/api/contracts/${id}`, submitData);
        showSnackbar('Контракт обновлен', 'success');
      } else if (isCreatingFromTender) {
        // Создание контракта из тендера (теперь через тело запроса)
        await api.post('/api/contracts/from-tender', submitData);
        showSnackbar('Контракт создан из тендера', 'success');
      } else {
        // Создание нового контракта
        await api.post('/api/contracts', submitData);
        showSnackbar('Контракт создан', 'success');
      }

      navigate('/contracts');
    } catch (error) {
      showSnackbar('Ошибка при сохранении контракта', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!id && !isCreatingFromTender) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Создание контракта возможно только через тендер и победителя. Перейдите в тендер и выберите победителя для заключения контракта.
        </Alert>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  const winnerProposal = proposals.find(p => p.supplierId === supplierId);

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 1 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(id ? `/contracts/${id}` : '/contracts')}
          sx={{ minWidth: 0, p: 1 }}
        />
        <Typography variant="h4" component="h1" sx={{ flexGrow: 1 }}>
          {id ? 'Редактирование контракта' : 'Создание контракта'}
        </Typography>
      </Box>

      {isCreatingFromTender && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Создание контракта на основе тендера
        </Alert>
      )}

      {isCreatingFromTender && (tenderData || winnerProposal) && (
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Информация о тендере
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">
                  Номер тендера: <strong>{tenderData?.tenderNumber || winnerProposal?.tenderNumber || ''}</strong>
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">
                  Название: <strong>{tenderData?.title || winnerProposal?.tenderTitle || ''}</strong>
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">
                  Статус: <strong>{getStatusLabel(tenderData?.status || '') || winnerProposal?.status || ''}</strong>
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">
                  Заказчик: <strong>{tenderData?.customerName || ''}</strong>
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Номер контракта"
                  value={formData.contractNumber}
                  onChange={(e) => handleInputChange('contractNumber', e.target.value)}
                  required
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Название"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  required
                />
              </Grid>

              {!isCreatingFromTender && (
                <>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Тендер</InputLabel>
                      <Select
                        value={formData.tenderId}
                        onChange={(e) => handleInputChange('tenderId', e.target.value)}
                        label="Тендер"
                      >
                        {tenders.map((tender) => (
                          <MenuItem key={tender.id} value={tender.id}>
                            {tender.tenderNumber} - {tender.title}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Поставщик</InputLabel>
                      <Select
                        value={formData.supplierId}
                        onChange={(e) => handleInputChange('supplierId', e.target.value)}
                        label="Поставщик"
                      >
                        {suppliers.map((supplier) => (
                          <MenuItem key={supplier.id} value={supplier.id}>
                            {supplier.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                </>
              )}

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Статус</InputLabel>
                  <Select
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    label="Статус"
                  >
                    <MenuItem value="DRAFT">Черновик</MenuItem>
                    <MenuItem value="ACTIVE">Активный</MenuItem>
                    <MenuItem value="COMPLETED">Завершен</MenuItem>
                    <MenuItem value="TERMINATED">Расторгнут</MenuItem>
                    <MenuItem value="SUSPENDED">Приостановлен</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Общая сумма"
                  type="number"
                  value={formData.totalAmount}
                  onChange={(e) => handleInputChange('totalAmount', Number(e.target.value))}
                  required
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label="Дата начала"
                    value={formData.startDate}
                    onChange={(date) => {
                      handleInputChange('startDate', date);
                      // Если дата окончания меньше или равна дате начала, увеличиваем её на год
                      if (date && formData.endDate && date.isAfter(formData.endDate)) {
                        handleInputChange('endDate', date.add(1, 'year'));
                      }
                    }}
                    format="DD.MM.YYYY"
                    slotProps={{ textField: { fullWidth: true } }}
                  />
                </LocalizationProvider>
              </Grid>

              <Grid item xs={12} md={6}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label="Дата окончания"
                    value={formData.endDate}
                    onChange={(date) => handleInputChange('endDate', date)}
                    minDate={formData.startDate}
                    format="DD.MM.YYYY"
                    slotProps={{ 
                      textField: { 
                        fullWidth: true,
                        helperText: formData.endDate && formData.startDate && 
                          formData.endDate.isSame(formData.startDate) || formData.endDate.isBefore(formData.startDate)
                          ? 'Дата окончания должна быть больше даты начала' 
                          : ''
                      } 
                    }}
                  />
                </LocalizationProvider>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Условия"
                  multiline
                  rows={3}
                  value={formData.terms}
                  onChange={(e) => handleInputChange('terms', e.target.value)}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Описание"
                  multiline
                  rows={3}
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                />
              </Grid>

              {isCreatingFromTender && proposals.length > 0 && supplierId && (
                (() => {
                  const selectedProposal = proposals.find(p => p.supplierId === supplierId);
                  if (!selectedProposal || !selectedProposal.proposalItems) return null;
                  return (
                    <Grid item xs={12}>
                      <Divider sx={{ my: 2 }} />
                      <Typography variant="h6" gutterBottom>
                        Позиции предложения поставщика
                      </Typography>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Поставщик: <strong>{selectedProposal.supplierName}</strong> | 
                          Номер предложения: <strong>{selectedProposal.proposalNumber}</strong> | 
                          Общая сумма: <strong>{selectedProposal.totalPrice} {selectedProposal.currency}</strong>
                        </Typography>
                      </Box>
                      <TableContainer component={Paper}>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>№</TableCell>
                              <TableCell>Описание</TableCell>
                              <TableCell>Бренд/Модель</TableCell>
                              <TableCell>Производитель</TableCell>
                              <TableCell>Количество</TableCell>
                              <TableCell>Ед. изм.</TableCell>
                              <TableCell>Цена за ед.</TableCell>
                              <TableCell>Сумма</TableCell>
                              <TableCell>Срок поставки</TableCell>
                              <TableCell>Гарантия</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {selectedProposal.proposalItems.map((item, idx) => (
                              <TableRow key={item.id || idx}>
                                <TableCell>{item.itemNumber}</TableCell>
                                <TableCell>{item.description}</TableCell>
                                <TableCell>{item.brand} {item.model}</TableCell>
                                <TableCell>{item.manufacturer}</TableCell>
                                <TableCell>{item.quantity}</TableCell>
                                <TableCell>{item.unitName || 'Не указано'}</TableCell>
                                <TableCell>{item.unitPrice?.toLocaleString()} ₽</TableCell>
                                <TableCell>{item.totalPrice?.toLocaleString()} ₽</TableCell>
                                <TableCell>{item.deliveryPeriod}</TableCell>
                                <TableCell>{item.warranty}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                      {selectedProposal.proposalItems.some(item => item.specifications) && (
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="subtitle2" gutterBottom>
                            Дополнительные характеристики:
                          </Typography>
                          {selectedProposal.proposalItems
                            .filter(item => item.specifications)
                            .map((item, idx) => (
                              <Typography key={idx} variant="body2" color="text.secondary" sx={{ ml: 2 }}>
                                <strong>{item.itemNumber}.</strong> {item.specifications}
                              </Typography>
                            ))}
                        </Box>
                      )}
                    </Grid>
                  );
                })()
              )}

              {/* НЕ НУЖНО на странице создания контракта */}
              {/* {proposals.length > 0 && (
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Все предложения поставщиков
                  </Typography>
                  <TableContainer component={Paper}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Поставщик</TableCell>
                          <TableCell>Номер предложения</TableCell>
                          <TableCell>Статус</TableCell>
                          <TableCell>Сумма</TableCell>
                          <TableCell>Валюта</TableCell>
                          <TableCell>Количество позиций</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {proposals.map((proposal) => (
                          <TableRow 
                            key={proposal.id}
                            sx={{ 
                              backgroundColor: proposal.supplierId === supplierId ? 'rgba(76, 175, 80, 0.1)' : 'inherit'
                            }}
                          >
                            <TableCell>
                              <Typography variant="body2">
                                {proposal.supplierName}
                                {proposal.supplierId === supplierId && (
                                  <Chip 
                                    label="Выбран" 
                                    color="success" 
                                    size="small" 
                                    sx={{ ml: 1 }}
                                  />
                                )}
                              </Typography>
                            </TableCell>
                            <TableCell>{proposal.proposalNumber}</TableCell>
                            <TableCell>
                              <Chip 
                                label={getStatusLabel(proposal.status)} 
                                color={proposal.status === 'ACCEPTED' ? 'success' : 'default'}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>{proposal.totalPrice?.toLocaleString()} ₽</TableCell>
                            <TableCell>{proposal.currency}</TableCell>
                            <TableCell>{proposal.proposalItems?.length || 0}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
              )} */}

              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <Button variant="outlined" onClick={() => navigate('/contracts')}>
                    Отмена
                  </Button>
                  <Button type="submit" variant="contained" disabled={loading}>
                    {loading ? <CircularProgress size={20} /> : (id ? 'Обновить' : 'Создать')}
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
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ContractEditPage; 