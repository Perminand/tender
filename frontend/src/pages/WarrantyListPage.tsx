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

interface Warranty {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

interface WarrantyFormData {
  name: string;
  description: string;
}

const WarrantyListPage: React.FC = () => {
  const [warranties, setWarranties] = useState<Warranty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingWarranty, setEditingWarranty] = useState<Warranty | null>(null);
  const [formData, setFormData] = useState<WarrantyFormData>({
    name: '',
    description: ''
  });

  const loadWarranties = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/dictionaries/warranties');
      setWarranties(response.data);
      setError(null);
    } catch (err) {
      console.error('Error loading warranties:', err);
      setError('Ошибка загрузки гарантий');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWarranties();
  }, []);

  const handleOpenDialog = (warranty?: Warranty) => {
    if (warranty) {
      setEditingWarranty(warranty);
      setFormData({
        name: warranty.name,
        description: warranty.description || ''
      });
    } else {
      setEditingWarranty(null);
      setFormData({ name: '', description: '' });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingWarranty(null);
    setFormData({ name: '', description: '' });
  };

  const handleSubmit = async () => {
    try {
      if (editingWarranty) {
        // Обновление существующей гарантии
        await api.put(`/api/dictionaries/warranties/${editingWarranty.id}`, formData);
      } else {
        // Создание новой гарантии
        await api.post('/api/dictionaries/warranties', formData);
      }
      handleCloseDialog();
      loadWarranties();
    } catch (err) {
      console.error('Error saving warranty:', err);
      setError('Ошибка сохранения гарантии');
    }
  };

  const handleDelete = async (warrantyId: string) => {
    if (window.confirm('Вы уверены, что хотите удалить эту гарантию?')) {
      try {
        await api.delete(`/api/dictionaries/warranties/${warrantyId}`);
        loadWarranties();
      } catch (err) {
        console.error('Error deleting warranty:', err);
        setError('Ошибка удаления гарантии');
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
            Справочник гарантий
          </Typography>
          <Box>
            <IconButton onClick={loadWarranties} sx={{ mr: 1 }}>
              <RefreshIcon />
            </IconButton>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
            >
              Добавить гарантию
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
                  {warranties.map((warranty) => (
                    <TableRow key={warranty.id}>
                      <TableCell>{warranty.name}</TableCell>
                      <TableCell>{warranty.description || '-'}</TableCell>
                      <TableCell>
                        {new Date(warranty.createdAt).toLocaleDateString('ru-RU')}
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDialog(warranty)}
                          sx={{ mr: 1 }}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(warranty.id)}
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
          {editingWarranty ? 'Редактировать гарантию' : 'Добавить гарантию'}
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
            {editingWarranty ? 'Сохранить' : 'Добавить'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default WarrantyListPage; 