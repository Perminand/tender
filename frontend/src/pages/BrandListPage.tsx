import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  Container
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { api } from '../utils/api';

interface Brand {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

interface BrandFormData {
  name: string;
  description: string;
}

const BrandListPage: React.FC = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [formData, setFormData] = useState<BrandFormData>({
    name: '',
    description: ''
  });

  const loadBrands = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/dictionaries/brands');
      setBrands(response.data);
      setError(null);
    } catch (err) {
      console.error('Error loading brands:', err);
      setError('Ошибка загрузки брендов');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBrands();
  }, []);

  const handleOpenDialog = (brand?: Brand) => {
    if (brand) {
      setEditingBrand(brand);
      setFormData({
        name: brand.name,
        description: brand.description || ''
      });
    } else {
      setEditingBrand(null);
      setFormData({ name: '', description: '' });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingBrand(null);
    setFormData({ name: '', description: '' });
  };

  const handleSubmit = async () => {
    try {
      if (editingBrand) {
        // Обновление существующего бренда
        await api.put(`/api/dictionaries/brands/${editingBrand.id}`, formData);
      } else {
        // Создание нового бренда
        await api.post('/api/dictionaries/brands', formData);
      }
      handleCloseDialog();
      loadBrands();
    } catch (err) {
      console.error('Error saving brand:', err);
      setError('Ошибка сохранения бренда');
    }
  };

  const handleDelete = async (brandId: string) => {
    if (window.confirm('Вы уверены, что хотите удалить этот бренд?')) {
      try {
        await api.delete(`/api/dictionaries/brands/${brandId}`);
        loadBrands();
      } catch (err) {
        console.error('Error deleting brand:', err);
        setError('Ошибка удаления бренда');
      }
    }
  };

  if (loading) {
    return (
      <Container>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h4" component="h1">
            Справочник брендов
          </Typography>
          <Box>
            <IconButton onClick={loadBrands} sx={{ mr: 1 }}>
              <RefreshIcon />
            </IconButton>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
            >
              Добавить бренд
            </Button>
          </Box>
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Card>
          <CardContent>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Название</TableCell>
                    <TableCell>Описание</TableCell>
                    <TableCell>Дата создания</TableCell>
                    <TableCell>Действия</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {brands.map((brand) => (
                    <TableRow key={brand.id}>
                      <TableCell>{brand.name}</TableCell>
                      <TableCell>{brand.description || '-'}</TableCell>
                      <TableCell>
                        {new Date(brand.createdAt).toLocaleDateString('ru-RU')}
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDialog(brand)}
                          sx={{ mr: 1 }}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(brand.id)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Box>

      {/* Диалог создания/редактирования */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingBrand ? 'Редактировать бренд' : 'Добавить бренд'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Название"
            fullWidth
            variant="outlined"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Описание"
            fullWidth
            variant="outlined"
            multiline
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Отмена</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingBrand ? 'Сохранить' : 'Добавить'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default BrandListPage; 