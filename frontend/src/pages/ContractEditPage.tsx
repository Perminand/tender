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
import { useParams, useNavigate, useLocation } from 'react-router-dom';
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
}

interface Company {
  id: string;
  name: string;
  type: string;
}

const ContractEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const isCreatingFromTender = location.state?.fromTender;
  const tenderId = location.state?.tenderId;
  const supplierId = location.state?.supplierId;

  const [contract, setContract] = useState<Contract | null>(null);
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [suppliers, setSuppliers] = useState<Company[]>([]);
  const [proposals, setProposals] = useState<SupplierProposal[]>([]);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const [formData, setFormData] = useState({
    contractNumber: '',
    title: '',
    tenderId: '',
    supplierId: '',
    status: 'DRAFT',
    totalAmount: 0,
    startDate: dayjs(),
    endDate: dayjs().add(1, 'year'),
    terms: '',
    description: ''
  });

  useEffect(() => {
    if (id) {
      fetchContract();
    } else if (isCreatingFromTender && tenderId && supplierId) {
      fetchTenderData();
    }
    fetchTenders();
    fetchSuppliers();
  }, [id, isCreatingFromTender, tenderId, supplierId]);

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
      
      // Получаем предложения поставщика
      const proposalsResponse = await fetch(`/api/proposals/tender/${tenderId}`);
      const proposalsData = await proposalsResponse.json();
      
      setProposals(proposalsData);
      
      // Устанавливаем данные по умолчанию
      setFormData(prev => ({
        ...prev,
        tenderId: tenderId,
        supplierId: supplierId,
        title: `Контракт по тендеру ${tenderData.tenderNumber}`,
        contractNumber: `CON-${Date.now()}`,
        totalAmount: proposalsData.find((p: SupplierProposal) => p.supplierId === supplierId)?.totalPrice || 0
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
      } else if (isCreatingFromTender && tenderId && supplierId) {
        // Создание контракта из тендера
        await fetch(`/api/contracts/from-tender?tenderId=${tenderId}&supplierId=${supplierId}`, {
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
                    onChange={(date) => handleInputChange('startDate', date)}
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
                    slotProps={{ textField: { fullWidth: true } }}
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

              {isCreatingFromTender && proposals.length > 0 && (
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Предложения поставщика
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
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {proposals.map((proposal) => (
                          <TableRow key={proposal.id}>
                            <TableCell>{proposal.supplierName}</TableCell>
                            <TableCell>{proposal.proposalNumber}</TableCell>
                            <TableCell>
                              <Chip 
                                label={proposal.status} 
                                color={proposal.status === 'ACCEPTED' ? 'success' : 'default'}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>{proposal.totalPrice}</TableCell>
                            <TableCell>{proposal.currency}</TableCell>
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