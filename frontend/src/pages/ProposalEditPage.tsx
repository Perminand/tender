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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Send as SendIcon
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { fnsApi } from '../utils/fnsApi';

interface TenderItem {
  id: string;
  itemNumber: number;
  description: string;
  quantity: number;
  unitName: string;
  specifications: string;
  estimatedPrice: number;
}

interface ProposalItemForm {
  tenderItemId: string;
  description: string;
  brand: string;
  model: string;
  manufacturer: string;
  countryOfOrigin: string;
  quantity: number;
  unitPrice: number;
  specifications: string;
  deliveryPeriod: string;
  warranty: string;
  additionalInfo: string;
}

interface ProposalFormData {
  tenderId: string;
  supplierId: string;
  coverLetter: string;
  technicalProposal: string;
  commercialTerms: string;
  paymentTerms: string;
  deliveryTerms: string;
  warrantyTerms: string;
  validUntil: string;
  items: ProposalItemForm[];
}

interface Company {
  id: string;
  name: string;
  shortName: string;
}

const ProposalEditPage: React.FC = () => {
  const { tenderId } = useParams<{ tenderId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [tenderItems, setTenderItems] = useState<TenderItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<ProposalFormData>({
    tenderId: tenderId || '',
    supplierId: '',
    coverLetter: '',
    technicalProposal: '',
    commercialTerms: '',
    paymentTerms: '',
    deliveryTerms: '',
    warrantyTerms: '',
    validUntil: '',
    items: []
  });

  useEffect(() => {
    loadCompanies();
    loadTenderItems();
  }, [tenderId]);

  const loadCompanies = async () => {
    try {
      const response = await fnsApi.get('/api/companies');
      setCompanies(response.data);
    } catch (error) {
      console.error('Error loading companies:', error);
    }
  };

  const loadTenderItems = async () => {
    if (!tenderId) return;
    
    try {
      const response = await fnsApi.get(`/api/tenders/${tenderId}/items`);
      setTenderItems(response.data);
      
      // Создаем формы для каждой позиции тендера
      const items = response.data.map((item: TenderItem) => ({
        tenderItemId: item.id,
        description: item.description,
        brand: '',
        model: '',
        manufacturer: '',
        countryOfOrigin: '',
        quantity: item.quantity,
        unitPrice: 0,
        specifications: item.specifications || '',
        deliveryPeriod: '',
        warranty: '',
        additionalInfo: ''
      }));
      
      setFormData(prev => ({ ...prev, items }));
    } catch (error) {
      console.error('Error loading tender items:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const proposalData = {
        ...formData,
        validUntil: formData.validUntil ? new Date(formData.validUntil).toISOString() : null,
        items: formData.items.map(item => ({
          ...item,
          totalPrice: item.quantity * item.unitPrice
        }))
      };

      await fnsApi.post('/api/proposals', proposalData);
      navigate(`/tenders/${tenderId}`);
    } catch (error) {
      console.error('Error saving proposal:', error);
      setError('Ошибка сохранения предложения');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitProposal = async () => {
    setLoading(true);
    setError(null);

    try {
      // Сначала сохраняем предложение
      const proposalData = {
        ...formData,
        validUntil: formData.validUntil ? new Date(formData.validUntil).toISOString() : null,
        items: formData.items.map(item => ({
          ...item,
          totalPrice: item.quantity * item.unitPrice
        }))
      };

      const response = await fnsApi.post('/api/proposals', proposalData);
      
      // Затем подаем предложение
      await fnsApi.post(`/api/proposals/${response.data.id}/submit`);
      
      navigate(`/tenders/${tenderId}`);
    } catch (error) {
      console.error('Error submitting proposal:', error);
      setError('Ошибка подачи предложения');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof ProposalFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleItemChange = (index: number, field: keyof ProposalItemForm, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const calculateTotalPrice = () => {
    return formData.items.reduce((total, item) => total + (item.quantity * item.unitPrice), 0);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
        Подача предложения
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Общая информация
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Поставщик</InputLabel>
                <Select
                  value={formData.supplierId}
                  onChange={(e) => handleInputChange('supplierId', e.target.value)}
                  label="Поставщик"
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
              <TextField
                fullWidth
                label="Срок действия предложения"
                type="date"
                value={formData.validUntil}
                onChange={(e) => handleInputChange('validUntil', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Сопроводительное письмо"
                value={formData.coverLetter}
                onChange={(e) => handleInputChange('coverLetter', e.target.value)}
                multiline
                rows={3}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Техническое предложение"
                value={formData.technicalProposal}
                onChange={(e) => handleInputChange('technicalProposal', e.target.value)}
                multiline
                rows={3}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Коммерческие условия
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Коммерческие условия"
                value={formData.commercialTerms}
                onChange={(e) => handleInputChange('commercialTerms', e.target.value)}
                multiline
                rows={3}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Условия оплаты"
                value={formData.paymentTerms}
                onChange={(e) => handleInputChange('paymentTerms', e.target.value)}
                multiline
                rows={2}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Условия поставки"
                value={formData.deliveryTerms}
                onChange={(e) => handleInputChange('deliveryTerms', e.target.value)}
                multiline
                rows={2}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Гарантийные обязательства"
                value={formData.warrantyTerms}
                onChange={(e) => handleInputChange('warrantyTerms', e.target.value)}
                multiline
                rows={2}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Позиции предложения
          </Typography>
          
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>№</TableCell>
                  <TableCell>Описание</TableCell>
                  <TableCell>Бренд</TableCell>
                  <TableCell>Модель</TableCell>
                  <TableCell>Производитель</TableCell>
                  <TableCell>Количество</TableCell>
                  <TableCell>Цена за ед.</TableCell>
                  <TableCell>Сумма</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {formData.items.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        value={item.description}
                        onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                        fullWidth
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        value={item.brand}
                        onChange={(e) => handleItemChange(index, 'brand', e.target.value)}
                        fullWidth
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        value={item.model}
                        onChange={(e) => handleItemChange(index, 'model', e.target.value)}
                        fullWidth
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        value={item.manufacturer}
                        onChange={(e) => handleItemChange(index, 'manufacturer', e.target.value)}
                        fullWidth
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value))}
                        fullWidth
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        type="number"
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(index, 'unitPrice', Number(e.target.value))}
                        fullWidth
                      />
                    </TableCell>
                    <TableCell>
                      {(item.quantity * item.unitPrice).toLocaleString('ru-RU')} ₽
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell colSpan={7} align="right">
                    <Typography variant="h6">
                      Итого:
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="h6">
                      {calculateTotalPrice().toLocaleString('ru-RU')} ₽
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3 }}>
        <Button
          variant="outlined"
          onClick={() => navigate(`/tenders/${tenderId}`)}
          disabled={loading}
        >
          Отмена
        </Button>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSubmit}
          disabled={loading}
        >
          Сохранить черновик
        </Button>
        <Button
          variant="contained"
          color="primary"
          startIcon={<SendIcon />}
          onClick={handleSubmitProposal}
          disabled={loading}
        >
          {loading ? <CircularProgress size={20} /> : 'Подать предложение'}
        </Button>
      </Box>
    </Box>
  );
};

export default ProposalEditPage; 