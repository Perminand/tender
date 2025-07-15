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
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Autocomplete
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Send as SendIcon
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../utils/api';

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
  proposalItems: ProposalItemForm[];
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
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [duplicateItems, setDuplicateItems] = useState<Set<number>>(new Set());
  
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
    proposalItems: []
  });

  useEffect(() => {
    loadCompanies();
    loadTenderItems();
  }, [tenderId]);

  const loadCompanies = async () => {
    try {
      const response = await api.get('/api/companies?role=SUPPLIER');
      setCompanies(response.data);
    } catch (error) {
      console.error('Error loading companies:', error);
    }
  };

  const loadTenderItems = async () => {
    if (!tenderId) return;
    
    try {
      const response = await api.get(`/api/tenders/${tenderId}/items`);
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
      
      setFormData(prev => ({ ...prev, proposalItems: items }));
    } catch (error) {
      console.error('Error loading tender items:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setErrorDialogOpen(false);
    if (!formData.supplierId) {
      setError('Поставщик обязателен для заполнения');
      setErrorDialogOpen(true);
      setLoading(false);
      return;
    }
    
    // Проверяем, что все цены больше 0
    const invalidItems = formData.proposalItems.filter(item => 
      item.tenderItemId && item.tenderItemId !== '' && (item.unitPrice <= 0)
    );
    if (invalidItems.length > 0) {
      setError('Цена за единицу должна быть больше 0 для всех позиций');
      setErrorDialogOpen(true);
      setLoading(false);
      return;
    }
    if (duplicateItems.size > 0) {
      setError('Удалите дублирующие позиции перед отправкой предложения');
      setErrorDialogOpen(true);
      setLoading(false);
      return;
    }
    try {
      const proposalData = {
        ...formData,
        validUntil: formData.validUntil ? new Date(formData.validUntil).toISOString() : null,
        proposalItems: formData.proposalItems
          .filter(item => item.tenderItemId && item.tenderItemId !== '')
          .map(item => ({
          ...item,
          totalPrice: item.quantity * item.unitPrice
        }))
      };
      await api.post('/api/proposals', proposalData);
      navigate(`/tenders/${tenderId}`);
    } catch (error: any) {
      console.error('Error saving proposal:', error);
      let message = 'Ошибка сохранения предложения';
      if (error.response && error.response.data) {
        if (typeof error.response.data === 'string' && error.response.data.includes('уже подали предложение на эту позицию')) {
          message = 'Вы уже подали предложение на одну из позиций. Проверьте, что не дублируете позиции.';
        } else if (error.response.data.message) {
          message = error.response.data.message;
        }
      }
      setError(message);
      setErrorDialogOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitProposal = async () => {
    setLoading(true);
    setError(null);
    setErrorDialogOpen(false);
    if (!formData.supplierId) {
      setError('Поставщик обязателен для заполнения');
      setErrorDialogOpen(true);
      setLoading(false);
      return;
    }
    
    // Проверяем, что все цены больше 0
    const invalidItems = formData.proposalItems.filter(item => 
      item.tenderItemId && item.tenderItemId !== '' && (item.unitPrice <= 0)
    );
    if (invalidItems.length > 0) {
      setError('Цена за единицу должна быть больше 0 для всех позиций');
      setErrorDialogOpen(true);
      setLoading(false);
      return;
    }
    if (duplicateItems.size > 0) {
      setError('Удалите дублирующие позиции перед отправкой предложения');
      setErrorDialogOpen(true);
      setLoading(false);
      return;
    }
    try {
      // Сначала сохраняем предложение
      const proposalData = {
        ...formData,
        validUntil: formData.validUntil ? new Date(formData.validUntil).toISOString() : null,
        proposalItems: formData.proposalItems
          .filter(item => item.tenderItemId && item.tenderItemId !== '')
          .map(item => ({
          ...item,
          totalPrice: item.quantity * item.unitPrice
        }))
      };
      const response = await api.post('/api/proposals', proposalData);
      // Затем подаем предложение
      await api.post(`/api/proposals/${response.data.id}/submit`);
      navigate(`/tenders/${tenderId}`);
    } catch (error: any) {
      console.error('Error submitting proposal:', error);
      let message = 'Ошибка подачи предложения';
      if (error.response && error.response.data && error.response.data.message) {
        message = error.response.data.message;
      }
      setError(message);
      setErrorDialogOpen(true);
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
      proposalItems: prev.proposalItems.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const calculateTotalPrice = () => {
    return formData.proposalItems.reduce((total, item) => total + (item.quantity * item.unitPrice), 0);
  };

  const handleAddItem = () => {
    setFormData(prev => ({
      ...prev,
      proposalItems: [
        ...prev.proposalItems,
        {
          tenderItemId: '',
          description: '',
          brand: '',
          model: '',
          manufacturer: '',
          countryOfOrigin: '',
          quantity: 1,
          unitPrice: 0,
          specifications: '',
          deliveryPeriod: '',
          warranty: '',
          additionalInfo: ''
        }
      ]
    }));
  };

  const handleRemoveItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      proposalItems: prev.proposalItems.filter((_, i) => i !== index)
    }));
  };

  // Функция для получения доступных для выбора позиций тендера (не выбранных ранее)
  const getAvailableTenderItems = (selectedIds: string[]) => {
    return tenderItems.filter(item => !selectedIds.includes(item.id));
  };

  // Функция для проверки дубликатов
  const checkDuplicates = () => {
    const duplicates = new Set<number>();
    const seenTenderItemIds = new Set<string>();
    
    formData.proposalItems.forEach((item, index) => {
      if (item.tenderItemId && item.tenderItemId !== '') {
        if (seenTenderItemIds.has(item.tenderItemId)) {
          // Находим все индексы с этим tenderItemId
          formData.proposalItems.forEach((checkItem, checkIndex) => {
            if (checkItem.tenderItemId === item.tenderItemId) {
              duplicates.add(checkIndex);
            }
          });
        } else {
          seenTenderItemIds.add(item.tenderItemId);
        }
      }
    });
    
    setDuplicateItems(duplicates);
  };

  // Проверяем дубликаты при изменении данных
  useEffect(() => {
    checkDuplicates();
  }, [formData.proposalItems]);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
        Подача предложения
      </Typography>

      {/* Модальное окно для ошибок */}
      <Dialog open={errorDialogOpen} onClose={() => setErrorDialogOpen(false)}>
        <DialogTitle>Ошибка</DialogTitle>
        <DialogContent>
          <Typography color="error">{error}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setErrorDialogOpen(false)} autoFocus>
            ОК
          </Button>
        </DialogActions>
      </Dialog>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Общая информация
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required error={!formData.supplierId && error !== null} sx={{ mb: 2 }}>
                <InputLabel id="supplier-label">Поставщик</InputLabel>
                <Select
                  labelId="supplier-label"
                  value={formData.supplierId}
                  label="Поставщик"
                  onChange={e => setFormData({ ...formData, supplierId: e.target.value })}
                  required
                >
                  {companies.map((company) => (
                    <MenuItem key={company.id} value={company.id}>{company.name}</MenuItem>
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

      {duplicateItems.size > 0 && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Обнаружены дублирующие позиции ({duplicateItems.size} строк). Удалите дубликаты перед отправкой предложения.
        </Alert>
      )}
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
                  <TableCell>Действия</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {formData.proposalItems.map((item, index) => {
                  const selectedTenderItemIds = formData.proposalItems
                    .filter((_, i) => i !== index)
                    .map(i => i.tenderItemId);
                  const availableTenderItems = getAvailableTenderItems(selectedTenderItemIds);
                  const selectedTenderItem = tenderItems.find(ti => ti.id === item.tenderItemId);
                  const isDuplicate = duplicateItems.has(index);
                  return (
                    <TableRow key={index} sx={{ backgroundColor: isDuplicate ? 'rgba(255, 0, 0, 0.1)' : 'transparent' }}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>
                        <FormControl fullWidth size="small">
                          <Select
                            value={item.tenderItemId}
                            onChange={e => {
                              const tenderItem = tenderItems.find(ti => ti.id === e.target.value);
                              handleItemChange(index, 'tenderItemId', e.target.value);
                              if (tenderItem) {
                                handleItemChange(index, 'description', tenderItem.description);
                                handleItemChange(index, 'quantity', tenderItem.quantity);
                                handleItemChange(index, 'specifications', tenderItem.specifications || '');
                              }
                            }}
                            displayEmpty
                          >
                            <MenuItem value="" disabled>Выберите позицию</MenuItem>
                            {availableTenderItems.map(ti => (
                              <MenuItem key={ti.id} value={ti.id}>
                                {ti.description} (Кол-во: {ti.quantity}, Ед.: {ti.unitName})
                              </MenuItem>
                            ))}
                            {item.tenderItemId && !availableTenderItems.some(ti => ti.id === item.tenderItemId) && selectedTenderItem && (
                              <MenuItem key={selectedTenderItem.id} value={selectedTenderItem.id}>
                                {selectedTenderItem.description} (Кол-во: {selectedTenderItem.quantity}, Ед.: {selectedTenderItem.unitName})
                              </MenuItem>
                            )}
                          </Select>
                        </FormControl>
                      </TableCell>
                      <TableCell>
                        <TextField
                          size="small"
                          value={item.brand}
                          onChange={e => handleItemChange(index, 'brand', e.target.value)}
                          fullWidth
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          size="small"
                          value={item.model}
                          onChange={e => handleItemChange(index, 'model', e.target.value)}
                          fullWidth
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          size="small"
                          value={item.manufacturer}
                          onChange={e => handleItemChange(index, 'manufacturer', e.target.value)}
                          fullWidth
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          size="small"
                          type="number"
                          value={selectedTenderItem ? selectedTenderItem.quantity : item.quantity}
                          disabled
                          inputProps={{ min: 0.01, step: 0.01 }}
                          fullWidth
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          size="small"
                          type="number"
                          value={item.unitPrice}
                          onChange={e => {
                            const value = Number(e.target.value);
                            handleItemChange(index, 'unitPrice', value);
                          }}
                          inputProps={{ min: 0.01, step: 0.01 }}
                          fullWidth
                        />
                      </TableCell>
                      <TableCell>
                        {(item.quantity * item.unitPrice).toLocaleString('ru-RU')} ₽
                      </TableCell>
                      <TableCell>
                        <IconButton color="error" onClick={() => handleRemoveItem(index)} size="small">
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
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

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
        <Button onClick={handleAddItem} variant="outlined" size="small" startIcon={<AddIcon />}>
          Добавить позицию
        </Button>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3 }}>
        <Button
          variant="outlined"
          onClick={() => navigate(`/tenders/${tenderId}`)}
          disabled={loading}
        >
          Отмена
        </Button>
        <Button
          type="submit"
          variant="contained"
          disabled={loading || !formData.supplierId}
          startIcon={<SaveIcon />}
        >
          Сохранить
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