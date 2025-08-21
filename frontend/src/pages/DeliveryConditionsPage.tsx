import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Container,
  Button,
  Grid,
  Chip,
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
  Paper,
  Alert,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  LocalShipping as DeliveryIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import { api } from '../utils/api';
import { useLocation } from 'react-router-dom';
import DeliveryConditionForm from '../components/DeliveryConditionForm';

interface DeliveryConditionVm {
  id?: string;
  name: string;
  description?: string;
  deliveryType: string;
  deliveryPeriod?: string;
  deliveryResponsibility: string;
  additionalTerms?: string;
  createdAt: string;
  updatedAt: string;
  calculateDelivery?: boolean;
}

const DeliveryConditionsPage: React.FC = () => {
  const [conditions, setConditions] = useState<DeliveryConditionVm[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCondition, setEditingCondition] = useState<DeliveryConditionVm | null>(null);
  const [currentCondition, setCurrentCondition] = useState<DeliveryConditionVm | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewingCondition, setViewingCondition] = useState<DeliveryConditionVm | null>(null);

  const location = useLocation();

  useEffect(() => {
    loadConditions();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('create') === '1') {
      handleCreate();
    }
  }, [location.search]);

  const loadConditions = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/delivery-conditions');
      setConditions(response.data);
      setError(null);
    } catch (err) {
      setError('Ошибка при загрузке условий доставки');
      console.error('Error loading delivery conditions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingCondition(null);
    setCurrentCondition({
      id: '',
      name: '',
      description: '',
      deliveryType: 'DELIVERY_TO_WAREHOUSE',
      deliveryPeriod: '',
      deliveryResponsibility: 'SUPPLIER',
      additionalTerms: '',
      calculateDelivery: false,
      createdAt: '',
      updatedAt: ''
    });
    setDialogOpen(true);
  };

  const handleEdit = (condition: DeliveryConditionVm) => {
    setEditingCondition(condition);
    setCurrentCondition(condition);
    setDialogOpen(true);
  };

  const handleView = (condition: DeliveryConditionVm) => {
    setViewingCondition(condition);
    setViewDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Вы уверены, что хотите удалить это условие доставки?')) {
      return;
    }

    try {
      await api.delete(`/api/delivery-conditions/${id}`);
      await loadConditions();
    } catch (err) {
      setError('Ошибка при удалении условия доставки');
      console.error('Error deleting delivery condition:', err);
    }
  };

  const handleSave = async (condition: DeliveryConditionVm) => {
    try {
      if (editingCondition) {
        await api.put(`/api/delivery-conditions/${editingCondition.id}`, condition);
      } else {
        await api.post('/api/delivery-conditions', condition);
      }
      setDialogOpen(false);
      setCurrentCondition(null);
      setEditingCondition(null);
      await loadConditions();
    } catch (err) {
      setError('Ошибка при сохранении условия доставки');
      console.error('Error saving delivery condition:', err);
    }
  };

  const getDeliveryTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'PICKUP': 'Самовывоз',
      'DELIVERY_TO_WAREHOUSE': 'Доставка на склад',
      'DELIVERY_TO_SITE': 'Доставка на объект',
      'EX_WORKS': 'EXW - Франко завод',
      'FCA': 'FCA - Франко перевозчик',
      'CPT': 'CPT - Фрахт оплачен до',
      'CIP': 'CIP - Фрахт и страхование оплачены до',
      'DAP': 'DAP - Поставка в месте назначения',
      'DPU': 'DPU - Поставка в месте назначения разгружено',
      'DDP': 'DDP - Поставка с оплатой пошлин'
    };
    return labels[type] || type;
  };

  const getResponsibilityLabel = (responsibility: string) => {
    const labels: Record<string, string> = {
      'SUPPLIER': 'Поставщик',
      'CUSTOMER': 'Заказчик',
      'SHARED': 'Разделенная ответственность'
    };
    return labels[responsibility] || responsibility;
  };

  const getResponsibilityColor = (responsibility: string) => {
    const colors: Record<string, 'primary' | 'secondary' | 'default'> = {
      'SUPPLIER': 'primary',
      'CUSTOMER': 'secondary',
      'SHARED': 'default'
    };
    return colors[responsibility] || 'default';
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography>Загрузка...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              Условия доставки
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Управление условиями доставки для предложений
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreate}
          >
            Добавить условие
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          {conditions.map((condition) => (
            <Grid item xs={12} md={6} lg={4} key={condition.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <DeliveryIcon color="primary" />
                      <Typography variant="h6" component="h3">
                        {condition.name}
                      </Typography>
                    </Box>
                    <Box>
                      <Tooltip title="Просмотр">
                        <IconButton size="small" onClick={() => handleView(condition)}>
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Редактировать">
                        <IconButton size="small" onClick={() => handleEdit(condition)}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Удалить">
                        <IconButton size="small" color="error" onClick={() => condition.id && handleDelete(condition.id)}>
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>

                  {condition.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {condition.description}
                    </Typography>
                  )}

                  <Box sx={{ mb: 2 }}>
                    <Chip
                      label={getDeliveryTypeLabel(condition.deliveryType)}
                      size="small"
                      variant="outlined"
                      sx={{ mb: 1 }}
                    />
                    <Chip
                      label={getResponsibilityLabel(condition.deliveryResponsibility)}
                      size="small"
                      color={getResponsibilityColor(condition.deliveryResponsibility)}
                      sx={{ mb: 1, ml: 1 }}
                    />
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    {condition.deliveryPeriod && (
                      <Typography variant="body2" color="text.secondary">
                        Срок: {condition.deliveryPeriod}
                      </Typography>
                    )}
                    {condition.calculateDelivery && (
                      <Typography variant="body2" color="text.secondary">
                        Рассчитывать доставку: Да
                      </Typography>
                    )}
                  </Box>

                  {condition.additionalTerms && (
                    <Typography variant="body2" color="text.secondary" sx={{ 
                      fontSize: '0.75rem',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical'
                    }}>
                      {condition.additionalTerms}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {conditions.length === 0 && (
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <DeliveryIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Условия доставки не найдены
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Создайте первое условие доставки для использования в предложениях
            </Typography>
            <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreate}>
              Создать условие доставки
            </Button>
          </Box>
        )}
      </Box>

      {/* Диалог создания/редактирования */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingCondition ? 'Редактировать условие доставки' : 'Создать условие доставки'}
        </DialogTitle>
        <DialogContent>
          <DeliveryConditionForm
            value={currentCondition || undefined as any}
            onChange={(condition) => setCurrentCondition(condition as any)}
            onSave={handleSave as any}
            hideButtons={true}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setDialogOpen(false);
            setCurrentCondition(null);
            setEditingCondition(null);
          }}>
            Отмена
          </Button>
          <Button 
            onClick={() => currentCondition && handleSave(currentCondition)} 
            variant="contained"
            disabled={!currentCondition?.name}
          >
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог просмотра */}
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Просмотр условия доставки: {viewingCondition?.name}
        </DialogTitle>
        <DialogContent>
          {viewingCondition && (
            <Box>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {viewingCondition.description}
              </Typography>
              
              <Paper sx={{ p: 2, mb: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Тип доставки
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      {getDeliveryTypeLabel(viewingCondition.deliveryType)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Ответственность
                    </Typography>
                    <Chip
                      label={getResponsibilityLabel(viewingCondition.deliveryResponsibility)}
                      color={getResponsibilityColor(viewingCondition.deliveryResponsibility)}
                      sx={{ mb: 1 }}
                    />
                  </Grid>
                  {viewingCondition.deliveryPeriod && (
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Срок доставки
                      </Typography>
                      <Typography variant="body1">
                        {viewingCondition.deliveryPeriod}
                      </Typography>
                    </Grid>
                  )}
                  {viewingCondition.calculateDelivery && (
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Рассчитывать доставку
                      </Typography>
                      <Typography variant="body1">Да</Typography>
                    </Grid>
                  )}
                  {viewingCondition.additionalTerms && (
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Дополнительные условия
                      </Typography>
                      <Typography variant="body1">
                        {viewingCondition.additionalTerms}
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </Paper>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Закрыть</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default DeliveryConditionsPage;
