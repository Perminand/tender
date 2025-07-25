import React, { useEffect, useState } from 'react';
import {
  Box, Button, Card, CardContent, Chip, DialogContent, FormControl, Grid, InputLabel, MenuItem, Paper, Select, Snackbar, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography, Alert
} from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import dayjs, { Dayjs } from 'dayjs';
import { useNavigate, useLocation } from 'react-router-dom';
import { api } from '../utils/api';

interface DeliveryItem {
  contractItemId: string;
  materialId: string;
  materialName: string;
  description: string;
  itemNumber: number;
  orderedQuantity: number;
  unitId: string;
  unitName: string;
  unitPrice: number;
  totalPrice: number;
  acceptanceStatus?: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'PARTIALLY_ACCEPTED';
}

interface ContractItem {
  id: string;
  contractId: string;
  materialId: string;
  materialName: string;
  description: string;
  quantity: number;
  unitId: string;
  unitName: string;
  unitPrice: number;
  totalPrice: number;
}

interface Contract {
  id: string;
  contractNumber: string;
  title: string;
  tenderId: string;
  tender?: {
    awardedSupplierId?: string;
    awardedSupplier?: {
      id: string;
      name: string;
      shortName: string;
    };
  };
  warehouseId?: string;
  warehouseName?: string;
}

const DeliveryEditPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const contractId = params.get('contractId');

  const [contracts, setContracts] = useState<Contract[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [contract, setContract] = useState<Contract | null>(null);
  const [contractItems, setContractItems] = useState<ContractItem[]>([]);
  const [deliveryItems, setDeliveryItems] = useState<DeliveryItem[]>([]);
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [selectedWarehouseId, setSelectedWarehouseId] = useState('');
  const [plannedDate, setPlannedDate] = useState<Dayjs | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  useEffect(() => {
    api.get('/api/contracts').then(res => setContracts(res.data));
    api.get('/companies?role=SUPPLIER').then(res => setSuppliers(res.data));
    api.get('/warehouses').then(res => setWarehouses(Array.isArray(res.data) ? res.data : []));
  }, []);

  // Подгружаем контракт и его позиции
  useEffect(() => {
    if (contractId) {
      api.get(`/api/contracts/${contractId}`)
        .then(res => {
          console.log('Contract data:', res.data); // Отладочная информация
          setContract(res.data);
          if (res.data.tender?.awardedSupplierId) {
            console.log('Awarded supplier ID:', res.data.tender.awardedSupplierId); // Отладочная информация
            setSelectedSupplierId(res.data.tender.awardedSupplierId);
          }
          if (res.data.warehouseId) setSelectedWarehouseId(res.data.warehouseId);
        });
      api.get(`/api/contracts/${contractId}/items`)
        .then(res => {
          setContractItems(res.data);
          setDeliveryItems(res.data.map((item: ContractItem, idx: number) => ({
            contractItemId: item.id,
            materialId: item.materialId,
            materialName: item.materialName,
            description: item.description,
            itemNumber: idx + 1,
            orderedQuantity: 0,
            unitId: item.unitId,
            unitName: item.unitName,
            unitPrice: item.unitPrice,
            totalPrice: 0,
            acceptanceStatus: 'PENDING',
          })));
        });
    }
  }, [contractId]);

  const handleQuantityChange = (index: number, quantity: number) => {
    setDeliveryItems(prev => prev.map((item, idx) => idx === index ? {
      ...item,
      orderedQuantity: quantity,
      totalPrice: quantity * item.unitPrice
    } : item));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const itemsToSubmit = deliveryItems.filter(item => item.orderedQuantity > 0);
    if (itemsToSubmit.length === 0) {
      setSnackbar({ open: true, message: 'Укажите количество хотя бы для одной позиции', severity: 'error' });
      return;
    }
    try {
      const submitData = {
        deliveryNumber: formData.get('deliveryNumber'),
        contractId: contractId, // Уже является строкой UUID
        supplierId: contract?.tender?.awardedSupplierId, // Используем ID поставщика из контракта
        warehouseId: contract?.warehouseId, // Используем ID склада из контракта
        plannedDate: plannedDate ? plannedDate.format('YYYY-MM-DD') : null,
        trackingNumber: formData.get('trackingNumber'),
        notes: formData.get('notes'),
        deliveryItems: itemsToSubmit
      };
      console.log('Submitting delivery data:', submitData); // Отладочная информация
      const response = await api.post('/api/deliveries', submitData);
      if (response.status === 200 || response.status === 201) {
        setSnackbar({ open: true, message: 'Поставка создана', severity: 'success' });
        setTimeout(() => {
          navigate(`/contracts/${contractId}/manage`);
        }, 1000);
      } else {
        setSnackbar({ open: true, message: 'Ошибка при создании поставки', severity: 'error' });
      }
    } catch (error: any) {
      let message = 'Ошибка при создании поставки';
      if (error.response && error.response.data) {
        const raw =
          typeof error.response.data === 'string'
            ? error.response.data
            : error.response.data.global || error.response.data.message || '';
        if (
          raw &&
          (/duplicate key value.*delivery_number.*already exists/i.test(raw) ||
           /уникальное ограничение.*delivery_number.*уже существует/i.test(raw))
        ) {
          // Ищем номер поставки даже в русских сообщениях и с кавычками
          const match = raw.match(/delivery_number["']?[\)\s=]*\(?([^)]+)\)?/i);
          const number = match ? match[1].replace(/[^\d]/g, '') : '';
          message = `Поставка с номером ${number} уже существует. Пожалуйста, выберите другой номер.`;
        } else if (raw) {
          message = raw;
        }
      }
      setSnackbar({ open: true, message, severity: 'error' });
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Создать поставку</Typography>
      <Paper sx={{ p: 2, mb: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField name="deliveryNumber" label="Номер поставки" fullWidth required />
            </Grid>
            <Grid item xs={6}>
              <TextField label="Контракт" value={contract ? `${contract.contractNumber} | ${contract.title}` : ''} fullWidth disabled />
            </Grid>
            <Grid item xs={6}>
              <TextField 
                label="Поставщик" 
                value={(() => {
                  const supplierName = contract?.tender?.awardedSupplier?.shortName || contract?.tender?.awardedSupplier?.name || '';
                  console.log('Supplier name:', supplierName); // Отладочная информация
                  return supplierName;
                })()} 
                fullWidth 
                disabled 
              />
            </Grid>
            <Grid item xs={6}>
              <TextField label="Склад" value={warehouses.find(w => String(w.id) === String(selectedWarehouseId))?.name || ''} fullWidth disabled />
            </Grid>
            <Grid item xs={6}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="Запланированная дата"
                  value={plannedDate}
                  onChange={setPlannedDate}
                  format="DD.MM.YYYY"
                  slotProps={{
                    textField: {
                      name: 'plannedDate',
                      fullWidth: true,
                      required: true,
                    },
                  }}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={6}>
              <TextField name="trackingNumber" label="Трек номер" fullWidth />
            </Grid>
            <Grid item xs={12}>
              <TextField name="notes" label="Примечания" multiline rows={3} fullWidth />
            </Grid>
            {contractItems.length > 0 && (
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Позиции поставки</Typography>
                <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>№</TableCell>
                        <TableCell>Описание</TableCell>
                        <TableCell>Материал</TableCell>
                        <TableCell>По контракту</TableCell>
                        <TableCell>Количество</TableCell>
                        <TableCell>Ед. изм.</TableCell>
                        <TableCell>Цена за ед.</TableCell>
                        <TableCell>Сумма</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {deliveryItems.map((item, idx) => (
                        <TableRow key={item.contractItemId}>
                          <TableCell>{item.itemNumber}</TableCell>
                          <TableCell>{item.description}</TableCell>
                          <TableCell>{item.materialName}</TableCell>
                          <TableCell>{contractItems.find(ci => ci.id === item.contractItemId)?.quantity}</TableCell>
                          <TableCell>
                            <TextField
                              type="number"
                              value={item.orderedQuantity}
                              onChange={e => handleQuantityChange(idx, Number(e.target.value))}
                              inputProps={{ min: 0 }}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>{item.unitName}</TableCell>
                          <TableCell>{item.unitPrice} р.</TableCell>
                          <TableCell>{item.totalPrice} р.</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
            )}
            <Grid item xs={12} sx={{ mt: 2, display: 'flex', gap: 2 }}>
              <Button type="submit" variant="contained">Создать поставку</Button>
              <Button 
                variant="outlined" 
                onClick={() => navigate(`/contracts/${contractId}/manage`)}
              >
                Отмена
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DeliveryEditPage; 