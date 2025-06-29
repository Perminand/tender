import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Paper, Typography, Box, Button, CircularProgress, TextField, MenuItem, Toolbar, Dialog, DialogTitle, DialogActions,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Grid, DialogContent, DialogContentText, Container, InputAdornment
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

interface Company { id: string; name: string; shortName?: string; legalName?: string; }
interface Project { id: string; name: string; }
interface Material { id: string; name: string; }
interface Unit { id: string; shortName: string; }
interface Section { id: string; name: string; projectId: string; }
interface WorkType { id: string; name: string; }
interface Warehouse { id: string; name: string; }
interface RequestMaterial {
  material?: Material | null;
  size?: string;
  quantity?: string;
  unit?: Unit | null;
  note?: string;
  deliveryDate?: string;
  section?: string;
  workType?: string;
  supplierMaterialName?: string;
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
}

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

  const [sections, setSections] = useState<Section[]>([]);
  const [sectionsLoading, setSectionsLoading] = useState(false);
  const [workTypes, setWorkTypes] = useState<WorkType[]>([]);
  const [openSectionDialog, setOpenSectionDialog] = useState(false);
  const [newSection, setNewSection] = useState('');
  const [openWorkTypeDialog, setOpenWorkTypeDialog] = useState(false);
  const [newWorkType, setNewWorkType] = useState('');
  const [sectionMaterialIdx, setSectionMaterialIdx] = useState<number | null>(null);
  const [workTypeMaterialIdx, setWorkTypeMaterialIdx] = useState<number | null>(null);

  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [openWarehouseDialog, setOpenWarehouseDialog] = useState(false);
  const [newWarehouse, setNewWarehouse] = useState('');
  const [warehouseMaterialIdx, setWarehouseMaterialIdx] = useState<number | null>(null);

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

  const [sectionsToCreate, setSectionsToCreate] = useState<string[]>([]);
  const [pendingImportSections, setPendingImportSections] = useState<any>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCounterparties, setFilteredCounterparties] = useState<any[]>([]);

  const [projectNameFromImport, setProjectNameFromImport] = useState<string | null>(null);

  const [pendingImportMaterials, setPendingImportMaterials] = useState<any[] | null>(null);
  const [pendingImportMaterialIndex, setPendingImportMaterialIndex] = useState<number>(4);
  const [pendingImportedMaterials, setPendingImportedMaterials] = useState<any[]>([]);

  const [newUnitName, setNewUnitName] = useState('');
  const [openUnitDialog, setOpenUnitDialog] = useState(false);

  // Функция для преобразования Excel-даты в ISO формат
  const normalizeDate = (dateValue: any): string => {
    if (typeof dateValue === 'number' || /^\d+$/.test(String(dateValue))) {
      const excelDate = Number(dateValue);
      const date = new Date((excelDate - 25569) * 86400 * 1000);
      return date.toISOString().slice(0, 10);
    }
    if (typeof dateValue === 'string') {
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) return dateValue;
      if (/^\d{2}\.\d{2}\.\d{4}$/.test(dateValue)) {
        const [day, month, year] = dateValue.split('.');
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }
      if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateValue)) {
        const [day, month, year] = dateValue.split('/');
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }
    }
    return '';
  };

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
  }, []);

  useEffect(() => {
    if (request.project?.id) {
      setSectionsLoading(true);
      axios.get(`/api/sections/by-project/${request.project.id}`)
        .then(res => setSections(res.data))
        .finally(() => setSectionsLoading(false));
    } else {
      setSections([]);
    }
  }, [request.project?.id]);

  useEffect(() => {
    if (isEdit) {
      setLoading(true);
      axios.get(`/api/requests/${id}`)
        .then(res => setRequest(res.data))
        .finally(() => setLoading(false));
    }
  }, [id, isEdit]);

  useEffect(() => {
    // Загружать supplierNames для каждого материала и автоматически заполнять поле supplierMaterialName
    Promise.all(request.materials.map(async (mat, idx) => {
      if (mat.material?.id && request.organization?.id) {
        try {
          const res = await axios.get('/api/supplier-material-names/by-material-and-supplier', {
            params: { materialId: mat.material.id, supplierId: request.organization.id }
          });
          const supplierNames = res.data.map((n: any) => n.name);
          
          // Если есть названия поставщиков и поле supplierMaterialName пустое, заполняем первым значением
          if (supplierNames.length > 0 && !mat.supplierMaterialName) {
            const newMaterials = [...request.materials];
            newMaterials[idx].supplierMaterialName = supplierNames[0];
            setRequest({ ...request, materials: newMaterials });
          }
          
          return supplierNames;
        } catch (error) {
          console.error('Ошибка при загрузке названий поставщиков:', error);
          return [];
        }
      }
      return [];
    })).then(setSupplierNamesOptions);
  }, [request.materials.map(m => m.material?.id).join(), request.organization?.id]);

  // Перезагружаем названия поставщиков при изменении организации
  useEffect(() => {
    if (request.organization?.id) {
      // Очищаем названия поставщиков при смене организации
      const newMaterials = request.materials.map(mat => ({
        ...mat,
        supplierMaterialName: ''
      }));
      setRequest({ ...request, materials: newMaterials });
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
      setRequest({ ...request, project: project });
    }
  };

  const handleMaterialChange = (idx: number, field: string, value: any) => {
    const newMaterials = [...request.materials];
    if (field === 'material') {
      newMaterials[idx].material = materials.find(m => m.id === value) || null;
      // При выборе материала автоматически загружаем и заполняем название у поставщика
      if (value && request.organization?.id) {
        axios.get('/api/supplier-material-names/by-material-and-supplier', {
          params: { materialId: value, supplierId: request.organization.id }
        })
          .then(res => {
            const supplierNames = res.data.map((n: any) => n.name);
            if (supplierNames.length > 0) {
              newMaterials[idx].supplierMaterialName = supplierNames[0];
              setRequest({ ...request, materials: newMaterials });
            }
          })
          .catch(error => {
            console.error('Ошибка при загрузке названий поставщиков:', error);
          });
      } else {
        newMaterials[idx].supplierMaterialName = '';
      }
    } else if (field === 'unit') {
      newMaterials[idx].unit = units.find(u => (u as any).shortName === value || (u as any).name === value) || null;
    } else if (field === 'section') {
      newMaterials[idx].section = value?.id || value || '';
    } else if (field === 'workType') {
      newMaterials[idx].workType = value?.id || value || '';
    } else {
      (newMaterials[idx] as any)[field] = value;
    }
    setRequest({ ...request, materials: newMaterials });
  };

  const handleAddMaterial = () => {
    setRequest({
      ...request,
      materials: [
        ...request.materials,
        { material: null, size: '', quantity: '', unit: null, note: '', deliveryDate: '', section: '', workType: '', supplierMaterialName: '' }
      ]
    });
  };

  const handleRemoveMaterial = (idx: number) => {
    setRequest({
      ...request,
      materials: request.materials.filter((_, i) => i !== idx)
    });
  };

  const handleSave = async () => {
    // Валидация: все материалы должны иметь заполненное наименование
    const emptyNames = request.materials.some(mat => !mat.material || !mat.material.id);
    if (emptyNames) {
      alert('Пожалуйста, заполните поле "Наименование материала" для всех строк.');
      setLoading(false);
      return;
    }
    setLoading(true);
    if (isEdit) {
      await axios.put(`/api/requests/${id}`, request);
    } else {
      await axios.post('/api/requests', request);
    }
    setLoading(false);
    navigate('/requests/registry');
  };

  const handleDelete = async () => {
    setLoading(true);
    await axios.delete(`/api/requests/${id}`);
    setLoading(false);
    navigate('/requests/registry');
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
        // Форсированная загрузка участков для выбранного проекта
        await axios.get(`/api/sections/by-project/${existingProject.id}`).then(res => setSections(res.data));
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
    // Если участки ещё загружаются — подождать
    if (sectionsLoading) {
      return;
    }
    // Собираем все уникальные участки из импортируемых данных
    const uniqueSections = Array.from(new Set(importData.materials.map((m: any) => m.section).filter(Boolean))) as string[];
    // Ищем отсутствующие участки
    const missingSections = uniqueSections.filter(
      name => !sections.some(
        s => s.name.trim().toLowerCase() === name.trim().toLowerCase() && s.projectId === request.project?.id
      )
    );
    if (missingSections.length > 0) {
      setSectionsToCreate(missingSections);
      setPendingImportSections(importData);
      return;
    }
    // --- Новый маппинг материалов ---
    const newMaterials = await Promise.all(importData.materials.map(async (row: any) => {
      let material: Material | null = null;
      if (row.supplierName && newOrganization?.id) {
        try {
          const res = await axios.get('/api/org-supplier-material-mapping', {
            params: { organizationId: newOrganization.id, supplierName: row.supplierName }
          });
          if (res.data && res.data.material) {
            material = res.data.material;
          }
        } catch {}
      }
      if (!material && row.materialName) {
        material = materials.find(m => m.name === row.materialName) || null;
      }
      return {
        section: sections.find(s => s.name === row.section)?.id || '',
        workType: row.workType,
        material,
        size: row.size,
        quantity: row.quantity,
        unit: units.find(u => (u as any).shortName === row.unitName || (u as any).name === row.unitName) || null,
        note: row.note,
        deliveryDate: row.deliveryDate,
        supplierMaterialName: row.materialName || ''
      };
    }));
    let formattedDate = request.date;
    if (importData.requestDate) {
      formattedDate = normalizeDate(importData.requestDate);
    }
    const normalize = (str: any) => (str || '').trim().toLowerCase();
    let existingOrg = companies.find(c => normalize(c.legalName) === normalize(importData.organizationName));
    if (!existingOrg) existingOrg = companies.find(c => normalize(c.shortName) === normalize(importData.organizationName));
    if (!existingOrg) existingOrg = companies.find(c => normalize(c.name) === normalize(importData.organizationName));

    setRequest(r => ({
      ...r,
      requestNumber: importData.requestNumber || r.requestNumber,
      date: formattedDate || r.date,
      organization: existingOrg || null,
      project: newProject,
      materials: newMaterials
    }));
    setPendingImportData(null);
  };

  useEffect(() => {
    if (sectionsToCreate.length === 0 && pendingImportSections) {
      // Повторно вызываем handleImportConfirm, но уже с новыми sections
      setPendingImportSections(null);
    }
  }, [sectionsToCreate, pendingImportSections]);

  const handleExcelImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      let requestNumber = '';
      let requestDate = '';
      let requestOrganization = '';
      // Ищем строку с "Заявка на материалы №", "Дата" и "Организация"
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i] as any[];
        if (!row) continue;
        for (let j = 0; j < row.length; j++) {
          const cell = row[j];
          if (typeof cell === 'string' && cell.includes('Заявка на материалы №')) {
            requestNumber = String(row[j + 1] || '').trim();
          }
          if (typeof cell === 'string' && cell.trim().toLowerCase().startsWith('дата')) {
            requestDate = String(row[j + 1] || '').trim();
          }
          if (typeof cell === 'string' && cell.trim().toLowerCase().startsWith('организация')) {
            requestOrganization = String(row[j + 1] || '').trim();
          }
        }
      }

      const formattedDate = normalizeDate(requestDate);

      // После парсинга requestNumber, requestDate, requestOrganization
      const normalize = (str: any) => (str || '').trim().toLowerCase();
      let existingOrg = companies.find(c => normalize(c.legalName) === normalize(requestOrganization));
      if (!existingOrg) existingOrg = companies.find(c => normalize(c.shortName) === normalize(requestOrganization));
      if (!existingOrg) existingOrg = companies.find(c => normalize(c.name) === normalize(requestOrganization));

      if (existingOrg) {
        setRequest(r => ({
          ...r,
          requestNumber,
          date: formattedDate || r.date,
          organization: existingOrg
        }));
      } else if (requestOrganization) {
        alert(`Организация не найдена: ${requestOrganization}\nНеобходимо создать новую организацию!`);
        setNewCompany(requestOrganization);
        setOpenCompanyDialog(true);
      }

      // --- Поиск и установка проекта ---
      let projectName = '';
      // Ищем слово 'проект' в Excel и берем ячейку справа
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i] as any[];
        if (!row) continue;
        for (let j = 0; j < row.length - 1; j++) {
          const cell = row[j];
          if (typeof cell === 'string' && cell.trim().toLowerCase().startsWith('проект')) {
            projectName = String(row[j + 1] || '').trim();
          }
        }
      }
      let existingProject = projects.find(p => (p.name || '').trim().toLowerCase() === projectName.trim().toLowerCase());
      console.log('[IMPORT][PROJECT] Найденный проект:', existingProject);
      if (existingProject) {
        setRequest(r => ({
          ...r,
        requestNumber,
          date: formattedDate || r.date,
          organization: existingOrg || null,
          project: existingProject
        }));
        setProjectNameFromImport(null);
        console.log('[IMPORT][PROJECT] Проект установлен:', existingProject);
      } else if (projectName) {
        alert(`Проект не найден: ${projectName}\nНеобходимо создать новый проект!`);
        setNewProject(projectName);
        setOpenProjectDialog(true);
        setRequest(r => ({
          ...r,
          requestNumber,
          date: formattedDate || r.date,
          organization: existingOrg || null
        }));
        setProjectNameFromImport(projectName);
        console.log('[IMPORT][PROJECT] Проект не найден, открыт диалог создания:', projectName);
      }

      // --- Импорт материалов заявки ---
      // 1. Найти строку с заголовками
      const headerRowIndex = (rows as any[]).findIndex((row) =>
        (row as any[]).some((cell: any) =>
          typeof cell === 'string' &&
          cell.toLowerCase().includes('наименование материала')
        )
      );
      if (headerRowIndex === -1) {
        alert('Не найдена строка с заголовками!');
        return;
      }
      const headerRow = rows[headerRowIndex] as any[];
      // 2. Построить отображение: название → индекс
      const headerMap: Record<string, number> = {};
      headerRow.forEach((cell: any, idx: number) => {
        if (typeof cell === 'string') {
          headerMap[cell.trim().toLowerCase()] = idx;
        }
      });
      // 3. Функция для получения индекса по названию (с синонимами)
      function getColIndex(...names: string[]): number | undefined {
        for (const name of names) {
          // Сначала точное совпадение
          const idx = headerMap[name.toLowerCase()];
          if (idx !== undefined) return idx;
          // Потом по includes
          for (const key in headerMap) {
            if (key.includes(name.toLowerCase())) return headerMap[key];
          }
        }
        return undefined;
      }
      const idxSection = getColIndex('участок (склад)', 'участок');
      const idxWorkType = getColIndex('вид работ');
      const idxMaterialName = getColIndex('наименование материала');
      const idxQuantity = getColIndex('кол-во', 'количество');
      const idxNote = getColIndex('примечание по заявке', 'примечание');
      const idxDeliveryDate = getColIndex('поставить к дате');
      const idxSupplierMaterialName = idxMaterialName;
      const idxUnit = getColIndex('ед. изм.', 'единица измерения', 'unit');
      let startIdx = headerRowIndex + 1;
      if (pendingImportMaterialIndex > startIdx) startIdx = pendingImportMaterialIndex;
      if (!sections.length) {
        setPendingImportMaterials(rows);
        setPendingImportMaterialIndex(startIdx);
        setPendingImportedMaterials([]);
      } else {
        let importedMaterials: any[] = [];
        for (let i = startIdx; i < rows.length; i++) {
          const row = rows[i] as any[];
          if (!row || row.every((cell: any) => !cell || String(cell).trim() === '')) break;
          const number = String(row[0]).trim();
          if (!/^[0-9]+$/.test(number)) continue;
          const sectionName = idxSection !== undefined ? String(row[idxSection] || '').trim() : '';
          let sectionObj = sections.find(s => (s.name || '').trim().toLowerCase() === sectionName.toLowerCase());
          if (!sectionObj && sectionName) {
            setNewSection(sectionName);
            setOpenSectionDialog(true);
            setPendingImportMaterialIndex(i);
            setPendingImportedMaterials(importedMaterials);
            break;
          }
          const workTypeName = idxWorkType !== undefined ? String(row[idxWorkType] || '').trim() : '';
          let workTypeObj = workTypes.find(w => (w.name || '').trim().toLowerCase() === workTypeName.toLowerCase());
          if (!workTypeObj && workTypeName) {
            setNewWorkType(workTypeName);
            setOpenWorkTypeDialog(true);
            setPendingImportMaterialIndex(i);
            setPendingImportedMaterials(importedMaterials);
            break;
          }
          const unitName = idxUnit !== undefined ? String(row[idxUnit] || '').trim() : '';
          let unitObj = units.find(u =>
            ((u as any).shortName || '').trim().toLowerCase() === unitName.toLowerCase() ||
            ((u as any).name || '').trim().toLowerCase() === unitName.toLowerCase()
          );
          console.log('[IMPORT][UNIT] Ищем единицу измерения:', unitName);
          console.log('[IMPORT][UNIT] Список units:', units);
          if (unitObj) {
            console.log('[IMPORT][UNIT] Найдена единица измерения:', unitObj);
          } else if (unitName) {
            console.log('[IMPORT][UNIT] Единица измерения не найдена, будет создана:', unitName);
          }
          console.log('[IMPORT][NOTE] idxNote:', idxNote, 'значение:', idxNote !== undefined ? row[idxNote] : undefined);
          if (idxNote === undefined) {
            console.warn('[IMPORT][NOTE] Не найден индекс колонки "Примечание"!');
          }
          importedMaterials.push({
            section: sectionObj ? sectionObj.id : '',
            workType: workTypeObj ? workTypeObj.id : '',
            materialName: idxMaterialName !== undefined ? String(row[idxMaterialName] || '').trim() : '',
            supplierMaterialName: idxSupplierMaterialName !== undefined ? String(row[idxSupplierMaterialName] || '').trim() : '',
            quantity: idxQuantity !== undefined ? String(row[idxQuantity] || '').trim() : '',
            note: idxNote !== undefined ? String(row[idxNote] || '').trim() : '',
            deliveryDate: idxDeliveryDate !== undefined ? normalizeDate(row[idxDeliveryDate]) : '',
            unit: unitObj || null,
          });
        }
        setRequest(r => ({
          ...r,
          materials: importedMaterials
        }));
        setPendingImportMaterialIndex(headerRowIndex + 1);
        setPendingImportedMaterials([]);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // useEffect для подстановки проекта после загрузки projects
  useEffect(() => {
    if (projectNameFromImport) {
      console.log('[IMPORT][PROJECT][EFFECT] projects:', projects, 'projectNameFromImport:', projectNameFromImport);
      const found = projects.find(p => (p.name || '').trim().toLowerCase() === projectNameFromImport.trim().toLowerCase());
      if (found) {
        setRequest(r => ({ ...r, project: found }));
        setProjectNameFromImport(null);
        console.log('[IMPORT][PROJECT] Проект подставлен после загрузки:', found);
      }
    }
  }, [projects, projectNameFromImport]);

  // useEffect для отложенного импорта материалов после загрузки sections и workTypes
  useEffect(() => {
    if (pendingImportMaterials && sections.length) {
      // Найти строку с заголовками
      const headerRowIndex = pendingImportMaterials.findIndex(row =>
        (row as any[]).some((cell: any) =>
          typeof cell === 'string' &&
          cell.toLowerCase().includes('наименование материала')
        )
      );
      if (headerRowIndex === -1) {
        alert('Не найдена строка с заголовками!');
        return;
      }
      const headerRow = pendingImportMaterials[headerRowIndex] as any[];
      const headerMap: Record<string, number> = {};
      headerRow.forEach((cell: any, idx: number) => {
        if (typeof cell === 'string') {
          headerMap[cell.trim().toLowerCase()] = idx;
        }
      });
      function getColIndex(...names: string[]): number | undefined {
        for (const name of names) {
          const idx = headerMap[name.toLowerCase()];
          if (idx !== undefined) return idx;
        }
        return undefined;
      }
      const idxSection = getColIndex('участок (склад)', 'участок');
      const idxWorkType = getColIndex('вид работ');
      const idxMaterialName = getColIndex('наименование материала');
      const idxQuantity = getColIndex('кол-во', 'количество');
      const idxNote = getColIndex('примечание по заявке', 'примечание');
      const idxDeliveryDate = getColIndex('поставить к дате');
      const idxSupplierMaterialName = idxMaterialName;
      const idxUnit = getColIndex('ед. изм.', 'единица измерения', 'unit');
      let importedMaterials: any[] = pendingImportedMaterials ? [...pendingImportedMaterials] : [];
      let startIdx = pendingImportMaterialIndex;
      let needCreateSection = false;
      for (let i = startIdx; i < pendingImportMaterials.length; i++) {
        const row = pendingImportMaterials[i] as any[];
        if (!row || row.every((cell: any) => !cell || String(cell).trim() === '')) break;
        const number = String(row[0]).trim();
        if (!/^[0-9]+$/.test(number)) continue;
        const sectionName = idxSection !== undefined ? String(row[idxSection] || '').trim() : '';
        let sectionObj = sections.find(s => (s.name || '').trim().toLowerCase() === sectionName.toLowerCase());
        if (!sectionObj && sectionName) {
          setNewSection(sectionName);
          setOpenSectionDialog(true);
          setPendingImportMaterialIndex(i);
          setPendingImportedMaterials(importedMaterials);
          needCreateSection = true;
          break;
        }
        const workTypeName = idxWorkType !== undefined ? String(row[idxWorkType] || '').trim() : '';
        let workTypeObj = workTypes.find(w => (w.name || '').trim().toLowerCase() === workTypeName.toLowerCase());
        if (!workTypeObj && workTypeName) {
          setNewWorkType(workTypeName);
          setOpenWorkTypeDialog(true);
          setPendingImportMaterialIndex(i);
          setPendingImportedMaterials(importedMaterials);
          needCreateSection = true;
          break;
        }
        const unitName = idxUnit !== undefined ? String(row[idxUnit] || '').trim() : '';
        let unitObj = units.find(u =>
          ((u as any).shortName || '').trim().toLowerCase() === unitName.toLowerCase() ||
          ((u as any).name || '').trim().toLowerCase() === unitName.toLowerCase()
        );
        console.log('[IMPORT][UNIT] Ищем единицу измерения:', unitName);
        console.log('[IMPORT][UNIT] Список units:', units);
        if (unitObj) {
          console.log('[IMPORT][UNIT] Найдена единица измерения:', unitObj);
        } else if (unitName) {
          console.log('[IMPORT][UNIT] Единица измерения не найдена, будет создана:', unitName);
        }
        console.log('[IMPORT][NOTE] idxNote:', idxNote, 'значение:', idxNote !== undefined ? row[idxNote] : undefined);
        if (idxNote === undefined) {
          console.warn('[IMPORT][NOTE] Не найден индекс колонки "Примечание"!');
        }
        importedMaterials.push({
          section: sectionObj ? sectionObj.id : '',
          workType: workTypeObj ? workTypeObj.id : '',
          materialName: idxMaterialName !== undefined ? String(row[idxMaterialName] || '').trim() : '',
          supplierMaterialName: idxSupplierMaterialName !== undefined ? String(row[idxSupplierMaterialName] || '').trim() : '',
          quantity: idxQuantity !== undefined ? String(row[idxQuantity] || '').trim() : '',
          note: idxNote !== undefined ? String(row[idxNote] || '').trim() : '',
          deliveryDate: idxDeliveryDate !== undefined ? normalizeDate(row[idxDeliveryDate]) : '',
          unit: unitObj || null,
        });
        setPendingImportMaterialIndex(i + 1);
      }
      if (!needCreateSection) {
        setRequest(r => ({
          ...r,
          materials: importedMaterials
        }));
        setPendingImportMaterials(null);
        setPendingImportMaterialIndex(headerRowIndex + 1);
        setPendingImportedMaterials([]);
      }
    }
  }, [sections, workTypes, pendingImportMaterials]);

  // Добавить функцию автоподстановки
  const handleSupplierMaterialNameChange = async (idx: number, value: string) => {
    const newMaterials = [...request.materials];
    newMaterials[idx].supplierMaterialName = value;

    // Если есть организация и значение, делаем запрос
    if (request.organization?.id && value) {
      try {
        const res = await axios.get('/api/org-supplier-material-mapping', {
          params: {
            organizationId: request.organization.id,
            supplierName: value
          }
        });
        if (res.data && res.data.material) {
          newMaterials[idx].material = res.data.material;
        }
      } catch (e) {
        // Можно добавить обработку ошибок
      }
    }

    setRequest(r => ({
      ...r,
      materials: newMaterials
    }));
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
              setRequest({ ...request, warehouse: value });
            }
          }}
          options={warehouses}
          filterOptions={(options, state) => {
            const filtered = options.filter(option =>
              option.name.toLowerCase().includes(state.inputValue.toLowerCase())
            );
            if (state.inputValue && filtered.length === 0) {
              return [{ id: 'CREATE_NEW', name: `Создать "${state.inputValue}"` }];
            }
            return filtered;
          }}
          getOptionLabel={(option: Warehouse) => option ? option.name : ''}
          isOptionEqualToValue={(option: Warehouse, value: Warehouse) => option.id === value.id}
          renderInput={params => (
            <TextField {...params} label="Склад" required />
          )}
        />
        <Typography variant="subtitle1" sx={{ mt: 2 }}>Материалы заявки</Typography>
        <TableContainer component={Paper} sx={{ mb: 2, overflowX: 'auto', width: '100%' }}>
          <Table size="small" sx={{ minWidth: 1200, width: 'max-content' }}>
            <TableHead>
              <TableRow>
                  {['#','Участок','Вид работ','Наименование материала','Наименование у поставщика','Кол-во','Ед. изм.','Примечание','Поставить к дате','Действия'].map((label, idx) => (
                  <TableCell
                    key={label}
                    sx={{ position: 'relative', width: colWidths[idx], minWidth: 40, maxWidth: 800, userSelect: 'none', whiteSpace: 'nowrap' }}
                  >
                    {label}
                    {idx !== 0 && idx !== 9 && (
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
          {request.materials.map((mat, idx) => (
                <TableRow key={idx}>
                  <TableCell>{idx + 1}</TableCell>
                  <TableCell sx={{ width: 'auto', whiteSpace: 'nowrap' }}>
                  <Autocomplete
                    value={sections.find((s: Section) => s.id === mat.section) || null}
                    onChange={(_, value, reason) => {
                      if (!request.project?.id) {
                        alert('Сначала выберите проект');
                        return;
                      }
                      if (value && value.id === 'CREATE_NEW') {
                        setNewSection(value.name.replace(/^Создать "/, '').replace(/"$/, ''));
                        setSectionMaterialIdx(idx);
                        setOpenSectionDialog(true);
                      } else {
                        handleMaterialChange(idx, 'section', value);
                      }
                    }}
                    options={sections}
                    filterOptions={(options, state) => {
                      const filtered = options.filter(option =>
                        option.name.toLowerCase().includes(state.inputValue.toLowerCase())
                      );
                      if (state.inputValue && filtered.length === 0) {
                        return [{ id: 'CREATE_NEW', name: `Создать "${state.inputValue}"`, projectId: request.project?.id || '' }];
                      }
                      return filtered;
                    }}
                    getOptionLabel={(option: Section) => option ? option.name : ''}
                    isOptionEqualToValue={(option: Section, value: Section) => option.id === value.id}
                    renderInput={params => (
                        <TextField {...params} size="small" label="Участок" />
                    )}
                    disabled={!request.project?.id}
                  />
                  </TableCell>
                  <TableCell sx={{ width: 'auto', whiteSpace: 'nowrap' }}>
                  <Autocomplete
                    value={workTypes.find(w => w.id === mat.workType) || null}
                    onChange={(_, value, reason) => {
                      if (value && value.id === 'CREATE_NEW') {
                        setNewWorkType(value.name.replace(/^Создать "/, '').replace(/"$/, ''));
                        setOpenWorkTypeDialog(true);
                      } else {
                        handleMaterialChange(idx, 'workType', value);
                      }
                    }}
                    options={workTypes}
                    filterOptions={(options, state) => {
                      const filtered = options.filter(option =>
                        option.name.toLowerCase().includes(state.inputValue.toLowerCase())
                      );
                      if (state.inputValue && filtered.length === 0) {
                        return [{ id: 'CREATE_NEW', name: `Создать "${state.inputValue}"` }];
                      }
                      return filtered;
                    }}
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
                    onChange={(_, value, reason) => {
                      if (value && value.id === 'CREATE_NEW') {
                        const inputName = value.name.replace(/^Создать "/, '').replace(/"$/, '');
                        window.open(`/reference/materials/new?name=${encodeURIComponent(inputName)}`, '_blank');
                      } else {
                        handleMaterialChange(idx, 'material', value ? value.id : '');
                      }
                    }}
                    options={materials}
                    filterOptions={(options, state) => {
                      const filtered = options.filter(option =>
                        option.name.toLowerCase().includes(state.inputValue.toLowerCase())
                      );
                      if (state.inputValue && filtered.length === 0) {
                        return [{ id: 'CREATE_NEW', name: `Создать "${state.inputValue}"` }];
                      }
                      return filtered;
                    }}
                    getOptionLabel={option => option ? option.name : ''}
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                    renderInput={params => (
                        <TextField {...params} size="small" label="Наименование материала" InputLabelProps={{ shrink: true }} />
                    )}
                  />
                  </TableCell>
                  <TableCell sx={{ minWidth: 180, maxWidth: 300 }}>
                    <Autocomplete
                      freeSolo
                      value={mat.supplierMaterialName || ''}
                      onChange={async (_, value) => {
                        // value — строка из списка или введённая вручную
                        handleSupplierMaterialNameChange(idx, value || '');
                      }}
                      onInputChange={(_, value) => {
                        // Для поддержки ручного ввода
                        handleSupplierMaterialNameChange(idx, value || '');
                      }}
                      options={
                        // supplierNamesOptions[idx] — массив строк для текущего материала
                        (supplierNamesOptions[idx] || [])
                      }
                      renderInput={params => (
                        <TextField {...params} size="small" label="Наименование у поставщика" InputLabelProps={{ shrink: true }} />
                      )}
                      filterOptions={(options, state) => {
                        // Только полное совпадение или все варианты
                        if (!state.inputValue) return options;
                        return options.filter(opt => opt === state.inputValue);
                      }}
                  />
                  </TableCell>
                    <TableCell sx={{ width: 'auto', whiteSpace: 'nowrap' }}>
                  <TextField
                    size="small"
                    label="Кол-во"
                    value={mat.quantity || ''}
                    onChange={e => handleMaterialChange(idx, 'quantity', e.target.value)}
                    type="number"
                    fullWidth
                  />
                  </TableCell>
                    <TableCell sx={{ width: 'auto', whiteSpace: 'nowrap' }}>
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
                    <TableCell sx={{ width: 'auto', whiteSpace: 'nowrap' }}>
                  <TextField
                    size="small"
                      label="Примечание"
                    value={mat.note || ''}
                    onChange={e => handleMaterialChange(idx, 'note', e.target.value)}
                    fullWidth
                      InputLabelProps={{ shrink: true }}
                  />
                  </TableCell>
                    <TableCell sx={{ width: 'auto', whiteSpace: 'nowrap' }}>
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
          ))}
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

      {/* Диалог создания нового участка */}
      <Dialog open={openSectionDialog} onClose={() => setOpenSectionDialog(false)}>
        <DialogTitle>Создать новый участок</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Название участка"
            type="text"
            fullWidth
            value={newSection}
            onChange={e => setNewSection(e.target.value)}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setOpenSectionDialog(false);
            setNewSection('');
          }}>
            Отмена
          </Button>
          <Button onClick={async () => {
            if (newSection.trim() && request.project?.id && sectionMaterialIdx !== null) {
              try {
                const res = await axios.post('/api/sections', { 
                  name: newSection, 
                  projectId: request.project.id 
                });
                setSections(prev => [...prev, res.data]);
                handleMaterialChange(sectionMaterialIdx, 'section', res.data.id);
                setNewSection('');
                setOpenSectionDialog(false);
              } catch (error) {
                console.error('Ошибка при создании участка:', error);
                alert('Ошибка при создании участка');
              }
            }
          }}>
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог создания нового вида работ */}
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

      {/* Диалог создания нового склада */}
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
            if (newWarehouse.trim()) {
              try {
                const res = await axios.post('/api/warehouses', { name: newWarehouse });
                setWarehouses(prev => [...prev, res.data]);
                setRequest({ ...request, warehouse: res.data });
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

      {/* Диалог создания нового проекта */}
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

      {/* Диалог создания новой организации */}
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

      {/* Диалог создания новой единицы измерения */}
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
      </Box>
    </Container>
  );
}