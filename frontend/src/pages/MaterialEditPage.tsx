import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  Box, Button, Grid, Paper, TextField, Typography, Alert, Snackbar, Autocomplete, Dialog, DialogActions, DialogContent, DialogTitle, Chip
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';

interface Category {
  id: string;
  name: string;
}

interface MaterialType {
  id: string;
  name: string;
}

interface Unit {
  id: string;
  name: string;
  shortName: string;
}

interface Material {
  id: string;
  name: string;
  description: string;
  materialType: MaterialType | null;
  link: string;
  units: Unit[];
  code: string;
  category: Category | null;
  createdAt: string;
  updatedAt: string;
}

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
  const { control, handleSubmit, register, formState: { errors }, reset, getValues, setValue } = useForm<FormData>({ defaultValues });
  const [saveError, setSaveError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [materialTypes, setMaterialTypes] = useState<MaterialType[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [openNewCategoryDialog, setOpenNewCategoryDialog] = useState(false);
  const [openNewMaterialTypeDialog, setOpenNewMaterialTypeDialog] = useState(false);
  const [openNewUnitDialog, setOpenNewUnitDialog] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newMaterialTypeName, setNewMaterialTypeName] = useState('');
  const [newUnitData, setNewUnitData] = useState({ name: '', shortName: '' });

  useEffect(() => {
    // Загрузка категорий
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(error => {
        console.error('Ошибка при загрузке категорий:', error);
        setCategories([]);
      });

    // Загрузка типов материалов
    fetch('/api/material-types')
      .then(res => res.json())
      .then(data => setMaterialTypes(data))
      .catch(error => {
        console.error('Ошибка при загрузке типов материалов:', error);
        setMaterialTypes([]);
      });

    // Загрузка единиц измерения
    fetch('/api/units')
      .then(res => res.json())
      .then(data => setUnits(data))
      .catch(error => {
        console.error('Ошибка при загрузке единиц измерения:', error);
        setUnits([]);
      });
  }, []);

  useEffect(() => {
    if (isEdit && id) {
      fetch(`/api/materials/${id}`)
        .then(res => res.json())
        .then((data: Material) => {
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

  const onSubmit = async (data: FormData) => {
    const url = isEdit ? `/api/materials/${id}` : '/api/materials';
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorText = await response.text();
        setSaveError(`Не удалось сохранить материал. ${errorText}`);
        return;
      }
      navigate('/reference/materials');
    } catch (error) {
      if (error instanceof Error) {
        setSaveError(error.message);
      } else {
        setSaveError('Произошла неизвестная ошибка');
      }
    }
  };

  const createNewCategoryOption: Category = { id: 'CREATE_NEW', name: 'Создать новую категорию' };
  const createNewMaterialTypeOption: MaterialType = { id: 'CREATE_NEW', name: 'Создать новый тип' };
  const createNewUnitOption: Unit = { id: 'CREATE_NEW', name: 'Создать новую единицу измерения', shortName: '' };

  const handleCloseCategoryDialog = () => {
    setOpenNewCategoryDialog(false);
    setNewCategoryName('');
  };

  const handleCloseMaterialTypeDialog = () => {
    setOpenNewMaterialTypeDialog(false);
    setNewMaterialTypeName('');
  };

  const handleCloseUnitDialog = () => {
    setOpenNewUnitDialog(false);
    setNewUnitData({ name: '', shortName: '' });
  };

  const handleSaveNewCategory = async () => {
    if (newCategoryName.trim()) {
      try {
        const res = await fetch('/api/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: newCategoryName }),
        });
        if (res.ok) {
          const newCategory = await res.json();
          setCategories(prev => [...prev, newCategory]);
          setValue('categoryId', newCategory.id);
        }
      } catch (e) {
        console.error(e);
      }
      handleCloseCategoryDialog();
    }
  };

  const handleSaveNewMaterialType = async () => {
    if (newMaterialTypeName.trim()) {
      try {
        const res = await fetch('/api/material-types', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: newMaterialTypeName }),
        });
        if (res.ok) {
          const newMaterialType = await res.json();
          setMaterialTypes(prev => [...prev, newMaterialType]);
          setValue('materialTypeId', newMaterialType.id);
        }
      } catch (e) {
        console.error(e);
      }
      handleCloseMaterialTypeDialog();
    }
  };

  const handleSaveNewUnit = async () => {
    if (newUnitData.name.trim() && newUnitData.shortName.trim()) {
      try {
        const res = await fetch('/api/units', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newUnitData),
        });
        if (res.ok) {
          const newUnit = await res.json();
          setUnits(prev => [...prev, newUnit]);
          const currentUnitIds = getValues('unitIds') || [];
          setValue('unitIds', [...currentUnitIds, newUnit.id]);
        }
      } catch (e) {
        console.error(e);
      }
      handleCloseUnitDialog();
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Typography variant="h4" gutterBottom>
        {isEdit ? 'Редактирование материала' : 'Новый материал'}
      </Typography>
      
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
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Код/Артикул"
              fullWidth
              {...register('code')}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Описание"
              fullWidth
              multiline
              rows={3}
              {...register('description')}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Ссылка"
              fullWidth
              {...register('link')}
            />
          </Grid>
        </Grid>
      </Paper>
      
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>Классификация</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <Controller
              name="categoryId"
              control={control}
              render={({ field }) => (
                <Autocomplete
                  options={[...categories, createNewCategoryOption]}
                  getOptionLabel={(option) => option.name}
                  value={categories.find(c => c.id === field.value) || null}
                  onChange={(event, newValue) => {
                    if (newValue?.id === 'CREATE_NEW') {
                      setOpenNewCategoryDialog(true);
                    } else {
                      field.onChange(newValue?.id || null);
                    }
                  }}
                  renderInput={(params) => <TextField {...params} label="Категория" />}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Controller
              name="materialTypeId"
              control={control}
              render={({ field }) => (
                <Autocomplete
                  options={[...materialTypes, createNewMaterialTypeOption]}
                  getOptionLabel={(option) => option.name}
                  value={materialTypes.find(mt => mt.id === field.value) || null}
                  onChange={(event, newValue) => {
                    if (newValue?.id === 'CREATE_NEW') {
                      setOpenNewMaterialTypeDialog(true);
                    } else {
                      field.onChange(newValue?.id || null);
                    }
                  }}
                  renderInput={(params) => <TextField {...params} label="Тип материала" />}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Controller
              name="unitIds"
              control={control}
              render={({ field }) => (
                <Autocomplete
                  multiple
                  options={[...units, createNewUnitOption]}
                  getOptionLabel={(option) => option.name}
                  value={units.filter(u => field.value?.includes(u.id))}
                  onChange={(event, newValue) => {
                    if (newValue.some(option => option.id === 'CREATE_NEW')) {
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
                  renderInput={(params) => <TextField {...params} label="Единицы измерения" />}
                />
              )}
            />
          </Grid>
        </Grid>
      </Paper>
      
      <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
        <Button type="submit" variant="contained">
          {isEdit ? 'Сохранить' : 'Создать'}
        </Button>
        <Button variant="outlined" onClick={() => navigate('/reference/materials')}>
          Отмена
        </Button>
      </Box>

      {saveError && (
        <Snackbar open={!!saveError} autoHideDuration={6000} onClose={() => setSaveError(null)}>
          <Alert onClose={() => setSaveError(null)} severity="error" sx={{ width: '100%' }}>
            {saveError}
          </Alert>
        </Snackbar>
      )}

      {/* Dialogs for creating new entities */}
      <Dialog open={openNewCategoryDialog} onClose={handleCloseCategoryDialog}>
        <DialogTitle>Создать новую категорию</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Название категории"
            type="text"
            fullWidth
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCategoryDialog}>Отмена</Button>
          <Button onClick={handleSaveNewCategory}>Сохранить</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openNewMaterialTypeDialog} onClose={handleCloseMaterialTypeDialog}>
        <DialogTitle>Создать новый тип материала</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Название типа материала"
            type="text"
            fullWidth
            value={newMaterialTypeName}
            onChange={(e) => setNewMaterialTypeName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseMaterialTypeDialog}>Отмена</Button>
          <Button onClick={handleSaveNewMaterialType}>Сохранить</Button>
        </DialogActions>
      </Dialog>
      
      <Dialog open={openNewUnitDialog} onClose={handleCloseUnitDialog}>
        <DialogTitle>Создать новую единицу измерения</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Полное название"
            type="text"
            fullWidth
            value={newUnitData.name}
            onChange={(e) => setNewUnitData({ ...newUnitData, name: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Краткое название"
            type="text"
            fullWidth
            value={newUnitData.shortName}
            onChange={(e) => setNewUnitData({ ...newUnitData, shortName: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseUnitDialog}>Отмена</Button>
          <Button onClick={handleSaveNewUnit}>Сохранить</Button>
        </DialogActions>
      </Dialog>
    </form>
  );
};

export default MaterialEditPage; 