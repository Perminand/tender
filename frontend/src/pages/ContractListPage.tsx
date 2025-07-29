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
  Snackbar,
  DialogContentText,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  CheckCircle as CheckCircleIcon,
  FileUpload as FileUploadIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { api } from '../utils/api';
import ResponsiveTable from '../components/ResponsiveTable';

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
}

const ContractListPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedContractId, setSelectedContractId] = useState<string | null>(null);
  const [statusStats, setStatusStats] = useState<{ [key: string]: number }>({});
  const [statusFilter, setStatusFilter] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchContracts();
  }, []);

  // Загрузка статистики по статусам
  const fetchStatusStats = async () => {
    try {
      const response = await api.get('/api/contracts/status-stats');
      const data = response.data;
        setStatusStats(data);
    } catch (error) {
      console.error('Ошибка при загрузке статистики статусов:', error);
      }
  };
  useEffect(() => { fetchStatusStats(); }, []);
  const reloadAll = () => { fetchContracts(); fetchStatusStats(); };

  const fetchContracts = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/contracts');
      const data = response.data;
      setContracts(data);
    } catch (error) {
      console.error('Ошибка при загрузке контрактов:', error);
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
    navigate(`/contracts/${contract.id}/edit`);
  };

  const handleDelete = async () => {
    if (selectedContractId) {
      try {
        await api.delete(`/api/contracts/${selectedContractId}`);
        showSnackbar('Контракт удален', 'success');
        reloadAll();
      } catch (error) {
        console.error('Ошибка при удалении контракта:', error);
        showSnackbar('Ошибка при удалении контракта', 'error');
      } finally {
        setDeleteDialogOpen(false);
        setSelectedContractId(null);
      }
    }
  };

  const openDeleteDialog = (id: string) => {
    setSelectedContractId(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (selectedContractId) {
      try {
        await api.delete(`/contracts/${selectedContractId}`);
        showSnackbar('Контракт удален', 'success');
        reloadAll();
      } catch (error) {
        showSnackbar('Ошибка при удалении контракта', 'error');
      } finally {
        setDeleteDialogOpen(false);
        setSelectedContractId(null);
      }
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

  // Добавить функцию для перевода статусов
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'Черновик';
      case 'ACTIVE': return 'Активный';
      case 'COMPLETED': return 'Завершён';
      case 'CANCELLED': return 'Отменён';
      default: return status;
    }
  };

  const handleExportExcel = async () => {
    try {
      const response = await api.get('/api/contract-registry/export', {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Реестр_контрактов.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Ошибка при экспорте:', error);
      showSnackbar('Ошибка при экспорте в Excel', 'error');
    }
  };

  const stats = {
    total: contracts.length,
    active: contracts.filter(c => c.status === 'ACTIVE').length,
    completed: contracts.filter(c => c.status === 'COMPLETED').length,
    totalAmount: contracts.reduce((sum, c) => sum + (c.totalAmount || 0), 0),
  };

  // Фильтрация контрактов по статусу
  const filteredContracts = statusFilter ? contracts.filter(c => c.status === statusFilter) : contracts;

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
          Контракты
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
        <Grid item xs={6} sm={2.4}>
          <Card sx={{ 
            cursor: 'pointer', 
            backgroundColor: statusFilter === '' ? 'action.selected' : undefined, 
            '&:hover': { backgroundColor: 'action.hover' } 
          }} onClick={() => setStatusFilter('')}>
            <CardContent sx={{ p: { xs: 1.5, md: 2 } }}>
              <Typography color="textSecondary" gutterBottom variant={isMobile ? "body2" : "body1"}>
                Всего контрактов
              </Typography>
              <Typography variant={isMobile ? "h6" : "h4"}>
                {Object.values(statusStats).reduce((a, b) => a + b, 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={2.4}>
          <Card sx={{ 
            cursor: 'pointer', 
            backgroundColor: statusFilter === 'DRAFT' ? 'action.selected' : undefined, 
            '&:hover': { backgroundColor: 'action.hover' } 
          }} onClick={() => setStatusFilter('DRAFT')}>
            <CardContent sx={{ p: { xs: 1.5, md: 2 } }}>
              <Typography color="textSecondary" gutterBottom variant={isMobile ? "body2" : "body1"}>
                Черновики
              </Typography>
              <Typography variant={isMobile ? "h6" : "h4"}>
                {statusStats.DRAFT || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={2.4}>
          <Card sx={{ 
            cursor: 'pointer', 
            backgroundColor: statusFilter === 'ACTIVE' ? 'action.selected' : undefined, 
            '&:hover': { backgroundColor: 'action.hover' } 
          }} onClick={() => setStatusFilter('ACTIVE')}>
            <CardContent sx={{ p: { xs: 1.5, md: 2 } }}>
              <Typography color="textSecondary" gutterBottom variant={isMobile ? "body2" : "body1"}>
                Активные
              </Typography>
              <Typography variant={isMobile ? "h6" : "h4"}>
                {statusStats.ACTIVE || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={2.4}>
          <Card sx={{ 
            cursor: 'pointer', 
            backgroundColor: statusFilter === 'COMPLETED' ? 'action.selected' : undefined, 
            '&:hover': { backgroundColor: 'action.hover' } 
          }} onClick={() => setStatusFilter('COMPLETED')}>
            <CardContent sx={{ p: { xs: 1.5, md: 2 } }}>
              <Typography color="textSecondary" gutterBottom variant={isMobile ? "body2" : "body1"}>
                Завершённые
              </Typography>
              <Typography variant={isMobile ? "h6" : "h4"}>
                {statusStats.COMPLETED || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={2.4}>
          <Card sx={{ 
            cursor: 'pointer', 
            backgroundColor: statusFilter === 'CANCELLED' ? 'action.selected' : undefined, 
            '&:hover': { backgroundColor: 'action.hover' } 
          }} onClick={() => setStatusFilter('CANCELLED')}>
            <CardContent sx={{ p: { xs: 1.5, md: 2 } }}>
              <Typography color="textSecondary" gutterBottom variant={isMobile ? "body2" : "body1"}>
                Отменённые
              </Typography>
              <Typography variant={isMobile ? "h6" : "h4"}>
                {statusStats.CANCELLED || 0}
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
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  label="Статус"
                >
                  <MenuItem value="">Все статусы</MenuItem>
                  <MenuItem value="DRAFT">Черновик</MenuItem>
                  <MenuItem value="ACTIVE">Активный</MenuItem>
                  <MenuItem value="COMPLETED">Завершён</MenuItem>
                  <MenuItem value="CANCELLED">Отменён</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={2}>
              <TextField
                label="Номер контракта"
                size="small"
                fullWidth
                value={''}
                // TODO: добавить фильтр по номеру контракта при необходимости
                disabled
              />
            </Grid>
            <Grid item xs={2}>
              <TextField
                label="Поставщик"
                size="small"
                fullWidth
                value={''}
                // TODO: добавить фильтр по поставщику при необходимости
                disabled
              />
            </Grid>
            <Grid item xs={2}>
              <TextField
                label="Дата от"
                size="small"
                fullWidth
                disabled
              />
            </Grid>
            <Grid item xs={2}>
              <TextField
                label="Дата до"
                size="small"
                fullWidth
                disabled
              />
            </Grid>
            <Grid item xs={2}>
              <Button
                variant="outlined"
                onClick={() => setStatusFilter('')}
                fullWidth
              >
                Очистить фильтры
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Кнопка создания */}

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
            {filteredContracts.map((contract) => (
              <TableRow key={contract.id}>
                <TableCell>{contract.contractNumber}</TableCell>
                <TableCell>{contract.title}</TableCell>
                <TableCell>
                  <Chip
                    label={getStatusLabel(contract.status)}
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
                    title="Просмотр"
                  >
                    <VisibilityIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => navigate(`/contracts/${contract.id}/manage`)}
                    title="Управление"
                    color="primary"
                  >
                    <CheckCircleIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleEdit(contract)}
                    title="Редактировать"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => openDeleteDialog(contract.id)}
                    title="Удалить"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>



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
            Вы уверены, что хотите удалить этот контракт? Это действие нельзя будет отменить.
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

export default ContractListPage; 