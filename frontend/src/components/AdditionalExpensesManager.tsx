import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  Chip,
  Alert,
  Grid
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AttachFile as AttachFileIcon
} from '@mui/icons-material';
import { api } from '../utils/api';

interface Company {
  id: string;
  name: string;
  shortName: string;
}

interface AdditionalExpense {
  id: string;
  supplierProposalId: string;
  expenseProviderId?: string;
  expenseProviderName?: string;
  expenseType: string;
  description: string;
  amount: number;
  currency: string;
  invoiceNumber?: string;
  invoiceDate?: string;
  documentPath?: string;
  notes?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface AdditionalExpensesManagerProps {
  supplierProposalId: string;
  onExpensesChange?: (expenses: AdditionalExpense[]) => void;
}

const EXPENSE_TYPES = [
  { value: 'DELIVERY', label: 'Доставка' },
  { value: 'CUSTOMS', label: 'Таможенные расходы' },
  { value: 'INSURANCE', label: 'Страхование' },
  { value: 'PACKAGING', label: 'Упаковка' },
  { value: 'LOADING', label: 'Погрузка/разгрузка' },
  { value: 'STORAGE', label: 'Хранение' },
  { value: 'OTHER', label: 'Прочие расходы' }
];

const EXPENSE_STATUSES = [
  { value: 'PENDING', label: 'Ожидает подтверждения', color: 'warning' },
  { value: 'APPROVED', label: 'Подтвержден', color: 'success' },
  { value: 'REJECTED', label: 'Отклонен', color: 'error' },
  { value: 'PAID', label: 'Оплачен', color: 'info' }
];

const AdditionalExpensesManager: React.FC<AdditionalExpensesManagerProps> = ({
  supplierProposalId,
  onExpensesChange
}) => {
  const [expenses, setExpenses] = useState<AdditionalExpense[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<AdditionalExpense | null>(null);
  const [formData, setFormData] = useState<Partial<AdditionalExpense>>({
    expenseType: 'DELIVERY',
    description: '',
    amount: 0,
    currency: 'RUB',
    status: 'PENDING'
  });

  useEffect(() => {
    loadExpenses();
    loadCompanies();
  }, [supplierProposalId]);

  const loadExpenses = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/additional-expenses/proposal/${supplierProposalId}`);
      setExpenses(response.data);
      onExpensesChange?.(response.data);
      setError(null);
    } catch (err) {
      setError('Ошибка при загрузке дополнительных расходов');
      console.error('Error loading additional expenses:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadCompanies = async () => {
    try {
      const response = await api.get('/api/companies');
      setCompanies(response.data);
    } catch (err) {
      console.error('Error loading companies:', err);
    }
  };

  const handleCreate = () => {
    setEditingExpense(null);
    setFormData({
      expenseType: 'DELIVERY',
      description: '',
      amount: 0,
      currency: 'RUB',
      status: 'PENDING'
    });
    setDialogOpen(true);
  };

  const handleEdit = (expense: AdditionalExpense) => {
    setEditingExpense(expense);
    setFormData({
      expenseType: expense.expenseType,
      description: expense.description,
      amount: expense.amount,
      currency: expense.currency,
      expenseProviderId: expense.expenseProviderId,
      invoiceNumber: expense.invoiceNumber,
      invoiceDate: expense.invoiceDate,
      notes: expense.notes,
      status: expense.status
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот дополнительный расход?')) {
      return;
    }

    try {
      await api.delete(`/api/additional-expenses/${id}`);
      await loadExpenses();
    } catch (err) {
      setError('Ошибка при удалении дополнительного расхода');
      console.error('Error deleting additional expense:', err);
    }
  };

  const handleSubmit = async () => {
    try {
      const expenseData = {
        ...formData,
        supplierProposalId
      };

      if (editingExpense) {
        await api.put(`/api/additional-expenses/${editingExpense.id}`, expenseData);
      } else {
        await api.post('/api/additional-expenses', expenseData);
      }

      setDialogOpen(false);
      await loadExpenses();
    } catch (err) {
      setError('Ошибка при сохранении дополнительного расхода');
      console.error('Error saving additional expense:', err);
    }
  };

  const getStatusColor = (status: string) => {
    const statusInfo = EXPENSE_STATUSES.find(s => s.value === status);
    return statusInfo?.color || 'default';
  };

  const getStatusLabel = (status: string) => {
    const statusInfo = EXPENSE_STATUSES.find(s => s.value === status);
    return statusInfo?.label || status;
  };

  const getExpenseTypeLabel = (type: string) => {
    const typeInfo = EXPENSE_TYPES.find(t => t.value === type);
    return typeInfo?.label || type;
  };

  const calculateTotal = () => {
    return expenses
      .filter(expense => expense.status === 'APPROVED')
      .reduce((sum, expense) => sum + expense.amount, 0);
  };

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Дополнительные расходы
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={handleCreate}
            startIcon={<AddIcon />}
          >
            Добавить расход
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Тип</TableCell>
                <TableCell>Описание</TableCell>
                <TableCell>Поставщик</TableCell>
                <TableCell>Сумма</TableCell>
                <TableCell>Счет</TableCell>
                <TableCell>Статус</TableCell>
                <TableCell>Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {expenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell>
                    <Chip 
                      label={getExpenseTypeLabel(expense.expenseType)} 
                      size="small" 
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>{expense.description}</TableCell>
                  <TableCell>{expense.expenseProviderName || '-'}</TableCell>
                  <TableCell>
                    {expense.amount.toLocaleString('ru-RU')} {expense.currency}
                  </TableCell>
                  <TableCell>{expense.invoiceNumber || '-'}</TableCell>
                  <TableCell>
                    <Chip 
                      label={getStatusLabel(expense.status)} 
                      size="small" 
                      color={getStatusColor(expense.status) as any}
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton 
                      size="small" 
                      onClick={() => handleEdit(expense)}
                      color="primary"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      onClick={() => handleDelete(expense.id)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {expenses.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    Дополнительные расходы не добавлены
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {expenses.length > 0 && (
          <Box sx={{ mt: 2, textAlign: 'right' }}>
            <Typography variant="h6">
              Общая сумма одобренных расходов: {calculateTotal().toLocaleString('ru-RU')} ₽
            </Typography>
          </Box>
        )}

        {/* Диалог создания/редактирования */}
        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            {editingExpense ? 'Редактировать дополнительный расход' : 'Добавить дополнительный расход'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Тип расхода</InputLabel>
                  <Select
                    value={formData.expenseType || ''}
                    onChange={(e) => setFormData({ ...formData, expenseType: e.target.value })}
                    label="Тип расхода"
                  >
                    {EXPENSE_TYPES.map((type) => (
                      <MenuItem key={type.value} value={type.value}>
                        {type.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Сумма"
                  type="number"
                  value={formData.amount || ''}
                  onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                  inputProps={{ min: 0, step: 0.01 }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Описание"
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  multiline
                  rows={2}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Autocomplete
                  options={companies}
                  getOptionLabel={(option) => option.name}
                  value={companies.find(c => c.id === formData.expenseProviderId) || null}
                  onChange={(_, newValue) => setFormData({ 
                    ...formData, 
                    expenseProviderId: newValue?.id 
                  })}
                  renderInput={(params) => (
                    <TextField {...params} label="Поставщик расходов" />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Номер счета"
                  value={formData.invoiceNumber || ''}
                  onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Дата счета"
                  type="date"
                  value={formData.invoiceDate || ''}
                  onChange={(e) => setFormData({ ...formData, invoiceDate: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Статус</InputLabel>
                  <Select
                    value={formData.status || ''}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    label="Статус"
                  >
                    {EXPENSE_STATUSES.map((status) => (
                      <MenuItem key={status.value} value={status.value}>
                        {status.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Примечания"
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  multiline
                  rows={2}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleSubmit} variant="contained">
              {editingExpense ? 'Сохранить' : 'Добавить'}
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default AdditionalExpensesManager;
