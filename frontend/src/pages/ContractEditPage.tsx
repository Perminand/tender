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
    default: return status;
  }
};

const ContractEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Получаем значения из query string
  const tenderId = searchParams.get('tenderId') || '';
  const supplierId = searchParams.get('supplierId') || '';
  const amount = Number(searchParams.get('amount')) || 0;
  const supplierName = searchParams.get('supplierName') || '';

  const isCreatingFromTender = Boolean(tenderId && supplierId);

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
    tenderId: tenderId,
    supplierId: supplierId,
    status: 'DRAFT',
    totalAmount: amount,
    startDate: dayjs(),
    endDate: dayjs().add(1, 'year'),
    terms: '',
    description: ''
  });

  useEffect(() => {
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
    const foundSupplier = suppliers.find(s => s.id === supplierId);
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
      const response = await fetch(`/api/contracts/${id}`);
      const data = await response.json();
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
    setLoading(true);
    try {
      // Получаем данные тендера
      const tenderResponse = await fetch(`/api/tenders/${tenderId}`);
      const tenderData = await tenderResponse.json();
      setTenderData(tenderData);
      
      // Получаем предложения поставщика
      const proposalsResponse = await fetch(`/api/proposals/tender/${tenderId}`);
      const proposalsData = await proposalsResponse.json();
      
      setProposals(proposalsData);
      
      // Находим выбранное предложение поставщика
      const selectedProposal = proposalsData.find((p: SupplierProposal) => p.supplierId === supplierId);
      
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
      const response = await fetch('/api/tenders');
      const data = await response.json();
      setTenders(data.filter((tender: Tender) => tender.status === 'AWARDED'));
    } catch (error) {
      console.error('Ошибка при загрузке тендеров:', error);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const response = await fetch('/api/companies?type=SUPPLIER');
      const data = await response.json();
      setSuppliers(data);
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

    // Проверка и логирование UUID
    console.log('tenderId:', tenderId, 'supplierId:', supplierId);
    const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
    if (!tenderId || !supplierId || !uuidRegex.test(tenderId) || !uuidRegex.test(supplierId)) {
      showSnackbar('Ошибка: tenderId или supplierId отсутствует или невалиден!', 'error');
      setLoading(false);
      return;
    }

    try {
      const submitData = {
        ...formData,
        startDate: formData.startDate.format('YYYY-MM-DD'),
        endDate: formData.endDate.format('YYYY-MM-DD')
      };

      if (id) {
        // Обновление существующего контракта
        await fetch(`/api/contracts/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(submitData),
        });
        showSnackbar('Контракт обновлен', 'success');
      } else if (isCreatingFromTender) {
        // Создание контракта из тендера (теперь через тело запроса)
        await fetch(`/api/contracts/from-tender`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(submitData),
        });
        showSnackbar('Контракт создан из тендера', 'success');
      } else {
        // Создание нового контракта
        await fetch('/api/contracts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(submitData),
        });
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

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {id ? 'Редактирование контракта' : 'Создание контракта'}
      </Typography>

      {isCreatingFromTender && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Создание контракта на основе тендера
        </Alert>
      )}

      {isCreatingFromTender && tenderData && (
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Информация о тендере
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">
                  Номер тендера: <strong>{tenderData.tenderNumber}</strong>
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">
                  Название: <strong>{tenderData.title}</strong>
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">
                  Статус: <strong>{getStatusLabel(tenderData.status)}</strong>
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">
                  Заказчик: <strong>{tenderData.customerName}</strong>
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
                                <TableCell>{item.unitName}</TableCell>
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

              {isCreatingFromTender && proposals.length > 0 && (
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
                                label={proposal.status} 
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
              )}

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