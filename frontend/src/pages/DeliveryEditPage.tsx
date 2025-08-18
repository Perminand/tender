import React, { useEffect, useState } from 'react';
import {
  Box, Button, Card, CardContent, Chip, DialogContent, FormControl, Grid, InputLabel, MenuItem, Paper, Select, Snackbar, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography, Alert
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import dayjs, { Dayjs } from 'dayjs';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
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
  const { id } = useParams<{ id: string }>();
  const params = new URLSearchParams(location.search);
  const contractId = params.get('contractId');
  const invoiceId = params.get('invoiceId');
  const supplierIdFromQuery = params.get('supplierId') || '';
  const supplierNameFromQuery = params.get('supplierName') || '';
  
  const isEditMode = !!id;

  const [contracts, setContracts] = useState<Contract[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [contract, setContract] = useState<Contract | null>(null);
  const [contractItems, setContractItems] = useState<ContractItem[]>([]);
  const [deliveryItems, setDeliveryItems] = useState<DeliveryItem[]>([]);
  const [originalDeliveryItems, setOriginalDeliveryItems] = useState<DeliveryItem[]>([]);
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [selectedWarehouseId, setSelectedWarehouseId] = useState('');
  const [plannedDate, setPlannedDate] = useState<Dayjs | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [delivery, setDelivery] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [loadingItems, setLoadingItems] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);

  // Загрузка базовых данных (контракты, поставщики, склады)
  useEffect(() => {
    const loadBasicData = async () => {
      try {
        const [contractsRes, suppliersRes, warehousesRes] = await Promise.all([
          api.get('/api/contracts'),
          api.get('/api/companies?role=SUPPLIER'),
          api.get('/api/warehouses')
        ]);
        
        setContracts(contractsRes.data);
        setSuppliers(suppliersRes.data);
        setWarehouses(Array.isArray(warehousesRes.data) ? warehousesRes.data : []);
      } catch (error) {
        console.error('Error loading basic data:', error);
      }
    };
    
    loadBasicData();
  }, []);

  // Предзаполнение поставщика из query string (supplierId/supplierName)
  useEffect(() => {
    // Не трогаем режим редактирования
    if (isEditMode) return;

    // Если уже выбран — выходим
    if (selectedSupplierId) return;

    // Приоритет: supplierId из query → supplierId из контракта → awardedSupplierId → supplierName из query
    if (supplierIdFromQuery) {
      setSelectedSupplierId(supplierIdFromQuery);
      return;
    }

    if (!selectedSupplierId && contract && (contract as any).supplierId) {
      setSelectedSupplierId((contract as any).supplierId);
      return;
    }
    if (!selectedSupplierId && contract?.tender?.awardedSupplierId) {
      setSelectedSupplierId(contract.tender.awardedSupplierId);
      return;
    }

    if (supplierNameFromQuery && suppliers.length > 0) {
      const decoded = decodeURIComponent(supplierNameFromQuery);
      const matched = suppliers.find((s: any) =>
        s.name === decoded || s.shortName === decoded
      );
      if (matched?.id) {
        setSelectedSupplierId(matched.id);
      }
    }
  }, [isEditMode, supplierIdFromQuery, supplierNameFromQuery, suppliers, selectedSupplierId, contract]);

  // Загрузка данных из счета, если передан invoiceId
  useEffect(() => {
    if (invoiceId && !isEditMode) {
      console.log('Loading invoice data for invoiceId:', invoiceId);
      api.get(`/api/invoices/${invoiceId}`)
        .then(res => {
          console.log('Invoice data:', res.data);
          const invoice = res.data;
          
          if (invoice.contractId) {
            console.log('Loading contract from invoice, contractId:', invoice.contractId);
            api.get(`/api/contracts/${invoice.contractId}`)
              .then(contractRes => {
                console.log('Contract data from invoice:', contractRes.data);
                setContract(contractRes.data);
                if (contractRes.data.tender?.awardedSupplierId) {
                  setSelectedSupplierId(contractRes.data.tender.awardedSupplierId);
                }
                if (contractRes.data.warehouseId) {
                  setSelectedWarehouseId(contractRes.data.warehouseId);
                }
                
                // Загружаем позиции контракта
                setLoadingItems(true);
                api.get(`/api/contracts/${invoice.contractId}/items`)
                  .then(itemsRes => {
                    console.log('Contract items from invoice:', itemsRes.data);
                    setContractItems(itemsRes.data);
                    
                    // Создаем позиции поставки на основе позиций контракта
                    const newDeliveryItems = itemsRes.data.map((item: ContractItem, idx: number) => ({
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
                    }));
                    setDeliveryItems(newDeliveryItems);
                  })
                  .catch(error => {
                    console.error('Error loading contract items from invoice:', error);
                  })
                  .finally(() => {
                    setLoadingItems(false);
                  });
              })
              .catch(error => {
                console.error('Error loading contract from invoice:', error);
              });
          }
        })
        .catch(error => {
          console.error('Error loading invoice:', error);
        });
    }
  }, [invoiceId, isEditMode]);

  // Загрузка существующей поставки для редактирования
  useEffect(() => {
    if (isEditMode && id && !dataLoaded) {
      setLoading(true);
      console.log('Loading delivery for editing, id:', id);
      
      const loadDeliveryData = async () => {
        try {
          // Загружаем данные поставки
          const deliveryRes = await api.get(`/api/deliveries/${id}`);
          console.log('Delivery data loaded:', deliveryRes.data);
          console.log('Delivery structure:', {
            id: deliveryRes.data.id,
            deliveryNumber: deliveryRes.data.deliveryNumber,
            contractId: deliveryRes.data.contractId,
            supplierId: deliveryRes.data.supplierId,
            warehouseId: deliveryRes.data.warehouseId,
            plannedDate: deliveryRes.data.plannedDate,
            trackingNumber: deliveryRes.data.trackingNumber,
            notes: deliveryRes.data.notes,
            status: deliveryRes.data.status,
            allKeys: Object.keys(deliveryRes.data)
          });
          const deliveryData = deliveryRes.data;
          setDelivery(deliveryData);
          
          // Заполняем поля формы данными поставки
          if (deliveryData.plannedDate) {
            setPlannedDate(dayjs(deliveryData.plannedDate));
          }
          
            // Загружаем контракт для существующей поставки
          if (deliveryData.contractId) {
            console.log('Loading contract for delivery, contractId:', deliveryData.contractId);
            const contractRes = await api.get(`/api/contracts/${deliveryData.contractId}`);
            console.log('Contract data loaded:', contractRes.data);
                setContract(contractRes.data);
            
                if (contractRes.data.tender?.awardedSupplierId) {
                  setSelectedSupplierId(contractRes.data.tender.awardedSupplierId);
                }
                if (contractRes.data.warehouseId) {
                  setSelectedWarehouseId(contractRes.data.warehouseId);
                }
            
            // Загружаем позиции контракта
            setLoadingItems(true);
            const itemsRes = await api.get(`/api/contracts/${deliveryData.contractId}/items`);
            console.log('Contract items loaded:', itemsRes.data);
            setContractItems(itemsRes.data);
            
            // Загружаем существующие позиции поставки
            try {
              const deliveryItemsRes = await api.get(`/api/deliveries/${id}/items`);
              console.log('Delivery items loaded:', deliveryItemsRes.data);
              
              if (deliveryItemsRes.data && deliveryItemsRes.data.length > 0) {
                // Создаем deliveryItems на основе существующих позиций поставки
                const existingDeliveryItems = deliveryItemsRes.data.map((di: any, idx: number) => {
                  const contractItem = itemsRes.data.find((item: ContractItem) => item.id === di.contractItemId);
                    if (contractItem) {
                      return {
                        contractItemId: di.contractItemId,
                        materialId: contractItem.materialId,
                        materialName: contractItem.materialName,
                        description: contractItem.description,
                        itemNumber: idx + 1,
                        orderedQuantity: di.orderedQuantity || 0,
                        unitId: contractItem.unitId,
                        unitName: contractItem.unitName,
                        unitPrice: contractItem.unitPrice,
                        totalPrice: (di.orderedQuantity || 0) * contractItem.unitPrice,
                        acceptanceStatus: di.acceptanceStatus || 'PENDING',
                      };
                    }
                    return null;
                  }).filter(Boolean);
                  
                  setDeliveryItems(existingDeliveryItems);
                  setOriginalDeliveryItems(existingDeliveryItems);
                } else {
                // Если позиций поставки нет, создаем пустые на основе контракта
                const emptyDeliveryItems = itemsRes.data.map((item: ContractItem, idx: number) => ({
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
                }));
                setDeliveryItems(emptyDeliveryItems);
              }
            } catch (error) {
              console.error('Error loading delivery items:', error);
              // Если не удалось загрузить позиции поставки, создаем пустые
              const emptyDeliveryItems = itemsRes.data.map((item: ContractItem, idx: number) => ({
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
              }));
              setDeliveryItems(emptyDeliveryItems);
            }
          } else {
            console.warn('Delivery does not have contractId:', deliveryData);
            
            // Fallback: пытаемся найти контракт по supplierId или другим полям
            if (deliveryData.supplierId) {
              console.log('Attempting to find contract by supplierId:', deliveryData.supplierId);
              try {
                // Загружаем все контракты и ищем подходящий
                const contractsRes = await api.get('/api/contracts');
                const matchingContract = contractsRes.data.find((c: any) => 
                  c.tender?.awardedSupplierId === deliveryData.supplierId
                );
                
                if (matchingContract) {
                  console.log('Found matching contract by supplierId:', matchingContract);
                  setContract(matchingContract);
                  setSelectedSupplierId(deliveryData.supplierId);
                  if (matchingContract.warehouseId) {
                    setSelectedWarehouseId(matchingContract.warehouseId);
                  }
                  
                  // Загружаем позиции найденного контракта
                  setLoadingItems(true);
                  const itemsRes = await api.get(`/api/contracts/${matchingContract.id}/items`);
                  setContractItems(itemsRes.data);
                  
                  // Создаем пустые позиции поставки
                  const emptyDeliveryItems = itemsRes.data.map((item: ContractItem, idx: number) => ({
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
                  }));
                  setDeliveryItems(emptyDeliveryItems);
                } else {
                  console.warn('No matching contract found for supplierId:', deliveryData.supplierId);
                }
              } catch (error) {
                console.error('Error searching for contract by supplierId:', error);
              }
            }
            
            // Если не удалось найти контракт, показываем предупреждение
            if (!deliveryData.supplierId) {
              console.warn('Delivery has no contractId and no supplierId - cannot load contract data');
            }
          }
          
          console.log('All delivery data loaded successfully');
          setDataLoaded(true);
        } catch (error) {
          console.error('Error loading delivery data:', error);
          setSnackbar({ open: true, message: 'Ошибка при загрузке поставки', severity: 'error' });
        } finally {
          setLoading(false);
          setLoadingItems(false);
        }
      };
      
      loadDeliveryData();
    }
  }, [isEditMode, id, dataLoaded]);

  // Загрузка контракта и его позиций для создания новой поставки
  useEffect(() => {
    if (!isEditMode && contractId && !dataLoaded) {
      console.log('Loading contract data for new delivery, contractId:', contractId);
      setLoadingItems(true);
      
      api.get(`/api/contracts/${contractId}`)
        .then(async (res) => {
          console.log('Contract data for new delivery:', res.data);
          setContract(res.data);
          
          // Предзаполняем поставщика: контрактный supplierId → победитель тендера → оставим для эффекта по имени
          if ((res.data as any).supplierId) {
            setSelectedSupplierId((res.data as any).supplierId);
          } else if (res.data.tender?.awardedSupplierId) {
            setSelectedSupplierId(res.data.tender.awardedSupplierId);
          }
          if (res.data.warehouseId) {
            setSelectedWarehouseId(res.data.warehouseId);
          }
          
          // Загружаем позиции контракта
          const itemsRes = await api.get(`/api/contracts/${contractId}/items`);
          console.log('Contract items for new delivery:', itemsRes.data);
          setContractItems(itemsRes.data);
          
          // Создаем пустые позиции поставки
          const newDeliveryItems = itemsRes.data.map((item: ContractItem, idx: number) => ({
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
          }));
          setDeliveryItems(newDeliveryItems);
          setDataLoaded(true);
                 })
         .catch(error => {
          console.error('Error loading contract for new delivery:', error);
         })
         .finally(() => {
           setLoadingItems(false);
         });
    }
  }, [contractId, isEditMode, dataLoaded]);

  // Синхронизируем selectedWarehouseId с contract?.warehouseId после загрузки складов и контракта
  useEffect(() => {
    if (contract?.warehouseId && warehouses.length > 0) {
      setSelectedWarehouseId(String(contract.warehouseId));
    }
  }, [contract, warehouses]);

  // Отладочная информация
  console.log('DeliveryEditPage render state:', {
    isEditMode,
    id,
    delivery,
    contract,
    contractItems: contractItems.length,
    deliveryItems: deliveryItems.length,
    dataLoaded,
    loading,
    loadingItems,
    selectedSupplierId,
    selectedWarehouseId,
    warehouses: warehouses.length
  });

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
    
    // При редактировании отправляем только те позиции, которые были изначально
    let itemsToSubmit;
    if (isEditMode) {
      // Фильтруем только те позиции, которые были в исходной поставке
      itemsToSubmit = deliveryItems.filter(item => {
        const wasInOriginal = originalDeliveryItems.some(original => original.contractItemId === item.contractItemId);
        return wasInOriginal && item.orderedQuantity > 0;
      });
    } else {
      // При создании новой поставки отправляем все позиции с количеством > 0
      itemsToSubmit = deliveryItems.filter(item => item.orderedQuantity > 0);
    }
    
    if (itemsToSubmit.length === 0) {
      setSnackbar({ open: true, message: 'Укажите количество хотя бы для одной позиции', severity: 'error' });
      return;
    }
    
    try {
      // Определяем contractId для отправки
      const targetContractId = isEditMode ? delivery?.contractId : contractId;
      
      // Проверяем, есть ли contractId для отправки
      if (!targetContractId) {
        setSnackbar({ 
          open: true, 
          message: 'Ошибка: поставка не связана с контрактом. Свяжите поставку с контрактом перед сохранением.', 
          severity: 'error' 
        });
        return;
      }
      
      const submitData = {
        deliveryNumber: formData.get('deliveryNumber'),
        contractId: targetContractId,
        supplierId: selectedSupplierId || (contract as any)?.supplierId || contract?.tender?.awardedSupplierId || delivery?.supplierId,
        warehouseId: contract?.warehouseId || delivery?.warehouseId,
        plannedDate: plannedDate ? plannedDate.format('YYYY-MM-DD') : null,
        trackingNumber: formData.get('trackingNumber'),
        notes: formData.get('notes'),
        deliveryItems: itemsToSubmit
      };
      console.log('Submitting delivery data:', submitData);
      
      let response;
      if (isEditMode && id) {
        // Обновление существующей поставки
        response = await api.put(`/api/deliveries/${id}`, submitData);
        if (response.status === 200) {
          setSnackbar({ open: true, message: 'Поставка обновлена', severity: 'success' });
          setTimeout(() => {
            navigate(`/deliveries/${id}`);
          }, 1000);
        } else {
          setSnackbar({ open: true, message: 'Ошибка при обновлении поставки', severity: 'error' });
        }
      } else {
        // Создание новой поставки
        response = await api.post('/api/deliveries', submitData);
        // После создания поставки переводим контракт в статус ACTIVE
        try {
          const cid = String(targetContractId);
          if (cid) {
            await api.patch(`/api/contracts/${cid}/status?status=ACTIVE`);
          }
        } catch (e) {
          console.warn('Не удалось обновить статус контракта до ACTIVE после создания поставки', e);
        }
        if (response.status === 200 || response.status === 201) {
          setSnackbar({ open: true, message: 'Поставка создана', severity: 'success' });
          setTimeout(() => {
            navigate(`/contracts/${targetContractId}/manage`);
          }, 1000);
        } else {
          setSnackbar({ open: true, message: 'Ошибка при создании поставки', severity: 'error' });
        }
      }
    } catch (error: any) {
      let message = isEditMode ? 'Ошибка при обновлении поставки' : 'Ошибка при создании поставки';
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

  if (loading) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
        <Typography>Загрузка поставки...</Typography>
      </Box>
    );
  }

  // Показываем индикатор загрузки, если данные еще не загружены
  if (!dataLoaded && isEditMode) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
        <Typography>Подготовка формы редактирования...</Typography>
      </Box>
    );
  }

  // Показываем индикатор загрузки, если контракт еще не загружен
  if (isEditMode && delivery && !contract) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
        <Typography>Загрузка данных контракта...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" alignItems="center" mb={2}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          sx={{ mr: 2 }}
        >
          Назад
        </Button>
        <Typography variant="h4">
          {isEditMode ? 'Редактировать поставку' : 'Создать поставку'}
        </Typography>
      </Box>
      <Paper sx={{ p: 2, mb: 3 }}>
        {delivery && !delivery.contractId && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>Внимание:</strong> Данная поставка не связана с контрактом. 
              Некоторые поля могут быть недоступны для редактирования.
            </Typography>
          </Alert>
        )}
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField 
                name="deliveryNumber" 
                label="Номер поставки" 
                defaultValue={delivery?.deliveryNumber || ''}
                fullWidth 
                required 
              />
            </Grid>
            <Grid item xs={6}>
              <TextField 
                label="Контракт" 
                value={(() => {
                  if (contract) {
                    return `${contract.contractNumber} | ${contract.title}`;
                  } else if (delivery && !delivery.contractId) {
                    return 'Контракт не связан с поставкой';
                  } else {
                    return 'Загрузка контракта...';
                  }
                })()} 
                fullWidth 
                disabled 
              />
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel id="supplier-label">Поставщик</InputLabel>
                <Select
                  labelId="supplier-label"
                  label="Поставщик"
                  value={selectedSupplierId}
                  onChange={(e) => setSelectedSupplierId(String(e.target.value))}
                >
                  {suppliers.map((s: any) => (
                    <MenuItem key={s.id} value={s.id}>{s.shortName || s.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <TextField 
                label="Склад" 
                value={(() => {
                  if (contract?.warehouseId) {
                    const warehouse = warehouses.find(w => String(w.id) === String(contract.warehouseId));
                    const warehouseName = warehouse?.name || '';
                    console.log('Warehouse for display:', warehouseName, 'Selected warehouse ID:', selectedWarehouseId, 'Warehouses:', warehouses, 'Contract warehouse ID:', contract?.warehouseId);
                    return warehouseName;
                  } else if (delivery?.warehouseId) {
                    const warehouse = warehouses.find(w => String(w.id) === String(delivery.warehouseId));
                    return warehouse?.name || `Склад ID: ${delivery.warehouseId}`;
                  } else {
                    return 'Склад не определен';
                  }
                })()} 
                fullWidth 
                disabled 
              />
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
              <TextField 
                name="trackingNumber" 
                label="Трек номер" 
                defaultValue={delivery?.trackingNumber || ''}
                fullWidth 
              />
            </Grid>
            <Grid item xs={12}>
              <TextField 
                name="notes" 
                label="Примечания" 
                defaultValue={delivery?.notes || ''}
                multiline 
                rows={3} 
                fullWidth 
              />
            </Grid>
                         <Grid item xs={12}>
               <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Позиции поставки</Typography>
               {loadingItems ? (
                 <Box sx={{ p: 2, textAlign: 'center' }}>
                   <Typography>Загрузка позиций контракта...</Typography>
                 </Box>
               ) : contractItems.length > 0 ? (
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
               ) : (
                 <Box sx={{ p: 2, textAlign: 'center', border: '1px dashed #ccc', borderRadius: 1 }}>
                   <Typography color="textSecondary">
                     {contract ? 'Позиции контракта не найдены' : 
                      delivery && !delivery.contractId ? 'Поставка не связана с контрактом. Позиции недоступны.' :
                      'Выберите контракт для загрузки позиций'}
                   </Typography>
                 </Box>
               )}
             </Grid>
            <Grid item xs={12} sx={{ mt: 2, display: 'flex', gap: 2 }}>
              <Button type="submit" variant="contained">
                {isEditMode ? 'Обновить поставку' : 'Создать поставку'}
              </Button>
              <Button 
                variant="outlined" 
                onClick={() => {
                  if (isEditMode && id) {
                    navigate(`/deliveries/${id}`);
                  } else {
                    const targetContractId = contractId || delivery?.contractId;
                    if (targetContractId) {
                      navigate(`/contracts/${targetContractId}/manage`);
                    } else {
                      navigate(-1);
                    }
                  }
                }}
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