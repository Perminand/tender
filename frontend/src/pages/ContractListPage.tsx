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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Card,
  CardContent,
  Grid,
  Typography,
  IconButton,
  Box,
  Alert,
  Snackbar
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';

interface Contract {
  id: number;
  contractNumber: string;
  title: string;
  tenderId: number;
  supplierId: number;
  customerId: number;
  status: string;
  totalAmount: number;
  startDate: string;
  endDate: string;
  terms: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

const ContractListPage: React.FC = () => {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingContract, setEditingContract] = useState<Contract | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [status, setStatus] = useState<string>('DRAFT');
  const navigate = useNavigate();

  useEffect(() => {
    fetchContracts();
  }, []);

  const fetchContracts = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/contracts');
      const data = await response.json();
      setContracts(data);
    } catch (error) {
      showSnackbar('Ошибка при загрузке контрактов', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCreate = () => {
    navigate('/contracts/new');
  };

  const handleEdit = (contract: Contract) => {
    setEditingContract(contract);
    setStatus(contract.status);
    setDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await fetch(`/api/contracts/${id}`, { method: 'DELETE' });
      showSnackbar('Контракт удален', 'success');
      fetchContracts();
    } catch (error) {
      showSnackbar('Ошибка при удалении контракта', 'error');
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    
    try {
      // Преобразуем даты в ISO-формат (yyyy-MM-dd)
      const rawStartDate = formData.get('startDate');
      const rawEndDate = formData.get('endDate');
      const startDate = rawStartDate ? dayjs(rawStartDate as string).format('YYYY-MM-DD') : null;
      const endDate = rawEndDate ? dayjs(rawEndDate as string).format('YYYY-MM-DD') : null;

      const submitData = {
        contractNumber: formData.get('contractNumber'),
        title: formData.get('title'),
        status: status,
        totalAmount: Number(formData.get('totalAmount')),
        startDate,
        endDate,
        terms: formData.get('terms'),
        description: formData.get('description'),
      };

      if (editingContract) {
        await fetch(`/api/contracts/${editingContract.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(submitData),
        });
        showSnackbar('Контракт обновлен', 'success');
      } else {
        await fetch('/api/contracts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(submitData),
        });
        showSnackbar('Контракт создан', 'success');
      }
      
      setDialogOpen(false);
      fetchContracts();
    } catch (error) {
      showSnackbar('Ошибка при сохранении контракта', 'error');
    }
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' } = {
      DRAFT: 'default',
      ACTIVE: 'success',
      COMPLETED: 'info',
      CANCELLED: 'error',
    };
    return colors[status] || 'default';
  };

  const stats = {
    total: contracts.length,
    active: contracts.filter(c => c.status === 'ACTIVE').length,
    completed: contracts.filter(c => c.status === 'COMPLETED').length,
    totalAmount: contracts.reduce((sum, c) => sum + (c.totalAmount || 0), 0),
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Контракты
      </Typography>

      {/* Статистика */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Всего контрактов
              </Typography>
              <Typography variant="h4">
                {stats.total}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Активные
              </Typography>
              <Typography variant="h4">
                {stats.active}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Завершенные
              </Typography>
              <Typography variant="h4">
                {stats.completed}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Общая сумма
              </Typography>
              <Typography variant="h4">
                {stats.totalAmount?.toLocaleString()} ₽
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
          Создать контракт
        </Button>
      </Box>

      {/* Таблица */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Номер</TableCell>
              <TableCell>Название</TableCell>
              <TableCell>Статус</TableCell>
              <TableCell>Сумма</TableCell>
              <TableCell>Дата начала</TableCell>
              <TableCell>Дата окончания</TableCell>
              <TableCell>Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {contracts.map((contract) => (
              <TableRow key={contract.id}>
                <TableCell>{contract.contractNumber}</TableCell>
                <TableCell>{contract.title}</TableCell>
                <TableCell>
                  <Chip
                    label={contract.status}
                    color={getStatusColor(contract.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>{contract.totalAmount?.toLocaleString()} ₽</TableCell>
                <TableCell>
                  {contract.startDate ? dayjs(contract.startDate).format('DD.MM.YYYY') : '-'}
                </TableCell>
                <TableCell>
                  {contract.endDate ? dayjs(contract.endDate).format('DD.MM.YYYY') : '-'}
                </TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={() => navigate(`/contracts/${contract.id}`)}
                  >
                    <VisibilityIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleEdit(contract)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDelete(contract.id)}
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
          {editingContract ? 'Редактировать контракт' : 'Создать контракт'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  name="contractNumber"
                  label="Номер контракта"
                  fullWidth
                  required
                  defaultValue={editingContract?.contractNumber}
                />
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth required>
                  <InputLabel>Статус</InputLabel>
                  <Select
                    name="status"
                    value={status}
                    onChange={e => setStatus(e.target.value)}
                  >
                    <MenuItem value="DRAFT">Черновик</MenuItem>
                    <MenuItem value="ACTIVE">Активный</MenuItem>
                    <MenuItem value="COMPLETED">Завершен</MenuItem>
                    <MenuItem value="CANCELLED">Отменен</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name="title"
                  label="Название"
                  fullWidth
                  required
                  defaultValue={editingContract?.title}
                />
              </Grid>
              <Grid item xs={6}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label="Дата начала"
                    slotProps={{
                      textField: {
                        name: 'startDate',
                        fullWidth: true,
                      },
                    }}
                    defaultValue={editingContract?.startDate ? dayjs(editingContract.startDate) : null}
                  />
                </LocalizationProvider>
              </Grid>
              <Grid item xs={6}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label="Дата окончания"
                    slotProps={{
                      textField: {
                        name: 'endDate',
                        fullWidth: true,
                      },
                    }}
                    defaultValue={editingContract?.endDate ? dayjs(editingContract.endDate) : null}
                  />
                </LocalizationProvider>
              </Grid>
              <Grid item xs={6}>
                <TextField
                  name="totalAmount"
                  label="Общая сумма"
                  type="number"
                  fullWidth
                  defaultValue={editingContract?.totalAmount}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name="terms"
                  label="Условия"
                  multiline
                  rows={3}
                  fullWidth
                  defaultValue={editingContract?.terms}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name="description"
                  label="Описание"
                  multiline
                  rows={3}
                  fullWidth
                  defaultValue={editingContract?.description}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>
              Отмена
            </Button>
            <Button type="submit" variant="contained">
              {editingContract ? 'Обновить' : 'Создать'}
            </Button>
          </DialogActions>
        </form>
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

export default ContractListPage; 