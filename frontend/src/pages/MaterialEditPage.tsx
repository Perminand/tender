import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  Box, Button, Grid, Paper, TextField, Typography, Alert, Autocomplete, Chip
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';

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
  const { control, handleSubmit, register, formState: { errors }, reset, setValue } = useForm<FormData>({ defaultValues });
  const [saveError, setSaveError] = useState<string | null>(null);

  // States for dictionaries
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [materialTypes, setMaterialTypes] = useState<MaterialTypeDto[]>([]);
  const [units, setUnits] = useState<UnitDto[]>([]);

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
      navigate('/reference/materials');
    } catch (error) {
      setSaveError('Произошла ошибка сети.');
    }
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
              label="Ссылка на сайт производителя"
              fullWidth
              {...register('link')}
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
                <Autocomplete
                  options={categories}
                  getOptionLabel={(option) => option.name}
                  value={categories.find(c => c.id === field.value) || null}
                  onChange={(_, newValue) => field.onChange(newValue?.id || null)}
                  renderInput={(params) => <TextField {...params} label="Категория" />}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Controller
              name="materialTypeId"
              control={control}
              render={({ field }) => (
                <Autocomplete
                  options={materialTypes}
                  getOptionLabel={(option) => option.name}
                  value={materialTypes.find(mt => mt.id === field.value) || null}
                  onChange={(_, newValue) => field.onChange(newValue?.id || null)}
                  renderInput={(params) => <TextField {...params} label="Тип материала" />}
                />
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
            <Autocomplete
              multiple
              options={units}
              getOptionLabel={(option) => `${option.name} (${option.shortName})`}
              value={units.filter(u => field.value?.includes(u.id))}
              onChange={(_, newValue) => field.onChange(newValue.map(v => v.id))}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip variant="outlined" label={option.name} {...getTagProps({ index })} />
                ))
              }
              renderInput={(params) => <TextField {...params} label="Выберите одну или несколько единиц" />}
            />
          )}
        />
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
        <Button onClick={() => navigate('/reference/materials')} sx={{ mr: 1 }}>
          Отмена
        </Button>
        <Button type="submit" variant="contained">
          {isEdit ? 'Сохранить изменения' : 'Создать материал'}
        </Button>
      </Box>
    </form>
  );
};

export default MaterialEditPage; 