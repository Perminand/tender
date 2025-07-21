import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Paper, Typography, Box, Button, CircularProgress, TextField, MenuItem, Toolbar, Dialog, DialogTitle, DialogActions,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Grid, DialogContent, DialogContentText, Container, InputAdornment, IconButton
} from '@mui/material';
import { api } from '../utils/api';
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
  quantity?: string;
  unit?: Unit | null;
  note?: string;
  deliveryDate?: string;
  workType?: string;
  supplierMaterialName?: string;
  estimatePrice?: string;
  materialLink?: string;
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

  const [supplierNamesOptions, setSupplierNamesOptions] = useState<string[][]>([]);

  const defaultWidths = [40, 120, 120, 400, 400, 100, 100, 100, 180, 180, 100, 100];
  const [colWidths, setColWidths] = useState<number[]>(defaultWidths);
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

  const [importWillCreate, setImportWillCreate] = useState<{project?: string, warehouse?: string, workTypes: string[], characteristics: string[], units: string[]}>({workTypes:[], characteristics:[], units:[]});

  const [missingMaterialIdx, setMissingMaterialIdx] = useState<number | null>(null);
  const [missingCompanyName, setMissingCompanyName] = useState<string | null>(null);

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
          setRequest({
            ...requestData,
            materials: (requestData.requestMaterials || []).map((mat: any) => ({
              ...mat,
              workType: typeof mat.workType === 'object' && mat.workType !== null ? mat.workType.id : (mat.workType || ''),
              characteristics: mat.size || mat.characteristics || '',
              materialLink: mat.materialLink || ''
            }))
          });
        })
        .finally(() => setLoading(false));
    }
  }, [id, isEdit]);

  useEffect(() => {
    // Загружать supplierNames для каждого материала последовательно сверху вниз
    const loadSupplierNamesSequentially = async () => {
      const newSupplierNamesOptions: string[][] = [];
      
      for (let idx = 0; idx < (request.materials || []).length; idx++) {
        const mat = request.materials[idx];
        if (mat.material?.id && request.organization?.id) {
          try {
            const res = await api.get('/api/supplier-material-names/by-material-and-supplier', {
              params: { materialId: mat.material.id, supplierId: request.organization.id }
            });
            const supplierNames = res.data.map((n: any) => n.name);
            
            // Если есть названия поставщиков и поле supplierMaterialName пустое, заполняем первым значением
            // НО только если это не импортированные данные
            if (supplierNames.length > 0 && !mat.supplierMaterialName && mat.material && !mat.isImported) {
              setRequest(prevRequest => {
                const newMaterials = [...(prevRequest.materials || [])];
                newMaterials[idx].supplierMaterialName = supplierNames[0];
                return { ...prevRequest, materials: newMaterials };
              });
            }
            
            newSupplierNamesOptions[idx] = supplierNames;
          } catch (error: any) {
            console.error('Ошибка при загрузке названий поставщиков:', error);
            newSupplierNamesOptions[idx] = [];
          }
        } else {
          newSupplierNamesOptions[idx] = [];
        }
        
        // Добавляем небольшую задержку между запросами для предотвращения перегрузки
        if (idx < (request.materials || []).length - 1) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
      
      setSupplierNamesOptions(newSupplierNamesOptions);
    };
    
    loadSupplierNamesSequentially();
  }, [(request.materials || []).map(m => m.material?.id).join(), request.organization?.id]);

  // Перезагружаем названия поставщиков при изменении организации
  useEffect(() => {
    if (request.organization?.id) {
      // Очищаем названия поставщиков при смене организации только для материалов без выбранного материала
      // НО сохраняем импортированные значения
      setRequest(prevRequest => {
        const newMaterials = (prevRequest.materials || []).map(mat => ({
          ...mat,
          // Сохраняем supplierMaterialName если он был установлен (например, при импорте)
          // Очищаем только если материал не выбран, поле было пустым и это не импортированный материал
          supplierMaterialName: mat.material ? (mat.supplierMaterialName || '') : 
            (mat.isImported ? (mat.supplierMaterialName || '') : '')
        }));
        return { ...prevRequest, materials: newMaterials };
      });
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
    const newMaterials = [...(request.materials || [])];
    if (field === 'workType') {
      // Сохраняем только id workType
      newMaterials[idx].workType = value;
    } else if (field === 'material') {
      const selectedMaterial = materials.find(m => m.id === value) || null;
      newMaterials[idx].material = selectedMaterial;
      
      if (value && request.organization?.id) {
        api.get('/api/supplier-material-names/by-material-and-supplier', {
          params: { materialId: value, supplierId: request.organization.id }
        })
          .then(res => {
            const supplierNames = res.data.map((n: any) => n.name);
            if (supplierNames.length > 0) {
              setRequest(prevRequest => {
                const updatedMaterials = [...(prevRequest.materials || [])];
                // Заполняем только если поле пустое и материал был выбран пользователем (не импортирован)
                if (!updatedMaterials[idx].supplierMaterialName && updatedMaterials[idx].material && !updatedMaterials[idx].isImported) {
                  updatedMaterials[idx].supplierMaterialName = supplierNames[0];
                }
                return { ...prevRequest, materials: updatedMaterials };
              });
            }
          })
          .catch(error => {
            console.error('Ошибка при загрузке названий поставщиков:', error);
          });
      } else if (!value) {
        // Очищаем только если материал не выбран, но сохраняем импортированные значения
        if (!newMaterials[idx].isImported) {
          newMaterials[idx].supplierMaterialName = '';
        }
      }
    } else if (field === 'unit') {
      newMaterials[idx].unit = units.find(u => u.id === value) || null;
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
        { material: null, characteristics: '', quantity: '', unit: null, note: '', deliveryDate: '', workType: '', supplierMaterialName: '', estimatePrice: '', materialLink: '', isImported: false }
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
    // Валидация: все материалы должны иметь заполненное наименование
    const missingIdx = (request.materials || []).findIndex(
      mat => (!mat.material || !mat.material.id) && mat.supplierMaterialName && mat.unit?.shortName
    );
    if (missingIdx !== -1) {
      setMissingMaterialIdx(missingIdx);
      return;
    }
    
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
    // Определяем статус для сохранения: если статус "Черновик", то меняем на "Сохранен"
    const statusToSave = request.status === 'DRAFT' ? 'SAVED' : (request.status || 'DRAFT');
    
    // Преобразуем materials обратно в requestMaterials для отправки на сервер
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
            size: mat.characteristics || '',
            quantity: mat.quantity ? parseFloat(mat.quantity) : null,
            unit: mat.unit ? { id: mat.unit.id } : null,
            note: mat.note || '',
            deliveryDate: mat.deliveryDate || '',
            supplierMaterialName: mat.supplierMaterialName || '',
            estimatePrice: mat.estimatePrice ? parseFloat(mat.estimatePrice) : null,
            materialLink: mat.materialLink || ''
          }))
        };
      
      console.log('Отправляем данные:', JSON.stringify(requestToSend, null, 2));
      console.log('requestMaterials:', JSON.stringify(requestToSend.requestMaterials, null, 2));
    
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
        // Индексы нужных колонок
        const idxMaterialName = headers.findIndex(h => (h || '').toString().trim().toLowerCase() === 'наименование материала, услуги по заявке');
        const idxCharacteristics = headers.findIndex(h => (h || '').toString().toLowerCase().includes('характерист'));
        const idxQuantity = headers.findIndex(h => (h || '').toString().toLowerCase().includes('кол-во'));
        const idxUnit = headers.findIndex(h => (h || '').toString().toLowerCase().includes('ед. изм'));
        const idxNote = headers.findIndex(h => (h || '').toString().toLowerCase().includes('примеч'));
        let idxDeliveryDate = headers.findIndex(h => (h || '').toString().toLowerCase().includes('поставить к дате'));
        if (idxDeliveryDate === -1) {
          idxDeliveryDate = headers.findIndex(h => (h || '').toString().toLowerCase().includes('поставк') || (h || '').toString().toLowerCase().includes('дата'));
        }
        const idxWorkType = headers.findIndex(h => (h || '').toString().toLowerCase().includes('вид работ'));
        const idxEstimatePrice = headers.findIndex(h => (h || '').toString().toLowerCase().includes('сметн'));
        const idxMaterialLink = headers.findIndex(h => (h || '').toString().toLowerCase().includes('ссылка'));

        const importedMaterials = [];
        for (let i = 0; i < dataRows.length; i++) {
          const row = dataRows[i] as any[];
          if (!row[idxMaterialName]) continue;
          const materialName = row[idxMaterialName] || '';
          const foundMaterial = materials.find(
            m => m.name.trim().toLowerCase() === materialName.trim().toLowerCase()
          );
          // Преобразовать дату поставки (deliveryDate)
          let deliveryDateValue = idxDeliveryDate !== -1 ? row[idxDeliveryDate] || '' : '';
          if (typeof deliveryDateValue === 'number' || /^\d+$/.test(deliveryDateValue)) {
            deliveryDateValue = excelDateToISO(Number(deliveryDateValue));
          } else if (typeof deliveryDateValue === 'string') {
            deliveryDateValue = parseDateString(deliveryDateValue);
          }
          importedMaterials.push({
            material: foundMaterial ? foundMaterial : null,
            supplierMaterialName: materialName,
            characteristics: idxCharacteristics !== -1 ? row[idxCharacteristics] || '' : '',
            quantity: idxQuantity !== -1 ? row[idxQuantity] || '' : '',
            unit: idxUnit !== -1 ? row[idxUnit] || '' : '',
            note: idxNote !== -1 ? row[idxNote] || '' : '',
            deliveryDate: deliveryDateValue,
            workType: idxWorkType !== -1 ? row[idxWorkType] || '' : '',
            estimatePrice: idxEstimatePrice !== -1 ? row[idxEstimatePrice] || '' : '',
            materialLink: idxMaterialLink !== -1 ? row[idxMaterialLink] || '' : '',
            isImported: true, // Помечаем как импортированный материал
          });
        }

        // ШАГ 5: Если организация выбрана, ищем соответствия через org_supplier_material_mapping для не найденных материалов
        setImportStep('mapping');
        if (orgObj) {
          for (const mat of importedMaterials) {
            if (!mat.material && mat.supplierMaterialName) {
              try {
                const res = await api.get('/api/org-supplier-material-mapping', {
                  params: { organizationId: orgObj.id, supplierName: mat.supplierMaterialName }
                });
                if (res.data && res.data.materialId) {
                  const foundMaterial = materials.find(m => m.id === res.data.materialId);
                  if (foundMaterial) {
                    mat.material = foundMaterial;
                  }
                }
                // Добавляем небольшую задержку между запросами для больших файлов
                await new Promise(resolve => setTimeout(resolve, 50));
              } catch (e: any) {
                // Игнорируем ошибки 404 и другие ошибки API
                if (e.response && e.response.status !== 404) {
                  console.warn('Ошибка при поиске маппинга материала:', e.message);
                }
              }
            }
          }
        }

        // ШАГ 6: Парсинг даты заявки
        let parsedDate = '';
        if (typeof date === 'number' || /^\d+$/.test(date)) {
          parsedDate = excelDateToISO(Number(date));
        } else if (typeof date === 'string') {
          parsedDate = parseDateString(date);
        }

        setImportStep('done');
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
    setImportWillCreate({
      project: missingProject,
      warehouse: missingWarehouse,
      workTypes: missingWorkTypes,
      characteristics: missingChars,
      units: missingUnits
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
    // Интеграция данных
    setRequest(prev => ({
      ...prev,
      organization: pendingImportData.organizationObj || prev.organization,
      requestNumber: pendingImportData.requestNumber || prev.requestNumber,
      date: pendingImportData.date || prev.date,
      applicant: pendingImportData.applicant || prev.applicant,
      project: projectObj || prev.project,
      warehouse: warehouseObj || prev.warehouse,
      materials: (pendingImportData.materials || []).map((mat: any) => {
        // workType, characteristics, unit — ищем среди новых и старых
        let workTypeObj = workTypes.find(w => w.name.trim().toLowerCase() === (mat.workType || '').trim().toLowerCase()) || workTypeMap[mat.workType];
        let charObj = characteristics.find(c => c.name.trim().toLowerCase() === (mat.characteristics || '').trim().toLowerCase()) || charMap[mat.characteristics];
        let unitObj = units.find(u => u.shortName.trim().toLowerCase() === (mat.unit || '').trim().toLowerCase()) || unitMap[mat.unit];
        return {
          ...mat,
          workType: workTypeObj ? workTypeObj.id : '',
          characteristics: charObj ? charObj.name : '',
          unit: unitObj ? unitObj : null,
        };
      })
    }));
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
        console.log('Material created:', { name, id });
        
        // Обновляем список материалов
        fetchMaterials();
        
        setRequest(prev => {
          const newMaterials = prev.materials.map(mat => {
            const normalize = (str: string) => (str || '').replace(/\s+/g, '').toLowerCase();
            
            // Случай 1: Материал был создан через импорт (есть supplierMaterialName, но нет material)
            if (!mat.material && mat.supplierMaterialName && normalize(mat.supplierMaterialName) === normalize(name)) {
              console.log('Updating material from import:', mat);
              return {
                ...mat,
                material: { id, name },
              };
            }
            
            // Случай 2: Материал был создан через Autocomplete (material.id === 'CREATE_NEW' или material.name содержит "Создать")
            if ((mat.material?.id === 'CREATE_NEW' || mat.material?.name?.startsWith('Создать "')) && 
                normalize(mat.material.name.replace(/^Создать "/, '').replace(/"$/, '')) === normalize(name)) {
              console.log('Updating material from Autocomplete:', mat);
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
        <TableContainer component={Paper} sx={{ mb: 2, overflowX: 'auto', width: '100%' }}>
          <Table size="small" sx={{ minWidth: 1200, width: 'max-content' }}>
            <TableHead>
              <TableRow>
                  {['#','Вид работ','Наименование материала','Характеристики','Наименование в заявке','Кол-во','Ед. изм.','Сметная цена','Сметная стоимость','Ссылка','Примечание','Поставить к дате','Действия'].map((label, idx) => (
                  <TableCell
                    key={label}
                    sx={{ position: 'relative', width: colWidths[idx], minWidth: 40, maxWidth: 800, userSelect: 'none', whiteSpace: 'nowrap' }}
                  >
                    {label}
                    {idx !== 0 && idx !== 12 && (
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
            const estimateTotal = (parseFloat(mat.estimatePrice || '0') * parseFloat(mat.quantity || '0')).toFixed(2);
            return (
                <TableRow key={idx}>
                  <TableCell>{idx + 1}</TableCell>
                  <TableCell sx={{ width: 'auto', whiteSpace: 'nowrap' }}>
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
                  <TableCell sx={{ minWidth: 180, maxWidth: 300 }}>
                  <Autocomplete<MaterialOption>
                    value={materials.find(m => m.id === mat.material?.id) || null}
                    onChange={(_, value) => {
                      if (value && (value.inputValue || value.name?.startsWith('Создать "'))) {
                        // Открыть MaterialEditPage с передачей наименования
                        const nameToCreate = value.inputValue || (typeof value.name === 'string' && value.name.replace(/^Создать "/, '').replace(/"$/, ''));
                        if (nameToCreate) {
                          window.open(`/reference/materials/new?name=${encodeURIComponent(nameToCreate)}`, '_blank');
                        }
                        return;
                      }
                      handleMaterialChange(idx, 'material', value ? value.id : '');
                    }}
                    filterOptions={(options, params) => {
                      const filtered = options.filter(option =>
                        option.name.toLowerCase().includes(params.inputValue.toLowerCase())
                      );
                      if (
                        params.inputValue !== '' &&
                        !options.some(option => option.name.toLowerCase() === params.inputValue.toLowerCase())
                      ) {
                        filtered.push({
                          id: 'CREATE_NEW',
                          inputValue: params.inputValue,
                          name: `Создать "${params.inputValue}"`
                        });
                      }
                      return filtered;
                    }}
                    selectOnFocus
                    clearOnBlur
                    handleHomeEndKeys
                    options={materials as MaterialOption[]}
                    getOptionLabel={option => {
                      if (typeof option === 'string') return option;
                      if (option.inputValue) return option.name; // Возвращаем name, а не inputValue
                      return option.name;
                    }}
                    renderInput={params => (
                      <TextField {...params} size="small" label="Наименование материала" InputLabelProps={{ shrink: true }} />
                    )}
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                  />
                </TableCell>
                <TableCell>
                  <Autocomplete
                    value={characteristics.find(c => c.name === mat.characteristics) || null}
                    onChange={(_, value) => {
                      if (value && value.id === 'CREATE_NEW') {
                        setNewCharacteristic(value.name.replace(/^Создать "/, '').replace(/"$/, ''));
                        setCharacteristicMaterialIdx(idx);
                        setOpenCharacteristicDialog(true);
                      } else {
                        handleMaterialChange(idx, 'characteristics', value ? value.name : '');
                      }
                    }}
                    options={characteristics}
                    filterOptions={(options, state) => {
                      const filtered = options.filter(option =>
                        option.name.toLowerCase().includes(state.inputValue.toLowerCase())
                      );
                      if (state.inputValue && filtered.length === 0) {
                        return [{ id: 'CREATE_NEW', name: `Создать "${state.inputValue}"` }];
                      }
                      return filtered;
                    }}
                    getOptionLabel={(option: Characteristic) => option ? option.name : ''}
                    isOptionEqualToValue={(option: Characteristic, value: Characteristic) => option.id === value.id}
                    renderInput={params => (
                      <TextField {...params} size="small" label="Характеристики" />
                    )}
                  />
                  </TableCell>
                  <TableCell sx={{ minWidth: 180, maxWidth: 300 }}>
                    <Autocomplete
                      freeSolo
                      value={mat.supplierMaterialName || ''}
                    onChange={async (_, value) => handleSupplierMaterialNameChange(idx, value || '')}
                    onInputChange={(_, value) => handleSupplierMaterialNameChange(idx, value || '')}
                    options={supplierNamesOptions[idx] || []}
                      renderInput={params => (
                        <TextField {...params} size="small" label="Наименование в заявке" InputLabelProps={{ shrink: true }} />
                      )}
                      filterOptions={(options, state) => {
                        if (!state.inputValue) return options;
                        return options.filter(opt => opt === state.inputValue);
                      }}
                  />
                  </TableCell>
                <TableCell>
                  <TextField
                    size="small"
                    label="Кол-во"
                    value={mat.quantity || ''}
                    onChange={e => handleMaterialChange(idx, 'quantity', e.target.value)}
                    type="number"
                    fullWidth
                  />
                  </TableCell>
                <TableCell>
                  <TextField
                    select
                    size="small"
                    label="Ед. изм."
                    value={mat.unit?.id || ''}
                    onChange={e => handleMaterialChange(idx, 'unit', e.target.value)}
                    fullWidth
                  >
                    {units.map(u => (
                      <MenuItem key={u.id} value={u.id}>{u.shortName}</MenuItem>
                    ))}
                  </TextField>
                  </TableCell>
                <TableCell>
                  <TextField
                    size="small"
                    label="Сметная цена"
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
                    fullWidth
                    error={mat.estimatePrice !== undefined && mat.estimatePrice !== '' && parseFloat(mat.estimatePrice) <= 0}
                    helperText={mat.estimatePrice !== undefined && mat.estimatePrice !== '' && parseFloat(mat.estimatePrice) <= 0 ? 'Цена должна быть больше 0' : ''}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    size="small"
                    label="Сметная стоимость"
                    value={estimateTotal}
                    InputProps={{ readOnly: true }}
                    fullWidth
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    size="small"
                    label="Ссылка"
                    value={mat.materialLink || ''}
                    onChange={e => handleMaterialChange(idx, 'materialLink', e.target.value)}
                    fullWidth
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    size="small"
                      label="Примечание"
                    value={mat.note || ''}
                    onChange={e => handleMaterialChange(idx, 'note', e.target.value)}
                    fullWidth
                      InputLabelProps={{ shrink: true }}
                  />
                  </TableCell>
                <TableCell>
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
                  <TableCell>
                    <Button color="error" size="small" onClick={() => handleRemoveMaterial(idx)}>
                    Удалить
                  </Button>
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
            <Button variant="outlined" color="success" onClick={() => setConfirmCreateTender(true)} sx={{ ml: 1 }}>
              Создать тендер
            </Button>
            <Button variant="outlined" color="error" onClick={() => setConfirmDelete(true)} sx={{ ml: 1 }}>
            Удалить
          </Button>
          </>
        )}
      </Box>
      <Dialog open={confirmDelete} onClose={() => setConfirmDelete(false)}>
        <DialogTitle>Удалить заявку?</DialogTitle>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(false)}>Отмена</Button>
          <Button color="error" onClick={handleDelete}>Удалить</Button>
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
              console.log('[IMPORT][UNIT] Единица измерения создана:', newUnitName);
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
          <Button color="error" onClick={confirmRemoveMaterial}>Удалить</Button>
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
              {(importWillCreate.project || importWillCreate.warehouse || importWillCreate.workTypes.length > 0 || importWillCreate.characteristics.length > 0 || importWillCreate.units.length > 0) && (
                <Box mt={2}>
                  <Typography variant="subtitle2" color="primary">Будут созданы новые справочники:</Typography>
                  <ul style={{marginTop: 4, marginBottom: 0, paddingLeft: 20}}>
                    {importWillCreate.project && <li>Проект: <b>{importWillCreate.project}</b></li>}
                    {importWillCreate.warehouse && <li>Склад: <b>{importWillCreate.warehouse}</b></li>}
                    {importWillCreate.workTypes.map(w => <li key={w}>Вид работ: <b>{w}</b></li>)}
                    {importWillCreate.characteristics.map(c => <li key={c}>Характеристика: <b>{c}</b></li>)}
                    {importWillCreate.units.map(u => <li key={u}>Ед. изм.: <b>{u}</b></li>)}
                  </ul>
                </Box>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenImportDialog(false)}>Отмена</Button>
          <Button onClick={handleImportConfirm} variant="contained">Импортировать</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={missingMaterialIdx !== null} onClose={() => setMissingMaterialIdx(null)}>
        <DialogTitle>Создать новый материал?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Для строки №{missingMaterialIdx !== null ? missingMaterialIdx + 1 : ''} не выбран материал, но заполнено "Наименование в заявке" и "Ед. изм.".<br/>
            Создать новый материал с этими данными?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMissingMaterialIdx(null)}>Отмена</Button>
          <Button
            onClick={() => {
              if (missingMaterialIdx === null) return;
              const mat = request.materials[missingMaterialIdx];
              window.open(`/reference/materials/new?name=${encodeURIComponent(mat.supplierMaterialName || '')}&unit=${encodeURIComponent(mat.unit?.shortName || '')}`, '_blank');
              setMissingMaterialIdx(null);
            }}
            variant="contained"
          >
            Создать
          </Button>
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
      </Box>
    </Container>
  );
}