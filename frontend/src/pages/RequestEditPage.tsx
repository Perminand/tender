import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Paper, Typography, Box, Button, CircularProgress, TextField, MenuItem, Toolbar, Dialog, DialogTitle, DialogActions,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Grid, DialogContent, DialogContentText, Container, InputAdornment, IconButton
} from '@mui/material';
import axios from 'axios';
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
  { value: 'SENT', label: 'Отправлена' },
  { value: 'APPROVED', label: 'Одобрена' },
  { value: 'REJECTED', label: 'Отклонена' },
];

const getToday = () => {
  const d = new Date();
  return d.toISOString().slice(0, 10);
};

export default function RequestEditPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [request, setRequest] = useState<RequestDto>({ materials: [], date: getToday() });
  const [confirmDelete, setConfirmDelete] = useState(false);

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

  const [pendingImportData, setPendingImportData] = useState<any | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCounterparties, setFilteredCounterparties] = useState<any[]>([]);

  const [projectNameFromImport, setProjectNameFromImport] = useState<string | null>(null);

  const [pendingImportMaterials, setPendingImportMaterials] = useState<any[] | null>(null);
  const [pendingImportMaterialIndex, setPendingImportMaterialIndex] = useState<number>(4);
  const [pendingImportedMaterials, setPendingImportedMaterials] = useState<any[]>([]);

  const [newUnitName, setNewUnitName] = useState('');
  const [openUnitDialog, setOpenUnitDialog] = useState(false);

  const [openRemoveMaterialDialog, setOpenRemoveMaterialDialog] = useState(false);
  const [removeMaterialIdx, setRemoveMaterialIdx] = useState<number | null>(null);

  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [openWarehouseDialog, setOpenWarehouseDialog] = useState(false);
  const [newWarehouse, setNewWarehouse] = useState('');

  const [openImportDialog, setOpenImportDialog] = useState(false);

  const [characteristics, setCharacteristics] = useState<Characteristic[]>([]);
  const [openCharacteristicDialog, setOpenCharacteristicDialog] = useState(false);
  const [newCharacteristic, setNewCharacteristic] = useState('');
  const [characteristicMaterialIdx, setCharacteristicMaterialIdx] = useState<number | null>(null);

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

  useEffect(() => {
    axios.get('/api/companies').then(res => setCompanies(res.data));
    axios.get('/api/projects').then(res => setProjects(res.data));
    axios.get('/api/materials').then(res => setMaterials(res.data));
    axios.get('/api/units').then(res => setUnits(res.data));
    axios.get('/api/work-types').then(res => setWorkTypes(res.data));
    axios.get('/api/warehouses').then(res => setWarehouses(res.data));
    axios.get('/api/characteristics').then(res => setCharacteristics(res.data));
  }, []);

  useEffect(() => {
    if (isEdit) {
      setLoading(true);
      axios.get(`/api/requests/${id}`)
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
            const res = await axios.get('/api/supplier-material-names/by-material-and-supplier', {
              params: { materialId: mat.material.id, supplierId: request.organization.id }
            });
            const supplierNames = res.data.map((n: any) => n.name);
            
            // Если есть названия поставщиков и поле supplierMaterialName пустое, заполняем первым значением
            if (supplierNames.length > 0 && !mat.supplierMaterialName) {
              setRequest(prevRequest => {
                const newMaterials = [...(prevRequest.materials || [])];
                newMaterials[idx].supplierMaterialName = supplierNames[0];
                return { ...prevRequest, materials: newMaterials };
              });
            }
            
            newSupplierNamesOptions[idx] = supplierNames;
          } catch (error) {
            console.error('Ошибка при загрузке названий поставщиков:', error);
            newSupplierNamesOptions[idx] = [];
          }
        } else {
          newSupplierNamesOptions[idx] = [];
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
      setRequest(prevRequest => {
        const newMaterials = (prevRequest.materials || []).map(mat => ({
          ...mat,
          supplierMaterialName: mat.material ? (mat.supplierMaterialName || '') : ''
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
        axios.get('/api/supplier-material-names/by-material-and-supplier', {
          params: { materialId: value, supplierId: request.organization.id }
        })
          .then(res => {
            const supplierNames = res.data.map((n: any) => n.name);
            if (supplierNames.length > 0) {
              setRequest(prevRequest => {
                const updatedMaterials = [...(prevRequest.materials || [])];
                // Заполняем только если поле пустое
                if (!updatedMaterials[idx].supplierMaterialName) {
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
        // Очищаем только если материал не выбран
        newMaterials[idx].supplierMaterialName = '';
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
        { material: null, characteristics: '', quantity: '', unit: null, note: '', deliveryDate: '', workType: '', supplierMaterialName: '', estimatePrice: '', materialLink: '' }
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
    const emptyNames = (request.materials || []).some(mat => !mat.material || !mat.material.id);
    if (emptyNames) {
      alert('Пожалуйста, заполните поле "Наименование материала" для всех строк.');
      return;
    }
    setLoading(true);
    
    try {
      // Преобразуем materials обратно в requestMaterials для отправки на сервер
              const requestToSend = {
          ...request,
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
      
      console.log('Отправляем данные:', requestToSend);
      
      if (isEdit) {
        await axios.put(`/api/requests/${id}`, requestToSend);
      } else {
        await axios.post('/api/requests', requestToSend);
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
      await axios.delete(`/api/requests/${id}`);
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

  const handleImportConfirm = async () => {
    const importData = pendingImportData;
    console.log('[IMPORT] handleImportConfirm', importData);
    let newOrganization = request.organization;
    let newProject = request.project;
    let needWait = false;
    
    // Обрабатываем организацию
    if (importData.organizationName) {
      const normalize = (str: any) => (str || '').trim().toLowerCase();
      console.log('[IMPORT] Ищем организацию:', importData.organizationName);
      console.log('[IMPORT] Список компаний:', companies);
      let existingOrg = companies.find(c => normalize(c.legalName) === normalize(importData.organizationName));
      console.log('[IMPORT] Поиск по legalName:', existingOrg);
      if (!existingOrg) {
        existingOrg = companies.find(c => normalize(c.shortName) === normalize(importData.organizationName));
        console.log('[IMPORT] Поиск по shortName:', existingOrg);
      }
      if (!existingOrg) {
        existingOrg = companies.find(c => normalize(c.name) === normalize(importData.organizationName));
        console.log('[IMPORT] Поиск по name:', existingOrg);
      }
      if (existingOrg) {
        console.log('[IMPORT] Найдена организация:', existingOrg);
        newOrganization = existingOrg;
      } else {
        console.log('[IMPORT] Организация не найдена, будет создана:', importData.organizationName);
        setNewCompany(importData.organizationName);
        setOpenCompanyDialog(true);
        needWait = true;
      }
    }
    
    // Обрабатываем проект
    if (importData.projectName) {
      const existingProject = projects.find(p => p.name === importData.projectName);
      if (existingProject) {
        newProject = existingProject;
      } else {
        setNewProject(importData.projectName);
        setOpenProjectDialog(true);
        needWait = true;
      }
    }
    
    // Если нужно ждать создания организации или проекта, не продолжаем импорт!
    if (needWait) {
      setPendingImportData(importData);
      return;
    }
    
    // --- Новый маппинг материалов ---
    const newMaterials = await Promise.all(importData.materials.map(async (row: any) => {
      let material: Material | null = null;
      if (row.supplierName && newOrganization?.id) {
        try {
          // Убираем вызов org-supplier-material-mapping, так как он возвращает 400
          // const res = await axios.get('/api/org-supplier-material-mapping', {
          //   params: { organizationId: newOrganization.id, supplierName: row.supplierName }
          // });
          // if (res.data && res.data.material) {
          //   material = res.data.material;
          // }
        } catch {}
      }
      if (!material && row.materialName) {
        material = materials.find(m => m.name === row.materialName) || null;
      }
      
      return {
        material: material,
        characteristics: row.characteristics || '',
        quantity: row.quantity || '',
        unit: units.find(u => u.shortName === row.unit) || null,
        note: row.note || '',
        deliveryDate: row.deliveryDate || '',
        workType: row.workType || '',
        supplierMaterialName: row.supplierMaterialName || '',
        estimatePrice: row.estimatePrice || '',
        materialLink: row.materialLink || '',
      };
    }));
    
    setRequest({
      ...request,
      organization: newOrganization,
      project: newProject,
      materials: newMaterials
    });
    
    setPendingImportData(null);
  };

  const handleExcelImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

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

        const headers = jsonData[0] as string[];
        console.log('Заголовки:', headers);

        // Нормализация заголовков
      const normalize = (str: any) => (str || '').trim().toLowerCase();

      function getColIndex(...names: string[]): number | undefined {
        for (const name of names) {
            const index = headers.findIndex(h => normalize(h) === normalize(name));
            if (index !== -1) return index;
        }
        return undefined;
      }

        // Проверяем наличие обязательных колонок
        const idxOrganization = getColIndex('организация', 'поставщик');
        const idxProject = getColIndex('проект', 'объект');
        const idxMaterial = getColIndex('материал', 'наименование', 'наименование материала');
        const idxQuantity = getColIndex('количество', 'кол-во');
        const idxUnit = getColIndex('единица измерения', 'ед.изм', 'единица');

        if (idxOrganization === undefined || idxProject === undefined || idxMaterial === undefined) {
          alert('В файле должны быть колонки: Организация, Проект, Материал');
        return;
      }

        const importData = {
          organizationName: '',
          projectName: '',
          materials: [] as any[]
        };

        // Обрабатываем первую строку данных для получения организации и проекта
        if (jsonData.length > 1) {
          const firstRow = jsonData[1] as any[];
          if (idxOrganization !== undefined) {
            importData.organizationName = String(firstRow[idxOrganization] || '').trim();
          }
          if (idxProject !== undefined) {
            importData.projectName = String(firstRow[idxProject] || '').trim();
          }
        }

        // Обрабатываем все строки данных
        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i] as any[];
          if (row.length === 0) continue;

          const materialName = idxMaterial !== undefined ? String(row[idxMaterial] || '').trim() : '';
          if (!materialName) continue;

          const material = {
            materialName: materialName,
            characteristics: getColIndex('характеристики', 'характеристика') !== undefined ? String(row[getColIndex('характеристики', 'характеристика')!] || '') : '',
            quantity: idxQuantity !== undefined ? String(row[idxQuantity] || '') : '',
            unit: idxUnit !== undefined ? String(row[idxUnit] || '') : '',
            note: getColIndex('примечание', 'примечания') !== undefined ? String(row[getColIndex('примечание', 'примечания')!] || '') : '',
            deliveryDate: getColIndex('дата поставки', 'срок поставки') !== undefined ? String(row[getColIndex('дата поставки', 'срок поставки')!] || '') : '',
            workType: getColIndex('вид работ', 'тип работ') !== undefined ? String(row[getColIndex('вид работ', 'тип работ')!] || '') : '',
            supplierMaterialName: getColIndex('наименование поставщика', 'название поставщика') !== undefined ? String(row[getColIndex('наименование поставщика', 'название поставщика')!] || '') : '',
            estimatePrice: getColIndex('сметная цена', 'цена') !== undefined ? String(row[getColIndex('сметная цена', 'цена')!] || '') : '',
            materialLink: getColIndex('ссылка на материал', 'ссылка') !== undefined ? String(row[getColIndex('ссылка на материал', 'ссылка')!] || '') : '',
            supplierName: importData.organizationName
          };

          importData.materials.push(material);
        }

        setPendingImportData(importData);
        setOpenImportDialog(true);

      } catch (error) {
        console.error('Ошибка при обработке файла:', error);
        alert('Ошибка при обработке файла');
      }
    };
    reader.readAsArrayBuffer(file);
    e.target.value = '';
  };

  const handleSupplierMaterialNameChange = async (idx: number, value: string) => {
    const newMaterials = [...(request.materials || [])];
    newMaterials[idx].supplierMaterialName = value;
    setRequest({ ...request, materials: newMaterials });
  };

  if (loading) {
    return <Box display="flex" justifyContent="center" mt={4}><CircularProgress /></Box>;
  }

  return (
    <Container maxWidth="xl" sx={{ width: '100%' }}>
      <Box sx={{ mt: 4, mb: 4 }}>
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Typography variant="h6">{isEdit ? 'Редактирование заявки' : 'Создание заявки'}</Typography>
        <Button variant="outlined" component="label">
          Импорт из Excel
          <input type="file" accept=".xlsx,.xls" hidden onChange={handleExcelImport} />
        </Button>
      </Toolbar>
      <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
        <Grid container spacing={2} sx={{ mb: 2, maxWidth: 1200, alignItems: 'center' }}>
          <Grid item xs={12} md={4}>
        <TextField
              name="requestNumber"
              label="Номер заявки"
              value={request.requestNumber || ''}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} md={4}>
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
          <Grid item xs={12} md={4}>
            <TextField
              name="applicant"
              label="Заявитель"
              value={request.applicant || ''}
              onChange={handleChange}
              required
              fullWidth
            />
          </Grid>
        </Grid>
        <Autocomplete
          value={companies.find(c => c.id === request.organization?.id) || null}
          onChange={(_, value) => {
            if (value && value.id === 'CREATE_NEW') {
              window.open('/reference/counterparties/new', '_blank');
            } else {
              handleSelectChange('organization', value ? value.id : '');
            }
          }}
          options={companies}
          filterOptions={(options, state) => {
            const filtered = options.filter(option =>
              (option.legalName || option.shortName || option.name).toLowerCase().includes(state.inputValue.toLowerCase())
            );
            if (state.inputValue && filtered.length === 0) {
              return [{ id: 'CREATE_NEW', name: `Создать "${state.inputValue}"` }];
            }
            return filtered;
          }}
          getOptionLabel={(option: Company) => option ? (option.legalName || option.shortName || option.name) : ''}
          isOptionEqualToValue={(option: Company, value: Company) => option.id === value.id}
          renderInput={params => (
            <TextField {...params} label="Организация" required />
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
                  {['#','Вид работ','Наименование материала','Характеристики','Наименование у поставщика','Кол-во','Ед. изм.','Сметная цена','Сметная стоимость','Ссылка','Примечание','Поставить к дате','Действия'].map((label, idx) => (
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
                  <Autocomplete
                    value={materials.find(m => m.id === mat.material?.id) || null}
                    onChange={(_, value) => handleMaterialChange(idx, 'material', value ? value.id : '')}
                    options={materials}
                    getOptionLabel={option => option ? option.name : ''}
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                    renderInput={params => (
                      <TextField {...params} size="small" label="Наименование материала" InputLabelProps={{ shrink: true }} />
                    )}
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
                        <TextField {...params} size="small" label="Наименование у поставщика" InputLabelProps={{ shrink: true }} />
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
                    onChange={e => handleMaterialChange(idx, 'estimatePrice', e.target.value)}
                    type="number"
                    fullWidth
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
          <Button variant="outlined" color="error" onClick={() => setConfirmDelete(true)} sx={{ ml: 2 }}>
            Удалить
          </Button>
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
                const res = await axios.post('/api/work-types', { name: newWorkType });
                setWorkTypes(prev => [...prev, res.data]);
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
                const res = await axios.post('/api/projects', { name: newProject });
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
            // Создать новую единицу через API
            const res = await axios.post('/api/units', { name: newUnitName, shortName: newUnitName });
            if (res.data && res.data.id) {
              // Обновить units
              const unitsRes = await axios.get('/api/units');
              setUnits(unitsRes.data);
              setOpenUnitDialog(false);
              console.log('[IMPORT][UNIT] Единица измерения создана:', newUnitName);
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
                const res = await axios.post('/api/warehouses', { 
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
            if (newCharacteristic.trim() && characteristicMaterialIdx !== null) {
              try {
                const res = await axios.post('/api/characteristics', { 
                  name: newCharacteristic
                });
                setCharacteristics(prev => [...prev, res.data]);
                handleMaterialChange(characteristicMaterialIdx, 'characteristics', res.data.name);
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
          <DialogContentText>
            {pendingImportData && (
              <>
                <Typography variant="subtitle2">Организация: {pendingImportData.organizationName || 'Не указана'}</Typography>
                <Typography variant="subtitle2">Проект: {pendingImportData.projectName || 'Не указан'}</Typography>
                <Typography variant="subtitle2">Материалов: {pendingImportData.materials?.length || 0}</Typography>
              </>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenImportDialog(false)}>Отмена</Button>
          <Button onClick={handleImportConfirm} variant="contained">Импортировать</Button>
        </DialogActions>
      </Dialog>
      </Box>
    </Container>
  );
}