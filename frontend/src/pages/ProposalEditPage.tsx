import React, { useState, useEffect, useCallback } from 'react';
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
// import PaymentConditionForm from '../components/PaymentConditionForm';
import AdditionalExpensesManager from '../components/AdditionalExpensesManager';
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

interface DictionaryItem {
  id: string;
  name: string;
  description?: string;
  country?: string;
  code?: string;
}

interface DeliveryConditionDict {
  id: string;
  name: string;
  description?: string;
  deliveryType: string;
  deliveryPeriod?: string;
  deliveryResponsibility: string;
  additionalTerms?: string;
  calculateDelivery?: boolean;
}

interface PaymentConditionDict {
  id: string;
  name: string;
  description?: string;
}

interface ProposalItemForm {
  tenderItemId: string;
  description: string;
  brand: DictionaryItem | null;
  model: string;
  manufacturer: DictionaryItem | null;
  countryOfOrigin: DictionaryItem | null;
  quantity: number;
  unitName: string;
  unitPrice: number;
  specifications: string;
  deliveryPeriod: string;
  warranty: DictionaryItem | null;
  additionalInfo: string;
  unitPriceWithVat: number;
  weight: number;
  deliveryCost: number;
}

interface ProposalFormData {
  id?: string;
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
  paymentCondition?: any; // выбранный объект
  paymentConditionId?: string; // id для бэкенда
  deliveryCondition?: any;
  deliveryConditionId?: string;
  deliveryCost?: number | null;
}

interface Company {
  id: string;
  name: string;
  shortName: string;
}

