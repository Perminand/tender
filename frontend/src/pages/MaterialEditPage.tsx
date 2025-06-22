import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  Box, Button, Grid, Paper, TextField, Typography, Alert, Snackbar, Autocomplete, Dialog, DialogActions, DialogContent, DialogTitle
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';

interface Category {
  id: string;
  name: string;
}

interface Material {
  id: string;
  name: string;
  description: string;
  type: string;
  link: string;
  unit: string;
  code: string;
  category: Category | null;
  createdAt: string;
  updatedAt: string;
}

type FormData = {
  name: string;
  description: string;
  type: string;
  link: string;
  unit: string;
  code: string;
  categoryId: string | null;
};

const defaultValues: FormData = {
  name: '',
  description: '',
  type: '',
  link: '',
  unit: '',
  code: '',
  categoryId: null,
};

const MaterialEditPage: React.FC<{ isEdit: boolean }> = ({ isEdit }) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { control, handleSubmit, register, formState: { errors }, reset, getValues } = useForm<FormData>({ defaultValues });
  const [saveError, setSaveError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [openNewCategoryDialog, setOpenNewCategoryDialog] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  useEffect(() => {
    // Загрузка категорий
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(error => {
        console.error('Ошибка при загрузке категорий:', error);
        setCategories([]);
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
            type: data.type || '',
            link: data.link || '',
            unit: data.unit || '',
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
    const method = isEdit ? 'PATCH' : 'POST';

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
      navigate('/materials');
    } catch (error) {
      if (error instanceof Error) {
        setSaveError(error.message);
      } else {
        setSaveError('Произошла неизвестная ошибка');
      }
    }
  };

  const createNewCategoryOption: Category = { id: 'CREATE_NEW', name: 'Создать новую категорию' };

  const handleCloseDialog = () => {
    setOpenNewCategoryDialog(false);
    setNewCategoryName('');
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
          reset({ 
            ...getValues(), 
            categoryId: newCategory.id 
          });
        }
      } catch (e) { 
        console.error(e); 
      }
      handleCloseDialog();
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
              {...register('name', { 
                required: 'Название не может быть пустым' 
              })}
              error={!!errors.name}
              helperText={errors.name?.message}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Код/артикул"
              fullWidth
              {...register('code')}
              placeholder="ГОСТ, артикул и т.д."
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Controller
              name="categoryId"
              control={control}
              render={({ field }) => {
                const selectedValue = categories.find(option => option.id === field.value) || null;
                return (
                  <>
                    <Autocomplete
                      value={selectedValue}
                      onChange={(_, newValue) => {
                        if (newValue?.id === 'CREATE_NEW') {
                          setOpenNewCategoryDialog(true);
                        } else {
                          field.onChange(newValue?.id || null);
                        }
                      }}
                      options={[...categories, createNewCategoryOption]}
                      getOptionLabel={(option) => option.name}
                      isOptionEqualToValue={(option, value) => option.id === value.id}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Категория"
                          placeholder="Выберите категорию"
                        />
                      )}
                    />
                    <Dialog open={openNewCategoryDialog} onClose={handleCloseDialog}>
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
                        <Button onClick={handleCloseDialog}>Отмена</Button>
                        <Button onClick={handleSaveNewCategory}>Сохранить</Button>
                      </DialogActions>
                    </Dialog>
                  </>
                );
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Тип"
              fullWidth
              {...register('type')}
              placeholder="Тип материала"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Единица измерения"
              fullWidth
              {...register('unit')}
              placeholder="шт., кг, м, м², м³, л"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Ссылка"
              fullWidth
              {...register('link')}
              placeholder="https://example.com"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Описание"
              fullWidth
              multiline
              rows={3}
              {...register('description')}
              placeholder="Подробное описание материала"
            />
          </Grid>
        </Grid>
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
        <Button variant="outlined" color="secondary" onClick={() => navigate('/materials')}>
          Отмена
        </Button>
        <Button type="submit" variant="contained">
          Сохранить
        </Button>
      </Box>

      {saveError && (
        <Snackbar 
          open={!!saveError} 
          autoHideDuration={6000} 
          onClose={() => setSaveError(null)}
        >
          <Alert severity="error">{saveError}</Alert>
        </Snackbar>
      )}
    </form>
  );
};

export default MaterialEditPage; 