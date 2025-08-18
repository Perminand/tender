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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  Fab,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Payment as PaymentIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import { api } from '../utils/api';
import PaymentConditionForm from '../components/PaymentConditionForm';

interface PaymentCondition {
  id: string;
  name: string;
  description?: string;
  paymentParts: PaymentPart[];
  createdAt: string;
  updatedAt: string;
}

interface PaymentPart {
  id: string;
  name: string;
  paymentType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  amount: number;
  paymentMoment: string;
  description?: string;
  orderIndex: number;
}

const PaymentConditionsPage: React.FC = () => {
  const [conditions, setConditions] = useState<PaymentCondition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCondition, setEditingCondition] = useState<PaymentCondition | null>(null);
  const [currentCondition, setCurrentCondition] = useState<PaymentCondition | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewingCondition, setViewingCondition] = useState<PaymentCondition | null>(null);

  useEffect(() => {
    loadConditions();
  }, []);

  const loadConditions = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/payment-conditions');
      setConditions(response.data);
      setError(null);
    } catch (err) {
      setError('Ошибка при загрузке условий оплаты');
      console.error('Error loading payment conditions:', err);
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
      paymentParts: [],
      createdAt: '',
      updatedAt: ''
    });
    setDialogOpen(true);
  };

  const handleEdit = (condition: PaymentCondition) => {
    setEditingCondition(condition);
    setCurrentCondition(condition);
    setDialogOpen(true);
  };

  const handleView = (condition: PaymentCondition) => {
    setViewingCondition(condition);
    setViewDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Вы уверены, что хотите удалить это условие оплаты?')) {
      return;
    }

    try {
      await api.delete(`/api/payment-conditions/${id}`);
      await loadConditions();
    } catch (err) {
      setError('Ошибка при удалении условия оплаты');
      console.error('Error deleting payment condition:', err);
    }
  };

  const handleSave = async (condition: PaymentCondition) => {
    try {
      if (editingCondition) {
        await api.put(`/api/payment-conditions/${editingCondition.id}`, condition);
      } else {
        await api.post('/api/payment-conditions', condition);
      }
      setDialogOpen(false);
      setCurrentCondition(null);
      setEditingCondition(null);
      await loadConditions();
    } catch (err) {
      setError('Ошибка при сохранении условия оплаты');
      console.error('Error saving payment condition:', err);
    }
  };

  const getPaymentMomentLabel = (moment: string) => {
    const labels: Record<string, string> = {
      'ADVANCE': 'Аванс',
      'READY_TO_SHIP': 'По готовности к отправке',
      'UPON_DELIVERY': 'По факту поставки',
      'AFTER_ACCEPTANCE': 'После приемки',
      'AFTER_WARRANTY': 'После гарантийного срока',
      'CUSTOM': 'Произвольный момент'
    };
    return labels[moment] || moment;
  };

  const getTotalPercentage = (parts: PaymentPart[]) => {
    return parts
      .filter(part => part.paymentType === 'PERCENTAGE')
      .reduce((sum, part) => sum + part.amount, 0);
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
              Условия оплаты
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Управление схемами оплаты для предложений
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
                      <PaymentIcon color="primary" />
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
                        <IconButton size="small" color="error" onClick={() => handleDelete(condition.id)}>
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
                    <Typography variant="body2" color="text.secondary">
                      Частей платежа: {condition.paymentParts.length}
                    </Typography>
                    {condition.paymentParts.some(part => part.paymentType === 'PERCENTAGE') && (
                      <Typography variant="body2" color="text.secondary">
                        Общий процент: {getTotalPercentage(condition.paymentParts)}%
                      </Typography>
                    )}
                  </Box>

                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {condition.paymentParts.slice(0, 3).map((part, index) => (
                      <Chip
                        key={index}
                        label={`${part.name}: ${part.amount}${part.paymentType === 'PERCENTAGE' ? '%' : '₽'}`}
                        size="small"
                        variant="outlined"
                      />
                    ))}
                    {condition.paymentParts.length > 3 && (
                      <Chip
                        label={`+${condition.paymentParts.length - 3} еще`}
                        size="small"
                        variant="outlined"
                      />
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {conditions.length === 0 && (
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <PaymentIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Условия оплаты не найдены
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Создайте первое условие оплаты для использования в предложениях
            </Typography>
            <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreate}>
              Создать условие оплаты
            </Button>
          </Box>
        )}
      </Box>

      {/* Диалог создания/редактирования */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingCondition ? 'Редактировать условие оплаты' : 'Создать условие оплаты'}
        </DialogTitle>
        <DialogContent>
          <PaymentConditionForm
            value={currentCondition || undefined}
            onChange={(condition) => setCurrentCondition(condition)}
            onSave={handleSave}
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
            disabled={!currentCondition?.name || currentCondition?.paymentParts.length === 0}
          >
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог просмотра */}
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Просмотр условия оплаты: {viewingCondition?.name}
        </DialogTitle>
        <DialogContent>
          {viewingCondition && (
            <Box>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {viewingCondition.description}
              </Typography>
              
              <TableContainer component={Paper} sx={{ mt: 2 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>№</TableCell>
                      <TableCell>Название</TableCell>
                      <TableCell>Тип</TableCell>
                      <TableCell>Сумма</TableCell>
                      <TableCell>Момент оплаты</TableCell>
                      <TableCell>Описание</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {viewingCondition.paymentParts.map((part, index) => (
                      <TableRow key={index}>
                        <TableCell>{part.orderIndex}</TableCell>
                        <TableCell>{part.name}</TableCell>
                        <TableCell>
                          <Chip
                            label={part.paymentType === 'PERCENTAGE' ? 'Процент' : 'Фиксированная сумма'}
                            size="small"
                            color={part.paymentType === 'PERCENTAGE' ? 'primary' : 'secondary'}
                          />
                        </TableCell>
                        <TableCell>
                          {part.amount} {part.paymentType === 'PERCENTAGE' ? '%' : '₽'}
                        </TableCell>
                        <TableCell>{getPaymentMomentLabel(part.paymentMoment)}</TableCell>
                        <TableCell>{part.description}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
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

export default PaymentConditionsPage;
