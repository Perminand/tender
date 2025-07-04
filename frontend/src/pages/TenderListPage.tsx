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
  DialogActions
} from '@mui/material';
import {
  Add as AddIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Publish as PublishIcon,
  Close as CloseIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { fnsApi } from '../utils/fnsApi';

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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTenderId, setSelectedTenderId] = useState<string | null>(null);
  const navigate = useNavigate();

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
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (selectedTenderId) {
      try {
        await fnsApi.delete(`/api/tenders/${selectedTenderId}`);
        await loadTenders();
        setDeleteDialogOpen(false);
        setSelectedTenderId(null);
      } catch (error) {
        console.error('Error deleting tender:', error);
      }
    }
  };

  const handlePublish = async (tenderId: string) => {
    try {
      await fnsApi.post(`/api/tenders/${tenderId}/publish`);
      await loadTenders();
    } catch (error) {
      console.error('Error publishing tender:', error);
    }
  };

  const handleClose = async (tenderId: string) => {
    try {
      await fnsApi.post(`/api/tenders/${tenderId}/close`);
      await loadTenders();
    } catch (error) {
      console.error('Error closing tender:', error);
    }
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

      <Grid container spacing={3}>
        {tenders.map((tender) => (
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
                    <Tooltip title="Опубликовать">
                      <IconButton
                        size="small"
                        onClick={() => handlePublish(tender.id)}
                      >
                        <PublishIcon />
                      </IconButton>
                    </Tooltip>
                  )}

                  {tender.status === 'BIDDING' && (
                    <Tooltip title="Закрыть прием">
                      <IconButton
                        size="small"
                        onClick={() => handleClose(tender.id)}
                      >
                        <CloseIcon />
                      </IconButton>
                    </Tooltip>
                  )}

                  <Tooltip title="Удалить">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => {
                        setSelectedTenderId(tender.id);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Подтверждение удаления</DialogTitle>
        <DialogContent>
          <Typography>
            Вы уверены, что хотите удалить этот тендер?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            Отмена
          </Button>
          <Button onClick={handleDelete} color="error">
            Удалить
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TenderListPage; 