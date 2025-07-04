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
  Divider
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { fnsApi } from '../utils/fnsApi';

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

const TenderEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [error, setError] = useState<string | null>(null);
  
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

  const isEdit = !!id;

  useEffect(() => {
    loadCompanies();
    loadRequests();
    if (isEdit) {
      loadTender();
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
    } catch (error) {
      console.error('Error saving tender:', error);
      setError('Ошибка сохранения тендера');
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

  if (loading && isEdit) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
        {isEdit ? 'Редактирование тендера' : 'Создание тендера'}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
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
    </Box>
  );
};

export default TenderEditPage; 