import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import {
  Box, Card, CardContent, Typography, Grid, TextField, Button, FormControl, InputLabel, Select, MenuItem, Snackbar, Alert
} from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import dayjs, { Dayjs } from 'dayjs';
import { api } from '../utils/api';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const calculateWorkingDays = (startDate: Dayjs, workingDays: number): Dayjs => {
  let dueDate = startDate;
  let addedDays = 0;
  while (addedDays < workingDays) {
    dueDate = dueDate.add(1, 'day');
    if (dueDate.day() !== 6 && dueDate.day() !== 0) {
      addedDays++;
    }
  }
  return dueDate;
};

const PaymentEditPage: React.FC = () => {
  const navigate = useNavigate();
  const query = useQuery();
  const { id } = useParams();
  const contractIdFromQuery = query.get('contractId') || '';
  const invoiceIdFromQuery = query.get('invoiceId') || '';
  const amountFromQuery = query.get('amount') || '';
  const invoiceNumberFromQuery = query.get('invoiceNumber') || '';

  const [form, setForm] = useState({
    paymentNumber: '',
    paymentDate: dayjs(),
    type: 'PROGRESS',
    amount: amountFromQuery,
    status: 'PENDING',
    invoiceNumber: invoiceNumberFromQuery,
    description: '',
    contractId: contractIdFromQuery,
  });
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [contracts, setContracts] = useState<any[]>([]);
  const [selectedContract, setSelectedContract] = useState<any>(null);
  const [supplierName, setSupplierName] = useState('');
  const [currency, setCurrency] = useState('RUB');
  const [paymentTerms, setPaymentTerms] = useState('');
  const [calculatedDueDate, setCalculatedDueDate] = useState<Dayjs | null>(null);
  const [isEdit, setIsEdit] = useState(false);

  useEffect(() => {
    if (id) {
      setIsEdit(true);
      fetchPayment();
    } else {
      fetchContracts();
      // Если передан invoiceId, загружаем данные счета
      if (invoiceIdFromQuery) {
        fetchInvoiceData();
      }
    }
  }, [id, invoiceIdFromQuery]);

  const fetchContracts = async () => {
    try {
      const response = await api.get('/api/contracts');
      setContracts(response.data);
    } catch {}
  };

  const fetchInvoiceData = async () => {
    try {
      const response = await api.get(`/api/invoices/${invoiceIdFromQuery}`);
      const invoice = response.data;
      
      // Обновляем форму данными счета
      setForm(prev => ({
        ...prev,
        contractId: invoice.contractId || prev.contractId,
        amount: invoice.remainingAmount?.toString() || prev.amount,
        invoiceNumber: invoice.invoiceNumber || prev.invoiceNumber,
        description: `Оплата счета ${invoice.invoiceNumber}`,
      }));
      
      // Если есть contractId, загружаем данные контракта
      if (invoice.contractId) {
        const contractResponse = await api.get(`/api/contracts/${invoice.contractId}`);
        const contract = contractResponse.data;
        setSupplierName(contract.supplierName || '');
        setCurrency(contract.currency || 'RUB');
      }
    } catch (error) {
      console.error('Ошибка при загрузке данных счета:', error);
    }
  };

  const fetchPayment = async () => {
    try {
      const response = await api.get(`/api/payments/${id}`);
      const data = response.data;
      setForm({
        paymentNumber: data.paymentNumber || '',
        paymentDate: data.paymentDate ? dayjs(data.paymentDate) : dayjs(),
        type: data.paymentType || 'PROGRESS',
        amount: data.amount?.toString() || '',
        status: data.status || 'PENDING',
        invoiceNumber: data.invoiceNumber || '',
        description: data.notes || '',
        contractId: data.contractId || '',
      });
      setCalculatedDueDate(data.dueDate ? dayjs(data.dueDate) : null);
      setSupplierName(data.supplierName || '');
      // Если список контрактов пуст, подгружаем
      if (contracts.length === 0) {
        fetchContracts();
      }
    } catch (error) {
      showSnackbar('Ошибка при загрузке платежа', 'error');
    }
  };

  useEffect(() => {
    if (!isEdit && form.contractId) {
      const contract = contracts.find(c => c.id === form.contractId);
      setSelectedContract(contract);
      if (contract) {
        setSupplierName(
          contract.tender?.awardedSupplier?.name ||
          contract.supplierName ||
          ''
        );
        setCurrency(contract.currency || 'RUB');
        setPaymentTerms(contract.paymentTerms || '');
        setForm(f => ({ ...f, amount: contract.totalAmount?.toString() || '' }));
        setCalculatedDueDate(calculateWorkingDays(dayjs(), 5));
      }
    }
  }, [form.contractId, contracts, isEdit]);

  // Автозаполнение при загрузке контрактов, если есть contractId в URL
  useEffect(() => {
    if (!isEdit && contracts.length > 0 && contractIdFromQuery) {
      const contract = contracts.find(c => c.id === contractIdFromQuery);
      if (contract) {
        setSelectedContract(contract);
        setSupplierName(
          contract.tender?.awardedSupplier?.name ||
          contract.supplierName ||
          ''
        );
        setCurrency(contract.currency || 'RUB');
        setPaymentTerms(contract.paymentTerms || '');
        setForm(f => ({ ...f, amount: contract.totalAmount?.toString() || '' }));
        setCalculatedDueDate(calculateWorkingDays(dayjs(), 5));
      }
    }
  }, [contracts, isEdit, contractIdFromQuery]);

  // После загрузки контрактов, если contractId есть, выставляем выбранный контракт
  useEffect(() => {
    if (isEdit && contracts.length > 0 && form.contractId) {
      const contract = contracts.find(c => c.id === form.contractId);
      setSelectedContract(contract);
    }
  }, [contracts, isEdit, form.contractId]);

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleChange = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        paymentNumber: form.paymentNumber,
        paymentType: form.type,
        amount: Number(form.amount),
        paymentDate: form.paymentDate.format('YYYY-MM-DD'),
        contractId: form.contractId,
        dueDate: calculatedDueDate ? calculatedDueDate.format('YYYY-MM-DD') : undefined,
        invoiceNumber: form.invoiceNumber,
        description: form.description,
        status: form.status,
      };
      
      const url = isEdit ? `/api/payments/${id}` : '/api/payments';
      const method = isEdit ? 'PUT' : 'POST';
      
      const response = await api[isEdit ? 'put' : 'post'](url, payload);
      
      if (response.status === 200 || response.status === 201) {
        showSnackbar(isEdit ? 'Платеж обновлен' : 'Платеж создан', 'success');
        
        // Если создан платеж для счета, перенаправляем на страницу счетов
        if (!isEdit && invoiceIdFromQuery) {
          setTimeout(() => navigate('/invoices'), 1000);
        } else {
          setTimeout(() => navigate(-1), 1000);
        }
      } else {
        showSnackbar('Ошибка при сохранении платежа', 'error');
      }
    } catch (error) {
      console.error('Ошибка при сохранении платежа:', error);
      showSnackbar('Ошибка при сохранении платежа', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
      <Box display="flex" alignItems="center" mb={2}>
        <Button
          variant="outlined"
          onClick={() => {
            if (!isEdit && invoiceIdFromQuery) {
              navigate('/invoices');
            } else {
              navigate(-1);
            }
          }}
          sx={{ mr: 2 }}
        >
          ← Назад
        </Button>
        <Typography variant="h5">
          {isEdit ? 'Редактирование платежа' : 'Создание платежа'}
          {!isEdit && invoiceNumberFromQuery && (
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              для счета {invoiceNumberFromQuery}
            </Typography>
          )}
        </Typography>
      </Box>
      <Card>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField label="Номер платежа" value={form.paymentNumber} onChange={e => handleChange('paymentNumber', e.target.value)} fullWidth required />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Контракт</InputLabel>
                <Select
                  value={form.contractId}
                  label="Контракт"
                  onChange={e => handleChange('contractId', e.target.value)}
                  disabled={isEdit}
                >
                  {contracts.map(contract => (
                    <MenuItem key={contract.id} value={contract.id}>
                      {contract.contractNumber} {contract.title ? `— ${contract.title}` : ''}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField label="Поставщик" value={supplierName} fullWidth disabled />
            </Grid>
            <Grid item xs={12}>
              <TextField label="Валюта" value={currency} fullWidth disabled />
            </Grid>
            <Grid item xs={12}>
              <TextField label="Сумма" type="number" value={form.amount} onChange={e => handleChange('amount', e.target.value)} fullWidth required />
            </Grid>
            {calculatedDueDate && (
              <Grid item xs={12}>
                <TextField
                  label="Срок оплаты (5 рабочих дней)"
                  value={calculatedDueDate.format('DD.MM.YYYY')}
                  fullWidth
                  disabled
                />
              </Grid>
            )}
            {paymentTerms && (
              <Grid item xs={12}>
                <TextField label="Условия оплаты" value={paymentTerms} fullWidth disabled />
              </Grid>
            )}
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Тип платежа</InputLabel>
                <Select value={form.type} onChange={e => handleChange('type', e.target.value)} label="Тип платежа">
                  <MenuItem value="ADVANCE">Аванс</MenuItem>
                  <MenuItem value="PROGRESS">Прогрессный платеж</MenuItem>
                  <MenuItem value="FINAL">Финальный платеж</MenuItem>
                  <MenuItem value="PENALTY">Штраф</MenuItem>
                  <MenuItem value="COMPENSATION">Компенсация</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            {isEdit && (
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Статус платежа</InputLabel>
                  <Select value={form.status} onChange={e => handleChange('status', e.target.value)} label="Статус платежа">
                    <MenuItem value="PENDING">Ожидает оплаты</MenuItem>
                    <MenuItem value="PAID">Оплачен</MenuItem>
                    <MenuItem value="OVERDUE">Просрочен</MenuItem>
                    <MenuItem value="CANCELLED">Отменен</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            )}
            <Grid item xs={12}>
              <TextField label="Номер счета" value={form.invoiceNumber} onChange={e => handleChange('invoiceNumber', e.target.value)} fullWidth />
            </Grid>
            <Grid item xs={12}>
              <TextField label="Описание" value={form.description} onChange={e => handleChange('description', e.target.value)} fullWidth multiline rows={2} />
            </Grid>
          </Grid>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, gap: 2 }}>
            <Button onClick={() => navigate(-1)} disabled={saving}>Отмена</Button>
            <Button variant="contained" onClick={handleSave} disabled={saving}>
              {isEdit ? 'Обновить' : 'Сохранить'}
            </Button>
          </Box>
        </CardContent>
      </Card>
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PaymentEditPage; 