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
  Button
} from '@mui/material';

interface DeliveryCondition {
  id?: string;
  name: string;
  description?: string;
  deliveryType: string;
  deliveryCost?: number;
  deliveryAddress?: string;
  deliveryPeriod?: string;
  deliveryResponsibility: string;
  additionalTerms?: string;
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
    deliveryCost: 0,
    deliveryAddress: '',
    deliveryPeriod: '',
    deliveryResponsibility: 'SUPPLIER',
    additionalTerms: ''
  });

  useEffect(() => {
    if (value) {
      setCondition(value);
    }
  }, [value]);

  const handleChange = (field: keyof DeliveryCondition, value: any) => {
    const updated = { ...condition, [field]: value };
    setCondition(updated);
    onChange(updated);
  };

  const getDeliveryTypeLabel = (type: string) => {
    switch (type) {
      case 'PICKUP': return 'Самовывоз';
      case 'DELIVERY_TO_WAREHOUSE': return 'Доставка на склад';
      case 'DELIVERY_TO_SITE': return 'Доставка на объект';
      case 'EX_WORKS': return 'EXW - Франко завод';
      case 'FCA': return 'FCA - Франко перевозчик';
      case 'CPT': return 'CPT - Фрахт оплачен до';
      case 'CIP': return 'CIP - Фрахт и страхование оплачены до';
      case 'DAP': return 'DAP - Поставка в месте назначения';
      case 'DPU': return 'DPU - Поставка в месте назначения разгружено';
      case 'DDP': return 'DDP - Поставка с оплатой пошлин';
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
              <FormControl fullWidth margin="normal">
                <InputLabel>Тип доставки</InputLabel>
                <Select
                  value={condition.deliveryType}
                  onChange={(e) => handleChange('deliveryType', e.target.value)}
                >
                  <MenuItem value="PICKUP">Самовывоз</MenuItem>
                  <MenuItem value="DELIVERY_TO_WAREHOUSE">Доставка на склад</MenuItem>
                  <MenuItem value="DELIVERY_TO_SITE">Доставка на объект</MenuItem>
                  <MenuItem value="EX_WORKS">EXW - Франко завод</MenuItem>
                  <MenuItem value="FCA">FCA - Франко перевозчик</MenuItem>
                  <MenuItem value="CPT">CPT - Фрахт оплачен до</MenuItem>
                  <MenuItem value="CIP">CIP - Фрахт и страхование оплачены до</MenuItem>
                  <MenuItem value="DAP">DAP - Поставка в месте назначения</MenuItem>
                  <MenuItem value="DPU">DPU - Поставка в месте назначения разгружено</MenuItem>
                  <MenuItem value="DDP">DDP - Поставка с оплатой пошлин</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Стоимость доставки"
                type="number"
                value={condition.deliveryCost || ''}
                onChange={(e) => handleChange('deliveryCost', parseFloat(e.target.value) || 0)}
                margin="normal"
                InputProps={{
                  endAdornment: '₽'
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Адрес доставки"
                value={condition.deliveryAddress}
                onChange={(e) => handleChange('deliveryAddress', e.target.value)}
                margin="normal"
                multiline
                rows={2}
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
        {condition.deliveryCost && condition.deliveryCost > 0 && (
          <Typography variant="body2">
            <strong>Стоимость доставки:</strong> {condition.deliveryCost} ₽
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
    </Box>
  );
};

export default DeliveryConditionForm;
