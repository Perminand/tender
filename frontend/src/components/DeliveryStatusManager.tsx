import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Typography,
  Box,
  Chip,
  Alert,
  Stepper,
  Step,
  StepLabel,
  StepContent
} from '@mui/material';
import {
  Check as CheckIcon,
  Close as CloseIcon,
  LocalShipping as LocalShippingIcon,
  Warehouse as WarehouseIcon,
  Assignment as AssignmentIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';

interface DeliveryStatusManagerProps {
  open: boolean;
  onClose: () => void;
  currentStatus: string;
  deliveryNumber: string;
  onStatusChange: (newStatus: string, comment: string) => Promise<void>;
}

const statusFlow = [
  { value: 'PLANNED', label: 'Запланирована', icon: AssignmentIcon, color: 'default' },
  { value: 'CONFIRMED', label: 'Подтверждена поставщиком', icon: CheckIcon, color: 'primary' },
  { value: 'IN_TRANSIT', label: 'В пути', icon: LocalShippingIcon, color: 'info' },
  { value: 'ARRIVED', label: 'Прибыла на склад', icon: WarehouseIcon, color: 'warning' },
  { value: 'DELIVERED', label: 'Доставлена', icon: CheckIcon, color: 'success' },
  { value: 'ACCEPTED', label: 'Принята', icon: CheckIcon, color: 'success' },
  { value: 'REJECTED', label: 'Отклонена', icon: CloseIcon, color: 'error' },
  { value: 'PARTIALLY_ACCEPTED', label: 'Частично принята', icon: CheckIcon, color: 'warning' },
  { value: 'CANCELLED', label: 'Отменена', icon: CancelIcon, color: 'error' }
];

const getStatusColor = (status: string) => {
  const statusInfo = statusFlow.find(s => s.value === status);
  return statusInfo?.color || 'default';
};

const getStatusLabel = (status: string) => {
  const statusInfo = statusFlow.find(s => s.value === status);
  return statusInfo?.label || status;
};

const getAvailableTransitions = (currentStatus: string) => {
  const transitions: { [key: string]: string[] } = {
    PLANNED: ['CONFIRMED', 'CANCELLED'],
    CONFIRMED: ['IN_TRANSIT', 'CANCELLED'],
    IN_TRANSIT: ['ARRIVED', 'DELIVERED', 'CANCELLED'],
    ARRIVED: ['DELIVERED', 'CANCELLED'],
    DELIVERED: ['ACCEPTED', 'REJECTED', 'PARTIALLY_ACCEPTED'],
    ACCEPTED: [], // Финальный статус
    REJECTED: [], // Финальный статус
    PARTIALLY_ACCEPTED: [], // Финальный статус
    CANCELLED: [] // Финальный статус
  };
  
  return transitions[currentStatus] || [];
};

const DeliveryStatusManager: React.FC<DeliveryStatusManagerProps> = ({
  open,
  onClose,
  currentStatus,
  deliveryNumber,
  onStatusChange
}) => {
  const [newStatus, setNewStatus] = useState('');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const availableTransitions = getAvailableTransitions(currentStatus);

  const handleSubmit = async () => {
    if (!newStatus) {
      setError('Выберите новый статус');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await onStatusChange(newStatus, comment);
      onClose();
      setNewStatus('');
      setComment('');
    } catch (error) {
      setError('Ошибка при изменении статуса');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setNewStatus('');
    setComment('');
    setError('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Управление статусом поставки №{deliveryNumber}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>Текущий статус:</Typography>
          <Chip 
            label={getStatusLabel(currentStatus)} 
            color={getStatusColor(currentStatus) as any}
            size="medium"
          />
        </Box>

        {availableTransitions.length > 0 ? (
          <>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Новый статус</InputLabel>
              <Select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                label="Новый статус"
              >
                {availableTransitions.map(status => (
                  <MenuItem key={status} value={status}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip 
                        label={getStatusLabel(status)} 
                        color={getStatusColor(status) as any}
                        size="small"
                      />
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Комментарий к изменению статуса"
              multiline
              rows={3}
              fullWidth
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Укажите причину изменения статуса..."
            />

            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
          </>
        ) : (
          <Alert severity="info">
            Поставка находится в финальном статусе. Дальнейшие изменения невозможны.
          </Alert>
        )}

        {/* Схема жизненного цикла */}
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>Жизненный цикл поставки:</Typography>
          <Stepper orientation="vertical" activeStep={statusFlow.findIndex(s => s.value === currentStatus)}>
            {statusFlow.map((step, index) => (
              <Step key={step.value} active={index <= statusFlow.findIndex(s => s.value === currentStatus)}>
                <StepLabel>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <step.icon color={index <= statusFlow.findIndex(s => s.value === currentStatus) ? 'primary' : 'disabled'} />
                    <Typography variant="body2">{step.label}</Typography>
                  </Box>
                </StepLabel>
                <StepContent>
                  <Typography variant="body2" color="textSecondary">
                    {getStepDescription(step.value)}
                  </Typography>
                </StepContent>
              </Step>
            ))}
          </Stepper>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Отмена</Button>
        {availableTransitions.length > 0 && (
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            disabled={!newStatus || loading}
          >
            {loading ? 'Сохранение...' : 'Изменить статус'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

const getStepDescription = (status: string) => {
  const descriptions: { [key: string]: string } = {
    PLANNED: 'Поставка создана и ожидает подтверждения от поставщика',
    CONFIRMED: 'Поставщик подтвердил поставку и готов к отгрузке',
    IN_TRANSIT: 'Товар в пути к складу',
    ARRIVED: 'Товар прибыл на склад, ожидает разгрузки',
    DELIVERED: 'Товар разгружен и готов к приемке',
    ACCEPTED: 'Товар принят без замечаний',
    REJECTED: 'Товар отклонен по качеству или количеству',
    PARTIALLY_ACCEPTED: 'Часть товара принята, часть отклонена',
    CANCELLED: 'Поставка отменена'
  };
  return descriptions[status] || '';
};

export default DeliveryStatusManager; 