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
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { api } from '../utils/api';

interface PaymentPart {
  id?: string;
  name: string;
  paymentType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  amount: number;
  paymentMoment: 'ADVANCE' | 'READY_TO_SHIP' | 'UPON_DELIVERY' | 'AFTER_ACCEPTANCE' | 'AFTER_WARRANTY' | 'CUSTOM';
  description?: string;
  orderIndex: number;
}

interface PaymentCondition {
  id?: string;
  name: string;
  description?: string;
  paymentParts: PaymentPart[];
}

interface PaymentConditionFormProps {
  value?: PaymentCondition;
  onChange: (condition: PaymentCondition | null) => void;
  onSave?: (condition: PaymentCondition) => void;
  hideButtons?: boolean;
}

const PaymentConditionForm: React.FC<PaymentConditionFormProps> = ({ value, onChange, onSave, hideButtons = false }) => {
  const [condition, setCondition] = useState<PaymentCondition>({
    name: '',
    description: '',
    paymentParts: []
  });
  const [editingPart, setEditingPart] = useState<PaymentPart | null>(null);
  const [editIndex, setEditIndex] = useState<number>(-1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (value) {
      setCondition(value);
    }
  }, [value]);

  const handleAddPart = () => {
    const newPart: PaymentPart = {
      name: '',
      paymentType: 'PERCENTAGE',
      amount: 0,
      paymentMoment: 'ADVANCE',
      description: '',
      orderIndex: condition.paymentParts.length + 1
    };
    setEditingPart(newPart);
    setEditIndex(-1);
    setDialogOpen(true);
  };

  const handleEditPart = (index: number) => {
    setEditingPart({ ...condition.paymentParts[index] });
    setEditIndex(index);
    setDialogOpen(true);
  };

  const handleDeletePart = (index: number) => {
    const newParts = condition.paymentParts.filter((_, i) => i !== index);
    const updatedParts = newParts.map((part, i) => ({
      ...part,
      orderIndex: i + 1
    }));
    const updatedCondition = { ...condition, paymentParts: updatedParts };
    setCondition(updatedCondition);
    onChange(updatedCondition);
  };

  const handleSavePart = () => {
    if (!editingPart) return;

    if (!editingPart.name.trim()) {
      setError('Название части платежа обязательно');
      return;
    }

    if (editingPart.amount <= 0) {
      setError('Сумма должна быть больше 0');
      return;
    }

    setError(null);
    let updatedParts: PaymentPart[];

    if (editIndex >= 0) {
      // Редактирование существующей части
      updatedParts = [...condition.paymentParts];
      updatedParts[editIndex] = editingPart;
    } else {
      // Добавление новой части
      updatedParts = [...condition.paymentParts, editingPart];
    }

    const updatedCondition = { ...condition, paymentParts: updatedParts };
    setCondition(updatedCondition);
    onChange(updatedCondition);
    setDialogOpen(false);
    setEditingPart(null);
    setEditIndex(-1);
  };

  const handleCancelEdit = () => {
    setDialogOpen(false);
    setEditingPart(null);
    setEditIndex(-1);
    setError(null);
  };

  const getPaymentTypeLabel = (type: string) => {
    switch (type) {
      case 'PERCENTAGE': return 'Процент';
      case 'FIXED_AMOUNT': return 'Фиксированная сумма';
      default: return type;
    }
  };

  const getPaymentMomentLabel = (moment: string) => {
    switch (moment) {
      case 'ADVANCE': return 'Аванс';
      case 'READY_TO_SHIP': return 'По готовности к отправке';
      case 'UPON_DELIVERY': return 'По факту поставки';
      case 'AFTER_ACCEPTANCE': return 'После приемки';
      case 'AFTER_WARRANTY': return 'После гарантийного срока';
      case 'CUSTOM': return 'Произвольный момент';
      default: return moment;
    }
  };

  const getTotalPercentage = () => {
    return condition.paymentParts
      .filter(part => part.paymentType === 'PERCENTAGE')
      .reduce((sum, part) => sum + part.amount, 0);
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Условия оплаты
      </Typography>
      
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Название условий оплаты"
                value={condition.name}
                onChange={(e) => {
                  const updated = { ...condition, name: e.target.value };
                  setCondition(updated);
                  onChange(updated);
                }}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Описание"
                value={condition.description}
                onChange={(e) => {
                  const updated = { ...condition, description: e.target.value };
                  setCondition(updated);
                  onChange(updated);
                }}
                margin="normal"
                multiline
                rows={2}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">
          Части платежа
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddPart}
        >
          Добавить часть
        </Button>
      </Box>

      {condition.paymentParts.length > 0 && (
        <TableContainer component={Paper} sx={{ mb: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>№</TableCell>
                <TableCell>Название</TableCell>
                <TableCell>Тип</TableCell>
                <TableCell>Сумма</TableCell>
                <TableCell>Момент оплаты</TableCell>
                <TableCell>Описание</TableCell>
                <TableCell>Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {condition.paymentParts.map((part, index) => (
                <TableRow key={index}>
                  <TableCell>{part.orderIndex}</TableCell>
                  <TableCell>{part.name}</TableCell>
                  <TableCell>{getPaymentTypeLabel(part.paymentType)}</TableCell>
                  <TableCell>
                    {part.amount} {part.paymentType === 'PERCENTAGE' ? '%' : '₽'}
                  </TableCell>
                  <TableCell>{getPaymentMomentLabel(part.paymentMoment)}</TableCell>
                  <TableCell>{part.description}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleEditPart(index)} size="small">
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDeletePart(index)} size="small" color="error">
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {condition.paymentParts.length > 0 && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Общий процент: {getTotalPercentage()}%
        </Alert>
      )}

      {/* Кнопки действий */}
      {onSave && !hideButtons && (
        <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button variant="outlined" onClick={() => onChange(null)}>
            Отмена
          </Button>
          <Button 
            variant="contained" 
            onClick={() => onSave(condition)}
            disabled={!condition.name || condition.paymentParts.length === 0}
          >
            Сохранить
          </Button>
        </Box>
      )}

      {/* Диалог редактирования части платежа */}
      <Dialog open={dialogOpen} onClose={handleCancelEdit} maxWidth="md" fullWidth>
        <DialogTitle>
          {editIndex >= 0 ? 'Редактировать часть платежа' : 'Добавить часть платежа'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Название части"
                value={editingPart?.name || ''}
                onChange={(e) => setEditingPart(prev => prev ? { ...prev, name: e.target.value } : null)}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Тип платежа</InputLabel>
                <Select
                  value={editingPart?.paymentType || 'PERCENTAGE'}
                  onChange={(e) => setEditingPart(prev => prev ? { ...prev, paymentType: e.target.value as any } : null)}
                >
                  <MenuItem value="PERCENTAGE">Процент</MenuItem>
                  <MenuItem value="FIXED_AMOUNT">Фиксированная сумма</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Сумма"
                type="number"
                value={editingPart?.amount || ''}
                onChange={(e) => setEditingPart(prev => prev ? { ...prev, amount: parseFloat(e.target.value) || 0 } : null)}
                margin="normal"
                InputProps={{
                  endAdornment: editingPart?.paymentType === 'PERCENTAGE' ? '%' : '₽'
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Момент оплаты</InputLabel>
                <Select
                  value={editingPart?.paymentMoment || 'ADVANCE'}
                  onChange={(e) => setEditingPart(prev => prev ? { ...prev, paymentMoment: e.target.value as any } : null)}
                >
                  <MenuItem value="ADVANCE">Аванс</MenuItem>
                  <MenuItem value="READY_TO_SHIP">По готовности к отправке</MenuItem>
                  <MenuItem value="UPON_DELIVERY">По факту поставки</MenuItem>
                  <MenuItem value="AFTER_ACCEPTANCE">После приемки</MenuItem>
                  <MenuItem value="AFTER_WARRANTY">После гарантийного срока</MenuItem>
                  <MenuItem value="CUSTOM">Произвольный момент</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Описание"
                value={editingPart?.description || ''}
                onChange={(e) => setEditingPart(prev => prev ? { ...prev, description: e.target.value } : null)}
                margin="normal"
                multiline
                rows={2}
              />
            </Grid>
            {error && (
              <Grid item xs={12}>
                <Alert severity="error">{error}</Alert>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelEdit} startIcon={<CancelIcon />}>
            Отмена
          </Button>
          <Button onClick={handleSavePart} variant="contained" startIcon={<SaveIcon />}>
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PaymentConditionForm;
