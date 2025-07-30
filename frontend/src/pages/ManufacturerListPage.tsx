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

interface Manufacturer {
  id: string;
  name: string;
  description?: string;
  country?: string;
  createdAt: string;
  updatedAt: string;
}

interface ManufacturerFormData {
  name: string;
  description: string;
  country: string;
}

const ManufacturerListPage: React.FC = () => {
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingManufacturer, setEditingManufacturer] = useState<Manufacturer | null>(null);
  const [formData, setFormData] = useState<ManufacturerFormData>({
    name: '',
    description: '',
    country: ''
  });

  const loadManufacturers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/dictionaries/manufacturers');
      setManufacturers(response.data);
      setError(null);
    } catch (err) {
      console.error('Error loading manufacturers:', err);
      setError('Ошибка загрузки производителей');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadManufacturers();
  }, []);

  const handleOpenDialog = (manufacturer?: Manufacturer) => {
    if (manufacturer) {
      setEditingManufacturer(manufacturer);
      setFormData({
        name: manufacturer.name,
        description: manufacturer.description || '',
        country: manufacturer.country || ''
      });
    } else {
      setEditingManufacturer(null);
      setFormData({ name: '', description: '', country: '' });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingManufacturer(null);
    setFormData({ name: '', description: '', country: '' });
  };

  const handleSubmit = async () => {
    try {
      if (editingManufacturer) {
        // Обновление существующего производителя
        await api.put(`/api/dictionaries/manufacturers/${editingManufacturer.id}`, formData);
      } else {
        // Создание нового производителя
        await api.post('/api/dictionaries/manufacturers', formData);
      }
      handleCloseDialog();
      loadManufacturers();
    } catch (err) {
      console.error('Error saving manufacturer:', err);
      setError('Ошибка сохранения производителя');
    }
  };

  const handleDelete = async (manufacturerId: string) => {
    if (window.confirm('Вы уверены, что хотите удалить этого производителя?')) {
      try {
        await api.delete(`/api/dictionaries/manufacturers/${manufacturerId}`);
        loadManufacturers();
      } catch (err) {
        console.error('Error deleting manufacturer:', err);
        setError('Ошибка удаления производителя');
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
            Справочник производителей
          </Typography>
          <Box>
            <IconButton onClick={loadManufacturers} sx={{ mr: 1 }}>
              <RefreshIcon />
            </IconButton>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
            >
              Добавить производителя
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
                    <TableCell>Страна</TableCell>
                    <TableCell>Описание</TableCell>
                    <TableCell>Дата создания</TableCell>
                    <TableCell>Действия</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {manufacturers.map((manufacturer) => (
                    <TableRow key={manufacturer.id}>
                      <TableCell>{manufacturer.name}</TableCell>
                      <TableCell>{manufacturer.country || '-'}</TableCell>
                      <TableCell>{manufacturer.description || '-'}</TableCell>
                      <TableCell>
                        {new Date(manufacturer.createdAt).toLocaleDateString('ru-RU')}
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDialog(manufacturer)}
                          sx={{ mr: 1 }}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(manufacturer.id)}
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
          {editingManufacturer ? 'Редактировать производителя' : 'Добавить производителя'}
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
            label="Страна"
            fullWidth
            variant="outlined"
            value={formData.country}
            onChange={(e) => setFormData({ ...formData, country: e.target.value })}
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
            {editingManufacturer ? 'Сохранить' : 'Добавить'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ManufacturerListPage; 