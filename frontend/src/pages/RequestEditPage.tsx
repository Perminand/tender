import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Paper, Typography, Box, Button, CircularProgress, TextField, MenuItem, Toolbar, Dialog, DialogTitle, DialogActions,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Grid, DialogContent
} from '@mui/material';
import axios from 'axios';
import { Autocomplete } from '@mui/material';

interface Company { id: string; name: string; }
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
}
interface RequestDto {
  id?: string;
  organization?: Company | null;
  project?: Project | null;
  date?: string;
  status?: string;
  materials: RequestMaterial[];
  warehouse?: Warehouse | null;
}

const statusOptions = [
  { value: 'DRAFT', label: 'Черновик' },
  { value: 'SENT', label: 'Отправлена' },
  { value: 'APPROVED', label: 'Одобрена' },
  { value: 'REJECTED', label: 'Отклонена' },
];

export default function RequestEditPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [request, setRequest] = useState<RequestDto>({ materials: [] });
  const [confirmDelete, setConfirmDelete] = useState(false);

  const [companies, setCompanies] = useState<Company[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);

  const [sections, setSections] = useState<Section[]>([]);
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
  const [openStatusDialog, setOpenStatusDialog] = useState(false);
  const [newStatus, setNewStatus] = useState('');

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
      axios.get(`/api/sections/by-project/${request.project.id}`).then(res => setSections(res.data));
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
    } else if (name === 'status') {
      setRequest({ ...request, status: value });
    }
  };

  const handleMaterialChange = (idx: number, field: string, value: any) => {
    const newMaterials = [...request.materials];
    if (field === 'material') {
      newMaterials[idx].material = materials.find(m => m.id === value) || null;
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
        ...request.materials,
        { material: null, size: '', quantity: '', unit: null, note: '', deliveryDate: '', section: '', workType: '' }
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

  if (loading) {
    return <Box display="flex" justifyContent="center" mt={4}><CircularProgress /></Box>;
  }

  return (
    <Paper sx={{ p: 3, width: '100%', maxWidth: 1600, mx: 'auto', mt: 3, boxSizing: 'border-box' }}>
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Typography variant="h6">{isEdit ? 'Редактирование заявки' : 'Создание заявки'}</Typography>
      </Toolbar>
      <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
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
              option.name.toLowerCase().includes(state.inputValue.toLowerCase())
            );
            if (state.inputValue && filtered.length === 0) {
              return [{ id: 'CREATE_NEW', name: `Создать "${state.inputValue}"` }];
            }
            return filtered;
          }}
          getOptionLabel={(option: Company) => option ? option.name : ''}
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
        <Autocomplete
          value={statusOptions.find(opt => opt.value === request.status) || null}
          onChange={(_, value) => {
            if (value && value.value === 'CREATE_NEW') {
              setNewStatus(value.label.replace(/^Создать "/, '').replace(/"$/, ''));
              setOpenStatusDialog(true);
            } else {
              handleSelectChange('status', value ? value.value : '');
            }
          }}
          options={statusOptions}
          filterOptions={(options, state) => {
            const filtered = options.filter(option =>
              option.label.toLowerCase().includes(state.inputValue.toLowerCase())
            );
            if (state.inputValue && filtered.length === 0) {
              return [{ value: 'CREATE_NEW', label: `Создать "${state.inputValue}"` }];
            }
            return filtered;
          }}
          getOptionLabel={option => option.label}
          isOptionEqualToValue={(option, value) => option.value === value.value}
          renderInput={params => (
            <TextField {...params} label="Статус" required />
          )}
        />
        <TextField
          name="date"
          label="Дата"
          type="date"
          value={request.date || ''}
          onChange={handleChange}
          InputLabelProps={{ shrink: true }}
          required
        />
        <Typography variant="subtitle1" sx={{ mt: 2 }}>Материалы заявки</Typography>
        <TableContainer component={Paper} sx={{ mb: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>#</TableCell>
                <TableCell>Участок</TableCell>
                <TableCell>Вид работ</TableCell>
                <TableCell>Наименование материала</TableCell>
                <TableCell>Размер</TableCell>
                <TableCell>Кол-во</TableCell>
                <TableCell>Ед. изм.</TableCell>
                <TableCell>Примечание</TableCell>
                <TableCell>Поставить к дате</TableCell>
                <TableCell>Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
          {request.materials.map((mat, idx) => (
                <TableRow key={idx}>
                  <TableCell>{idx + 1}</TableCell>
                  <TableCell>
                  <Autocomplete
                    value={sections.find((s: Section) => s.id === mat.section) || null}
                    onChange={(_, value) => {
                      if (value && (value as any).id === 'CREATE_NEW') {
                        setSectionMaterialIdx(idx);
                        setOpenSectionDialog(true);
                      } else {
                        handleMaterialChange(idx, 'section', value);
                      }
                    }}
                    options={[...sections, { id: 'CREATE_NEW', name: 'Создать новый участок', projectId: request.project?.id || '' }]}
                    getOptionLabel={(option: Section) => option ? option.name : ''}
                    isOptionEqualToValue={(option: Section, value: Section) => option.id === value.id}
                    renderInput={params => (
                        <TextField {...params} size="small" label="Участок" />
                    )}
                    disabled={!request.project?.id}
                  />
                  </TableCell>
                  <TableCell>
                  <Autocomplete
                    value={workTypes.find(w => w.id === mat.workType) || null}
                    onChange={(_, value) => {
                      if (value && (value as any).id === 'CREATE_NEW') {
                        setWorkTypeMaterialIdx(idx);
                        setOpenWorkTypeDialog(true);
                      } else {
                        handleMaterialChange(idx, 'workType', value);
                      }
                    }}
                    options={[...workTypes, { id: 'CREATE_NEW', name: 'Создать новый вид работ' }]}
                    getOptionLabel={option => option ? option.name : ''}
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                    renderInput={params => (
                        <TextField {...params} size="small" label="Вид работ" />
                    )}
                  />
                  </TableCell>
                  <TableCell>
                  <TextField
                    select
                    size="small"
                    label="Наименование материала"
                    value={mat.material?.id || ''}
                    onChange={e => handleMaterialChange(idx, 'material', e.target.value)}
                    fullWidth
                  >
                    {materials.map(m => (
                      <MenuItem key={m.id} value={m.id}>{m.name}</MenuItem>
                    ))}
                  </TextField>
                  </TableCell>
                  <TableCell>
                  <TextField
                    size="small"
                    label="Размер"
                    value={mat.size || ''}
                    onChange={e => handleMaterialChange(idx, 'size', e.target.value)}
                    fullWidth
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
                    label="Примечание по заявке / Ссылка на Материал"
                    value={mat.note || ''}
                    onChange={e => handleMaterialChange(idx, 'note', e.target.value)}
                    fullWidth
                    multiline
                    minRows={2}
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
            if (newWorkType.trim() && workTypeMaterialIdx !== null) {
              try {
                const res = await axios.post('/api/work-types', { 
                  name: newWorkType 
                });
                setWorkTypes(prev => [...prev, res.data]);
                handleMaterialChange(workTypeMaterialIdx, 'workType', res.data.id);
                setNewWorkType('');
                setOpenWorkTypeDialog(false);
              } catch (error) {
                console.error('Ошибка при создании вида работ:', error);
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

      {/* Диалог создания нового статуса */}
      <Dialog open={openStatusDialog} onClose={() => setOpenStatusDialog(false)}>
        <DialogTitle>Создать новый статус</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Название статуса"
            type="text"
            fullWidth
            value={newStatus}
            onChange={e => setNewStatus(e.target.value)}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setOpenStatusDialog(false);
            setNewStatus('');
          }}>
            Отмена
          </Button>
          <Button onClick={async () => {
            if (newStatus.trim()) {
              try {
                // Здесь предполагается, что у вас есть API для создания статуса
                // Если нет — просто добавьте в локальный массив
                const newOpt = { value: newStatus.toUpperCase(), label: newStatus };
                statusOptions.push(newOpt);
                handleSelectChange('status', newOpt.value);
                setNewStatus('');
                setOpenStatusDialog(false);
              } catch (error) {
                alert('Ошибка при создании статуса');
              }
            }
          }}>
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}