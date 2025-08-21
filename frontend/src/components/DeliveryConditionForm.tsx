import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Autocomplete,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import { api } from '../utils/api';

interface DeliveryType {
  id: string;
  name: string;
}

interface DeliveryCondition {
  id?: string;
  name: string;
  description?: string;
  deliveryType: string;
  deliveryPeriod?: string;
  deliveryResponsibility: string;
  additionalTerms?: string;
  calculateDelivery?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface DeliveryConditionFormProps {
  value?: DeliveryCondition;
  onChange: (condition: DeliveryCondition | null) => void;
  onSave?: (condition: DeliveryCondition) => void | Promise<void>;
  hideButtons?: boolean;
}

const DeliveryConditionForm: React.FC<DeliveryConditionFormProps> = ({ value, onChange, onSave, hideButtons = false }) => {
  const [condition, setCondition] = useState<DeliveryCondition>({
    name: '',
    description: '',
    deliveryType: 'DELIVERY_TO_WAREHOUSE',
    deliveryPeriod: '',
    deliveryResponsibility: 'SUPPLIER',
    additionalTerms: '',
    calculateDelivery: false
  });

  const [deliveryTypes, setDeliveryTypes] = useState<DeliveryType[]>([]);
  const [loading, setLoading] = useState(false);
  const [openDeliveryTypeDialog, setOpenDeliveryTypeDialog] = useState(false);
  const [newDeliveryType, setNewDeliveryType] = useState('');

  useEffect(() => {
    if (value) {
      setCondition(value);
    }
  }, [value]);

  useEffect(() => {
    loadDeliveryTypes();
  }, []);

  const loadDeliveryTypes = async () => {
    try {
      setLoading(true);
      // Жестко ограничиваем набор типов доставки до 3-х разрешенных значений
      const allowedTypes: DeliveryType[] = [
        { id: 'PICKUP', name: 'Самовывоз' },
        { id: 'DELIVERY_TO_WAREHOUSE', name: 'Доставка на склад' },
        { id: 'DELIVERY_TO_SITE', name: 'Доставка на объект' }
      ];
      setDeliveryTypes(allowedTypes);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof DeliveryCondition, value: any) => {
    const updated = { ...condition, [field]: value };
    setCondition(updated);
    onChange(updated);
  };

  const getDeliveryTypeLabel = (type: string) => {
    // Сначала ищем в загруженных типах доставки
    const foundType = deliveryTypes.find(dt => dt.id === type || dt.name === type);
    if (foundType) {
      return foundType.name;
    }

    // Если не найдено, используем старые хардкодные значения
    switch (type) {
      case 'PICKUP': return 'Самовывоз';
      case 'DELIVERY_TO_WAREHOUSE': return 'Доставка на склад';
      case 'DELIVERY_TO_SITE': return 'Доставка на объект';
      default: return type;
    }
  };

  const getResponsibilityLabel = (responsibility: string) => {
    switch (responsibility) {
      case 'SUPPLIER': return 'Поставщик';
      case 'CUSTOMER': return 'Заказчик';
      case 'SHARED': return 'Разделенная ответственность';
      default: return responsibility;
    }
  };

  const handleDeliveryTypeChange = (_: any, value: DeliveryType | null) => {
    handleChange('deliveryType', value ? value.id : '');
  };

  const handleCreateDeliveryType = async () => {
    if (newDeliveryType.trim()) {
      try {
        const response = await api.post('/api/delivery-types', { name: newDeliveryType.trim() });
        setDeliveryTypes(prev => [...prev, response.data]);
        handleChange('deliveryType', response.data.id);
        setNewDeliveryType('');
        setOpenDeliveryTypeDialog(false);
      } catch (error: any) {
        console.error('Ошибка при создании типа доставки:', error);
        let errorMessage = 'Ошибка при создании типа доставки';
        if (error.response?.data?.name) {
          errorMessage = error.response.data.name;
        } else if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        }
        alert(errorMessage);
      }
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Условия доставки
      </Typography>
      
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Название условий доставки"
                value={condition.name}
                onChange={(e) => handleChange('name', e.target.value)}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Описание"
                value={condition.description}
                onChange={(e) => handleChange('description', e.target.value)}
                margin="normal"
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Autocomplete
                value={deliveryTypes.find(dt => dt.id === condition.deliveryType) || null}
                onChange={handleDeliveryTypeChange}
                options={deliveryTypes}
                filterOptions={(options, state) => options.filter(option => option.name.toLowerCase().includes(state.inputValue.toLowerCase()))}
                getOptionLabel={(option: DeliveryType) => option ? option.name : ''}
                isOptionEqualToValue={(option: DeliveryType, value: DeliveryType) => option.id === value.id}
                loading={loading}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Тип доставки"
                    margin="normal"
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {loading ? <div>Загрузка...</div> : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
                renderOption={(props, option) => (
                  <li {...props}>{option.name}</li>
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Срок доставки"
                value={condition.deliveryPeriod}
                onChange={(e) => handleChange('deliveryPeriod', e.target.value)}
                margin="normal"
                placeholder="например: 30 дней"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Ответственность за доставку</InputLabel>
                <Select
                  value={condition.deliveryResponsibility}
                  onChange={(e) => handleChange('deliveryResponsibility', e.target.value)}
                >
                  <MenuItem value="SUPPLIER">Поставщик</MenuItem>
                  <MenuItem value="CUSTOMER">Заказчик</MenuItem>
                  <MenuItem value="SHARED">Разделенная ответственность</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={Boolean(condition.calculateDelivery)}
                    onChange={(e) => handleChange('calculateDelivery', e.target.checked)}
                  />
                }
                label="Рассчитывать доставку (показывать сумму доставки при подаче предложения)"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Дополнительные условия"
                value={condition.additionalTerms}
                onChange={(e) => handleChange('additionalTerms', e.target.value)}
                margin="normal"
                multiline
                rows={3}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Alert severity="info" sx={{ mb: 2 }}>
        <Typography variant="body2">
          <strong>Тип доставки:</strong> {getDeliveryTypeLabel(condition.deliveryType)}
        </Typography>
        <Typography variant="body2">
          <strong>Ответственность:</strong> {getResponsibilityLabel(condition.deliveryResponsibility)}
        </Typography>
        {condition.deliveryPeriod && (
          <Typography variant="body2">
            <strong>Срок доставки:</strong> {condition.deliveryPeriod}
          </Typography>
        )}
      </Alert>

      {/* Кнопки действий */}
      {onSave && !hideButtons && (
        <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button variant="outlined" onClick={() => onChange(null)}>
            Отмена
          </Button>
          <Button 
            variant="contained" 
            onClick={() => onSave(condition)}
            disabled={!condition.name}
          >
            Сохранить
          </Button>
        </Box>
      )}

      <Dialog open={openDeliveryTypeDialog} onClose={() => setOpenDeliveryTypeDialog(false)}>
        <DialogTitle>Создание нового типа доставки</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Название нового типа доставки"
            fullWidth
            value={newDeliveryType}
            onChange={(e) => setNewDeliveryType(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && newDeliveryType.trim()) {
                handleCreateDeliveryType();
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setOpenDeliveryTypeDialog(false);
            setNewDeliveryType('');
          }}>
            Отмена
          </Button>
          <Button 
            onClick={handleCreateDeliveryType} 
            variant="contained"
            disabled={!newDeliveryType.trim()}
          >
            Создать
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DeliveryConditionForm;
