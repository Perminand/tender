import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip
} from '@mui/material';
import { fnsApi } from '../utils/fnsApi';

interface TenderItemDto {
  id: string;
  itemNumber: number;
  description: string;
  quantity: number;
  unitName: string;
  specifications: string;
  deliveryRequirements: string;
  estimatedPrice: number;
  materialName: string;
  materialTypeName: string;
}

interface TenderSplitRequestDto {
  tenderId: string;
  itemSplits: TenderItemSplitDto[];
}

interface TenderItemSplitDto {
  itemId: string;
  splitQuantity: number;
  newItemDescription: string;
}

interface TenderSplitResponseDto {
  originalTenderId: string;
  newTenderId: string;
  newTenderNumber: string;
  originalItems: TenderItemDto[];
  newItems: TenderItemDto[];
  message: string;
}

interface TenderSplitDialogProps {
  open: boolean;
  onClose: () => void;
  tenderId: string;
  tenderItems: TenderItemDto[];
  onSplitSuccess: (response: TenderSplitResponseDto) => void;
}

const TenderSplitDialog: React.FC<TenderSplitDialogProps> = ({
  open,
  onClose,
  tenderId,
  tenderItems,
  onSplitSuccess
}) => {
  const [splits, setSplits] = useState<TenderItemSplitDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      // Инициализируем пустые сплиты для всех позиций
      const initialSplits = tenderItems.map(item => ({
        itemId: item.id,
        splitQuantity: 0,
        newItemDescription: `${item.description} (Часть)`
      }));
      setSplits(initialSplits);
      setError(null);
      setSuccess(null);
    }
  }, [open, tenderItems]);

  const handleSplitQuantityChange = (itemId: string, value: number) => {
    setSplits(prev => prev.map(split => 
      split.itemId === itemId 
        ? { ...split, splitQuantity: value }
        : split
    ));
  };

  const handleDescriptionChange = (itemId: string, value: string) => {
    setSplits(prev => prev.map(split => 
      split.itemId === itemId 
        ? { ...split, newItemDescription: value }
        : split
    ));
  };

  const handleSplit = async () => {
    // Фильтруем только те сплиты, где указано количество больше 0
    const validSplits = splits.filter(split => split.splitQuantity > 0);
    
    if (validSplits.length === 0) {
      setError('Необходимо указать количество для разделения хотя бы одной позиции');
      return;
    }

    // Проверяем, что количество не превышает доступное
    for (const split of validSplits) {
      const item = tenderItems.find(i => i.id === split.itemId);
      if (item && split.splitQuantity > item.quantity) {
        setError(`Количество для разделения превышает доступное для позиции "${item.description}"`);
        return;
      }
    }

    setLoading(true);
    setError(null);

    try {
      const request: TenderSplitRequestDto = {
        tenderId,
        itemSplits: validSplits
      };

      const response = await fnsApi.post<TenderSplitResponseDto>(`/api/tenders/${tenderId}/split`, request);
      
      setSuccess(response.data.message);
      onSplitSuccess(response.data);
      
      // Закрываем диалог через 2 секунды
      setTimeout(() => {
        onClose();
      }, 2000);
      
    } catch (e: any) {
      setError(e.response?.data?.message || 'Ошибка при разделении тендера');
    } finally {
      setLoading(false);
    }
  };

  const getItemById = (itemId: string) => {
    return tenderItems.find(item => item.id === itemId);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB'
    }).format(price);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Разделить тендер на части</DialogTitle>
      <DialogContent>
        <Typography variant="body2" sx={{ mb: 2 }}>
          Выберите позиции для разделения и укажите количество для отделения в новый тендер.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <TableContainer component={Paper} sx={{ mb: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>№</TableCell>
                <TableCell>Описание</TableCell>
                <TableCell>Доступное количество</TableCell>
                <TableCell>Количество для разделения</TableCell>
                <TableCell>Описание новой позиции</TableCell>
                <TableCell>Оцен. цена</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {splits.map((split) => {
                const item = getItemById(split.itemId);
                if (!item) return null;

                const remainingQuantity = item.quantity - split.splitQuantity;
                const splitPrice = item.estimatedPrice * (split.splitQuantity / item.quantity);

                return (
                  <TableRow key={split.itemId}>
                    <TableCell>{item.itemNumber}</TableCell>
                    <TableCell>
                      <Typography variant="body2">{item.description}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {item.materialName}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {item.quantity} {item.unitName}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <TextField
                        type="number"
                        size="small"
                        value={split.splitQuantity}
                        onChange={(e) => handleSplitQuantityChange(split.itemId, Number(e.target.value))}
                        inputProps={{ 
                          min: 0, 
                          max: item.quantity,
                          step: 0.01
                        }}
                        sx={{ width: 120 }}
                      />
                      {split.splitQuantity > 0 && (
                        <Typography variant="caption" display="block" color="text.secondary">
                          Останется: {remainingQuantity} {item.unitName}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        value={split.newItemDescription}
                        onChange={(e) => handleDescriptionChange(split.itemId, e.target.value)}
                        sx={{ width: 200 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatPrice(item.estimatedPrice)}
                      </Typography>
                      {split.splitQuantity > 0 && (
                        <Typography variant="caption" display="block" color="success.main">
                          {formatPrice(splitPrice)}
                        </Typography>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Будет создан новый тендер с выбранными позициями
          </Typography>
          <Chip 
            label={`${splits.filter(s => s.splitQuantity > 0).length} позиций для разделения`}
            color="primary"
            variant="outlined"
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Отмена
        </Button>
        <Button 
          onClick={handleSplit} 
          variant="contained" 
          color="primary"
          disabled={loading || splits.filter(s => s.splitQuantity > 0).length === 0}
          startIcon={loading ? <CircularProgress size={16} /> : null}
        >
          {loading ? 'Разделение...' : 'Разделить тендер'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TenderSplitDialog; 