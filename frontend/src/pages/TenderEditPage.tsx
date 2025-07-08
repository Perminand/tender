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
  CircularProgress,
  Divider,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { fnsApi } from '../utils/fnsApi';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

interface TenderFormData {
  title: string;
  description: string;
  customerId: string;
  startDate: string;
  endDate: string;
  submissionDeadline: string;
  requirements: string;
  termsAndConditions: string;
  requestId: string;
}

interface Company {
  id: string;
  name: string;
  shortName: string;
}

interface Request {
  id: string;
  requestNumber: string;
  title: string;
}

interface TenderStatus {
  id: string;
  status: 'DRAFT' | 'PUBLISHED' | 'BIDDING' | 'EVALUATION' | 'AWARDED' | 'CANCELLED';
}

const TenderEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [tenderStatus, setTenderStatus] = useState<TenderStatus | null>(null);
  
  // Модальные окна для управления статусом
  const [statusDialog, setStatusDialog] = useState<{
    open: boolean;
    action: string;
    title: string;
    description: string;
    onConfirm: () => void;
  }>({
    open: false,
    action: '',
    title: '',
    description: '',
    onConfirm: () => {}
  });
  
  const [formData, setFormData] = useState<TenderFormData>({
    title: '',
    description: '',
    customerId: '',
    startDate: '',
    endDate: '',
    submissionDeadline: '',
    requirements: '',
    termsAndConditions: '',
    requestId: ''
  });

  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  const isEdit = !!id;

  useEffect(() => {
    loadCompanies();
    loadRequests();
    if (isEdit) {
      loadTender();
      loadTenderStatus();
    }
  }, [id]);

  const loadCompanies = async () => {
    try {
      const response = await fnsApi.get('/api/companies');
      setCompanies(response.data);
    } catch (error) {
      console.error('Error loading companies:', error);
    }
  };

  const loadRequests = async () => {
    try {
      const response = await fnsApi.get('/api/requests');
      setRequests(response.data);
    } catch (error) {
      console.error('Error loading requests:', error);
    }
  };

  const loadTenderStatus = async () => {
    if (!id) return;
    
    try {
      const response = await fnsApi.get(`/api/tenders/${id}`);
      setTenderStatus({
        id: response.data.id,
        status: response.data.status
      });
    } catch (error) {
      console.error('Error loading tender status:', error);
    }
  };

  const loadTender = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const response = await fnsApi.get(`/api/tenders/${id}`);
      const tender = response.data;
      
      setFormData({
        title: tender.title || '',
        description: tender.description || '',
        customerId: tender.customerId || '',
        startDate: tender.startDate ? tender.startDate.split('T')[0] : '',
        endDate: tender.endDate ? tender.endDate.split('T')[0] : '',
        submissionDeadline: tender.submissionDeadline ? tender.submissionDeadline.split('T')[0] : '',
        requirements: tender.requirements || '',
        termsAndConditions: tender.termsAndConditions || '',
        requestId: tender.requestId || ''
      });
    } catch (error) {
      console.error('Error loading tender:', error);
      setError('Ошибка загрузки тендера');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const tenderData = {
        ...formData,
        startDate: formData.startDate ? new Date(formData.startDate).toISOString() : null,
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null,
        submissionDeadline: formData.submissionDeadline ? new Date(formData.submissionDeadline).toISOString() : null
      };

      if (isEdit) {
        await fnsApi.put(`/api/tenders/${id}`, tenderData);
      } else {
        await fnsApi.post('/api/tenders', tenderData);
      }

      navigate('/tenders');
    } catch (error: any) {
      console.error('Error saving tender:', error);
      const errorMessage = error.response?.data?.message || 'Ошибка сохранения тендера';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof TenderFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Функции управления статусом
  const handlePublish = async () => {
    try {
      await fnsApi.post(`/api/tenders/${id}/publish`);
      await loadTenderStatus();
      setStatusDialog(prev => ({ ...prev, open: false }));
    } catch (error: any) {
      console.error('Error publishing tender:', error);
      const errorMessage = error.response?.data?.message || 'Ошибка публикации тендера';
      setError(errorMessage);
    }
  };

  const handleStartBidding = async () => {
    try {
      await fnsApi.post(`/api/tenders/${id}/start-bidding`);
      await loadTenderStatus();
      setStatusDialog(prev => ({ ...prev, open: false }));
    } catch (error: any) {
      console.error('Error starting bidding:', error);
      const errorMessage = error.response?.data?.message || 'Ошибка начала приема предложений';
      setError(errorMessage);
    }
  };

  const handleCloseBidding = async () => {
    try {
      await fnsApi.post(`/api/tenders/${id}/close`);
      await loadTenderStatus();
      setStatusDialog(prev => ({ ...prev, open: false }));
    } catch (error: any) {
      console.error('Error closing bidding:', error);
      const errorMessage = error.response?.data?.message || 'Ошибка закрытия приема предложений';
      setError(errorMessage);
    }
  };

  const handleComplete = async () => {
    try {
      await fnsApi.post(`/api/tenders/${id}/complete`);
      await loadTenderStatus();
      setStatusDialog(prev => ({ ...prev, open: false }));
    } catch (error: any) {
      console.error('Error completing tender:', error);
      const errorMessage = error.response?.data?.message || 'Ошибка завершения тендера';
      setError(errorMessage);
    }
  };

  const openStatusDialog = (action: string, title: string, description: string, onConfirm: () => void) => {
    setStatusDialog({
      open: true,
      action,
      title,
      description,
      onConfirm
    });
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

  const handleCancelTender = async () => {
    if (!id) return;
    try {
      await fnsApi.post(`/api/tenders/${id}/cancel`);
      setCancelDialogOpen(false);
      setError(null);
      await loadTenderStatus();
    } catch (e: any) {
      setError(e.response?.data?.message || 'Ошибка отмены тендера');
    }
  };

  if (loading && isEdit) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 1 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/tenders')}
          sx={{ minWidth: 0, p: 1 }}
        />
        <Typography variant="h4" component="h1">
        {isEdit ? 'Редактирование тендера' : 'Создание тендера'}
      </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Секция управления статусом */}
      {isEdit && tenderStatus && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Управление статусом тендера
              </Typography>
              <Chip
                label={getStatusLabel(tenderStatus.status)}
                color={getStatusColor(tenderStatus.status)}
              />
            </Box>
            
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {tenderStatus.status === 'DRAFT' && (
                <Button
                  variant="contained"
                  color="info"
                  onClick={() => openStatusDialog(
                    'publish',
                    'Опубликовать тендер',
                    'Вы уверены, что хотите опубликовать тендер? После публикации тендер станет доступен для просмотра.',
                    handlePublish
                  )}
                >
                  Опубликовать
                </Button>
              )}

              {tenderStatus.status === 'PUBLISHED' && (
                <Button
                  variant="contained"
                  color="warning"
                  onClick={() => openStatusDialog(
                    'start-bidding',
                    'Начать прием предложений',
                    'Вы уверены, что хотите начать прием предложений? После этого поставщики смогут подавать предложения.',
                    handleStartBidding
                  )}
                >
                  Начать прием предложений
                </Button>
              )}

              {tenderStatus.status === 'BIDDING' && (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => openStatusDialog(
                    'close-bidding',
                    'Закрыть прием предложений',
                    'Вы уверены, что хотите закрыть прием предложений? После этого новые предложения приниматься не будут.',
                    handleCloseBidding
                  )}
                >
                  Закрыть прием предложений
                </Button>
              )}

              {tenderStatus.status === 'EVALUATION' && (
                <Button
                  variant="contained"
                  color="success"
                  onClick={() => openStatusDialog(
                    'complete',
                    'Завершить тендер',
                    'Вы уверены, что хотите завершить тендер? Это действие нельзя будет отменить.',
                    handleComplete
                  )}
                >
                  Завершить тендер
                </Button>
              )}

              {tenderStatus.status !== 'CANCELLED' && tenderStatus.status !== 'AWARDED' && (
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => setCancelDialogOpen(true)}
                  sx={{ ml: 2 }}
                >
                  Отменить тендер
                </Button>
              )}
            </Box>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Название тендера"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Описание"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  multiline
                  rows={3}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Заказчик</InputLabel>
                  <Select
                    value={formData.customerId}
                    onChange={(e) => handleInputChange('customerId', e.target.value)}
                    label="Заказчик"
                    required
                  >
                    {companies.map((company) => (
                      <MenuItem key={company.id} value={company.id}>
                        {company.shortName || company.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Заявка</InputLabel>
                  <Select
                    value={formData.requestId}
                    onChange={(e) => handleInputChange('requestId', e.target.value)}
                    label="Заявка"
                  >
                    {requests.map((request) => (
                      <MenuItem key={request.id} value={request.id}>
                        {request.requestNumber} - {request.title}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Дата начала"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Дата окончания"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleInputChange('endDate', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Срок подачи предложений"
                  type="date"
                  value={formData.submissionDeadline}
                  onChange={(e) => handleInputChange('submissionDeadline', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Дополнительная информация
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Требования к участникам"
                  value={formData.requirements}
                  onChange={(e) => handleInputChange('requirements', e.target.value)}
                  multiline
                  rows={4}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Условия и порядок проведения"
                  value={formData.termsAndConditions}
                  onChange={(e) => handleInputChange('termsAndConditions', e.target.value)}
                  multiline
                  rows={4}
                />
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/tenders')}
                    disabled={loading}
                  >
                    Отмена
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={loading}
                  >
                    {loading ? <CircularProgress size={20} /> : (isEdit ? 'Сохранить' : 'Создать')}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>

      {/* Модальное окно подтверждения изменения статуса */}
      <Dialog
        open={statusDialog.open}
        onClose={() => setStatusDialog(prev => ({ ...prev, open: false }))}
        aria-labelledby="status-dialog-title"
        aria-describedby="status-dialog-description"
      >
        <DialogTitle id="status-dialog-title">
          {statusDialog.title}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="status-dialog-description">
            {statusDialog.description}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setStatusDialog(prev => ({ ...prev, open: false }))}
            color="primary"
          >
            Отмена
          </Button>
          <Button 
            onClick={statusDialog.onConfirm}
            color="secondary"
            autoFocus
          >
            Подтвердить
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={cancelDialogOpen}
        onClose={() => setCancelDialogOpen(false)}
        aria-labelledby="cancel-tender-dialog-title"
        aria-describedby="cancel-tender-dialog-description"
      >
        <DialogTitle id="cancel-tender-dialog-title">Отменить тендер</DialogTitle>
        <DialogContent>
          <DialogContentText id="cancel-tender-dialog-description">
            Вы уверены, что хотите отменить тендер? После отмены тендер будет недоступен для дальнейших действий.
          </DialogContentText>
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialogOpen(false)} color="primary">
            Отмена
          </Button>
          <Button onClick={handleCancelTender} color="secondary" autoFocus>
            Подтвердить
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TenderEditPage; 