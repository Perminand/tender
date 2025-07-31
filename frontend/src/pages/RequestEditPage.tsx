import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Paper, Typography, Box, Button, CircularProgress, TextField, MenuItem, Toolbar, Dialog, DialogTitle, DialogActions,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Grid, DialogContent, DialogContentText, Container, InputAdornment, IconButton, InputLabel, Select, FormControl
} from '@mui/material';
import { api, getImportColumnMapping, saveImportColumnMapping, ImportColumnMapping } from '../utils/api';
import { Autocomplete } from '@mui/material';
import * as XLSX from 'xlsx';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import AddIcon from '@mui/icons-material/Add';

interface Company { id: string; name: string; shortName?: string; legalName?: string; }
interface Project { id: string; name: string; }
interface Material { id: string; name: string; characteristics?: string; }
interface MaterialOption extends Material {
  inputValue?: string;
}
interface Unit { id: string; shortName: string; }
interface WorkType { id: string; name: string; }
interface Warehouse { id: string; name: string; projectId: string; }
interface RequestMaterial {
  id?: string;
  material?: Material | null;
  characteristics?: string;
  size?: string; // Характеристики (смета)
  quantity?: string;
  unit?: Unit | null;
  note?: string;
  deliveryDate?: string;
  workType?: string;
  supplierMaterialName?: string; // Наименование в заявке
  estimateMaterialName?: string; // Наименование материала (смета)
  estimatePrice?: string;
  materialLink?: string;
  estimateUnit?: Unit | null;
  estimateQuantity?: string;
  isImported?: boolean; // Флаг для отслеживания импортированных материалов
}
interface RequestDto {
  id?: string;
  organization?: Company | null;
  project?: Project | null;
  date?: string;
  status?: string;
  materials: RequestMaterial[];
  warehouse?: Warehouse | null;
  requestNumber?: string;
  applicant?: string;
}

interface Characteristic { id: string; name: string; description?: string; }

const statusOptions = [
  { value: 'DRAFT', label: 'Черновик' },
  { value: 'SAVED', label: 'Сохранен' },
  { value: 'TENDER', label: 'Тендер' },
  { value: 'COMPLETED', label: 'Исполнена' },
  { value: 'CANCELLED', label: 'Отменена' },
];

const getToday = () => {
  const d = new Date();
  return d.toISOString().slice(0, 10);
};

