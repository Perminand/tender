import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  Box, Button, Grid, Paper, TextField, Typography, Alert, Autocomplete, Chip, IconButton, List, ListItem, ListItemText, ListItemSecondaryAction
} from '@mui/material';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

// DTOs for related entities
interface CategoryDto {
  id: string;
  name: string;
}

interface MaterialTypeDto {
  id: string;
  name: string;
}

interface UnitDto {
  id: string;
  name: string;
  shortName: string;
}

// Main DTO for Material
interface MaterialDto {
  id: string;
  name: string;
  description: string;
  materialType: MaterialTypeDto | null;
  link: string;
  units: UnitDto[];
  code: string;
  category: CategoryDto | null;
}

// Form data structure now aligns with DTOs for create/update
type FormData = {
  name: string;
  description: string;
  materialTypeId: string | null;
  link: string;
  unitIds: string[];
  code: string;
  categoryId: string | null;
};

const defaultValues: FormData = {
  name: '',
  description: '',
  materialTypeId: null,
  link: '',
  unitIds: [],
  code: '',
  categoryId: null,
};

const MaterialEditPage: React.FC<{ isEdit: boolean }> = ({ isEdit }) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const { control, handleSubmit, register, formState: { errors }, reset, setValue } = useForm<FormData>({ defaultValues });
  const [saveError, setSaveError] = useState<string | null>(null);

  // States for dictionaries
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [materialTypes, setMaterialTypes] = useState<MaterialTypeDto[]>([]);
  const [units, setUnits] = useState<UnitDto[]>([]);

  // Dialogs for creating on the fly
  const [openNewCategoryDialog, setOpenNewCategoryDialog] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [openNewTypeDialog, setOpenNewTypeDialog] = useState(false);
  const [newTypeName, setNewTypeName] = useState('');
  const [openNewUnitDialog, setOpenNewUnitDialog] = useState(false);
  const [newUnitName, setNewUnitName] = useState('');
  const [newUnitShortName, setNewUnitShortName] = useState('');

  // New states for supplier names
  const [supplierNames, setSupplierNames] = useState<string[]>([]);
  const [newSupplierName, setNewSupplierName] = useState('');
  const [editSupplierIdx, setEditSupplierIdx] = useState<number | null>(null);
  const [editSupplierValue, setEditSupplierValue] = useState('');

  // --- ДОБАВЛЯЕМ состояния для inputValue ---
  const [categoryInputValue, setCategoryInputValue] = useState('');
  const [typeInputValue, setTypeInputValue] = useState('');

  // Fetch all dictionaries
  useEffect(() => {
    const fetchDict = async (url: string, setter: React.Dispatch<React.SetStateAction<any[]>>) => {
      try {
        const response = await fetch(`http://localhost:8080/api${url}`);
        if (!response.ok) throw new Error(`Failed to fetch ${url}`);
        const data = await response.json();
        setter(data);
      } catch (error) {
        console.error(error);
        setter([]);
      }
    };
    fetchDict('/categories', setCategories);
    fetchDict('/material-types', setMaterialTypes);
    fetchDict('/units', setUnits);
  }, []);

  // Fetch material data if in edit mode
  useEffect(() => {
    if (isEdit && id) {
      fetch(`http://localhost:8080/api/materials/${id}`)
        .then(res => res.json())
        .then((data: MaterialDto) => {
          const formData: FormData = {
            name: data.name || '',
            description: data.description || '',
            materialTypeId: data.materialType?.id || null,
            link: data.link || '',
            unitIds: data.units?.map(u => u.id) || [],
            code: data.code || '',
            categoryId: data.category?.id || null,
          };
          reset(formData);
        })
        .catch(error => {
          console.error('Ошибка при загрузке материала:', error);
          setSaveError('Ошибка при загрузке материала');
        });
    }
  }, [id, isEdit, reset]);

  useEffect(() => {
    if (!isEdit && location.search) {
      const params = new URLSearchParams(location.search);
      const name = params.get('name');
      if (name) {
        setValue('name', name);
      }
    }
  }, [isEdit, location.search, setValue]);

  useEffect(() => {
    if (isEdit && id) {
      fetch(`/api/supplier-material-names/by-material/${id}`)
        .then(res => res.json())
        .then((data: any[]) => setSupplierNames(data.map(n => n.name)))
        .catch(() => setSupplierNames([]));
    }
  }, [isEdit, id]);

  const onSubmit = async (data: FormData) => {
    const url = isEdit ? `http://localhost:8080/api/materials/${id}` : 'http://localhost:8080/api/materials';
    const method = isEdit ? 'PUT' : 'POST';

    // The payload now matches MaterialDtoNew/MaterialDtoUpdate
    const payload = {
      ...data,
      unitIds: data.unitIds || []
    };
    
    try {
      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setSaveError(errorData.message || 'Не удалось сохранить материал.');
        return;
      }

      if (!isEdit) {
        const createdMaterial = await response.json();
        if (window.opener) {
          window.opener.postMessage(
            {
              type: 'materialCreated',
              payload: {
                name: createdMaterial.name,
                id: createdMaterial.id,
              }
            },
            '*'
          );
          window.close();
          return;
        }
      }

      navigate('/reference/materials');
    } catch (error) {
      setSaveError('Произошла ошибка сети.');
    }
  };

  // Functions for creating on the fly
  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;
    try {
      const res = await fetch('http://localhost:8080/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCategoryName })
      });
      if (res.ok) {
        const created = await res.json();
        setCategories(prev => [...prev, created]);
        setValue('categoryId', created.id);
        setOpenNewCategoryDialog(false);
        setNewCategoryName('');
      }
    } catch (e) { /* handle error */ }
  };
  const handleCreateType = async () => {
    if (!newTypeName.trim()) return;
    try {
      const res = await fetch('http://localhost:8080/api/material-types', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newTypeName })
      });
      if (res.ok) {
        const created = await res.json();
        setMaterialTypes(prev => [...prev, created]);
        setValue('materialTypeId', created.id);
        setOpenNewTypeDialog(false);
        setNewTypeName('');
      }
    } catch (e) { /* handle error */ }
  };
  const handleCreateUnit = async () => {
    if (!newUnitName.trim()) return;
    try {
      const res = await fetch('http://localhost:8080/api/units', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newUnitName, shortName: newUnitShortName || newUnitName })
      });
      if (res.ok) {
        const created = await res.json();
        setUnits(prev => [...prev, created]);
        setValue('unitIds', [...(Array.isArray(control._formValues.unitIds) ? control._formValues.unitIds : []), created.id]);
        setOpenNewUnitDialog(false);
        setNewUnitName('');
        setNewUnitShortName('');
      }
    } catch (e) { /* handle error */ }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Typography variant="h4" gutterBottom>
        {isEdit ? 'Редактирование материала' : 'Новый материал'}
      </Typography>
      
      {saveError && <Alert severity="error" sx={{ mb: 2 }}>{saveError}</Alert>}

      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Основная информация</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Название *"
              fullWidth
              {...register('name', { required: 'Название обязательно' })}
              error={!!errors.name}
              helperText={errors.name?.message}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Код/Артикул"
              fullWidth
              {...register('code')}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Описание"
              fullWidth
              multiline
              rows={3}
              {...register('description')}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Ссылка на сайт производителя"
              fullWidth
              {...register('link')}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        </Grid>
      </Paper>
      
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Классификация</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Controller
              name="categoryId"
              control={control}
              render={({ field }) => (
                <>
                  <Autocomplete
                    options={[
                      ...categories,
                      ...(categoryInputValue && !categories.some(c => c.name.toLowerCase() === categoryInputValue.toLowerCase())
                        ? [{ id: 'CREATE_NEW', name: `Создать категорию: "${categoryInputValue}"`, inputValue: categoryInputValue }]
                        : [])
                    ]}
                    inputValue={categoryInputValue}
                    onInputChange={(_, value) => setCategoryInputValue(value)}
                    getOptionLabel={option => option.name}
                    value={categories.find(c => c.id === field.value) || null}
                    onChange={(_, newValue) => {
                      if (newValue?.id === 'CREATE_NEW') {
                        setNewCategoryName(newValue.inputValue);
                        setOpenNewCategoryDialog(true);
                      } else {
                        field.onChange(newValue?.id || null);
                      }
                    }}
                    renderInput={params => <TextField {...params} label="Категория" InputLabelProps={{ shrink: true }} />}
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                  />
                  <Dialog open={openNewCategoryDialog} onClose={() => setOpenNewCategoryDialog(false)}>
                    <DialogTitle>Создать новую категорию</DialogTitle>
                    <DialogContent>
                      <TextField autoFocus label="Название категории" fullWidth value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} InputLabelProps={{ shrink: true }} />
                    </DialogContent>
                    <DialogActions>
                      <Button onClick={() => setOpenNewCategoryDialog(false)}>Отмена</Button>
                      <Button onClick={handleCreateCategory} variant="contained">Создать</Button>
                    </DialogActions>
                  </Dialog>
                </>
              )}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Controller
              name="materialTypeId"
              control={control}
              render={({ field }) => (
                <>
                  <Autocomplete
                    options={[
                      ...materialTypes,
                      ...(typeInputValue && !materialTypes.some(mt => mt.name.toLowerCase() === typeInputValue.toLowerCase())
                        ? [{ id: 'CREATE_NEW', name: `Создать тип: "${typeInputValue}"`, inputValue: typeInputValue }]
                        : [])
                    ]}
                    inputValue={typeInputValue}
                    onInputChange={(_, value) => setTypeInputValue(value)}
                    getOptionLabel={option => option.name}
                    value={materialTypes.find(mt => mt.id === field.value) || null}
                    onChange={(_, newValue) => {
                      if (newValue?.id === 'CREATE_NEW') {
                        setNewTypeName(newValue.inputValue);
                        setOpenNewTypeDialog(true);
                      } else {
                        field.onChange(newValue?.id || null);
                      }
                    }}
                    renderInput={params => <TextField {...params} label="Тип материала" InputLabelProps={{ shrink: true }} />}
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                  />
                  <Dialog open={openNewTypeDialog} onClose={() => setOpenNewTypeDialog(false)}>
                    <DialogTitle>Создать новый тип материала</DialogTitle>
                    <DialogContent>
                      <TextField autoFocus label="Название типа" fullWidth value={newTypeName} onChange={e => setNewTypeName(e.target.value)} InputLabelProps={{ shrink: true }} />
                    </DialogContent>
                    <DialogActions>
                      <Button onClick={() => setOpenNewTypeDialog(false)}>Отмена</Button>
                      <Button onClick={handleCreateType} variant="contained">Создать</Button>
                    </DialogActions>
                  </Dialog>
                </>
              )}
            />
          </Grid>
        </Grid>
      </Paper>
      
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Единицы измерения</Typography>
        <Controller
          name="unitIds"
          control={control}
          render={({ field }) => (
            <>
              <Autocomplete
                multiple
                options={[...units, { id: 'CREATE_NEW', name: 'Создать новую единицу', shortName: '' }]}
                getOptionLabel={(option) => option.name}
                value={units.filter(u => field.value?.includes(u.id))}
                onChange={(_, newValue) => {
                  if (Array.isArray(newValue) && newValue.some(v => v.id === 'CREATE_NEW')) {
                    setOpenNewUnitDialog(true);
                  } else {
                    field.onChange(newValue.map(v => v.id));
                  }
                }}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip variant="outlined" label={option.name} {...getTagProps({ index })} />
                  ))
                }
                renderInput={(params) => <TextField {...params} label="Выберите одну или несколько единиц" InputLabelProps={{ shrink: true }} />}
                isOptionEqualToValue={(option, value) => option.id === value.id}
              />
              <Dialog open={openNewUnitDialog} onClose={() => setOpenNewUnitDialog(false)}>
                <DialogTitle>Создать новую единицу измерения</DialogTitle>
                <DialogContent>
                  <TextField autoFocus label="Название" fullWidth value={newUnitName} onChange={e => setNewUnitName(e.target.value)} sx={{ mb: 2 }} InputLabelProps={{ shrink: true }} />
                  <TextField label="Сокращение" fullWidth value={newUnitShortName} onChange={e => setNewUnitShortName(e.target.value)} InputLabelProps={{ shrink: true }} />
                </DialogContent>
                <DialogActions>
                  <Button onClick={() => setOpenNewUnitDialog(false)}>Отмена</Button>
                  <Button onClick={handleCreateUnit} variant="contained">Создать</Button>
                </DialogActions>
              </Dialog>
            </>
          )}
        />
      </Paper>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Наименования у поставщиков</Typography>
        <List>
          {supplierNames.map((name, idx) => (
            <ListItem key={idx}>
              {editSupplierIdx === idx ? (
                <TextField
                  value={editSupplierValue}
                  onChange={e => setEditSupplierValue(e.target.value)}
                  size="small"
                  sx={{ mr: 1 }}
                  InputLabelProps={{ shrink: true }}
                />
              ) : (
                <ListItemText primary={name} />
              )}
              <ListItemSecondaryAction>
                {editSupplierIdx === idx ? (
                  <>
                    <IconButton edge="end" onClick={async () => {
                      await fetch(`/api/supplier-material-names`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ materialId: id, name: editSupplierValue })
                      });
                      setSupplierNames(sn => sn.map((n, i) => i === idx ? editSupplierValue : n));
                      setEditSupplierIdx(null);
                      setEditSupplierValue('');
                    }}>
                      <EditIcon color="primary" />
                    </IconButton>
                    <IconButton edge="end" onClick={() => { setEditSupplierIdx(null); setEditSupplierValue(''); }}>
                      <DeleteIcon color="error" />
                    </IconButton>
                  </>
                ) : (
                  <>
                    <IconButton edge="end" onClick={() => { setEditSupplierIdx(idx); setEditSupplierValue(name); }}>
                      <EditIcon />
                    </IconButton>
                    <IconButton edge="end" onClick={async () => {
                      await fetch(`/api/supplier-material-names`, {
                        method: 'DELETE',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ materialId: id, name })
                      });
                      setSupplierNames(sn => sn.filter((_, i) => i !== idx));
                    }}>
                      <DeleteIcon />
                    </IconButton>
                  </>
                )}
              </ListItemSecondaryAction>
            </ListItem>
          ))}
          <ListItem>
            <TextField
              value={newSupplierName}
              onChange={e => setNewSupplierName(e.target.value)}
              size="small"
              label="Добавить наименование"
              sx={{ mr: 1 }}
              InputLabelProps={{ shrink: true }}
            />
            <Button
              variant="contained"
              size="small"
              onClick={async () => {
                if (newSupplierName.trim()) {
                  await fetch(`/api/supplier-material-names`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ materialId: id, name: newSupplierName })
                  });
                  setSupplierNames(sn => [...sn, newSupplierName]);
                  setNewSupplierName('');
                }
              }}
            >Добавить</Button>
          </ListItem>
        </List>
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, gap: 2 }}>
        <Button variant="outlined" color="secondary" onClick={() => navigate('/reference/materials')}>Отмена</Button>
        <Button type="submit" variant="contained" sx={{ ml: 1 }}>
          {isEdit ? 'Сохранить изменения' : 'Создать материал'}
        </Button>
      </Box>
    </form>
  );
};

export default MaterialEditPage; 