const ProposalEditPage: React.FC = () => {
  const { tenderId, id } = useParams<{ tenderId?: string; id?: string }>();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [tenderItems, setTenderItems] = useState<TenderItem[]>([]);
  const [tenderInfo, setTenderInfo] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [duplicateItems, setDuplicateItems] = useState<Set<number>>(new Set());
  const [savingDictionaryItem, setSavingDictionaryItem] = useState(false);
  
  // Состояния для справочников
  const [brands, setBrands] = useState<DictionaryItem[]>([]);
  const [manufacturers, setManufacturers] = useState<DictionaryItem[]>([]);
  const [countries, setCountries] = useState<DictionaryItem[]>([]);
  const [warranties, setWarranties] = useState<DictionaryItem[]>([]);
  const [deliveryConditions, setDeliveryConditions] = useState<DeliveryConditionDict[]>([]);
  const [paymentConditions, setPaymentConditions] = useState<PaymentConditionDict[]>([]);
  const [dictionariesLoaded, setDictionariesLoaded] = useState(false);
  
  // Состояния для модального окна позиции
  const [positionModalOpen, setPositionModalOpen] = useState(false);
  const [currentPositionIndex, setCurrentPositionIndex] = useState(0);
  const [currentPositionData, setCurrentPositionData] = useState<ProposalItemForm | null>(null);
  const [fillingStarted, setFillingStarted] = useState(false);
  const [savingPosition, setSavingPosition] = useState(false);
  
  // Сброс состояния заполнения при загрузке в режиме редактирования
  useEffect(() => {
    if (isEditMode) {
      console.log('Режим редактирования - сбрасываем состояние заполнения позиций');
      setFillingStarted(false);
      setCurrentPositionIndex(0);
      setPositionModalOpen(false);
      setCurrentPositionData(null);
      // Очищаем localStorage для этого тендера
      if (tenderId) {
        localStorage.removeItem(`proposal_filling_${tenderId}`);
      }
    }
  }, [isEditMode, tenderId]);
  
  // Логирование изменений состояния модального окна
  useEffect(() => {
    console.log('Состояние модального окна изменилось:', {
      positionModalOpen,
      currentPositionIndex,
      fillingStarted,
      currentPositionData: currentPositionData ? 'установлен' : 'null'
    });
  }, [positionModalOpen, currentPositionIndex, fillingStarted, currentPositionData]);
  
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
    proposalItems: [],
    deliveryCost: null,
    paymentConditionId: undefined
  });

  // Состояние для автокомплета поставщика
  const [selectedSupplier, setSelectedSupplier] = useState<Company | null>(null);
  
  // Ширина столбцов
  const defaultWidths = [40, 200, 120, 120, 150, 120, 80, 100, 100, 80, 100, 120, 120, 100, 60];
  const [colWidths, setColWidths] = useState<number[]>(defaultWidths);

  // Функция для расчета оптимальной ширины столбцов
  const calculateOptimalColumnWidths = useCallback(() => {
    if (!formData.proposalItems || formData.proposalItems.length === 0) {
      return defaultWidths;
    }

    const columnHeaders = [
      '№', 'Описание', 'Бренд', 'Модель', 'Производитель', 'Страна', 'Количество', 'Ед. изм.',
      'Цена за ед.', 'Цена с НДС', 'Вес', 'Доставка', 'Срок поставки', 'Гарантия', 'Сумма', 'Действия'
    ];

    const calculateTextWidth = (text: string, isHeader: boolean = false, isCompact: boolean = false) => {
      if (isCompact) {
        const charWidth = 5;
        const padding = isHeader ? 12 : 8;
        return Math.max(text.length * charWidth + padding, 40);
      }
      
      const charWidth = 8;
      const padding = isHeader ? 20 : 16;
      return Math.max(text.length * charWidth + padding, 60);
    };

    const widths = columnHeaders.map((header, colIndex) => {
      const isNumericColumn = colIndex === 0 || colIndex === 6 || colIndex === 7 || colIndex === 8 || colIndex === 9 || colIndex === 10 || colIndex === 13;
      const isCompactColumn = isNumericColumn;
      let maxWidth = calculateTextWidth(header, true, isCompactColumn);

      formData.proposalItems.forEach((item, rowIndex) => {
        let cellText = '';
        
        switch (colIndex) {
          case 0: // №
            cellText = (rowIndex + 1).toString();
            break;
          case 1: // Описание
            cellText = item.description || '';
            break;
          case 2: // Бренд
            cellText = item.brand?.name || '';
            break;
          case 3: // Модель
            cellText = item.model || '';
            break;
          case 4: // Производитель
            cellText = item.manufacturer?.name || '';
            break;
          case 5: // Страна
            cellText = item.countryOfOrigin?.name || '';
            break;
          case 6: // Количество
            cellText = item.quantity?.toString() || '';
            break;
          case 7: // Ед. изм.
            cellText = item.unitName || '';
            break;
          case 8: // Цена за ед.
            cellText = item.unitPrice?.toString() || '';
            break;
          case 9: // Цена с НДС
            cellText = item.unitPriceWithVat?.toString() || '';
            break;
          case 10: // Вес
            cellText = item.weight?.toString() || '';
            break;
          case 11: // Доставка
            cellText = item.deliveryCost?.toString() || '';
            break;
          case 12: // Срок поставки
            cellText = item.deliveryPeriod || '';
            break;
          case 13: // Гарантия
            cellText = item.warranty?.name || '';
            break;
          case 14: // Сумма
            cellText = ((item.quantity || 0) * (item.unitPrice || 0)).toString();
            break;
          case 15: // Действия
            cellText = '';
            break;
        }
        
        const cellWidth = calculateTextWidth(cellText, false, isCompactColumn);
        maxWidth = Math.max(maxWidth, cellWidth);
      });
      
      return Math.min(maxWidth, 800); // Максимальная ширина столбца
    });

    return widths;
  }, [formData.proposalItems]);

  // Обновляем ширину столбцов при изменении данных
  useEffect(() => {
    const newWidths = calculateOptimalColumnWidths();
    setColWidths(newWidths);
    console.log('Ширина столбцов обновлена:', newWidths);
  }, [calculateOptimalColumnWidths]);

  // Отладочный эффект для отслеживания изменений colWidths
  useEffect(() => {
    console.log('colWidths изменился:', colWidths);
  }, [colWidths]);

  // Функция для генерации стилей ячейки
  const getCellStyles = (colIndex: number) => ({
    sx: { 
      width: colWidths[colIndex],
      flex: 'none',
      flexShrink: 0,
      flexGrow: 0
    },
    style: {
      width: colWidths[colIndex],
      minWidth: colWidths[colIndex],
      maxWidth: colWidths[colIndex],
      '--cell-width': `${colWidths[colIndex]}px`
    } as React.CSSProperties
  });

  // Функция для изменения ширины столбцов
  const handleMouseDown = (idx: number, e: React.MouseEvent) => {
    console.log('handleMouseDown вызван для столбца:', idx);
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = colWidths[idx];
    console.log('Начальная ширина столбца:', startWidth);

    const handleMouseMove = (e: MouseEvent) => {
      console.log('handleMouseMove вызван');
      const deltaX = e.clientX - startX;
      const newWidth = Math.max(40, Math.min(800, startWidth + deltaX));
      console.log('Новая ширина столбца:', newWidth);
      
      setColWidths(prev => {
        const newWidths = [...prev];
        newWidths[idx] = newWidth;
        console.log('Обновленные ширины столбцов:', newWidths);
        return newWidths;
      });
    };

    const handleMouseUp = () => {
      console.log('handleMouseUp вызван');
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  useEffect(() => {
    console.log('ProposalEditPage загружается, tenderId:', tenderId, 'id:', id, 'isEditMode:', isEditMode);
    loadCompanies();
    loadDictionaries();
    
    if (isEditMode && id) {
      // Загружаем предложение только после загрузки справочников
      if (dictionariesLoaded) {
        loadProposal();
      }
    } else if (tenderId) {
      loadTenderInfo();
      loadTenderItems();
    }
  }, [tenderId, id, isEditMode, dictionariesLoaded]);

  // Загрузка предложения после загрузки справочников
  useEffect(() => {
    if (isEditMode && id && dictionariesLoaded) {
      loadProposal();
    }
  }, [dictionariesLoaded, isEditMode, id]);

  // Обновление условия доставки после загрузки справочников
  useEffect(() => {
    if (isEditMode && dictionariesLoaded && deliveryConditions.length > 0 && formData.deliveryConditionId && !formData.deliveryCondition) {
      const foundCondition = deliveryConditions.find(dc => dc.id === formData.deliveryConditionId);
      if (foundCondition) {
        console.log('Обновляем условие доставки после загрузки справочников:', foundCondition);
        setFormData(prev => ({
          ...prev,
          deliveryCondition: foundCondition
        }));
      }
    }
  }, [dictionariesLoaded, deliveryConditions, isEditMode, formData.deliveryConditionId, formData.deliveryCondition]);

  // Обновление условия оплаты после загрузки справочников
  useEffect(() => {
    if (isEditMode && dictionariesLoaded && paymentConditions.length > 0 && formData.paymentConditionId && !formData.paymentCondition) {
      const foundCondition = paymentConditions.find(pc => pc.id === formData.paymentConditionId);
      if (foundCondition) {
        console.log('Обновляем условие оплаты после загрузки справочников:', foundCondition);
        setFormData(prev => ({
          ...prev,
          paymentCondition: foundCondition
        }));
      }
    }
  }, [dictionariesLoaded, paymentConditions, isEditMode, formData.paymentConditionId, formData.paymentCondition]);

  // Инициализация selectedSupplier при изменении companies или formData.supplierId
  useEffect(() => {
    if (companies.length > 0 && formData.supplierId) {
      const supplier = companies.find(company => company.id === formData.supplierId);
      setSelectedSupplier(supplier || null);
    }
  }, [companies, formData.supplierId]);

  // Восстановление процесса заполнения позиций при возврате на страницу
  useEffect(() => {
    if (fillingStarted && tenderItems.length > 0 && currentPositionIndex < tenderItems.length && !positionModalOpen && !isEditMode) {
      // Если процесс заполнения был начат, но модальное окно закрыто, показываем следующую позицию
      // Только для новых предложений, не для редактирования
      showNextPosition();
    }
  }, [fillingStarted, tenderItems.length, currentPositionIndex, positionModalOpen, isEditMode]);

  // Сохранение состояния процесса заполнения в localStorage
  useEffect(() => {
    if (tenderId && !isEditMode) {
      const key = `proposal_filling_${tenderId}`;
      if (fillingStarted) {
        localStorage.setItem(key, JSON.stringify({
          fillingStarted,
          currentPositionIndex,
          proposalItemsCount: formData.proposalItems.length
        }));
      } else {
        localStorage.removeItem(key);
      }
    }
  }, [fillingStarted, currentPositionIndex, formData.proposalItems.length, tenderId, isEditMode]);

  // Восстанавливаем состояние заполнения позиций из localStorage
  useEffect(() => {
    if (tenderId && !fillingStarted && !isEditMode) {
      const key = `proposal_filling_${tenderId}`;
      const savedState = localStorage.getItem(key);
      if (savedState) {
        try {
          const state = JSON.parse(savedState);
          if (state.fillingStarted && state.currentPositionIndex >= 0) {
            console.log('Восстанавливаем состояние заполнения из localStorage');
            setFillingStarted(true);
            setCurrentPositionIndex(state.currentPositionIndex);
          }
        } catch (error) {
          console.error('Ошибка при восстановлении состояния заполнения:', error);
        }
      }
    } else if (isEditMode) {
      console.log('Режим редактирования - восстановление состояния из localStorage пропущено');
    }
  }, [tenderId, fillingStarted, isEditMode]);

  // Отслеживание изменений в proposalItems
  useEffect(() => {
    console.log('formData.proposalItems изменился:', {
      count: formData.proposalItems.length,
      items: formData.proposalItems,
      isEditMode: isEditMode,
      tenderItemsCount: tenderItems.length
    });
    
    // Проверяем, что позиции правильно связаны с позициями тендера
    if (formData.proposalItems.length > 0 && tenderItems.length > 0) {
      formData.proposalItems.forEach((item, index) => {
        const tenderItem = tenderItems.find(ti => ti.id === item.tenderItemId);
        console.log(`Позиция ${index}: tenderItemId=${item.tenderItemId}, найдена в тендере: ${tenderItem ? 'да' : 'нет'}`);
      });
    }
  }, [formData.proposalItems, isEditMode, tenderItems]);

  const loadCompanies = async () => {
    try {
      const response = await api.get('/api/companies?role=SUPPLIER');
      setCompanies(response.data);
    } catch (error) {
      console.error('Error loading companies:', error);
    }
  };

  const loadDictionaries = async () => {
    try {
      console.log('Загружаем справочники...');
      const [brandsResponse, manufacturersResponse, countriesResponse, warrantiesResponse, deliveryConditionsResponse, paymentConditionsResponse] = await Promise.all([
        api.get('/api/dictionaries/brands'),
        api.get('/api/dictionaries/manufacturers'),
        api.get('/api/dictionaries/countries'),
        api.get('/api/dictionaries/warranties'),
        api.get('/api/delivery-conditions'),
        api.get('/api/payment-conditions')
      ]);
      
      console.log('Справочники загружены:', {
        brands: brandsResponse.data.length,
        manufacturers: manufacturersResponse.data.length,
        countries: countriesResponse.data.length,
        warranties: warrantiesResponse.data.length,
        deliveryConditions: deliveryConditionsResponse.data.length,
        paymentConditions: paymentConditionsResponse.data.length
      });
      console.log('Данные справочников:', {
        brands: brandsResponse.data,
        manufacturers: manufacturersResponse.data,
        countries: countriesResponse.data,
        warranties: warrantiesResponse.data,
        deliveryConditions: deliveryConditionsResponse.data,
        paymentConditions: paymentConditionsResponse.data
      });
      
      setBrands(brandsResponse.data);
      setManufacturers(manufacturersResponse.data);
      setCountries(countriesResponse.data);
      setWarranties(warrantiesResponse.data);
      setDeliveryConditions(deliveryConditionsResponse.data || []);
      setPaymentConditions(paymentConditionsResponse.data || []);
      setDictionariesLoaded(true);
    } catch (error) {
      console.error('Error loading dictionaries:', error);
    }
  };

  const loadTenderInfo = async () => {
    if (!tenderId) return;
    
    try {
      const response = await api.get(`/api/tenders/${tenderId}`);
      setTenderInfo(response.data);
      console.log('Загружена информация о тендере:', response.data);
    } catch (error) {
      console.error('Error loading tender info:', error);
    }
  };

  const loadTenderItems = async () => {
    if (!tenderId) return;
    
    try {
      const response = await api.get(`/api/tenders/${tenderId}/items`);
      setTenderItems(response.data);
      console.log('Загружены позиции тендера:', response.data.length, 'fillingStarted:', fillingStarted);
      console.log('Детали позиций тендера:', response.data.map((item: any) => ({
        description: item.description,
        quantity: item.quantity,
        unitName: item.unitName
      })));
      
      // Начинаем процесс заполнения позиций только если он еще не был начат
      // И только для новых предложений, не для редактирования
      if (response.data.length > 0 && !fillingStarted && !isEditMode) {
        console.log('Автоматически запускаем заполнение позиций для нового предложения');
        startPositionFilling();
      } else {
        console.log('Автоматический запуск не выполнен:', {
          hasItems: response.data.length > 0,
          fillingStarted: fillingStarted,
          isEditMode: isEditMode
        });
      }
    } catch (error) {
      console.error('Error loading tender items:', error);
    }
  };

  const loadProposal = async () => {
    if (!id) return;
    
    try {
      const response = await api.get(`/api/proposals/${id}/with-best-offers`);
      const proposal = response.data;
      
      let tenderItemsResponse = null;
      
      // Загружаем позиции тендера для этого предложения
      if (proposal.tenderId) {
        tenderItemsResponse = await api.get(`/api/tenders/${proposal.tenderId}/items`);
        setTenderItems(tenderItemsResponse.data);
        console.log('Загружены позиции тендера для редактирования:', tenderItemsResponse.data.length);
      }
      
      console.log('Загружено предложение для редактирования:', proposal);
      console.log('Позиции предложения:', proposal.proposalItems);
      console.log('Количество позиций:', proposal.proposalItems?.length || 0);
      console.log('Тип proposalItems:', typeof proposal.proposalItems);
      console.log('Является ли массивом:', Array.isArray(proposal.proposalItems));
      
      if (proposal.proposalItems && Array.isArray(proposal.proposalItems)) {
        proposal.proposalItems.forEach((item: any, index: number) => {
          console.log(`Позиция ${index}:`, item);
        });
      }
      
      // Преобразуем данные предложения в формат формы
      const mappedItems = proposal.proposalItems?.map((item: any) => ({
        tenderItemId: item.tenderItemId || '',
        description: item.description || '',
        brand: item.brand || null,
        model: item.model || '',
        manufacturer: item.manufacturer || null,
        countryOfOrigin: item.countryOfOrigin || null,
        quantity: item.quantity || 0,
        unitName: item.unitName || '',
        unitPrice: item.unitPrice || 0,
        specifications: item.specifications || '',
        deliveryPeriod: item.deliveryPeriod || '',
        warranty: item.warranty || null,
        additionalInfo: item.additionalInfo || '',
        unitPriceWithVat: item.unitPriceWithVat || 0,
        weight: item.weight || 0,
        deliveryCost: item.deliveryCost || 0
      })) || [];
      
      console.log('Преобразованные позиции:', mappedItems);
      
      setFormData({
        tenderId: proposal.tenderId || '',
        supplierId: proposal.supplierId || '',
        coverLetter: proposal.coverLetter || '',
        technicalProposal: proposal.technicalProposal || '',
        commercialTerms: proposal.commercialTerms || '',
        paymentTerms: proposal.paymentTerms || '',
        deliveryTerms: proposal.deliveryTerms || '',
        warrantyTerms: proposal.warrantyTerms || '',
        validUntil: proposal.validUntil || '',
        deliveryCost: proposal.deliveryCost ?? null,
        paymentCondition: proposal.paymentConditionId && paymentConditions.length > 0 ? paymentConditions.find(pc => pc.id === proposal.paymentConditionId) : undefined,
        paymentConditionId: proposal.paymentConditionId || undefined,
        deliveryCondition: proposal.deliveryConditionId && deliveryConditions.length > 0 ? deliveryConditions.find(dc => dc.id === proposal.deliveryConditionId) : undefined,
        proposalItems: mappedItems
      });
      
      console.log('Загружено предложение для редактирования:', proposal);
      console.log('Отладка условий доставки:');
      console.log('proposal.deliveryConditionId:', proposal.deliveryConditionId);
      console.log('deliveryConditions:', deliveryConditions);
      if (proposal.deliveryConditionId) {
        const foundCondition = deliveryConditions.find(dc => dc.id === proposal.deliveryConditionId);
        console.log('Найдено условие доставки:', foundCondition);
        
        // Если условие доставки не найдено, но справочники еще загружаются, обновим позже
        if (!foundCondition && deliveryConditions.length === 0) {
          console.log('Справочники еще не загружены, условие доставки будет установлено позже');
        }
      }
      
      console.log('Отладка условий оплаты:');
      console.log('proposal.paymentConditionId:', proposal.paymentConditionId);
      console.log('paymentConditions:', paymentConditions);
      if (proposal.paymentConditionId) {
        const foundCondition = paymentConditions.find(pc => pc.id === proposal.paymentConditionId);
        console.log('Найдено условие оплаты:', foundCondition);
        
        // Если условие оплаты не найдено, но справочники еще загружаются, обновим позже
        if (!foundCondition && paymentConditions.length === 0) {
          console.log('Справочники еще не загружены, условие оплаты будет установлено позже');
        }
      }
      
      // Если есть позиции тендера, но нет позиций предложения, запускаем процесс заполнения
      // Только для новых предложений, не для редактирования
      if (!isEditMode && proposal.tenderId && (!proposal.proposalItems || proposal.proposalItems.length === 0)) {
        // Проверяем, что позиции тендера были загружены
        if (tenderItemsResponse && tenderItemsResponse.data && tenderItemsResponse.data.length > 0) {
          console.log('Запускаем процесс заполнения позиций для нового предложения');
          setTimeout(() => {
            startPositionFilling();
          }, 100);
        }
      } else if (isEditMode) {
        console.log('Режим редактирования - модальное окно заполнения позиций не будет показано');
      }
    } catch (error) {
      console.error('Error loading proposal:', error);
    }
  };

  // Функция для начала заполнения позиций
  const startPositionFilling = () => {
    console.log('startPositionFilling вызван, isEditMode:', isEditMode);
    
    // Не запускаем заполнение позиций в режиме редактирования
    if (isEditMode) {
      console.log('Режим редактирования - заполнение позиций не будет запущено');
      return;
    }
    
    setCurrentPositionIndex(0);
    setFillingStarted(true);
    console.log('fillingStarted установлен в true, вызываем showNextPosition');
    showNextPosition();
  };

  // Функция для показа следующей позиции
  const showNextPosition = () => {
    console.log('showNextPosition вызван, currentPositionIndex:', currentPositionIndex, 'tenderItems.length:', tenderItems.length, 'isEditMode:', isEditMode);
    
    // Не показываем модальное окно в режиме редактирования
    if (isEditMode) {
      console.log('Режим редактирования - модальное окно не будет показано');
      return;
    }
    
    console.log('positionModalOpen будет установлен в true');
    if (currentPositionIndex < tenderItems.length) {
      const tenderItem = tenderItems[currentPositionIndex];
      console.log('Показываем позицию:', tenderItem);
      console.log('Единицы измерения в тендерной позиции:', tenderItem.unitName);
      setCurrentPositionData({
        tenderItemId: tenderItem.id,
        description: tenderItem.description,
        brand: null,
        model: '',
        manufacturer: null,
        countryOfOrigin: null,
        quantity: tenderItem.quantity,
        unitName: tenderItem.unitName || '',
        unitPrice: 0,
        specifications: tenderItem.specifications || '',
        deliveryPeriod: '',
        warranty: null,
        additionalInfo: '',
        unitPriceWithVat: 0,
        weight: 0,
        deliveryCost: 0
      });
      setPositionModalOpen(true);
      console.log('Модальное окно должно открыться, positionModalOpen установлен в true');
      console.log('currentPositionData установлен:', currentPositionData);
    } else {
      console.log('Нет больше позиций для показа');
    }
  };

  // Функция для сохранения позиции и перехода к следующей
  const handleSavePosition = () => {
    if (currentPositionData && !savingPosition) {
      setSavingPosition(true);
      
      setFormData(prev => {
        // Проверяем, есть ли уже позиция с таким tenderItemId
        const existingIndex = prev.proposalItems.findIndex(
          item => item.tenderItemId === currentPositionData.tenderItemId
        );
        
        let newProposalItems;
        if (existingIndex !== -1) {
          // Заменяем существующую позицию
          newProposalItems = [...prev.proposalItems];
          newProposalItems[existingIndex] = currentPositionData as ProposalItemForm;
        } else {
          // Добавляем новую позицию
          newProposalItems = [...prev.proposalItems, currentPositionData as ProposalItemForm];
        }
        
        return {
          ...prev,
          proposalItems: newProposalItems
        };
      });
      
      // Очищаем данные текущей позиции
      setCurrentPositionData(null);
      
      const nextIndex = currentPositionIndex + 1;
      setCurrentPositionIndex(nextIndex);
      setPositionModalOpen(false);
      
      // Показываем следующую позицию или завершаем
      setTimeout(() => {
        if (nextIndex < tenderItems.length) {
          showNextPosition();
        }
        setSavingPosition(false);
      }, 100);
    }
  };

  // Функция для пропуска позиции
  const handleSkipPosition = () => {
    if (!savingPosition) {
      setSavingPosition(true);
      
      // При пропуске позиции добавляем пустую форму, если её ещё нет
      if (currentPositionData) {
        setFormData(prev => {
          const existingIndex = prev.proposalItems.findIndex(
            item => item.tenderItemId === currentPositionData.tenderItemId
          );
          
          if (existingIndex === -1) {
            // Добавляем пустую позицию только если её ещё нет
            return {
              ...prev,
              proposalItems: [...prev.proposalItems, currentPositionData as ProposalItemForm]
            };
          }
          return prev;
        });
      }
      
      // Очищаем данные текущей позиции
      setCurrentPositionData(null);
      
      const nextIndex = currentPositionIndex + 1;
      setCurrentPositionIndex(nextIndex);
      setPositionModalOpen(false);
      
      setTimeout(() => {
        if (nextIndex < tenderItems.length) {
          showNextPosition();
        }
        setSavingPosition(false);
      }, 100);
    }
  };

  // Функция для завершения заполнения и перехода к обычному режиму
  const handleFinishFilling = () => {
    if (savingPosition) return;
    
    setPositionModalOpen(false);
    setFillingStarted(false);
    // Очищаем localStorage
    if (tenderId) {
      localStorage.removeItem(`proposal_filling_${tenderId}`);
    }
    
    // Создаем пустые формы для оставшихся позиций, избегая дубликатов
    const existingTenderItemIds = new Set(formData.proposalItems.map(item => item.tenderItemId));
    const remainingItems = tenderItems
      .slice(currentPositionIndex)
      .filter(item => !existingTenderItemIds.has(item.id))
      .map((item: TenderItem) => ({
        tenderItemId: item.id,
        description: item.description,
        brand: null,
        model: '',
        manufacturer: null,
        countryOfOrigin: null,
        quantity: item.quantity,
        unitName: item.unitName || '',
        unitPrice: 0,
        specifications: item.specifications || '',
        deliveryPeriod: '',
        warranty: null,
        additionalInfo: '',
        unitPriceWithVat: 0,
        weight: 0,
        deliveryCost: 0
      }));
    
    setFormData(prev => ({
      ...prev,
      proposalItems: [...prev.proposalItems, ...remainingItems]
    }));
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
    if (!formData.deliveryCondition) {
      setError('Выберите условие доставки из справочника');
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
      const dc = formData.deliveryCondition as DeliveryConditionDict | undefined;
      const pc = formData.paymentCondition as PaymentConditionDict | undefined;
      const proposalData = {
        ...formData,
        deliveryConditionId: dc?.id || null,
        paymentConditionId: pc?.id || null,
        deliveryType: dc?.deliveryType || null,
        deliveryAddress: null,
        deliveryCost: formData.deliveryCost ?? null,
        deliveryPeriod: dc?.deliveryPeriod || null,
        deliveryResponsibility: dc?.deliveryResponsibility || null,
        deliveryAdditionalTerms: dc?.additionalTerms || null,
        deliveryConditionName: dc?.name || null,
        deliveryConditionDescription: dc?.description || null,
        validUntil: formData.validUntil ? new Date(formData.validUntil).toISOString() : null,
        proposalItems: formData.proposalItems
          .filter(item => item.tenderItemId && item.tenderItemId !== '')
          .map(item => ({
          ...item,
          totalPrice: item.quantity * item.unitPrice
        }))
      };
      
      if (isEditMode && id) {
        // Режим редактирования - обновляем существующее предложение
        await api.put(`/api/proposals/${id}`, proposalData);
        navigate(`/proposals/${id}`);
      } else {
        // Режим создания - создаем новое предложение
        await api.post('/api/proposals', proposalData);
        // Очищаем localStorage при успешной отправке
        if (tenderId) {
          localStorage.removeItem(`proposal_filling_${tenderId}`);
        }
        navigate(`/tenders/${tenderId}`);
      }
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
    if (!formData.deliveryCondition) {
      setError('Выберите условие доставки из справочника');
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
      const dc = formData.deliveryCondition as DeliveryConditionDict | undefined;
      const pc = formData.paymentCondition as PaymentConditionDict | undefined;
      const proposalData = {
        ...formData,
        deliveryConditionId: dc?.id || null,
        paymentConditionId: pc?.id || null,
        deliveryType: dc?.deliveryType || null,
        deliveryAddress: null,
        deliveryCost: formData.deliveryCost ?? null,
        deliveryPeriod: dc?.deliveryPeriod || null,
        deliveryResponsibility: dc?.deliveryResponsibility || null,
        deliveryAdditionalTerms: dc?.additionalTerms || null,
        deliveryConditionName: dc?.name || null,
        deliveryConditionDescription: dc?.description || null,
        validUntil: formData.validUntil ? new Date(formData.validUntil).toISOString() : null,
        proposalItems: formData.proposalItems
          .filter(item => item.tenderItemId && item.tenderItemId !== '')
          .map(item => ({
          ...item,
          totalPrice: item.quantity * item.unitPrice
        }))
      };
      
      if (isEditMode && id) {
        // Режим редактирования - только обновляем существующее предложение
        await api.put(`/api/proposals/${id}`, proposalData);
        navigate(`/proposals/${id}`);
      } else {
        // Режим создания - создаем новое предложение
        const response = await api.post('/api/proposals', proposalData);
        // Затем подаем предложение
        await api.post(`/api/proposals/${response.data.id}/submit`);
        navigate(`/tenders/${tenderId}`);
      }
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

  // Обработчик изменения поставщика в автокомплете
  const handleSupplierChange = (event: any, newValue: Company | null) => {
    if (newValue && newValue.id === 'CREATE_NEW') {
      // Если выбрана опция создания нового поставщика
      const supplierName = newValue.name.replace(/^Создать: /, '');
      handleCreateSupplier(supplierName);
    } else {
      setSelectedSupplier(newValue);
      setFormData(prev => ({
        ...prev,
        supplierId: newValue?.id || ''
      }));
    }
  };

  // Обработчик создания нового поставщика
  const handleCreateSupplier = (inputValue: string) => {
    // Переходим на страницу создания контрагента с предзаполненными данными
    const returnUrl = isEditMode ? `/proposals/${id}/edit` : `/tenders/${tenderId}/proposals/new`;
    const params = new URLSearchParams({
      name: inputValue,
      shortName: inputValue,
      role: 'SUPPLIER',
      returnUrl: returnUrl
    });
    navigate(`/counterparties/new?${params.toString()}`);
  };

  const handleItemChange = (index: number, field: keyof ProposalItemForm, value: string | number | DictionaryItem | null) => {
    setFormData(prev => ({
      ...prev,
      proposalItems: prev.proposalItems.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  // Функция для перезагрузки справочников
  const reloadDictionaries = async () => {
    try {
      console.log('Перезагружаем справочники...');
      const [brandsResponse, manufacturersResponse, countriesResponse, warrantiesResponse] = await Promise.all([
        api.get('/api/dictionaries/brands'),
        api.get('/api/dictionaries/manufacturers'),
        api.get('/api/dictionaries/countries'),
        api.get('/api/dictionaries/warranties')
      ]);
      
      setBrands(brandsResponse.data);
      setManufacturers(manufacturersResponse.data);
      setCountries(countriesResponse.data);
      setWarranties(warrantiesResponse.data);
      
      console.log('Справочники перезагружены:', {
        brands: brandsResponse.data.length,
        manufacturers: manufacturersResponse.data.length,
        countries: countriesResponse.data.length,
        warranties: warrantiesResponse.data.length
      });
    } catch (error) {
      console.error('Ошибка при перезагрузке справочников:', error);
    }
  };

  // Функция для сохранения новой сущности в базу данных
  const saveNewDictionaryItem = async (type: string, name: string): Promise<DictionaryItem> => {
    setSavingDictionaryItem(true);
    try {
      console.log(`Отправляем запрос на создание ${type}:`, { name });
      const response = await api.post(`/api/dictionaries/${type}`, { name });
      console.log(`Новая ${type} сохранена в базу:`, response.data);
      
      // Перезагружаем справочники после успешного создания
      await reloadDictionaries();
      
      return response.data;
    } catch (error: any) {
      console.error(`Ошибка при сохранении ${type}:`, error);
      const errorMessage = error.response?.data?.message || error.message || `Ошибка при создании ${type}`;
      setError(`Не удалось создать ${type}: ${errorMessage}`);
      setErrorDialogOpen(true);
      // Возвращаем временную сущность если сохранение не удалось
      return { id: `temp_${Date.now()}`, name };
    } finally {
      setSavingDictionaryItem(false);
    }
  };

  // Функция для обновления данных в модальном окне
  const handleModalItemChange = (field: keyof ProposalItemForm, value: any) => {
    if (currentPositionData) {
      setCurrentPositionData({
        ...currentPositionData,
        [field]: value
      });
    }
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
          brand: null,
          model: '',
          manufacturer: null,
          countryOfOrigin: null,
          quantity: 1,
          unitName: '',
          unitPrice: 0,
          specifications: '',
          deliveryPeriod: '',
          warranty: null,
          additionalInfo: '',
          unitPriceWithVat: 0,
          weight: 0,
          deliveryCost: 0
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

  // Функция для удаления дубликатов
  const removeDuplicates = () => {
    const seenTenderItemIds = new Set<string>();
    const uniqueItems = formData.proposalItems.filter(item => {
      if (item.tenderItemId && item.tenderItemId !== '') {
        if (seenTenderItemIds.has(item.tenderItemId)) {
          return false; // Пропускаем дубликат
        } else {
          seenTenderItemIds.add(item.tenderItemId);
          return true; // Оставляем первую позицию
        }
      }
      return true; // Оставляем позиции без tenderItemId
    });
    setFormData(prev => ({
      ...prev,
      proposalItems: uniqueItems
    }));
  };

  // Проверяем дубликаты при изменении данных
  useEffect(() => {
    checkDuplicates();
  }, [formData.proposalItems]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      currencyDisplay: 'symbol'
    }).format(price);
  };

  // Функция для перевода ответственности на русский
  const getResponsibilityLabel = (responsibility: string) => {
    switch (responsibility) {
      case 'SUPPLIER': return 'Поставщик';
      case 'CUSTOMER': return 'Заказчик';
      case 'SHARED': return 'Разделенная ответственность';
      default: return responsibility;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <style>
        {`
          .resizable-table .MuiTableCell-root {
            box-sizing: border-box !important;
            width: var(--cell-width) !important;
            min-width: var(--cell-width) !important;
            max-width: var(--cell-width) !important;
            flex: none !important;
            flex-shrink: 0 !important;
            flex-grow: 0 !important;
          }
        `}
      </style>
      <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
        {isEditMode ? 'Редактирование предложения' : 'Подача предложения'}
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
              <Autocomplete
                options={companies}
                getOptionLabel={(option) => option.name}
                value={selectedSupplier}
                onChange={handleSupplierChange}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Поставщик"
                    required
                    error={!formData.supplierId && error !== null}
                    helperText={!formData.supplierId && error !== null ? 'Поставщик обязателен для заполнения' : ''}
                  />
                )}
                renderOption={(props, option) => (
                  <li {...props}>
                    <Box>
                      {option.id === 'CREATE_NEW' ? (
                        <Typography variant="body1" color="primary" sx={{ fontWeight: 'bold' }}>
                          {option.name}
                        </Typography>
                      ) : (
                        <>
                          <Typography variant="body1">{option.name}</Typography>
                          {option.shortName && option.shortName !== option.name && (
                            <Typography variant="caption" color="text.secondary">
                              {option.shortName}
                            </Typography>
                          )}
                        </>
                      )}
                    </Box>
                  </li>
                )}
                filterOptions={(options, { inputValue }) => {
                  const filterValue = inputValue.toLowerCase();
                  const filtered = options.filter(option => 
                    option.name.toLowerCase().includes(filterValue) ||
                    (option.shortName && option.shortName.toLowerCase().includes(filterValue))
                  );
                  
                  // Добавляем опцию создания нового поставщика, если есть введенный текст и нет совпадений
                  if (inputValue && !options.some(option => 
                    option.name.toLowerCase() === inputValue.toLowerCase() ||
                    (option.shortName && option.shortName.toLowerCase() === inputValue.toLowerCase())
                  )) {
                    filtered.push({ id: 'CREATE_NEW', name: `Создать: ${inputValue}`, shortName: inputValue } as any);
                  }
                  return filtered;
                }}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                noOptionsText="Поставщик не найден"
                loading={loading}
                loadingText="Загрузка поставщиков..."
                sx={{ mb: 2 }}
              />
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
                label="Условия оплаты (текст)"
                value={formData.paymentTerms}
                onChange={(e) => handleInputChange('paymentTerms', e.target.value)}
                multiline
                rows={2}
                placeholder="Дополнительная информация об условиях оплаты"
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Условия поставки (текст)"
                value={formData.deliveryTerms}
                onChange={(e) => handleInputChange('deliveryTerms', e.target.value)}
                multiline
                rows={2}
                placeholder="Дополнительная информация об условиях поставки"
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

      {/* Условия оплаты */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Условия оплаты
          </Typography>
          <Autocomplete
            options={paymentConditions}
            getOptionLabel={(option) => option ? option.name : ''}
            value={(formData.paymentCondition as PaymentConditionDict) || null}
            onChange={(_, value) => {
              if (value && (value as any).id === 'CREATE_PAYMENT_CONDITION') {
                window.open('/reference/payment-conditions?create=1', '_blank', 'noopener,noreferrer');
                return;
              }
              setFormData(prev => ({ ...prev, paymentCondition: value || undefined }));
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Условие оплаты"
                placeholder="Выберите из справочника"
                required
              />
            )}
            renderOption={(props, option) => {
              const { key, ...otherProps } = props as any;
              if ((option as any).id === 'CREATE_PAYMENT_CONDITION') {
                return (
                  <li key={key} {...otherProps}>
                    <Typography variant="body1" color="primary" sx={{ fontWeight: 'bold' }}>
                      Создать условие оплаты
                    </Typography>
                  </li>
                );
              }
              return (
                <li key={key} {...otherProps}>
                  <Typography variant="body1">{(option as any)?.name || ''}</Typography>
                </li>
              );
            }}
            filterOptions={(options, { inputValue }) => {
              const filtered = options.filter((o) =>
                (o as any).name?.toLowerCase().includes((inputValue || '').toLowerCase())
              );
              filtered.push({ id: 'CREATE_PAYMENT_CONDITION', name: 'Создать условие оплаты' } as any);
              return filtered as any;
            }}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            noOptionsText="Условия оплаты не найдены"
            sx={{ mb: 2 }}
          />
        </CardContent>
      </Card>

      {/* Условия доставки */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Условия доставки
          </Typography>
          <Autocomplete
            options={deliveryConditions}
            getOptionLabel={(option) => option ? option.name : ''}
            value={(formData.deliveryCondition as DeliveryConditionDict) || null}
            onChange={(_, value) => {
              // Переход на страницу создания условий
              if (value && (value as any).id === 'CREATE_DELIVERY_CONDITION') {
                window.open('/reference/delivery-conditions?create=1', '_blank', 'noopener,noreferrer');
                return;
              }
              setFormData(prev => ({
                ...prev,
                deliveryCondition: value || undefined,
                // При нерасчетных условиях скрываем поле и сбрасываем значение
                deliveryCost: value && (value as any).calculateDelivery ? prev.deliveryCost : null
              }));
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Условие доставки"
                placeholder="Выберите из справочника"
                required
              />
            )}
            renderOption={(props, option) => {
              const { key, ...otherProps } = props as any;
              if ((option as any).id === 'CREATE_DELIVERY_CONDITION') {
                return (
                  <li key={key} {...otherProps}>
                    <Typography variant="body1" color="primary" sx={{ fontWeight: 'bold' }}>
                      Создать условия доставки
                    </Typography>
                  </li>
                );
              }
              return (
                <li key={key} {...otherProps}>
                  <Typography variant="body1">{(option as any)?.name || ''}</Typography>
                </li>
              );
            }}
            filterOptions={(options, { inputValue }) => {
              const filtered = options.filter((o) =>
                (o as any).name?.toLowerCase().includes((inputValue || '').toLowerCase())
              );
              // Добавляем пункт создания условий доставки в конец списка
              filtered.push({ id: 'CREATE_DELIVERY_CONDITION', name: 'Создать условия доставки' } as any);
              return filtered as any;
            }}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            noOptionsText="Условия доставки не найдены"
            sx={{ mb: 2 }}
          />
          <Grid container spacing={2} sx={{ mb: 1 }}>
            {((formData.deliveryCondition as DeliveryConditionDict)?.calculateDelivery) && (
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Стоимость доставки"
                  type="number"
                  value={formData.deliveryCost ?? ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, deliveryCost: e.target.value === '' ? null : Number(e.target.value) }))}
                  inputProps={{ min: 0, step: 0.01 }}
                />
              </Grid>
            )}
          </Grid>
          {!!formData.deliveryCondition && (
            <Box sx={{ pl: 1 }}>
              {(formData.deliveryCondition as DeliveryConditionDict).deliveryPeriod && (
                <Typography variant="body2" color="text.secondary">
                  Срок: {(formData.deliveryCondition as DeliveryConditionDict).deliveryPeriod}
                </Typography>
              )}
              {(formData.deliveryCondition as DeliveryConditionDict).deliveryResponsibility && (
                <Typography variant="body2" color="text.secondary">
                  Ответственность: {getResponsibilityLabel((formData.deliveryCondition as DeliveryConditionDict).deliveryResponsibility)}
                </Typography>
              )}
              {(formData.deliveryCondition as DeliveryConditionDict).additionalTerms && (
                <Typography variant="body2" color="text.secondary">
                  Доп. условия: {(formData.deliveryCondition as DeliveryConditionDict).additionalTerms}
                </Typography>
              )}
              {(formData.deliveryCondition as DeliveryConditionDict).description && (
                <Typography variant="body2" color="text.secondary">
                  Описание: {(formData.deliveryCondition as DeliveryConditionDict).description}
                </Typography>
              )}
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Дополнительные расходы */}
      {formData.id && (
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <AdditionalExpensesManager
              supplierProposalId={formData.id}
              onExpensesChange={(expenses) => {
                console.log('Дополнительные расходы обновлены:', expenses);
              }}
            />
          </CardContent>
        </Card>
      )}

      {duplicateItems.size > 0 && (
        <Alert 
          severity="warning" 
          sx={{ mb: 2 }}
          action={
            <Button 
              color="inherit" 
              size="small" 
              onClick={removeDuplicates}
            >
              Удалить дубликаты
            </Button>
          }
        >
          Обнаружены дублирующие позиции ({duplicateItems.size} строк). Удалите дубликаты перед отправкой предложения.
        </Alert>
      )}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Позиции предложения
            </Typography>
            {tenderItems.length > 0 && !fillingStarted && formData.proposalItems.length === 0 && !isEditMode && (
              <Button
                variant="contained"
                color="primary"
                onClick={startPositionFilling}
                startIcon={<AddIcon />}
              >
                Заполнить через модальное окно
              </Button>
            )}
            {tenderItems.length > 0 && formData.proposalItems.length > 0 && !isEditMode && (
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => {
                  setFormData(prev => ({ ...prev, proposalItems: [] }));
                  setFillingStarted(false);
                  setCurrentPositionIndex(0);
                  if (tenderId) {
                    localStorage.removeItem(`proposal_filling_${tenderId}`);
                  }
                }}
                startIcon={<AddIcon />}
              >
                Начать заново
              </Button>
            )}
            {tenderItems.length > 0 && fillingStarted && formData.proposalItems.length === 0 && !isEditMode && (
              <Button
                variant="outlined"
                color="primary"
                onClick={() => {
                  setFillingStarted(false);
                  setCurrentPositionIndex(0);
                  if (tenderId) {
                    localStorage.removeItem(`proposal_filling_${tenderId}`);
                  }
                  setTimeout(() => {
                    startPositionFilling();
                  }, 100);
                }}
                startIcon={<AddIcon />}
              >
                Запустить модальное окно
              </Button>
            )}

          </Box>
          <TableContainer component={Paper} variant="outlined" sx={{ mb: 2, overflowX: 'auto', width: '100%', maxWidth: '100%', maxHeight: '600px', overflowY: 'auto' }}>
            <Table sx={{ minWidth: 2500, width: 'max-content', tableLayout: 'fixed' }} className="resizable-table">
              <TableHead>
                <TableRow>
                  {(() => {
                    const isSupplierDelivery = (formData.deliveryCondition as DeliveryConditionDict)?.deliveryResponsibility === 'SUPPLIER';
                    const headers = ['№', 'Описание', 'Бренд', 'Модель', 'Производитель', 'Страна', 'Количество', 'Ед. изм.', 'Цена за ед.', 'Цена с НДС', 'Вес'];
                    
                    if (!isSupplierDelivery) {
                      headers.push('Доставка');
                    }
                    
                    headers.push('Срок поставки', 'Гарантия', 'Сумма', 'Действия');
                    
                    return headers.map((label, idx) => (
                      <TableCell
                        key={label}
                        sx={{ 
                          position: 'relative', 
                          width: colWidths[idx], 
                          minWidth: 40, 
                          maxWidth: 800, 
                          userSelect: 'none', 
                          whiteSpace: 'nowrap',
                          flex: 'none',
                          flexShrink: 0,
                          flexGrow: 0
                        }}
                        style={{
                          width: colWidths[idx],
                          minWidth: colWidths[idx],
                          maxWidth: colWidths[idx],
                          '--cell-width': `${colWidths[idx]}px`
                        } as React.CSSProperties}
                      >
                        {label}
                        {idx !== 0 && idx !== (isSupplierDelivery ? 11 : 12) && (
                          <span
                            style={{
                              position: 'absolute',
                              right: -3,
                              top: 0,
                              height: '100%',
                              width: 12,
                              cursor: 'col-resize',
                              zIndex: 10,
                              userSelect: 'none',
                              background: 'transparent',
                            }}
                            onMouseDown={e => handleMouseDown(idx, e)}
                            title="Перетащите для изменения ширины столбца"
                          />
                        )}
                      </TableCell>
                    ));
                  })()}
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
                      <TableCell {...getCellStyles(0)}>
                        {index + 1}
                      </TableCell>
                      <TableCell {...getCellStyles(1)}>
                        <FormControl fullWidth size="small">
                          <Select
                            value={item.tenderItemId}
                            onChange={e => {
                              const tenderItem = tenderItems.find(ti => ti.id === e.target.value);
                              handleItemChange(index, 'tenderItemId', e.target.value);
                              if (tenderItem) {
                                handleItemChange(index, 'description', tenderItem.description);
                                handleItemChange(index, 'quantity', tenderItem.quantity);
                                handleItemChange(index, 'unitName', tenderItem.unitName || '');
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
                      <TableCell {...getCellStyles(2)}>
                        <Autocomplete
                          options={brands}
                          getOptionLabel={(option) => typeof option === 'string' ? option : (option?.name || '')}
                          value={item.brand}
                          onChange={async (event, newValue) => {
                            if (newValue && typeof newValue === 'object' && newValue.id === 'CREATE_NEW') {
                              // Создаем новый бренд и сохраняем в базу
                              const brandName = newValue.name.replace(/^Создать: /, '');
                              console.log('Создаем новый бренд:', brandName);
                              const newBrand = await saveNewDictionaryItem('brands', brandName);
                              handleItemChange(index, 'brand', newBrand);
                            } else {
                              handleItemChange(index, 'brand', newValue);
                            }
                          }}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              size="small"
                              fullWidth
                            />
                          )}
                          renderOption={(props, option) => {
                            const { key, ...otherProps } = props;
                            return (
                              <li key={key} {...otherProps}>
                                <Typography variant="body1">
                                  {typeof option === 'string' ? option : (option?.name || '')}
                                </Typography>
                              </li>
                            );
                          }}
                          filterOptions={(options, { inputValue }) => {
                            const filtered = options.filter(option => 
                              option.name.toLowerCase().includes(inputValue.toLowerCase())
                            );
                            if (inputValue && !options.some(option => 
                              option.name.toLowerCase() === inputValue.toLowerCase()
                            )) {
                              filtered.push({ id: 'CREATE_NEW', name: `Создать: ${inputValue}` } as any);
                            }
                            return filtered;
                          }}
                          freeSolo
                          autoComplete
                          includeInputInList
                          filterSelectedOptions
                          noOptionsText="Бренд не найден"
                          size="small"
                        />
                      </TableCell>
                      <TableCell {...getCellStyles(3)}>
                        <TextField
                          size="small"
                          value={item.model}
                          onChange={e => handleItemChange(index, 'model', e.target.value)}
                          fullWidth
                        />
                      </TableCell>
                      <TableCell {...getCellStyles(4)}>
                        <Autocomplete
                          options={manufacturers}
                          getOptionLabel={(option) => typeof option === 'string' ? option : (option?.name || '')}
                          value={item.manufacturer}
                          onChange={async (event, newValue) => {
                            if (newValue && typeof newValue === 'object' && newValue.id === 'CREATE_NEW') {
                              // Создаем нового производителя и сохраняем в базу
                              const manufacturerName = newValue.name.replace(/^Создать: /, '');
                              console.log('Создаем нового производителя:', manufacturerName);
                              const newManufacturer = await saveNewDictionaryItem('manufacturers', manufacturerName);
                              handleItemChange(index, 'manufacturer', newManufacturer);
                            } else {
                              handleItemChange(index, 'manufacturer', newValue);
                            }
                          }}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              size="small"
                              fullWidth
                            />
                          )}
                          renderOption={(props, option) => {
                            const { key, ...otherProps } = props;
                            return (
                              <li key={key} {...otherProps}>
                                <Typography variant="body1">
                                  {typeof option === 'string' ? option : (option?.name || '')}
                                </Typography>
                              </li>
                            );
                          }}
                          filterOptions={(options, { inputValue }) => {
                            const filtered = options.filter(option => 
                              option.name.toLowerCase().includes(inputValue.toLowerCase())
                            );
                            if (inputValue && !options.some(option => 
                              option.name.toLowerCase() === inputValue.toLowerCase()
                            )) {
                              filtered.push({ id: 'CREATE_NEW', name: `Создать: ${inputValue}` } as any);
                            }
                            return filtered;
                          }}
                          freeSolo
                          autoComplete
                          includeInputInList
                          filterSelectedOptions
                          noOptionsText="Производитель не найден"
                          size="small"
                        />
                      </TableCell>
                      <TableCell {...getCellStyles(5)}>
                        <Autocomplete
                          options={countries}
                          getOptionLabel={(option) => typeof option === 'string' ? option : (option?.name || '')}
                          value={item.countryOfOrigin}
                          onChange={async (event, newValue) => {
                            if (newValue && typeof newValue === 'object' && newValue.id === 'CREATE_NEW') {
                              // Создаем новую страну и сохраняем в базу
                              const countryName = newValue.name.replace(/^Создать: /, '');
                              console.log('Создаем новую страну:', countryName);
                              const newCountry = await saveNewDictionaryItem('countries', countryName);
                              handleItemChange(index, 'countryOfOrigin', newCountry);
                            } else {
                              handleItemChange(index, 'countryOfOrigin', newValue);
                            }
                          }}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              size="small"
                              fullWidth
                            />
                          )}
                          renderOption={(props, option) => {
                            const { key, ...otherProps } = props;
                            return (
                              <li key={key} {...otherProps}>
                                <Typography variant="body1">
                                  {typeof option === 'string' ? option : (option?.name || '')}
                                </Typography>
                              </li>
                            );
                          }}
                          filterOptions={(options, { inputValue }) => {
                            const filtered = options.filter(option => 
                              option.name.toLowerCase().includes(inputValue.toLowerCase())
                            );
                            if (inputValue && !options.some(option => 
                              option.name.toLowerCase() === inputValue.toLowerCase()
                            )) {
                              filtered.push({ id: 'CREATE_NEW', name: `Создать: ${inputValue}` } as any);
                            }
                            return filtered;
                          }}
                          freeSolo
                          autoComplete
                          includeInputInList
                          filterSelectedOptions
                          noOptionsText="Страна не найдена"
                          size="small"
                        />
                      </TableCell>
                      <TableCell {...getCellStyles(6)}>
                        <TextField
                          size="small"
                          type="number"
                          value={selectedTenderItem ? selectedTenderItem.quantity : item.quantity}
                          disabled
                          inputProps={{ min: 0.01, step: 0.01 }}
                          fullWidth
                        />
                      </TableCell>
                      <TableCell {...getCellStyles(7)}>
                        <TextField
                          size="small"
                          value={selectedTenderItem ? selectedTenderItem.unitName : item.unitName}
                          disabled
                          fullWidth
                        />
                      </TableCell>
                      <TableCell {...getCellStyles(8)}>
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
                      <TableCell {...getCellStyles(9)}>
                        <TextField
                          size="small"
                          type="number"
                          value={item.unitPriceWithVat || ''}
                          onChange={e => {
                            const value = Number(e.target.value);
                            handleItemChange(index, 'unitPriceWithVat', value);
                          }}
                          inputProps={{ min: 0.01, step: 0.01 }}
                          fullWidth
                        />
                      </TableCell>
                      <TableCell {...getCellStyles(10)}>
                        <TextField
                          size="small"
                          type="number"
                          value={item.weight || ''}
                          onChange={e => {
                            const value = Number(e.target.value);
                            handleItemChange(index, 'weight', value);
                          }}
                          inputProps={{ min: 0, step: 0.001 }}
                          fullWidth
                        />
                      </TableCell>
                      {!((formData.deliveryCondition as DeliveryConditionDict)?.deliveryResponsibility === 'SUPPLIER') && (
                        <TableCell {...getCellStyles(11)}>
                          <TextField
                            size="small"
                            type="number"
                            value={item.deliveryCost || ''}
                            onChange={e => {
                              const value = Number(e.target.value);
                              handleItemChange(index, 'deliveryCost', value);
                            }}
                            inputProps={{ min: 0, step: 0.01 }}
                            fullWidth
                            disabled={!((formData.deliveryCondition as DeliveryConditionDict)?.calculateDelivery)}
                          />
                        </TableCell>
                      )}
                      <TableCell {...getCellStyles((formData.deliveryCondition as DeliveryConditionDict)?.deliveryResponsibility === 'SUPPLIER' ? 11 : 12)}>
                        <TextField
                          size="small"
                          value={item.deliveryPeriod || ''}
                          onChange={e => handleItemChange(index, 'deliveryPeriod', e.target.value)}
                          fullWidth
                        />
                      </TableCell>
                      <TableCell {...getCellStyles((formData.deliveryCondition as DeliveryConditionDict)?.deliveryResponsibility === 'SUPPLIER' ? 12 : 13)}>
                        <Autocomplete
                          options={warranties}
                          getOptionLabel={(option) => typeof option === 'string' ? option : (option?.name || '')}
                          value={item.warranty}
                          onChange={async (event, newValue) => {
                            if (newValue && typeof newValue === 'object' && newValue.id === 'CREATE_NEW') {
                              // Создаем новую гарантию и сохраняем в базу
                              const warrantyName = newValue.name.replace(/^Создать: /, '');
                              console.log('Создаем новую гарантию:', warrantyName);
                              const newWarranty = await saveNewDictionaryItem('warranties', warrantyName);
                              handleItemChange(index, 'warranty', newWarranty);
                            } else {
                              handleItemChange(index, 'warranty', newValue);
                            }
                          }}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              size="small"
                              fullWidth
                            />
                          )}
                          renderOption={(props, option) => {
                            const { key, ...otherProps } = props;
                            return (
                              <li key={key} {...otherProps}>
                                <Typography variant="body1">
                                  {typeof option === 'string' ? option : (option?.name || '')}
                                </Typography>
                              </li>
                            );
                          }}
                          filterOptions={(options, { inputValue }) => {
                            const filtered = options.filter(option => 
                              option.name.toLowerCase().includes(inputValue.toLowerCase())
                            );
                            if (inputValue && !options.some(option => 
                              option.name.toLowerCase() === inputValue.toLowerCase()
                            )) {
                              filtered.push({ id: 'CREATE_NEW', name: `Создать: ${inputValue}` } as any);
                            }
                            return filtered;
                          }}
                          freeSolo
                          autoComplete
                          includeInputInList
                          filterSelectedOptions
                          noOptionsText="Гарантия не найдена"
                          size="small"
                        />
                      </TableCell>
                      <TableCell {...getCellStyles((formData.deliveryCondition as DeliveryConditionDict)?.deliveryResponsibility === 'SUPPLIER' ? 13 : 14)}>
                        {formatPrice(item.quantity * item.unitPrice)}
                      </TableCell>
                      <TableCell {...getCellStyles((formData.deliveryCondition as DeliveryConditionDict)?.deliveryResponsibility === 'SUPPLIER' ? 14 : 15)}>
                        <IconButton color="error" onClick={() => handleRemoveItem(index)} size="small">
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
                <TableRow>
                  <TableCell colSpan={((formData.deliveryCondition as DeliveryConditionDict)?.deliveryResponsibility === 'SUPPLIER' ? 14 : 15)} align="right">
                    <Typography variant="h6">
                      Итого:
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="h6">
                      {formatPrice(calculateTotalPrice())}
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
          onClick={() => navigate(isEditMode ? `/proposals/${id}` : `/tenders/${tenderId}`)}
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
          {isEditMode ? 'Обновить' : 'Сохранить'}
        </Button>
        <Button
          variant="contained"
          color="primary"
          startIcon={<SendIcon />}
          onClick={handleSubmitProposal}
          disabled={loading}
        >
          {loading ? <CircularProgress size={20} /> : (isEditMode ? 'Сохранить изменения' : 'Подать предложение')}
        </Button>
      </Box>

      {/* Модальное окно для заполнения позиции */}
      <Dialog 
        open={positionModalOpen} 
        onClose={() => !savingPosition && setPositionModalOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {savingPosition && <CircularProgress size={20} sx={{ mr: 1 }} />}
          {savingDictionaryItem && <CircularProgress size={20} sx={{ mr: 1 }} />}
          Позиция {currentPositionIndex + 1} из {tenderItems.length}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              {currentPositionData?.description}
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Autocomplete
                  options={brands}
                  getOptionLabel={(option) => typeof option === 'string' ? option : (option?.name || '')}
                  value={currentPositionData?.brand || null}
                  onChange={async (event, newValue) => {
                    if (newValue && typeof newValue === 'object' && newValue.id === 'CREATE_NEW') {
                      // Создаем новую сущность и сохраняем в базу
                      const brandName = newValue.name.replace(/^Создать: /, '');
                      console.log('Создаем новый бренд:', brandName);
                      const newBrand = await saveNewDictionaryItem('brands', brandName);
                      handleModalItemChange('brand', newBrand);
                    } else {
                      handleModalItemChange('brand', newValue);
                    }
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Бренд"
                      size="small"
                      fullWidth
                    />
                  )}
                  renderOption={(props, option) => {
                    const { key, ...otherProps } = props;
                    return (
                      <li key={key} {...otherProps}>
                        <Typography variant="body1">
                          {typeof option === 'string' ? option : (option?.name || '')}
                        </Typography>
                      </li>
                    );
                  }}
                  filterOptions={(options, { inputValue }) => {
                    const filtered = options.filter(option => 
                      option.name.toLowerCase().includes(inputValue.toLowerCase())
                    );
                    if (inputValue && !options.some(option => 
                      option.name.toLowerCase() === inputValue.toLowerCase()
                    )) {
                      filtered.push({ id: 'CREATE_NEW', name: `Создать: ${inputValue}` } as any);
                    }
                    return filtered;
                  }}
                  freeSolo
                  autoComplete
                  includeInputInList
                  filterSelectedOptions
                  noOptionsText="Бренд не найден"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Модель"
                  value={currentPositionData?.model || ''}
                  onChange={e => handleModalItemChange('model', e.target.value)}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Autocomplete
                  options={manufacturers}
                  getOptionLabel={(option) => typeof option === 'string' ? option : (option?.name || '')}
                  value={currentPositionData?.manufacturer}
                  onChange={async (event, newValue) => {
                    if (newValue && typeof newValue === 'object' && newValue.id === 'CREATE_NEW') {
                      // Создаем новую сущность и сохраняем в базу
                      const manufacturerName = newValue.name.replace(/^Создать: /, '');
                      console.log('Создаем нового производителя:', manufacturerName);
                      const newManufacturer = await saveNewDictionaryItem('manufacturers', manufacturerName);
                      handleModalItemChange('manufacturer', newManufacturer);
                    } else {
                      handleModalItemChange('manufacturer', newValue);
                    }
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Производитель"
                      size="small"
                      fullWidth
                    />
                  )}
                  renderOption={(props, option) => {
                    const { key, ...otherProps } = props;
                    return (
                      <li key={key} {...otherProps}>
                        <Typography variant="body1">
                          {typeof option === 'string' ? option : (option?.name || '')}
                        </Typography>
                      </li>
                    );
                  }}
                  filterOptions={(options, { inputValue }) => {
                    const filtered = options.filter(option => 
                      option.name.toLowerCase().includes(inputValue.toLowerCase())
                    );
                    if (inputValue && !options.some(option => 
                      option.name.toLowerCase() === inputValue.toLowerCase()
                    )) {
                      filtered.push({ id: 'CREATE_NEW', name: `Создать: ${inputValue}` } as any);
                    }
                    return filtered;
                  }}
                  freeSolo
                  autoComplete
                  includeInputInList
                  filterSelectedOptions
                  noOptionsText="Производитель не найден"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Autocomplete
                  options={countries}
                  getOptionLabel={(option) => typeof option === 'string' ? option : (option?.name || '')}
                  value={currentPositionData?.countryOfOrigin}
                  onChange={async (event, newValue) => {
                    if (newValue && typeof newValue === 'object' && newValue.id === 'CREATE_NEW') {
                      // Создаем новую сущность и сохраняем в базу
                      const countryName = newValue.name.replace(/^Создать: /, '');
                      console.log('Создаем новую страну:', countryName);
                      const newCountry = await saveNewDictionaryItem('countries', countryName);
                      handleModalItemChange('countryOfOrigin', newCountry);
                    } else {
                      handleModalItemChange('countryOfOrigin', newValue);
                    }
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Страна происхождения"
                      size="small"
                      fullWidth
                    />
                  )}
                  renderOption={(props, option) => {
                    const { key, ...otherProps } = props;
                    return (
                      <li key={key} {...otherProps}>
                        <Typography variant="body1">
                          {typeof option === 'string' ? option : (option?.name || '')}
                        </Typography>
                      </li>
                    );
                  }}
                  filterOptions={(options, { inputValue }) => {
                    const filtered = options.filter(option => 
                      option.name.toLowerCase().includes(inputValue.toLowerCase())
                    );
                    if (inputValue && !options.some(option => 
                      option.name.toLowerCase() === inputValue.toLowerCase()
                    )) {
                      filtered.push({ id: 'CREATE_NEW', name: `Создать: ${inputValue}` } as any);
                    }
                    return filtered;
                  }}
                  freeSolo
                  autoComplete
                  includeInputInList
                  filterSelectedOptions
                  noOptionsText="Страна не найдена"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Количество"
                  type="number"
                  value={currentPositionData?.quantity || ''}
                  disabled
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Ед. изм."
                  value={currentPositionData?.unitName || ''}
                  disabled
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Цена за единицу"
                  type="number"
                  value={currentPositionData?.unitPrice || ''}
                  onChange={e => handleModalItemChange('unitPrice', Number(e.target.value))}
                  inputProps={{ min: 0.01, step: 0.01 }}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Цена с НДС"
                  type="number"
                  value={currentPositionData?.unitPriceWithVat || ''}
                  onChange={e => handleModalItemChange('unitPriceWithVat', Number(e.target.value))}
                  inputProps={{ min: 0.01, step: 0.01 }}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Вес (кг)"
                  type="number"
                  value={currentPositionData?.weight || ''}
                  onChange={e => handleModalItemChange('weight', Number(e.target.value))}
                  inputProps={{ min: 0, step: 0.001 }}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                {((formData.deliveryCondition as DeliveryConditionDict)?.deliveryResponsibility === 'SUPPLIER') ? (
                  <TextField
                    fullWidth
                    label="Стоимость доставки"
                    value="За счет поставщика"
                    disabled
                    size="small"
                  />
                ) : (
                  <TextField
                    fullWidth
                    label="Стоимость доставки"
                    type="number"
                    value={currentPositionData?.deliveryCost || ''}
                    onChange={e => handleModalItemChange('deliveryCost', Number(e.target.value))}
                    inputProps={{ min: 0, step: 0.01 }}
                    size="small"
                  />
                )}
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Срок поставки"
                  value={currentPositionData?.deliveryPeriod || ''}
                  onChange={e => handleModalItemChange('deliveryPeriod', e.target.value)}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Autocomplete
                  options={warranties}
                  getOptionLabel={(option) => typeof option === 'string' ? option : (option?.name || '')}
                  value={currentPositionData?.warranty}
                  onChange={async (event, newValue) => {
                    if (newValue && typeof newValue === 'object' && newValue.id === 'CREATE_NEW') {
                      // Создаем новую сущность и сохраняем в базу
                      const warrantyName = newValue.name.replace(/^Создать: /, '');
                      console.log('Создаем новую гарантию:', warrantyName);
                      const newWarranty = await saveNewDictionaryItem('warranties', warrantyName);
                      handleModalItemChange('warranty', newWarranty);
                    } else {
                      handleModalItemChange('warranty', newValue);
                    }
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Гарантия"
                      size="small"
                      fullWidth
                    />
                  )}
                  renderOption={(props, option) => {
                    const { key, ...otherProps } = props;
                    return (
                      <li key={key} {...otherProps}>
                        <Typography variant="body1">
                          {typeof option === 'string' ? option : (option?.name || '')}
                        </Typography>
                      </li>
                    );
                  }}
                  filterOptions={(options, { inputValue }) => {
                    const filtered = options.filter(option => 
                      option.name.toLowerCase().includes(inputValue.toLowerCase())
                    );
                    if (inputValue && !options.some(option => 
                      option.name.toLowerCase() === inputValue.toLowerCase()
                    )) {
                      filtered.push({ id: 'CREATE_NEW', name: `Создать: ${inputValue}` } as any);
                    }
                    return filtered;
                  }}
                  freeSolo
                  autoComplete
                  includeInputInList
                  filterSelectedOptions
                  noOptionsText="Гарантия не найдена"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Характеристики"
                  value={currentPositionData?.specifications || ''}
                  onChange={e => handleModalItemChange('specifications', e.target.value)}
                  multiline
                  rows={2}
                  size="small"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Дополнительная информация"
                  value={currentPositionData?.additionalInfo || ''}
                  onChange={e => handleModalItemChange('additionalInfo', e.target.value)}
                  multiline
                  rows={2}
                  size="small"
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleFinishFilling} color="secondary" disabled={savingPosition || savingDictionaryItem}>
            Завершить заполнение
          </Button>
          <Button onClick={handleSkipPosition} color="secondary" disabled={savingPosition || savingDictionaryItem}>
            Пропустить
          </Button>
          <Button onClick={handleSavePosition} variant="contained" disabled={savingPosition || savingDictionaryItem}>
            {savingPosition ? 'Сохранение...' : (currentPositionIndex + 1 < tenderItems.length ? 'Сохранить и продолжить' : 'Завершить')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProposalEditPage; 