// --- Функция для нормализации названия организации ---
function normalizeOrgName(str: string): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/общество\s*с\s*ограниченной\s*ответственностью/g, 'ооо')
    .replace(/строительное\s*предприятие/g, 'сп')
    .replace(/[\s"'«»\-]/g, '') // убираем пробелы, кавычки, тире
    .trim();
}

export default function RequestEditPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [request, setRequest] = useState<RequestDto>({ materials: [], date: getToday(), status: 'DRAFT' });
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmCreateTender, setConfirmCreateTender] = useState(false);

  const [companies, setCompanies] = useState<Company[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);

  const [workTypes, setWorkTypes] = useState<WorkType[]>([]);
  const [openWorkTypeDialog, setOpenWorkTypeDialog] = useState(false);
  const [newWorkType, setNewWorkType] = useState('');
  const [workTypeMaterialIdx, setWorkTypeMaterialIdx] = useState<number | null>(null);

  const [openProjectDialog, setOpenProjectDialog] = useState(false);
  const [newProject, setNewProject] = useState('');

  const [openCompanyDialog, setOpenCompanyDialog] = useState(false);
  const [newCompany, setNewCompany] = useState('');

  const [newMaterial, setNewMaterial] = useState('');
  const [openMaterialDialog, setOpenMaterialDialog] = useState(false);
  const [materialDialogIdx, setMaterialDialogIdx] = useState<number | null>(null);



  const defaultWidths = [40, 120, 120, 400, 400, 100, 100, 100, 180, 180, 100, 100];
  const [colWidths, setColWidths] = useState<number[]>(defaultWidths);

  // Функция для расчета оптимальной ширины столбцов на основе содержимого
  const calculateOptimalColumnWidths = useCallback(() => {
    if (!request.materials || request.materials.length === 0) {
      return defaultWidths;
    }

    const columnHeaders = [
      '#', 'Вид работ', 'Наименование в заявке', 'Кол-во', 'Ед. изм.',
      'Наименование материала (смета)', 'Характеристики (смета)', 'Кол-во (смета)', 
      'Ед. изм.(смета)', 'Цена (смета)', 'Стоимость (смета)', 'Ссылка', 'Примечание', 'Поставить к дате', 'Действия'
    ];

    const calculateTextWidth = (text: string, isHeader: boolean = false, isCompact: boolean = false) => {
      // Для компактных столбцов (числовые, короткие тексты и цены) используем меньшую ширину
      if (isCompact) {
        const charWidth = 5; // Еще меньшая ширина для цифр, коротких текстов и цен
        const padding = isHeader ? 12 : 8; // Меньший отступ для компактных столбцов
        return Math.max(text.length * charWidth + padding, 40); // Минимальная ширина 40px для компактных
      }
      
      // Для текстовых столбцов обычная ширина
      const charWidth = 8;
      const padding = isHeader ? 20 : 16;
      return Math.max(text.length * charWidth + padding, 60);
    };

    const widths = columnHeaders.map((header, colIndex) => {
      // Определяем, является ли столбец числовым или коротким текстом
      const isNumericColumn = colIndex === 0 || colIndex === 3 || colIndex === 7 || colIndex === 9 || colIndex === 10;
      const isShortTextColumn = colIndex === 4 || colIndex === 8; // Ед. изм. и Ед. изм.(смета)
      const isPriceColumn = colIndex === 9 || colIndex === 10; // Цена (смета) и Стоимость (смета)
      const isCompactColumn = isNumericColumn || isPriceColumn; // Убрали isShortTextColumn из компактных
      let maxWidth = calculateTextWidth(header, true, isCompactColumn);

      // Проходим по всем строкам данных
      request.materials.forEach((mat, rowIndex) => {
        let cellText = '';
        
        switch (colIndex) {
          case 0: // #
            cellText = (rowIndex + 1).toString();
            break;
          case 1: // Вид работ
            const workType = workTypes.find(w => w.id === mat.workType);
            cellText = workType ? workType.name : (mat.workType || '');
            break;
          case 2: // Наименование в заявке
            cellText = mat.supplierMaterialName || '';
            break;
          case 3: // Кол-во
            cellText = mat.quantity || '';
            break;
          case 4: // Ед. изм.
            const unit = units.find(u => u.id === mat.unit?.id);
            cellText = unit ? unit.shortName : (mat.unit?.shortName || '');
            break;
          case 5: // Наименование материала (смета)
            const material = materials.find(m => m.id === mat.material?.id);
            cellText = material ? material.name : (mat.material?.name || '');
            break;
          case 6: // Характеристики (смета)
            cellText = mat.characteristics || '';
            break;
          case 7: // Кол-во (смета)
            cellText = mat.estimateQuantity || '';
            break;
          case 8: // Ед. изм.(смета)
            const estimateUnit = units.find(u => u.id === mat.estimateUnit?.id);
            cellText = estimateUnit ? estimateUnit.shortName : (mat.estimateUnit?.shortName || '');
            break;
          case 9: // Цена (смета)
            cellText = mat.estimatePrice || '';
            break;
          case 10: // Стоимость (смета)
            const estimateTotal = (parseFloat(mat.estimatePrice || '0') * parseFloat(mat.estimateQuantity || mat.quantity || '0')).toFixed(2);
            cellText = estimateTotal;
            break;
          case 11: // Ссылка
            cellText = mat.materialLink || '';
            break;
          case 12: // Примечание
            cellText = mat.note || '';
            break;
          case 13: // Поставить к дате
            cellText = mat.deliveryDate ? new Date(mat.deliveryDate).toLocaleDateString('ru-RU') : '';
            break;
          case 14: // Действия
            cellText = 'Удалить';
            break;
        }

        let cellWidth;
        // Специальная логика для столбцов "Ед. изм." и "Ед. изм.(смета)"
        if (colIndex === 4 || colIndex === 8) {
          // Для единиц измерения: ширина по самой длинной записи + 5 пикселей
          const charWidth = 8; // Обычная ширина символа
          const padding = 16; // Отступ
          cellWidth = Math.max(cellText.length * charWidth + padding + 5, 60); // Минимум 60px
        } else {
          cellWidth = calculateTextWidth(cellText, false, isCompactColumn);
        }
        maxWidth = Math.max(maxWidth, cellWidth);
      });

      // Ограничиваем максимальную ширину
      return Math.min(maxWidth, 500);
    });

    return widths;
  }, [request.materials, workTypes, units, materials]);

  // Автоматически пересчитываем ширину столбцов при изменении данных
  useEffect(() => {
    const optimalWidths = calculateOptimalColumnWidths();
    setColWidths(optimalWidths);
  }, [calculateOptimalColumnWidths]);
  const resizingCol = useRef<number | null>(null);
  const startX = useRef<number>(0);
  const startWidth = useRef<number>(0);

  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCounterparties, setFilteredCounterparties] = useState<any[]>([]);

  const [projectNameFromImport, setProjectNameFromImport] = useState<string | null>(null);

  const [pendingImportData, setPendingImportData] = useState<any | null>(null);
  const [openImportDialog, setOpenImportDialog] = useState(false);

  const [newUnitName, setNewUnitName] = useState('');
  const [openUnitDialog, setOpenUnitDialog] = useState(false);

  const [openRemoveMaterialDialog, setOpenRemoveMaterialDialog] = useState(false);
  const [removeMaterialIdx, setRemoveMaterialIdx] = useState<number | null>(null);

  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [openWarehouseDialog, setOpenWarehouseDialog] = useState(false);
  const [newWarehouse, setNewWarehouse] = useState('');

  const [openCharacteristicDialog, setOpenCharacteristicDialog] = useState(false);
  const [newCharacteristic, setNewCharacteristic] = useState('');
  const [characteristicMaterialIdx, setCharacteristicMaterialIdx] = useState<number | null>(null);

  const [characteristics, setCharacteristics] = useState<Characteristic[]>([]);

  const [importStep, setImportStep] = useState<'idle'|'parsing'|'mapping'|'done'>('idle');
  const [importMissing, setImportMissing] = useState<any>(null);
  const [importLoading, setImportLoading] = useState(false);

  const [importWillCreate, setImportWillCreate] = useState<{project?: string, warehouse?: string, workTypes: string[], characteristics: string[], units: string[], estimateUnits: string[], materials: string[]}>({workTypes:[], characteristics:[], units:[], estimateUnits:[], materials:[]});


  const [missingCompanyName, setMissingCompanyName] = useState<string | null>(null);

  // 1. Новое состояние для пользовательских соответствий
  const [customHeaderMapping, setCustomHeaderMapping] = useState<{ [key: string]: number | string }>({});
  const [showHeaderMappingDialog, setShowHeaderMappingDialog] = useState(false);
  const [importHeaders, setImportHeaders] = useState<string[]>([]);
  const [hasSavedMapping, setHasSavedMapping] = useState(false);

  const handleMouseDown = (idx: number, e: React.MouseEvent) => {
    resizingCol.current = idx;
    startX.current = e.clientX;
    startWidth.current = colWidths[idx];
    document.body.style.cursor = 'col-resize';
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (resizingCol.current !== null) {
        const delta = e.clientX - startX.current;
        setColWidths(widths => {
          const newWidths = [...widths];
          newWidths[resizingCol.current!] = Math.max(40, startWidth.current + delta);
          return newWidths;
        });
      }
    };
    const handleMouseUp = () => {
      resizingCol.current = null;
      document.body.style.cursor = '';
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const fetchMaterials = () => {
    api.get('/api/materials').then(res => setMaterials(res.data));
  };

  useEffect(() => {
    api.get('/api/companies?role=CUSTOMER').then(res => setCompanies(res.data));
    api.get('/api/projects').then(res => setProjects(res.data));
    fetchMaterials();
    api.get('/api/units').then(res => setUnits(res.data));
    api.get('/api/work-types').then(res => setWorkTypes(res.data));
    api.get('/api/warehouses').then(res => setWarehouses(res.data));
    api.get('/api/characteristics').then(res => setCharacteristics(res.data));
  }, []);

  useEffect(() => {
    if (isEdit) {
      setLoading(true);
      api.get(`/api/requests/${id}`)
        .then(res => {
          // Преобразуем requestMaterials в materials для совместимости с фронтендом
          const requestData = res.data;
          if (import.meta.env.DEV) {
            console.log('Получены данные с сервера:', JSON.stringify(requestData, null, 2));
                                console.log('Проверяем поле size в материалах:', requestData.requestMaterials?.map((m: any) => ({ id: m.id, size: m.size })));
            console.log('Проверяем поле estimateMaterialName в материалах:', requestData.requestMaterials?.map((m: any) => ({ id: m.id, estimateMaterialName: m.estimateMaterialName })));
          }
          const transformedMaterials = (requestData.requestMaterials || []).map((mat: any) => ({
              ...mat,
              workType: typeof mat.workType === 'object' && mat.workType !== null ? mat.workType.id : (mat.workType || ''),
              size: mat.size || '',
              materialLink: mat.materialLink || '',
              estimateUnit: mat.estimateUnit || null,
              estimateQuantity: mat.estimateQuantity ? mat.estimateQuantity.toString() : ''
          }));
          
          if (import.meta.env.DEV) {
            console.log('Преобразованные материалы:', transformedMaterials.map((m: any) => ({ 
              id: m.id, 
              estimateMaterialName: m.estimateMaterialName,
              supplierMaterialName: m.supplierMaterialName 
            })));
          }
          
          setRequest({
            ...requestData,
            materials: transformedMaterials
          });
        })
        .finally(() => setLoading(false));
    }
  }, [id, isEdit]);

  useEffect(() => {
    // Убираем логику загрузки названий поставщиков, так как поле "Наименование материала (смета)" теперь просто текстовое
  }, [(request.materials || []).map(m => m.material?.id).join(), request.organization?.id]);

  // Перезагружаем названия поставщиков при изменении организации
  useEffect(() => {
    if (request.organization?.id) {
      // НЕ очищаем названия поставщиков при смене организации, чтобы не терять данные
      // Пользователь может вручную изменить организацию, но данные должны сохраниться
    }
  }, [request.organization?.id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setRequest({ ...request, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (name: string, value: string) => {
    if (name === 'organization') {
      const company = companies.find(c => c.id === value) || null;
      setRequest({ ...request, organization: company });
    } else if (name === 'project') {
      const project = projects.find(p => p.id === value) || null;
      setRequest({ ...request, project: project, warehouse: null });
    } else if (name === 'warehouse') {
      const warehouse = warehouses.find(w => w.id === value) || null;
      setRequest({ ...request, warehouse });
    }
  };

  const handleMaterialChange = (idx: number, field: string, value: any) => {
    if (import.meta.env.DEV) {
      console.log(`handleMaterialChange вызвана: idx=${idx}, field=${field}, value=`, value);
    }
    const newMaterials = [...(request.materials || [])];
    if (field === 'workType') {
      // Сохраняем только id workType
      newMaterials[idx].workType = value;
    } else if (field === 'material') {
      const selectedMaterial = materials.find(m => m.id === value) || null;
      newMaterials[idx].material = selectedMaterial;
      
      // Убираем логику загрузки названий поставщиков, так как поле "Наименование материала (смета)" теперь просто текстовое
    } else if (field === 'unit') {
      newMaterials[idx].unit = units.find(u => u.id === value) || null;
    } else if (field === 'characteristics') {
      // Для характеристик сохраняем строку (название характеристики)
      newMaterials[idx].characteristics = typeof value === 'object' && value?.name ? value.name : value;
    } else if (field === 'size') {
      // Для характеристик (смета) сохраняем строку
      newMaterials[idx].size = typeof value === 'object' && value?.name ? value.name : value;
      if (import.meta.env.DEV) {
        console.log(`handleMaterialChange: поле size изменено для материала ${idx}, новое значение:`, value);
      }
    } else {
      (newMaterials[idx] as any)[field] = value;
    }
    setRequest({ ...request, materials: newMaterials });
  };

  const handleAddMaterial = () => {
    setRequest({
      ...request,
      materials: [
        ...(request.materials || []),
          { material: null, characteristics: '', size: '', quantity: '', unit: null, note: '', deliveryDate: '', workType: '', supplierMaterialName: '', estimateMaterialName: '', estimatePrice: '', materialLink: '', isImported: false }
      ]
    });
  };

  const handleRemoveMaterial = (idx: number) => {
    setRemoveMaterialIdx(idx);
    setOpenRemoveMaterialDialog(true);
  };

  const confirmRemoveMaterial = () => {
    if (removeMaterialIdx !== null) {
      setRequest(prev => ({
        ...prev,
        materials: (prev.materials || []).filter((_, i) => i !== removeMaterialIdx)
      }));
    }
    setOpenRemoveMaterialDialog(false);
    setRemoveMaterialIdx(null);
  };

  const handleSave = async () => {
    // Валидация убрана: поле "Наименование материала (смета)" не является обязательным
    
    // Валидация: сметные цены должны быть больше 0
    const invalidPriceIdx = (request.materials || []).findIndex(
      mat => mat.estimatePrice && mat.estimatePrice !== '' && parseFloat(mat.estimatePrice) <= 0
    );
    if (invalidPriceIdx !== -1) {
      alert(`Сметная цена должна быть больше 0 в строке ${invalidPriceIdx + 1}`);
      return;
    }
    setLoading(true);
    
    try {
    // Сохраняем текущий статус без изменений
    const statusToSave = request.status || 'DRAFT';
    
    // Преобразуем materials обратно в requestMaterials для отправки на сервер
    if (import.meta.env.DEV) {
      console.log('request.materials перед отправкой:', JSON.stringify(request.materials, null, 2));
    }
    const requestToSend = {
          id: request.id,
          organization: request.organization,
          project: request.project,
          date: request.date,
          requestNumber: request.requestNumber,
          warehouse: request.warehouse,
          applicant: request.applicant,
          status: statusToSave,
          requestMaterials: (request.materials || []).map((mat, index) => ({
            id: mat.id,
            number: index + 1,
            workType: mat.workType ? { id: mat.workType } : null,
            material: mat.material ? { id: mat.material.id } : null,
            size: mat.size || '',
            quantity: mat.quantity ? parseFloat(mat.quantity) : null,
            unit: mat.unit ? { id: mat.unit.id } : null,
            note: mat.note || '',
            deliveryDate: mat.deliveryDate || '',
            supplierMaterialName: mat.supplierMaterialName || '',
            estimateMaterialName: mat.estimateMaterialName || '',
            estimatePrice: mat.estimatePrice ? parseFloat(mat.estimatePrice) : null,
            materialLink: mat.materialLink || '',
            estimateUnit: mat.estimateUnit ? { id: mat.estimateUnit.id } : null,
            estimateQuantity: mat.estimateQuantity ? parseFloat(mat.estimateQuantity) : null
          }))
        };
      
      if (import.meta.env.DEV) {
        console.log('Отправляем данные:', JSON.stringify(requestToSend, null, 2));
        console.log('requestMaterials:', JSON.stringify(requestToSend.requestMaterials, null, 2));
                            console.log('Проверяем поле size (характеристики смета):', requestToSend.requestMaterials.map((m: any) => ({ id: m.id, size: m.size })));
      }
    
    if (isEdit) {
      await api.put(`/api/requests/${id}`, requestToSend);
    } else {
      await api.post('/api/requests', requestToSend);
    }
      
    setLoading(false);
    navigate('/requests/registry');
    } catch (error: any) {
      setLoading(false);
      console.error('Ошибка при сохранении:', error);
      
      if (error.response) {
        console.error('Детали ошибки:', error.response.data);
        alert(`Ошибка при сохранении: ${error.response.data?.message || error.response.statusText}`);
      } else {
        alert('Ошибка при сохранении заявки');
      }
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
    await api.delete(`/api/requests/${id}`);
    setLoading(false);
    navigate('/requests/registry');
    } catch (error: any) {
      setLoading(false);
      console.error('Ошибка при удалении:', error);
      
      if (error.response) {
        console.error('Детали ошибки:', error.response.data);
        alert(`Ошибка при удалении: ${error.response.data?.message || error.response.statusText}`);
      } else {
        alert('Ошибка при удалении заявки');
      }
    }
  };

  const handleCreateTender = async () => {
    try {
      const response = await api.post(`/api/requests/${id}/create-tender`);
      const tender = response.data;
      // После создания тендера меняем статус заявки на 'TENDER'
      setRequest(prev => ({ ...prev, status: 'TENDER' }));
      // Открываем тендер в новом окне
      window.open(`/tenders/${tender.id}`, '_blank');
    } catch (error: any) {
      console.error('Ошибка при создании тендера:', error);
      alert('Ошибка при создании тендера: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleSupplierMaterialNameChange = async (idx: number, value: string) => {
    const newMaterials = [...(request.materials || [])];
    newMaterials[idx].supplierMaterialName = value;
    setRequest({ ...request, materials: newMaterials });
  };

  // Функция преобразования serial date Excel в YYYY-MM-DD
  function excelDateToISO(serial: any) {
    if (!serial || isNaN(serial)) return '';
    const utc_days  = Math.floor(serial - 25569);
    const utc_value = utc_days * 86400;
    const date_info = new Date(utc_value * 1000);
    return date_info.toISOString().slice(0, 10);
  }

  // Функция для парсинга строки даты в YYYY-MM-DD
  function parseDateString(str: string) {
    if (!str) return '';
    // Ожидаем dd.mm.yyyy или dd.mm.yy
    const parts = str.split(/[./-]/);
    if (parts.length === 3) {
      let [d, m, y] = parts;
      if (y.length === 2) y = '20' + y;
      if (d.length === 1) d = '0' + d;
      if (m.length === 1) m = '0' + m;
      return `${y}-${m}-${d}`;
    }
    return '';
  }

  // Базовый импорт из Excel
  const handleExcelImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportLoading(true);
    setImportStep('parsing');
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (jsonData.length < 2) {
          alert('Файл должен содержать заголовки и хотя бы одну строку данных');
          return;
        }

        // ШАГ 1: Парсим шапку (Организация, Проект, Склад, Заявитель, Дата, Заявка)
        let org = '', project = '', sklad = '', applicant = '', date = '', requestNumber = '';
        // Ищем только в первых двух строках для всех, кроме заявителя
        for (let i = 0; i < Math.min(jsonData.length, 2); i++) {
          const row = jsonData[i] as any[];
          for (let j = 0; j < row.length; j++) {
            const cell = (row[j] || '').toString().toLowerCase();
            if (cell.includes('организация')) org = row[j + 1] || '';
            if (cell.includes('проект')) project = row[j + 1] || '';
            if (cell.includes('склад')) sklad = row[j + 1] || '';
            if (cell.includes('дата')) date = row[j + 1] || '';
            if (cell.includes('заявка')) requestNumber = row[j + 1] || '';
          }
        }
        // Заявителя ищем только в первой строке
        if (jsonData.length > 0) {
          const row = jsonData[0] as any[];
          for (let j = 0; j < row.length; j++) {
            const cell = (row[j] || '').toString().toLowerCase();
            if (cell.includes('заявитель')) {
              applicant = row[j + 1] || '';
              break;
            }
          }
        }

        // ШАГ 2: Определяем организацию из справочника по имени из Excel
        let orgObj = null;
        if (org) {
          const normOrg = normalizeOrgName(org);
          orgObj = companies.find(c => [c.legalName, c.shortName, c.name].some(n => normalizeOrgName(n) === normOrg));
          // Если не нашли — ищем по вхождению
          if (!orgObj) {
            orgObj = companies.find(c => [c.legalName, c.shortName, c.name].some(n => normalizeOrgName(n).includes(normOrg) || normOrg.includes(normalizeOrgName(n))));
          }
          // Гарантируем, что orgObj — это объект из companies (по ссылке)
          if (orgObj) {
            orgObj = companies.find(c => c.id === orgObj.id) || orgObj;
          }
        }
        // Если организация не найдена, показываем модалку и прекращаем импорт
        if (!orgObj && org) {
          setMissingCompanyName(org);
          setImportLoading(false);
          setImportStep('idle');
          return;
        }

        // ШАГ 3: Найти строку с заголовками материалов
        let headers: string[] = [];
        let headerRowIndex = -1;
        for (let i = 0; i < Math.min(jsonData.length, 20); i++) {
          const row = jsonData[i] as any[];
          const normalized = row.map((cell: any) => (cell === undefined || cell === null) ? '' : String(cell).trim().toLowerCase());
          if (normalized.includes('наименование материала, услуги по заявке') && normalized.includes('кол-во')) {
            headers = row as string[];
            headerRowIndex = i;
            break;
          }
        }
        if (headers.length === 0) {
          alert('В файле не найдена строка с заголовками материалов (например, "Наименование материала, услуги по Заявке", "Кол-во")');
          return;
        }

        // ШАГ 4: Импортировать материалы начиная со следующей строки
        const dataRows = jsonData.slice(headerRowIndex + 1);
        
        // Функция для получения индекса из пользовательского mapping или автоматического поиска
        const getColumnIndex = (fieldKey: string, fallbackSearch: (headers: string[]) => number): number => {
          const userIndex = customHeaderMapping[fieldKey];
          if (userIndex !== undefined && userIndex !== '' && typeof userIndex === 'number') {
            return userIndex;
          }
          return fallbackSearch(headers);
        };
        
        // Индексы нужных колонок с поддержкой пользовательского mapping
        const idxMaterialName = getColumnIndex('materialName', 
          (h) => {
            return h.findIndex(header => {
              const val = (header || '').toString().trim().toLowerCase();
              return val.includes('наименование') && val.includes('материал') && val.includes('смет');
            });
          });
        const idxSupplierMaterialName = getColumnIndex('supplierMaterialName',
          (h) => {
            return h.findIndex(header => {
              const val = (header || '').toString().trim().toLowerCase();
              return val.includes('наименование') && val.includes('материал') && val.includes('заявк');
            });
          });
        const idxSize = getColumnIndex('size',
          (h) => h.findIndex(header => (header || '').toString().toLowerCase().includes('характеристики материала по смете')));
        const idxQuantity = getColumnIndex('quantity',
          (h) => h.findIndex(header => (header || '').toString().toLowerCase().includes('кол-во') && !(header || '').toString().toLowerCase().includes('смета')));
        const idxEstimateQuantity = getColumnIndex('estimateQuantity',
          (h) => h.findIndex(header => (header || '').toString().toLowerCase().includes('кол-во (смета)')));
        const idxUnit = getColumnIndex('unit',
          (h) => h.findIndex(header => (header || '').toString().toLowerCase().includes('ед. изм') && !(header || '').toString().toLowerCase().includes('смета')));
        const idxEstimateUnit = getColumnIndex('estimateUnit',
          (h) => h.findIndex(header => {
            const val = (header || '').toString().toLowerCase();
            return val.includes('ед. изм.') && val.includes('смета');
          }));
        const idxNote = getColumnIndex('note',
          (h) => h.findIndex(header => (header || '').toString().toLowerCase().includes('примеч')));
        const idxDeliveryDate = getColumnIndex('deliveryDate',
          (h) => {
            let idx = h.findIndex(header => (header || '').toString().toLowerCase().includes('поставить к дате'));
            if (idx === -1) {
              idx = h.findIndex(header => (header || '').toString().toLowerCase().includes('поставк') || (header || '').toString().toLowerCase().includes('дата'));
            }
            return idx;
          });
        const idxWorkType = getColumnIndex('workType',
          (h) => h.findIndex(header => (header || '').toString().toLowerCase().includes('вид работ')));
        const idxEstimatePrice = getColumnIndex('estimatePrice',
          (h) => h.findIndex(header => (header || '').toString().toLowerCase().includes('сметная цена')));
        const idxMaterialLink = getColumnIndex('materialLink',
          (h) => h.findIndex(header => (header || '').toString().toLowerCase().includes('ссылка')));

        // Отладочная информация
        if (import.meta.env.DEV) {
          console.log('Найденные индексы колонок:', {
            materialName: idxMaterialName,
            supplierMaterialName: idxSupplierMaterialName,
            size: idxSize,
            quantity: idxQuantity,
            estimateQuantity: idxEstimateQuantity,
            unit: idxUnit,
            estimateUnit: idxEstimateUnit,
            note: idxNote,
            deliveryDate: idxDeliveryDate,
            workType: idxWorkType,
            estimatePrice: idxEstimatePrice,
            materialLink: idxMaterialLink
          });
          console.log('Детали найденных индексов:', {
            materialName: idxMaterialName !== -1 ? `${idxMaterialName}: "${headers[idxMaterialName]}"` : 'не найдено',
            supplierMaterialName: idxSupplierMaterialName !== -1 ? `${idxSupplierMaterialName}: "${headers[idxSupplierMaterialName]}"` : 'не найдено',
            size: idxSize !== -1 ? `${idxSize}: "${headers[idxSize]}"` : 'не найдено'
          });
          console.log('Заголовки:', headers);
          console.log('Значения заголовков:', headers.map((h, i) => `${i}: "${h}"`));
          
          // Поиск колонок с "смет" в названии
          const smetColumns = headers.map((h, i) => ({ index: i, value: h })).filter(item => 
            item.value && item.value.toString().toLowerCase().includes('смет')
          );
          console.log('Колонки со словом "смет":', smetColumns);
          console.log('Детали колонок со словом "смет":', smetColumns.map(col => `${col.index}: "${col.value}"`));
          
          // Поиск колонок с "наименование" в названии
          const nameColumns = headers.map((h, i) => ({ index: i, value: h })).filter(item => 
            item.value && item.value.toString().toLowerCase().includes('наименование')
          );
          console.log('Колонки со словом "наименование":', nameColumns);
          console.log('Детали колонок со словом "наименование":', nameColumns.map(col => `${col.index}: "${col.value}"`));
        }

        const importedMaterials = [];
        for (let i = 0; i < dataRows.length; i++) {
          const row = dataRows[i] as any[];
          if (!row[idxMaterialName]) continue;
          const materialName = row[idxMaterialName] || '';
          const supplierMaterialName = idxSupplierMaterialName !== -1 ? row[idxSupplierMaterialName] || '' : '';
          // Убираем поиск материала в справочнике, так как поле теперь просто текстовое
          const foundMaterial = null;
          // Преобразовать дату поставки (deliveryDate)
          let deliveryDateValue = idxDeliveryDate !== -1 ? row[idxDeliveryDate] || '' : '';
          if (typeof deliveryDateValue === 'number' || /^\d+$/.test(deliveryDateValue)) {
            deliveryDateValue = excelDateToISO(Number(deliveryDateValue));
          } else if (typeof deliveryDateValue === 'string') {
            deliveryDateValue = parseDateString(deliveryDateValue);
          }
          const importedMaterial = {
            material: foundMaterial ? foundMaterial : null,
            supplierMaterialName: supplierMaterialName, // Наименование в заявке (из колонки "Наименование материала, услуги по Заявке")
            estimateMaterialName: materialName, // Наименование материала (смета) (из колонки "Наименование материала, услуги по Смете")
            size: idxSize !== -1 ? row[idxSize] || '' : '',
            quantity: idxQuantity !== -1 ? row[idxQuantity] || '' : '',
            estimateQuantity: idxEstimateQuantity !== -1 ? row[idxEstimateQuantity] || '' : '',
            unit: idxUnit !== -1 ? row[idxUnit] || '' : '',
            estimateUnit: idxEstimateUnit !== -1 ? row[idxEstimateUnit] || '' : '',
            note: idxNote !== -1 ? row[idxNote] || '' : '',
            deliveryDate: deliveryDateValue,
            workType: idxWorkType !== -1 ? row[idxWorkType] || '' : '',
            estimatePrice: idxEstimatePrice !== -1 ? row[idxEstimatePrice] || '' : '',
            materialLink: idxMaterialLink !== -1 ? row[idxMaterialLink] || '' : '',
            isImported: true, // Помечаем как импортированный материал
          };

          // Отладочная информация для первого материала
          if (import.meta.env.DEV && i === 0) {
            console.log('Первый импортированный материал:', {
              materialName,
              supplierMaterialName,
              foundMaterial: foundMaterial?.name,
              materialField: importedMaterial.material,
              size: importedMaterial.size,
              quantity: importedMaterial.quantity,
              estimateQuantity: importedMaterial.estimateQuantity,
              supplierMaterialNameField: importedMaterial.supplierMaterialName,
              estimateMaterialNameField: importedMaterial.estimateMaterialName
            });
            console.log('Строка данных:', row);
            console.log('Индексы колонок:', {
              idxMaterialName,
              idxSupplierMaterialName,
              idxSize
            });
            console.log('Значения из строки по найденным индексам:', {
              materialNameValue: idxMaterialName !== -1 ? row[idxMaterialName] : 'не найдено',
              supplierMaterialNameValue: idxSupplierMaterialName !== -1 ? row[idxSupplierMaterialName] : 'не найдено',
              sizeValue: idxSize !== -1 ? row[idxSize] : 'не найдено'
            });
          }

          importedMaterials.push(importedMaterial);
        }

        // ШАГ 5: Убираем логику маппинга материалов, так как поле "Наименование материала (смета)" теперь просто текстовое
        setImportStep('mapping');

        // ШАГ 6: Парсинг даты заявки
        let parsedDate = '';
        if (typeof date === 'number' || /^\d+$/.test(date)) {
          parsedDate = excelDateToISO(Number(date));
        } else if (typeof date === 'string') {
          parsedDate = parseDateString(date);
        }

        setImportStep('done');
        
        // Отладочная информация для проверки импортированных данных
        if (import.meta.env.DEV) {
          console.log('=== ИМПОРТИРОВАННЫЕ ДАННЫЕ ===');
          console.log('Всего материалов:', importedMaterials.length);
          console.log('Первый материал:', importedMaterials[0]);
                  console.log('Поле supplierMaterialName в первом материале:', importedMaterials[0]?.supplierMaterialName);
        console.log('Поле estimateMaterialName в первом материале:', importedMaterials[0]?.estimateMaterialName);
        console.log('Все supplierMaterialName:', importedMaterials.map(m => m.supplierMaterialName));
        console.log('Все estimateMaterialName:', importedMaterials.map(m => m.estimateMaterialName));
        }
        
        setPendingImportData({
          organizationName: orgObj ? (orgObj.legalName || orgObj.shortName || orgObj.name) : org,
          organizationObj: orgObj,
          projectName: project,
          sklad,
          applicant,
          date: parsedDate,
          requestNumber,
          materials: importedMaterials
        });
        setOpenImportDialog(true);

        // 2. После определения headers (в handleExcelImport) сохраняем их и показываем диалог выбора
        setImportHeaders(headers);
        
        // Загружаем сохраненный mapping для пользователя
        try {
          const token = localStorage.getItem('token');
          if (token) {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const userId = payload.userId;
            const companyId = payload.companyId;
            
            if (userId && companyId) {
              const savedMapping = await getImportColumnMapping(userId, companyId);
              if (savedMapping && savedMapping.mappingJson) {
                const parsedMapping = JSON.parse(savedMapping.mappingJson);
                setCustomHeaderMapping(parsedMapping);
                setHasSavedMapping(true);
              } else {
                setHasSavedMapping(false);
              }
            }
          }
        } catch (error) {
          console.warn('Ошибка при загрузке сохраненного mapping:', error);
          setHasSavedMapping(false);
        }
      } catch (error) {
        console.error('Ошибка при обработке файла:', error);
        alert('Ошибка при обработке файла');
      } finally {
        setImportLoading(false);
        setImportStep('idle');
      }
    };
    reader.readAsArrayBuffer(file);
    e.target.value = '';
  };

  // --- Импорт: вычисление недостающих справочников ---
  useEffect(() => {
    if (!pendingImportData) return;
    // Проект
    const missingProject = pendingImportData.projectName && !projects.find(p => p.name.trim().toLowerCase() === pendingImportData.projectName.trim().toLowerCase()) ? pendingImportData.projectName : undefined;
    // Склад
    const missingWarehouse = pendingImportData.sklad && !warehouses.find(w => w.name.trim().toLowerCase() === pendingImportData.sklad.trim().toLowerCase()) ? pendingImportData.sklad : undefined;
    // Виды работ
    const allWorkTypes = ((pendingImportData.materials || []).map((m:any) => m.workType).filter(Boolean) as string[]);
    const missingWorkTypes = Array.from(new Set(allWorkTypes.filter((w:string) => w && !workTypes.find(wt => wt.name.trim().toLowerCase() === w.trim().toLowerCase()))));
    // Характеристики
    const allChars = ((pendingImportData.materials || []).map((m:any) => m.characteristics).filter(Boolean) as string[]);
    const missingChars = Array.from(new Set(allChars.filter((c:string) => c && !characteristics.find(ch => ch.name.trim().toLowerCase() === c.trim().toLowerCase()))));
    // Ед. изм.
    const allUnits = ((pendingImportData.materials || []).map((m:any) => m.unit).filter(Boolean) as string[]);
    const missingUnits = Array.from(new Set(allUnits.filter((u:string) => u && !units.find(unit => unit.shortName.trim().toLowerCase() === u.trim().toLowerCase()))));
    // Ед. изм.(смета)
    const allEstimateUnits = ((pendingImportData.materials || []).map((m:any) => m.estimateUnit).filter(Boolean) as string[]);
    const missingEstimateUnits = Array.from(new Set(allEstimateUnits.filter((u:string) => u && !units.find(unit => unit.shortName.trim().toLowerCase() === u.trim().toLowerCase()))));
    
    // Материалы (смета) - анализируем estimateMaterialName
    const allEstimateMaterials = ((pendingImportData.materials || []).map((m:any) => m.estimateMaterialName).filter(Boolean) as string[]);
    const missingMaterials = Array.from(new Set(allEstimateMaterials.filter((materialName:string) => 
      materialName && !materials.find(m => m.name.trim().toLowerCase() === materialName.trim().toLowerCase())
    )));
    
    if (import.meta.env.DEV) {
      console.log('=== АНАЛИЗ МАТЕРИАЛОВ ПРИ ИМПОРТЕ ===');
      console.log('Все estimateMaterialName из импорта:', allEstimateMaterials);
      console.log('Существующие материалы в справочнике:', materials.map(m => m.name));
      console.log('Отсутствующие материалы:', missingMaterials);
    }
    
    setImportWillCreate({
      project: missingProject,
      warehouse: missingWarehouse,
      workTypes: missingWorkTypes,
      characteristics: missingChars,
      units: missingUnits,
      estimateUnits: missingEstimateUnits,
      materials: missingMaterials
    });
  }, [pendingImportData, projects, warehouses, workTypes, characteristics, units]);

  // --- Импорт: создание недостающих справочников и интеграция данных ---
  const handleImportConfirm = async () => {
    if (!pendingImportData) return;
    let projectObj = projects.find(p => p.name.trim().toLowerCase() === (pendingImportData.projectName || '').trim().toLowerCase());
    if (!projectObj && pendingImportData.projectName) {
      const res = await api.post('/api/projects', { name: pendingImportData.projectName });
      projectObj = res.data;
      setProjects(prev => [...prev, res.data]);
    }
    let warehouseObj = warehouses.find(w => w.name.trim().toLowerCase() === (pendingImportData.sklad || '').trim().toLowerCase());
    if (!warehouseObj && pendingImportData.sklad && projectObj) {
      const res = await api.post('/api/warehouses', { name: pendingImportData.sklad, projectId: projectObj.id });
      warehouseObj = res.data;
      setWarehouses(prev => [...prev, res.data]);
    }
    // Виды работ
    let workTypeMap: Record<string, any> = {};
    for (const w of importWillCreate.workTypes) {
      const res = await api.post('/api/work-types', { name: w });
      setWorkTypes(prev => [...prev, res.data]);
      workTypeMap[w] = res.data;
    }
    // Характеристики
    let charMap: Record<string, any> = {};
    for (const c of importWillCreate.characteristics) {
      const res = await api.post('/api/characteristics', { name: c });
      setCharacteristics(prev => [...prev, res.data]);
      charMap[c] = res.data;
    }
    // Ед. изм.
    let unitMap: Record<string, any> = {};
    for (const u of importWillCreate.units) {
      const res = await api.post('/api/units', { name: u, shortName: u });
      const unitsRes = await api.get('/api/units');
      setUnits(unitsRes.data);
      unitMap[u] = res.data;
    }
    // Ед. изм.(смета)
    for (const u of importWillCreate.estimateUnits) {
      const res = await api.post('/api/units', { name: u, shortName: u });
      const unitsRes = await api.get('/api/units');
      setUnits(unitsRes.data);
      unitMap[u] = res.data;
    }
    
    // Материалы (смета) - создаем новые материалы в справочнике
    let materialMap: Record<string, any> = {};
    if (importWillCreate.materials.length > 0) {
      console.log('Создаем новые материалы:', importWillCreate.materials);
      for (const materialName of importWillCreate.materials) {
        const res = await api.post('/api/materials', { name: materialName });
        console.log(`Создан материал "${materialName}":`, res.data);
        setMaterials(prev => [...prev, res.data]);
        materialMap[materialName] = res.data;
      }
    }
    // Интеграция данных
    const processedMaterials = (pendingImportData.materials || []).map((mat: any) => {
        // workType, characteristics, unit, estimateUnit — ищем среди новых и старых
        let workTypeObj = workTypes.find(w => w.name.trim().toLowerCase() === (mat.workType || '').trim().toLowerCase()) || workTypeMap[mat.workType];
        let charObj = characteristics.find(c => c.name.trim().toLowerCase() === (mat.characteristics || '').trim().toLowerCase()) || charMap[mat.characteristics];
        let unitObj = units.find(u => u.shortName.trim().toLowerCase() === (mat.unit || '').trim().toLowerCase()) || unitMap[mat.unit];
        let estimateUnitObj = units.find(u => u.shortName.trim().toLowerCase() === (mat.estimateUnit || '').trim().toLowerCase()) || unitMap[mat.estimateUnit];
        
        // Материал (смета) - ищем среди новых и старых материалов
        let materialObj = materials.find(m => m.name.trim().toLowerCase() === (mat.estimateMaterialName || '').trim().toLowerCase()) || materialMap[mat.estimateMaterialName];
        
        if (import.meta.env.DEV && mat.estimateMaterialName) {
          console.log(`Обработка материала "${mat.estimateMaterialName}":`, {
            estimateMaterialName: mat.estimateMaterialName,
            foundInMaterials: materials.find(m => m.name.trim().toLowerCase() === (mat.estimateMaterialName || '').trim().toLowerCase()),
            foundInMaterialMap: materialMap[mat.estimateMaterialName],
            finalMaterialObj: materialObj
          });
        }
        
        return {
          ...mat,
          workType: workTypeObj ? workTypeObj.id : '',
          characteristics: charObj ? charObj.name : '',
          unit: unitObj ? unitObj : null,
          estimateUnit: estimateUnitObj ? estimateUnitObj : null,
          material: materialObj ? materialObj : null, // Подставляем найденный материал
        };
    });

    // Отладочная информация для проверки обработанных данных
    if (import.meta.env.DEV) {
      console.log('=== ОБРАБОТАННЫЕ ДАННЫЕ ===');
      console.log('Всего материалов после обработки:', processedMaterials.length);
      console.log('Первый материал после обработки:', processedMaterials[0]);
              console.log('Поле supplierMaterialName в первом материале после обработки:', processedMaterials[0]?.supplierMaterialName);
        console.log('Поле estimateMaterialName в первом материале после обработки:', processedMaterials[0]?.estimateMaterialName);
        console.log('Все supplierMaterialName после обработки:', processedMaterials.map(m => m.supplierMaterialName));
        console.log('Все estimateMaterialName после обработки:', processedMaterials.map(m => m.estimateMaterialName));
    }

    setRequest(prev => {
      const newRequest = {
        ...prev,
        organization: pendingImportData.organizationObj || prev.organization,
        requestNumber: pendingImportData.requestNumber || prev.requestNumber,
        date: pendingImportData.date || prev.date,
        applicant: pendingImportData.applicant || prev.applicant,
        project: projectObj || prev.project,
        warehouse: warehouseObj || prev.warehouse,
        materials: processedMaterials
      };

        // Отладочная информация для проверки состояния формы
  if (import.meta.env.DEV) {
    console.log('=== СОСТОЯНИЕ ФОРМЫ ПОСЛЕ ИМПОРТА ===');
    console.log('Новое состояние request:', newRequest);
    console.log('Количество материалов в форме:', newRequest.materials?.length);
    console.log('Первый материал в форме:', newRequest.materials?.[0]);
    console.log('material в первом материале формы:', newRequest.materials?.[0]?.material);
    console.log('supplierMaterialName в первом материале формы:', newRequest.materials?.[0]?.supplierMaterialName);
    console.log('estimateMaterialName в первом материале формы:', newRequest.materials?.[0]?.estimateMaterialName);
    console.log('Все estimateMaterialName в форме:', newRequest.materials?.map(m => m.estimateMaterialName));
  }

      return newRequest;
    });
    setOpenImportDialog(false);
    setPendingImportData(null);

    if (!isEdit) {
      if (window.opener) {
        window.opener.postMessage(
          {
            type: 'materialCreated',
            payload: {
              name: pendingImportData.materials[0].supplierMaterialName,
              id: pendingImportData.materials[0].material?.id,
              unit: pendingImportData.materials[0].unit?.id
            }
          },
          '*'
        );
        window.close();
        return;
      }
    }
  };

  useEffect(() => {
    function handleMaterialCreated(event: MessageEvent) {
      if (event.data?.type === 'materialCreated') {
        const { name, id } = event.data.payload;
        if (import.meta.env.DEV) {
          console.log('Material created:', { name, id });
        }
        
        // Обновляем список материалов
        fetchMaterials();
        
        setRequest(prev => {
          const newMaterials = prev.materials.map(mat => {
            const normalize = (str: string) => (str || '').replace(/\s+/g, '').toLowerCase();
            
            // Случай 1: Материал был создан через импорт (есть supplierMaterialName, но нет material)
            if (!mat.material && mat.supplierMaterialName && normalize(mat.supplierMaterialName) === normalize(name)) {
              if (import.meta.env.DEV) {
                console.log('Updating material from import:', mat);
              }
              return {
                ...mat,
                material: { id, name },
              };
            }
            
            // Случай 2: Материал был создан через Autocomplete (material.id === 'CREATE_NEW' или material.name содержит "Создать")
            if ((mat.material?.id === 'CREATE_NEW' || mat.material?.name?.startsWith('Создать "')) && 
                normalize(mat.material.name.replace(/^Создать "/, '').replace(/"$/, '')) === normalize(name)) {
              if (import.meta.env.DEV) {
                console.log('Updating material from Autocomplete:', mat);
              }
              return {
                ...mat,
                material: { id, name },
              };
            }
            
            return mat;
          });
          return { ...prev, materials: newMaterials };
        });
      }
    }
    window.addEventListener('message', handleMaterialCreated);
    return () => window.removeEventListener('message', handleMaterialCreated);
  }, [materials]);

  if (loading) {
    return <Box display="flex" justifyContent="center" mt={4}><CircularProgress /></Box>;
  }

  return (
    <Container maxWidth="xl" sx={{ width: '100%' }}>
      <Box sx={{ mt: 4, mb: 4 }}>
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Typography variant="h6">{isEdit ? 'Редактирование заявки' : 'Создание заявки'}</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button 
            variant="outlined" 
            onClick={() => {
              const optimalWidths = calculateOptimalColumnWidths();
              setColWidths(optimalWidths);
            }}
            title="Автоматически подогнать ширину столбцов под содержимое"
          >
            Подогнать столбцы
          </Button>
        <Button variant="outlined" component="label" disabled={importLoading}>
          {importLoading ? (
            <>
              <CircularProgress size={16} sx={{ mr: 1 }} />
              {importStep === 'parsing' && 'Парсинг файла...'}
              {importStep === 'mapping' && 'Поиск материалов...'}
              {importStep === 'done' && 'Готово!'}
            </>
          ) : (
            'Импорт из Excel'
          )}
          <input type="file" accept=".xlsx,.xls" hidden onChange={handleExcelImport} />
        </Button>
        </Box>
      </Toolbar>
      <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
        <Grid container spacing={2} sx={{ mb: 2, maxWidth: 1200, alignItems: 'center' }}>
          <Grid item xs={12} md={3}>
        <TextField
              name="requestNumber"
              label="Номер заявки"
              value={request.requestNumber || ''}
              onChange={handleChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} md={3}>
        <TextField
          name="date"
          label="Дата"
          type="date"
          value={request.date || ''}
          onChange={handleChange}
          InputLabelProps={{ shrink: true }}
              fullWidth
          required
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              name="applicant"
              label="Заявитель"
              value={request.applicant || ''}
              onChange={handleChange}
              required
              fullWidth
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              select
              name="status"
              label="Статус заявки"
              value={request.status || 'DRAFT'}
              onChange={handleChange}
              fullWidth
            >
              {statusOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>
        <Autocomplete
          options={companies}
          getOptionLabel={option => option.shortName || option.name}
          value={companies.find(c => c.id === request.organization?.id) || null}
          onChange={(_, value) => setRequest(prev => ({ ...prev, organization: value || null }))}
          renderInput={(params) => (
            <TextField {...params} label="Организация (заказчик)" variant="outlined" required />
          )}
        />
        <Autocomplete
          value={projects.find(p => p.id === request.project?.id) || null}
          onChange={(_, value) => {
            if (value && value.id === 'CREATE_NEW') {
              setNewProject(value.name.replace(/^Создать "/, '').replace(/"$/, ''));
              setOpenProjectDialog(true);
            } else {
              handleSelectChange('project', value ? value.id : '');
            }
          }}
          options={projects}
          filterOptions={(options, state) => {
            const filtered = options.filter(option =>
              option.name.toLowerCase().includes(state.inputValue.toLowerCase())
            );
            if (state.inputValue && filtered.length === 0) {
              return [{ id: 'CREATE_NEW', name: `Создать "${state.inputValue}"` }];
            }
            return filtered;
          }}
          getOptionLabel={(option: Project) => option ? option.name : ''}
          isOptionEqualToValue={(option: Project, value: Project) => option.id === value.id}
          renderInput={params => (
            <TextField {...params} label="Проект" required />
          )}
        />
        <Autocomplete
          value={warehouses.find(w => w.id === request.warehouse?.id) || null}
          onChange={(_, value) => {
            if (value && value.id === 'CREATE_NEW') {
              setNewWarehouse(value.name.replace(/^Создать "/, '').replace(/"$/, ''));
              setOpenWarehouseDialog(true);
            } else {
              handleSelectChange('warehouse', value ? value.id : '');
            }
          }}
          options={warehouses.filter(w => w.projectId === request.project?.id)}
          filterOptions={(options, state) => {
            const filtered = options.filter(option =>
              option.name.toLowerCase().includes(state.inputValue.toLowerCase())
            );
            if (state.inputValue && filtered.length === 0) {
              return [{ id: 'CREATE_NEW', name: `Создать "${state.inputValue}"`, projectId: request.project?.id || '' }];
            }
            return filtered;
          }}
          getOptionLabel={(option: Warehouse) => option ? option.name : ''}
          isOptionEqualToValue={(option: Warehouse, value: Warehouse) => option.id === value.id}
          renderInput={params => (
            <TextField {...params} label="Склад" required />
          )}
          disabled={!request.project?.id}
        />
        <Typography variant="subtitle1" sx={{ mt: 2 }}>Материалы заявки</Typography>
        <TableContainer component={Paper} sx={{ mb: 2, overflowX: 'auto', width: '100%', maxWidth: '100%', maxHeight: '600px', overflowY: 'auto' }}>
          <Table size="small" sx={{ minWidth: 2000, width: 'max-content' }}>
            <TableHead>
              <TableRow>
                  {['#','Вид работ','Наименование в заявке','Кол-во','Ед. изм.','Наименование материала (смета)','Характеристики (смета)','Кол-во (смета)','Ед. изм.(смета)','Цена (смета)','Стоимость (смета)','Ссылка','Примечание','Поставить к дате','Действия'].map((label, idx) => (
                  <TableCell
                    key={label}
                    sx={{ 
                      position: 'relative', 
                      width: colWidths[idx], 
                      minWidth: 40, 
                      maxWidth: 800, 
                      userSelect: 'none', 
                      whiteSpace: 'nowrap',
                      // Выделяем сметные столбцы (индексы 5-10)
                      backgroundColor: idx >= 5 && idx <= 10 ? '#f0f8ff' : 'inherit',
                      borderLeft: idx === 5 ? '2px solid #1976d2' : 'inherit',
                      borderRight: idx === 10 ? '2px solid #1976d2' : 'inherit',
                      fontWeight: idx >= 5 && idx <= 10 ? 'bold' : 'normal'
                    }}
                  >
                    {label}
                    {idx !== 0 && idx !== 13 && (
                      <span
                        style={{
                          position: 'absolute',
                          right: 0,
                          top: 0,
                          height: '100%',
                          width: 6,
                          cursor: 'col-resize',
                          zIndex: 2,
                          userSelect: 'none',
                          background: 'transparent',
                        }}
                        onMouseDown={e => handleMouseDown(idx, e)}
                      />
                    )}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
          {request.materials.map((mat, idx) => {
            const estimateTotal = (parseFloat(mat.estimatePrice || '0') * parseFloat(mat.estimateQuantity || mat.quantity || '0')).toFixed(2);
            return (
                <TableRow key={idx}>
                  <TableCell sx={{ width: colWidths[0] }} title={`${idx + 1}`}>{idx + 1}</TableCell>
                  <TableCell sx={{ width: colWidths[1], whiteSpace: 'nowrap' }} title={workTypes.find(w => w.id === mat.workType)?.name || ''}>
                  <Autocomplete
                    value={workTypes.find(w => w.id === mat.workType) || null}
                    onChange={(_, value) => handleMaterialChange(idx, 'workType', value ? value.id : '')}
                    options={workTypes}
                    getOptionLabel={option => option ? option.name : ''}
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                    renderInput={params => (
                        <TextField {...params} size="small" label="Вид работ" />
                    )}
                  />
                  </TableCell>
                  <TableCell sx={{ width: colWidths[2], minWidth: 180, maxWidth: 300 }} title={mat.supplierMaterialName || ''}>
                    <Autocomplete
                      freeSolo
                      value={mat.supplierMaterialName || ''}
                    onChange={async (_, value) => handleSupplierMaterialNameChange(idx, value || '')}
                    onInputChange={(_, value) => handleSupplierMaterialNameChange(idx, value || '')}
                    options={[]}
                      renderInput={params => (
                        <TextField {...params} size="small" label="Наименование в заявке" InputLabelProps={{ shrink: true }} />
                      )}
                      filterOptions={(options, state) => {
                        if (!state.inputValue) return options;
                        return options.filter(opt => opt === state.inputValue);
                      }}
                  />
                  </TableCell>
                                   <TableCell sx={{ width: colWidths[3], maxWidth: colWidths[3] }} title={mat.quantity || ''}>
                   <TextField
                     size="small"
                     label="Кол-во"
                     value={mat.quantity || ''}
                     onChange={e => handleMaterialChange(idx, 'quantity', e.target.value)}
                     type="number"
                     sx={{ width: '100%', maxWidth: colWidths[3] }}
                   />
                 </TableCell>
                                     <TableCell sx={{ width: colWidths[4], maxWidth: colWidths[4] }} title={mat.unit?.shortName || ''}>
                     <TextField
                       select
                       size="small"
                       label="Ед. изм."
                       value={mat.unit?.id || ''}
                       onChange={e => handleMaterialChange(idx, 'unit', e.target.value)}
                       sx={{ width: '100%', maxWidth: colWidths[4] }}
                     >
                       {units.map(u => (
                         <MenuItem key={u.id} value={u.id}>{u.shortName}</MenuItem>
                       ))}
                     </TextField>
                   </TableCell>
                  <TableCell sx={{ 
                    width: colWidths[5],
                    minWidth: 180, 
                    maxWidth: 300,
                    backgroundColor: '#f0f8ff',
                    borderLeft: '2px solid #1976d2'
                              }} title={mat.estimateMaterialName || ''}>
                    <Autocomplete
                      freeSolo
                      value={mat.estimateMaterialName || ''}
                      onChange={async (_, value) => {
                        if (typeof value === 'string') {
                          // Если введено новое значение, создаем материал
                          try {
                            const res = await api.post('/api/materials', { name: value });
                            setMaterials(prev => [...prev, res.data]);
                            handleMaterialChange(idx, 'estimateMaterialName', value);
                            handleMaterialChange(idx, 'material', res.data);
                          } catch (error) {
                            console.error('Ошибка при создании материала:', error);
                            handleMaterialChange(idx, 'estimateMaterialName', value);
                          }
                        } else if (value && value.name && value.name.startsWith('Создать: ')) {
                          // Если выбрана опция "Создать:"
                          const materialName = value.name.replace('Создать: ', '');
                          try {
                            const res = await api.post('/api/materials', { name: materialName });
                            setMaterials(prev => [...prev, res.data]);
                            handleMaterialChange(idx, 'estimateMaterialName', materialName);
                            handleMaterialChange(idx, 'material', res.data);
                          } catch (error) {
                            console.error('Ошибка при создании материала:', error);
                            handleMaterialChange(idx, 'estimateMaterialName', materialName);
                          }
                        } else {
                          // Если выбран существующий материал
                          handleMaterialChange(idx, 'estimateMaterialName', value ? value.name : '');
                          handleMaterialChange(idx, 'material', value);
                        }
                      }}
                      onInputChange={(_, value) => handleMaterialChange(idx, 'estimateMaterialName', value || '')}
                      options={materials}
                      getOptionLabel={option => typeof option === 'string' ? option : option.name}
                      isOptionEqualToValue={(option, value) => 
                        typeof option === 'string' ? option === value : option.id === value.id
                      }
                      renderInput={params => (
                        <TextField 
                          {...params} 
                          size="small" 
                          label="Наименование материала (смета)" 
                          InputLabelProps={{ shrink: true }}
                        />
                      )}
                      filterOptions={(options, state) => {
                        const filtered = options.filter(option => 
                          option.name.toLowerCase().includes(state.inputValue.toLowerCase())
                        );
                        // Добавляем опцию создания нового материала
                        if (state.inputValue && !options.some(option => 
                          option.name.toLowerCase() === state.inputValue.toLowerCase()
                        )) {
                          filtered.push({ id: '', name: `Создать: ${state.inputValue}` } as any);
                        }
                        return filtered;
                      }}
                    />
                  </TableCell>
                <TableCell sx={{ width: colWidths[6], backgroundColor: '#f0f8ff' }} title={mat.size || ''}>
                  <TextField
                    size="small"
                    label="Характеристики (смета)"
                    value={mat.size || ''}
                    onChange={e => handleMaterialChange(idx, 'size', e.target.value)}
                    sx={{ width: '100%', maxWidth: colWidths[6] }}
                  />
                  </TableCell>
                  <TableCell sx={{ width: colWidths[7], maxWidth: colWidths[7], backgroundColor: '#f0f8ff' }} title={mat.estimateQuantity || ''}>
                  <TextField
                    size="small"
                      label="Кол-во (смета)"
                      value={mat.estimateQuantity || ''}
                      onChange={e => handleMaterialChange(idx, 'estimateQuantity', e.target.value)}
                    type="number"
                      inputProps={{ min: 0.01, step: 0.01 }}
                      sx={{ width: '100%', maxWidth: colWidths[7] }}
                  />
                  </TableCell>
                  <TableCell sx={{ width: colWidths[8], maxWidth: colWidths[8], backgroundColor: '#f0f8ff' }} title={mat.estimateUnit?.shortName || ''}>
                  <TextField
                    select
                    size="small"
                      label="Ед. изм.(смета)"
                      value={mat.estimateUnit?.id || ''}
                      onChange={e => handleMaterialChange(idx, 'estimateUnit', e.target.value)}
                      sx={{ width: '100%', maxWidth: colWidths[8] }}
                  >
                    {units.map(u => (
                      <MenuItem key={u.id} value={u.id}>{u.shortName}</MenuItem>
                    ))}
                  </TextField>
                  </TableCell>
                <TableCell sx={{ width: colWidths[9], maxWidth: colWidths[9], backgroundColor: '#f0f8ff' }} title={mat.estimatePrice || ''}>
                  <TextField
                    size="small"
                    label="Цена (смета)"
                    value={mat.estimatePrice || ''}
                    onChange={e => {
                      const value = e.target.value;
                      // Убираем ноль если введен только ноль
                      if (value === '0') {
                        handleMaterialChange(idx, 'estimatePrice', '');
                      } else {
                        handleMaterialChange(idx, 'estimatePrice', value);
                      }
                    }}
                    type="number"
                    inputProps={{ min: 0.01, step: 0.01 }}
                    error={mat.estimatePrice !== undefined && mat.estimatePrice !== '' && parseFloat(mat.estimatePrice) <= 0}
                    helperText={mat.estimatePrice !== undefined && mat.estimatePrice !== '' && parseFloat(mat.estimatePrice) <= 0 ? 'Цена должна быть больше 0' : ''}
                    sx={{ width: '100%', maxWidth: colWidths[9] }}
                  />
                </TableCell>
                                  <TableCell sx={{ 
                    width: colWidths[10],
                    maxWidth: colWidths[10],
                    backgroundColor: '#f0f8ff',
                    borderRight: '2px solid #1976d2'
                  }} title={estimateTotal || ''}>
                  <TextField
                    size="small"
                    label="Стоимость (смета)"
                    value={estimateTotal}
                    InputProps={{ readOnly: true }}
                    sx={{ width: '100%', maxWidth: colWidths[10] }}
                  />
                </TableCell>
                <TableCell sx={{ width: colWidths[11] }} title={mat.materialLink || ''}>
                  <TextField
                    size="small"
                    label="Ссылка"
                    value={mat.materialLink || ''}
                    onChange={e => handleMaterialChange(idx, 'materialLink', e.target.value)}
                    fullWidth
                  />
                </TableCell>
                <TableCell sx={{ width: colWidths[12] }} title={mat.note || ''}>
                  <TextField
                    size="small"
                      label="Примечание"
                    value={mat.note || ''}
                    onChange={e => handleMaterialChange(idx, 'note', e.target.value)}
                    fullWidth
                      InputLabelProps={{ shrink: true }}
                  />
                  </TableCell>
                <TableCell sx={{ width: colWidths[13] }} title={mat.deliveryDate || ''}>
                  <TextField
                    size="small"
                    label="Поставить к дате"
                    value={mat.deliveryDate || ''}
                    onChange={e => handleMaterialChange(idx, 'deliveryDate', e.target.value)}
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                  />
                  </TableCell>
                  <TableCell sx={{ width: colWidths[14] }} title="Удалить материал">
                    <IconButton 
                      color="error" 
                      size="small" 
                      onClick={() => handleRemoveMaterial(idx)}
                      title="Удалить материал"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
            );
          })}
            </TableBody>
          </Table>
        </TableContainer>
          <Button onClick={handleAddMaterial} variant="outlined" size="small" sx={{ alignSelf: 'flex-end' }}>
            Добавить материал
          </Button>
        </Box>
      <Box mt={3} display="flex" justifyContent="flex-end" gap={2}>
        <Button variant="outlined" color="secondary" onClick={() => navigate('/requests/registry')}>Отмена</Button>
        <Button variant="contained" color="primary" onClick={handleSave} sx={{ ml: 1 }}>
          Сохранить
        </Button>
        {isEdit && (
          <>
            {request.status && request.status.toUpperCase() !== 'DRAFT' && (
            <Button variant="outlined" color="success" onClick={() => setConfirmCreateTender(true)} sx={{ ml: 1 }}>
              Создать тендер
            </Button>
            )}
            <IconButton 
              color="error" 
              onClick={() => setConfirmDelete(true)} 
              sx={{ ml: 1 }}
              title="Удалить заявку"
            >
              <DeleteIcon />
            </IconButton>
          </>
        )}
      </Box>
      <Dialog open={confirmDelete} onClose={() => setConfirmDelete(false)}>
        <DialogTitle>Удалить заявку?</DialogTitle>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(false)}>Отмена</Button>
          <Button color="error" onClick={handleDelete} startIcon={<DeleteIcon />}>Удалить</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openWorkTypeDialog} onClose={() => setOpenWorkTypeDialog(false)}>
        <DialogTitle>Создать новый вид работ</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Название вида работ"
            type="text"
            fullWidth
            value={newWorkType}
            onChange={e => setNewWorkType(e.target.value)}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setOpenWorkTypeDialog(false);
            setNewWorkType('');
          }}>
            Отмена
          </Button>
          <Button onClick={async () => {
            if (newWorkType.trim()) {
              try {
                const res = await api.post('/api/work-types', { name: newWorkType });
                setWorkTypes(prev => [...prev, res.data]);
                if (workTypeMaterialIdx !== null) {
                  handleMaterialChange(workTypeMaterialIdx, 'workType', res.data.id);
                }
                setOpenWorkTypeDialog(false);
                setNewWorkType('');
              } catch (error) {
                alert('Ошибка при создании вида работ');
              }
            }
          }}>
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openProjectDialog} onClose={() => setOpenProjectDialog(false)}>
        <DialogTitle>Создать новый проект</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Название проекта"
            type="text"
            fullWidth
            value={newProject}
            onChange={e => setNewProject(e.target.value)}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setOpenProjectDialog(false);
            setNewProject('');
          }}>
            Отмена
          </Button>
          <Button onClick={async () => {
            if (newProject.trim()) {
              try {
                const res = await api.post('/api/projects', { name: newProject });
                setProjects(prev => [...prev, res.data]);
                handleSelectChange('project', res.data.id);
                setRequest(r => ({ ...r, project: res.data }));
                setNewProject('');
                setOpenProjectDialog(false);
              } catch (error) {
                console.error('Ошибка при создании проекта:', error);
                alert('Ошибка при создании проекта');
              }
            }
          }}>
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openCompanyDialog} onClose={() => setOpenCompanyDialog(false)}>
        <DialogTitle>Создать новую организацию</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Название организации"
            type="text"
            fullWidth
            value={newCompany}
            onChange={e => setNewCompany(e.target.value)}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setOpenCompanyDialog(false);
            setNewCompany('');
          }}>
            Отмена
          </Button>
          <Button onClick={() => {
            if (newCompany.trim()) {
              window.open(`/reference/counterparties/new?shortName=${encodeURIComponent(newCompany)}`, '_blank');
              setOpenCompanyDialog(false);
              setNewCompany('');
            }
          }}>
            Создать
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openUnitDialog} onClose={() => setOpenUnitDialog(false)}>
        <DialogTitle>Создать новую единицу измерения</DialogTitle>
        <DialogContent>
          <TextField autoFocus label="Название или сокращение" fullWidth value={newUnitName} onChange={e => setNewUnitName(e.target.value)} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenUnitDialog(false)}>Отмена</Button>
          <Button onClick={async () => {
            if (newUnitName.trim()) {
            // Создать новую единицу через API
            const res = await api.post('/api/units', { name: newUnitName, shortName: newUnitName });
            if (res.data && res.data.id) {
              // Обновить units
              const unitsRes = await api.get('/api/units');
              setUnits(unitsRes.data);
              setOpenUnitDialog(false);
              if (import.meta.env.DEV) {
                console.log('[IMPORT][UNIT] Единица измерения создана:', newUnitName);
              }
              }
            }
          }} variant="contained">Создать</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openRemoveMaterialDialog} onClose={() => setOpenRemoveMaterialDialog(false)}>
        <DialogTitle>Удалить материал?</DialogTitle>
        <DialogContent>
          <DialogContentText>Вы уверены, что хотите удалить этот материал из заявки?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRemoveMaterialDialog(false)}>Отмена</Button>
          <Button color="error" onClick={confirmRemoveMaterial} startIcon={<DeleteIcon />}>Удалить</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openWarehouseDialog} onClose={() => setOpenWarehouseDialog(false)}>
        <DialogTitle>Создать новый склад</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Название склада"
            type="text"
            fullWidth
            value={newWarehouse}
            onChange={e => setNewWarehouse(e.target.value)}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setOpenWarehouseDialog(false);
            setNewWarehouse('');
          }}>
            Отмена
          </Button>
          <Button onClick={async () => {
            if (newWarehouse.trim() && request.project?.id) {
              try {
                const res = await api.post('/api/warehouses', { 
                  name: newWarehouse, 
                  projectId: request.project.id 
                });
                setWarehouses(prev => [...prev, res.data]);
                handleSelectChange('warehouse', res.data.id);
                setRequest(r => ({ ...r, warehouse: res.data }));
                setNewWarehouse('');
                setOpenWarehouseDialog(false);
              } catch (error) {
                console.error('Ошибка при создании склада:', error);
                alert('Ошибка при создании склада');
              }
            }
          }}>
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openCharacteristicDialog} onClose={() => setOpenCharacteristicDialog(false)}>
        <DialogTitle>Создать характеристику</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Название характеристики"
            type="text"
            fullWidth
            value={newCharacteristic}
            onChange={e => setNewCharacteristic(e.target.value)}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setOpenCharacteristicDialog(false);
            setNewCharacteristic('');
          }}>
            Отмена
          </Button>
          <Button onClick={async () => {
            if (newCharacteristic.trim()) {
              try {
                const res = await api.post('/api/characteristics', { 
                  name: newCharacteristic
                });
                setCharacteristics(prev => [...prev, res.data]);
                if (characteristicMaterialIdx !== null) {
                handleMaterialChange(characteristicMaterialIdx, 'characteristics', res.data.name);
                }
                setNewCharacteristic('');
                setOpenCharacteristicDialog(false);
              } catch (error) {
                console.error('Ошибка при создании характеристики:', error);
                alert('Ошибка при создании характеристики');
              }
            }
          }}>
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openImportDialog} onClose={() => setOpenImportDialog(false)}>
        <DialogTitle>Подтверждение импорта</DialogTitle>
        <DialogContent>
          {pendingImportData && (
            <>
              <Typography variant="subtitle2">Организация: {pendingImportData.organizationName || 'Не указана'}</Typography>
              <Typography variant="subtitle2">Проект: {pendingImportData.projectName || 'Не указан'}</Typography>
              <Typography variant="subtitle2">Склад: {pendingImportData.sklad || 'Не указан'}</Typography>
              <Typography variant="subtitle2">Заявитель: {pendingImportData.applicant || 'Не указан'}</Typography>
              <Typography variant="subtitle2">Дата: {pendingImportData.date ? (new Date(pendingImportData.date).toLocaleDateString('ru-RU')) : 'Не указана'}</Typography>
              <Typography variant="subtitle2">Номер заявки: {pendingImportData.requestNumber || 'Не указан'}</Typography>
              <Typography variant="subtitle2">Материалов: {pendingImportData.materials?.length || 0}</Typography>
              {hasSavedMapping && (
                <Typography variant="subtitle2" color="success.main" sx={{ mt: 1 }}>
                  ✓ Найдены сохраненные соответствия столбцов
                </Typography>
              )}
              {(importWillCreate.project || importWillCreate.warehouse || importWillCreate.workTypes.length > 0 || importWillCreate.characteristics.length > 0 || importWillCreate.units.length > 0 || importWillCreate.estimateUnits.length > 0 || importWillCreate.materials.length > 0) && (
                <Box mt={2}>
                  <Typography variant="subtitle2" color="primary">Будут созданы новые справочники:</Typography>
                  <ul style={{marginTop: 4, marginBottom: 0, paddingLeft: 20}}>
                    {importWillCreate.project && <li>Проект: <b>{importWillCreate.project}</b></li>}
                    {importWillCreate.warehouse && <li>Склад: <b>{importWillCreate.warehouse}</b></li>}
                    {importWillCreate.workTypes.map(w => <li key={w}>Вид работ: <b>{w}</b></li>)}
                    {importWillCreate.characteristics.map(c => <li key={c}>Характеристика: <b>{c}</b></li>)}
                    {importWillCreate.units.map(u => <li key={u}>Ед. изм.: <b>{u}</b></li>)}
                    {importWillCreate.estimateUnits.map(u => <li key={u}>Ед. изм.(смета): <b>{u}</b></li>)}
                    {importWillCreate.materials.map(m => <li key={m}>Материал (смета): <b>{m}</b></li>)}
                  </ul>
                </Box>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenImportDialog(false)}>Отмена</Button>
          <Button
            onClick={() => setShowHeaderMappingDialog(true)} 
            variant="outlined"
            sx={{ mr: 1 }}
          >
            Соответствия
          </Button>
          <Button onClick={handleImportConfirm} variant="contained">Импортировать</Button>
        </DialogActions>
      </Dialog>



      <Dialog open={confirmCreateTender} onClose={() => setConfirmCreateTender(false)}>
        <DialogTitle>Создать тендер?</DialogTitle>
        <DialogContent>
          <DialogContentText>Вы уверены, что хотите создать тендер по этой заявке? После создания статус заявки изменится на "Тендер".</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmCreateTender(false)}>Отмена</Button>
          <Button color="success" onClick={() => { setConfirmCreateTender(false); handleCreateTender(); }}>Создать</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!missingCompanyName} onClose={() => setMissingCompanyName(null)}>
        <DialogTitle>Организация не найдена</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Организация <b>{missingCompanyName}</b> не найдена в базе.<br/>
            Создать новую организацию?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMissingCompanyName(null)}>Отмена</Button>
          <Button
            onClick={() => {
              window.open(`/reference/counterparties/new?shortName=${encodeURIComponent(missingCompanyName || '')}`, '_blank');
              setMissingCompanyName(null);
            }}
            variant="contained"
          >
            Создать
          </Button>
        </DialogActions>
      </Dialog>

      {showHeaderMappingDialog && (
        <Dialog open={showHeaderMappingDialog} onClose={() => setShowHeaderMappingDialog(false)}>
          <DialogTitle>Настройка соответствия столбцов Excel</DialogTitle>
          <DialogContent>
            {[
              { key: 'materialName', label: 'Наименование материала (смета)' },
              { key: 'supplierMaterialName', label: 'Наименование в заявке' },
              { key: 'characteristics', label: 'Характеристики (смета)' },
              { key: 'quantity', label: 'Кол-во' },
              { key: 'estimateQuantity', label: 'Кол-во (смета)' },
              { key: 'unit', label: 'Ед. изм.' },
              { key: 'estimateUnit', label: 'Ед. изм. (смета)' },
              { key: 'note', label: 'Примечание' },
              { key: 'deliveryDate', label: 'Поставить к дате' },
              { key: 'workType', label: 'Вид работ' },
              { key: 'estimatePrice', label: 'Цена (смета)' },
              { key: 'materialLink', label: 'Ссылка' },
            ].map(field => (
              <FormControl fullWidth sx={{ mt: 2 }} key={field.key}>
                <InputLabel>{field.label}</InputLabel>
                <Select
                  value={customHeaderMapping[field.key] ?? ''}
                  label={field.label}
                  onChange={e => setCustomHeaderMapping(prev => ({ ...prev, [field.key]: e.target.value === '' ? '' : Number(e.target.value) }))}
                >
                  <MenuItem value={''}>Не импортировать</MenuItem>
                  {importHeaders.map((h, idx) => (
                    <MenuItem value={idx} key={idx}>{h}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            ))}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowHeaderMappingDialog(false)}>Отмена</Button>
            <Button onClick={async () => {
              try {
                const token = localStorage.getItem('token');
                if (token) {
                  const payload = JSON.parse(atob(token.split('.')[1]));
                  const userId = payload.userId;
                  const companyId = payload.companyId;
                  
                  if (userId && companyId) {
                    await saveImportColumnMapping({
                      userId,
                      companyId,
                      mappingJson: JSON.stringify(customHeaderMapping)
                    });
                  }
                }
              } catch (error) {
                console.error('Ошибка при сохранении mapping:', error);
              }
              setShowHeaderMappingDialog(false);
            }} variant="contained">Сохранить</Button>
          </DialogActions>
        </Dialog>
      )}
      </Box>
    </Container>
  );
}