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
  Chip,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  DialogContentText,
  MenuItem,
  FormControl,
  InputLabel,
  Select
} from '@mui/material';
import {
  Add as AddIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Publish as PublishIcon,
  Close as CloseIcon,
  TrendingUp as TrendingUpIcon,
  CheckCircle as CheckCircleIcon,
  Assessment as AssessmentIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { fnsApi } from '../utils/fnsApi';
import type { SelectChangeEvent } from '@mui/material/Select';
import Pagination from '@mui/material/Pagination';

interface TenderDto {
  id: string;
  tenderNumber: string;
  title: string;
  description: string;
  customerName: string;
  startDate: string;
  endDate: string;
  submissionDeadline: string;
  status: 'DRAFT' | 'PUBLISHED' | 'BIDDING' | 'EVALUATION' | 'AWARDED' | 'CANCELLED';
  proposalsCount: number;
  bestPrice: number;
  bestSupplierName: string;
}

const TenderListPage: React.FC = () => {
  const [tenders, setTenders] = useState<TenderDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTenderId, setSelectedTenderId] = useState<string | null>(null);
  const [statusDialog, setStatusDialog] = useState<{
    open: boolean;
    tenderId: string | null;
    action: 'publish' | 'start-bidding' | 'close' | 'complete' | 'cancel' | null;
    title: string;
    description: string;
    onConfirm: (() => void) | null;
  }>({
    open: false,
    tenderId: null,
    action: null,
    title: '',
    description: '',
    onConfirm: null
  });
  const navigate = useNavigate();

  const statusOrder = [
    'DRAFT',
    'PUBLISHED',
    'BIDDING',
    'EVALUATION',
    'AWARDED',
    'CANCELLED'
  ];
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [page, setPage] = useState(1);
  const rowsPerPage = 50;

  useEffect(() => {
    loadTenders();
  }, []);

  const loadTenders = async () => {
    try {
      setLoading(true);
      const response = await fnsApi.get('/api/tenders');
      setTenders(response.data);
    } catch (error) {
      console.error('Error loading tenders:', error);
      setError('Ошибка загрузки тендеров');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (tenderId: string) => {
    setSelectedTenderId(tenderId);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (selectedTenderId) {
      try {
        await fnsApi.delete(`/api/tenders/${selectedTenderId}`);
        await loadTenders();
        setDeleteDialogOpen(false);
        setSelectedTenderId(null);
        setError(null);
      } catch (error: any) {
        console.error('Error deleting tender:', error);
        const errorMessage = error.response?.data?.message || 'Ошибка удаления тендера';
        setError(errorMessage);
        setDeleteDialogOpen(false);
        setSelectedTenderId(null);
      }
    }
  };

  const handlePublish = async (tenderId: string) => {
    try {
      await fnsApi.post(`/api/tenders/${tenderId}/publish`);
      await loadTenders();
      setError(null);
    } catch (error: any) {
      console.error('Error publishing tender:', error);
      const errorMessage = error.response?.data?.message || 'Ошибка публикации тендера';
      setError(errorMessage);
    }
  };

  const handleClose = async (tenderId: string) => {
    try {
      await fnsApi.post(`/api/tenders/${tenderId}/close`);
      await loadTenders();
      setError(null);
    } catch (error: any) {
      console.error('Error closing tender:', error);
      const errorMessage = error.response?.data?.message || 'Ошибка закрытия тендера';
      setError(errorMessage);
    }
  };

  const handleStartBidding = async (tenderId: string) => {
    try {
      await fnsApi.post(`/api/tenders/${tenderId}/start-bidding`);
      await loadTenders();
      setError(null);
    } catch (error: any) {
      console.error('Error starting bidding:', error);
      const errorMessage = error.response?.data?.message || 'Ошибка начала приема предложений';
      setError(errorMessage);
    }
  };

  const handleComplete = async (tenderId: string) => {
    try {
      await fnsApi.post(`/api/tenders/${tenderId}/complete`);
      await loadTenders();
      setError(null);
    } catch (error: any) {
      console.error('Error completing tender:', error);
      const errorMessage = error.response?.data?.message || 'Ошибка завершения тендера';
      setError(errorMessage);
    }
  };

  const handleCancel = async (tenderId: string) => {
    try {
      await fnsApi.post(`/api/tenders/${tenderId}/cancel`);
      await loadTenders();
      setError(null);
    } catch (error: any) {
      console.error('Error cancelling tender:', error);
      const errorMessage = error.response?.data?.message || 'Ошибка отмены тендера';
      setError(errorMessage);
    }
  };

  const openStatusDialog = (tenderId: string, action: 'publish' | 'start-bidding' | 'close' | 'complete' | 'cancel') => {
    let title = '';
    let description = '';
    let onConfirm: (() => void) | null = null;
    switch (action) {
      case 'publish':
        title = 'Опубликовать тендер';
        description = 'Вы уверены, что хотите опубликовать тендер? После публикации тендер станет доступен для просмотра.';
        onConfirm = () => handlePublish(tenderId);
        break;
      case 'start-bidding':
        title = 'Начать прием предложений';
        description = 'Вы уверены, что хотите начать прием предложений? После этого поставщики смогут подавать предложения.';
        onConfirm = () => handleStartBidding(tenderId);
        break;
      case 'close':
        title = 'Закрыть прием предложений';
        description = 'Вы уверены, что хотите закрыть прием предложений? После этого новые предложения приниматься не будут.';
        onConfirm = () => handleClose(tenderId);
        break;
      case 'complete':
        title = 'Завершить тендер';
        description = 'Вы уверены, что хотите завершить тендер? Это действие нельзя будет отменить.';
        onConfirm = () => handleComplete(tenderId);
        break;
      case 'cancel':
        title = 'Отменить тендер';
        description = 'Вы уверены, что хотите отменить тендер? После отмены тендер будет недоступен для дальнейших действий.';
        onConfirm = () => handleCancel(tenderId);
        break;
    }
    setStatusDialog({ open: true, tenderId, action, title, description, onConfirm });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'default';
      case 'PUBLISHED': return 'info';
      case 'BIDDING': return 'warning';
      case 'EVALUATION': return 'primary';
      case 'AWARDED': return 'success';
      case 'CANCELLED': return 'error';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'Черновик';
      case 'PUBLISHED': return 'Опубликован';
      case 'BIDDING': return 'Прием предложений';
      case 'EVALUATION': return 'Оценка';
      case 'AWARDED': return 'Присужден';
      case 'CANCELLED': return 'Отменен';
      default: return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB'
    }).format(price);
  };

  const handleStatusFilterChange = (event: SelectChangeEvent<string>) => {
    setStatusFilter(event.target.value as string);
  };

  const filteredAndSortedTenders = tenders
    .filter(t => statusFilter === 'ALL' || t.status === statusFilter)
    .sort((a, b) => {
      const statusDiff = statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status);
      if (statusDiff !== 0) return statusDiff;
      return a.title.localeCompare(b.title, 'ru', { sensitivity: 'base' });
    });

  const paginatedTenders = filteredAndSortedTenders.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  if (loading) {
    return <Typography>Загрузка...</Typography>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Тендеры
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/tenders/new')}
        >
          Создать тендер
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
        <FormControl size="small" sx={{ minWidth: 220 }}>
          <InputLabel id="status-filter-label">Фильтр по статусу</InputLabel>
          <Select
            labelId="status-filter-label"
            value={statusFilter}
            label="Фильтр по статусу"
            onChange={handleStatusFilterChange}
          >
            <MenuItem value="ALL">Все статусы</MenuItem>
            <MenuItem value="DRAFT">Черновик</MenuItem>
            <MenuItem value="PUBLISHED">Опубликован</MenuItem>
            <MenuItem value="BIDDING">Прием предложений</MenuItem>
            <MenuItem value="EVALUATION">Оценка</MenuItem>
            <MenuItem value="AWARDED">Присужден</MenuItem>
            <MenuItem value="CANCELLED">Отменен</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Grid container spacing={3}>
        {paginatedTenders.map((tender) => (
          <Grid item xs={12} md={6} lg={4} key={tender.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Typography variant="h6" component="h2" sx={{ flex: 1 }}>
                    {tender.title}
                  </Typography>
                  <Chip
                    label={getStatusLabel(tender.status)}
                    color={getStatusColor(tender.status)}
                    size="small"
                  />
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  №{tender.tenderNumber}
                </Typography>

                <Typography variant="body2" sx={{ mb: 1 }}>
                  Заказчик: {tender.customerName}
                </Typography>

                <Typography variant="body2" sx={{ mb: 1 }}>
                  Срок подачи: {formatDate(tender.submissionDeadline)}
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Typography variant="body2" sx={{ mr: 1 }}>
                    Предложений: {tender.proposalsCount}
                  </Typography>
                  {tender.bestPrice && (
                    <Box sx={{ display: 'flex', alignItems: 'center', ml: 'auto' }}>
                      <TrendingUpIcon sx={{ fontSize: 16, mr: 0.5, color: 'success.main' }} />
                      <Typography variant="body2" color="success.main">
                        {formatPrice(tender.bestPrice)}
                      </Typography>
                    </Box>
                  )}
                </Box>

                {tender.bestSupplierName && (
                  <Typography variant="body2" color="success.main" sx={{ mb: 2 }}>
                    Лучшее предложение: {tender.bestSupplierName}
                  </Typography>
                )}

                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Tooltip title="Просмотр">
                    <IconButton
                      size="small"
                      onClick={() => navigate(`/tenders/${tender.id}`)}
                    >
                      <ViewIcon />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Редактировать">
                    <IconButton
                      size="small"
                      onClick={() => navigate(`/tenders/${tender.id}/edit`)}
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>

                  {tender.status === 'DRAFT' && (
                    <>
                    <Tooltip title="Опубликовать">
                        <IconButton
                          size="small"
                          onClick={() => openStatusDialog(tender.id, 'publish')}
                        >
                          <PublishIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Удалить">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteClick(tender.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </>
                  )}

                  {tender.status === 'PUBLISHED' && (
                    <Tooltip title="Начать прием предложений">
                      <IconButton
                        size="small"
                        color="warning"
                        onClick={() => openStatusDialog(tender.id, 'start-bidding')}
                      >
                        <TrendingUpIcon />
                      </IconButton>
                    </Tooltip>
                  )}

                  {tender.status === 'BIDDING' && (
                    <Tooltip title="Закрыть прием">
                      <IconButton
                        size="small"
                        onClick={() => openStatusDialog(tender.id, 'close')}
                      >
                        <CloseIcon />
                      </IconButton>
                    </Tooltip>
                  )}

                  {tender.status === 'EVALUATION' && (
                    <Tooltip title="Завершить тендер">
                      <IconButton
                        size="small"
                        color="success"
                        onClick={() => openStatusDialog(tender.id, 'complete')}
                      >
                        <CheckCircleIcon />
                      </IconButton>
                    </Tooltip>
                  )}

                  {tender.status !== 'CANCELLED' && tender.status !== 'AWARDED' && (
                    <Tooltip title="Отменить тендер">
                    <IconButton
                      size="small"
                      color="error"
                        onClick={() => openStatusDialog(tender.id, 'cancel')}
                      >
                        <CloseIcon />
                      </IconButton>
                    </Tooltip>
                  )}

                  {tender.status === 'BIDDING' && (
                    <Tooltip title="Подать предложение">
                      <IconButton
                        size="small"
                        color="success"
                        onClick={() => navigate(`/tenders/${tender.id}/proposals/new`)}
                    >
                        <PublishIcon />
                    </IconButton>
                  </Tooltip>
                  )}

                  {(tender.status === 'BIDDING' || tender.status === 'EVALUATION' || tender.status === 'AWARDED') && (
                    <Tooltip title="Анализ цен">
                      <IconButton
                        size="small"
                        color="info"
                        onClick={() => navigate(`/tenders/${tender.id}/price-analysis`)}
                      >
                        <AssessmentIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
        <Pagination
          count={Math.ceil(filteredAndSortedTenders.length / rowsPerPage)}
          page={page}
          onChange={(_, value) => setPage(value)}
          color="primary"
        />
      </Box>

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
            Вы уверены, что хотите удалить этот тендер? Это действие нельзя будет отменить.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="primary">
            Отмена
          </Button>
          <Button onClick={handleDelete} color="error" autoFocus>
            Удалить
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={statusDialog.open}
        onClose={() => setStatusDialog(prev => ({ ...prev, open: false }))}
        aria-labelledby="status-dialog-title"
        aria-describedby="status-dialog-description"
      >
        <DialogTitle id="status-dialog-title">{statusDialog.title}</DialogTitle>
        <DialogContent>
          <DialogContentText id="status-dialog-description">
            {statusDialog.description}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusDialog(prev => ({ ...prev, open: false }))} color="primary">
            Отмена
          </Button>
          <Button
            onClick={() => {
              if (statusDialog.onConfirm) statusDialog.onConfirm();
              setStatusDialog(prev => ({ ...prev, open: false }));
            }}
            color="secondary"
            autoFocus
          >
            Подтвердить
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TenderListPage; 