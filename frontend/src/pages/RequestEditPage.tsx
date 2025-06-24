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

  useEffect(() => {
    axios.get('/api/companies').then(res => setCompanies(res.data));
    axios.get('/api/projects').then(res => setProjects(res.data));
    axios.get('/api/materials').then(res => setMaterials(res.data));
    axios.get('/api/units').then(res => setUnits(res.data));
    axios.get('/api/work-types').then(res => setWorkTypes(res.data));
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
        <Button onClick={() => navigate('/requests/registry')}>Отмена</Button>
      </Toolbar>
      <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
        <TextField
          name="organization"
          label="Организация"
          select
          value={request.organization?.id || ''}
          onChange={e => handleSelectChange('organization', e.target.value)}
          required
        >
          {companies.map(c => (
            <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
          ))}
        </TextField>
        <TextField
          name="project"
          label="Проект"
          select
          value={request.project?.id || ''}
          onChange={e => handleSelectChange('project', e.target.value)}
          required
        >
          {projects.map(p => (
            <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
          ))}
        </TextField>
        <TextField
          name="date"
          label="Дата"
          type="date"
          value={request.date || ''}
          onChange={handleChange}
          InputLabelProps={{ shrink: true }}
          required
        />
        <TextField
          name="status"
          label="Статус"
          select
          value={request.status || ''}
          onChange={e => handleSelectChange('status', e.target.value)}
          required
        >
          {statusOptions.map(opt => (
            <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
          ))}
        </TextField>
        <Typography variant="subtitle1" sx={{ mt: 2 }}>Материалы заявки</Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {request.materials.map((mat, idx) => (
            <Paper key={idx} sx={{ p: 2, mb: 1, position: 'relative', display: 'flex', alignItems: 'flex-start' }} elevation={2}>
              <Box sx={{ width: 40, minWidth: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>{idx + 1}</Typography>
              </Box>
              <Grid container spacing={2} alignItems="center" flex={1}>
                <Grid item xs={2}>
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
                      <TextField {...params} size="small" label="Участок" fullWidth />
                    )}
                    disabled={!request.project?.id}
                  />
                </Grid>
                <Grid item xs={2}>
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
                      <TextField {...params} size="small" label="Вид работ" fullWidth />
                    )}
                  />
                </Grid>
                <Grid item xs={3}>
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
                </Grid>
                <Grid item xs={1}>
                  <TextField
                    size="small"
                    label="Размер"
                    value={mat.size || ''}
                    onChange={e => handleMaterialChange(idx, 'size', e.target.value)}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={1}>
                  <TextField
                    size="small"
                    label="Кол-во"
                    value={mat.quantity || ''}
                    onChange={e => handleMaterialChange(idx, 'quantity', e.target.value)}
                    type="number"
                    fullWidth
                  />
                </Grid>
                <Grid item xs={1}>
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
                </Grid>
                <Grid item xs={3}>
                  <TextField
                    size="small"
                    label="Примечание по заявке / Ссылка на Материал"
                    value={mat.note || ''}
                    onChange={e => handleMaterialChange(idx, 'note', e.target.value)}
                    fullWidth
                    multiline
                    minRows={2}
                  />
                </Grid>
                <Grid item xs={2}>
                  <TextField
                    size="small"
                    label="Поставить к дате"
                    value={mat.deliveryDate || ''}
                    onChange={e => handleMaterialChange(idx, 'deliveryDate', e.target.value)}
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={1}>
                  <Button color="error" size="small" onClick={() => handleRemoveMaterial(idx)} sx={{ mt: { xs: 2, sm: 0 } }}>
                    Удалить
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          ))}
          <Button onClick={handleAddMaterial} variant="outlined" size="small" sx={{ alignSelf: 'flex-end' }}>
            Добавить материал
          </Button>
        </Box>
      </Box>
      <Box mt={3} display="flex" gap={2}>
        <Button variant="contained" color="primary" onClick={handleSave}>
          Сохранить
        </Button>
        {isEdit && (
          <Button variant="outlined" color="error" onClick={() => setConfirmDelete(true)}>
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
    </Paper>
  );
}