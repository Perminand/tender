import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton, Box, Autocomplete
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface Warehouse {
  id: string;
  name: string;
  projectId: string;
  project?: {
    id: string;
    name: string;
  };
}

interface Project {
  id: string;
  name: string;
}

const WarehouseListPage: React.FC = () => {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null);
  const [formData, setFormData] = useState({ name: '', projectId: '' });
  const navigate = useNavigate();

  const fetchWarehouses = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/warehouses');
      setWarehouses(response.data);
    } catch (error) {
      console.error('Error fetching warehouses:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await axios.get('/api/projects');
      setProjects(response.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  useEffect(() => {
    fetchWarehouses();
    fetchProjects();
  }, []);

  const handleOpenDialog = (warehouse?: Warehouse) => {
    if (warehouse) {
      setEditingWarehouse(warehouse);
      setFormData({ name: warehouse.name, projectId: warehouse.projectId });
    } else {
      setEditingWarehouse(null);
      setFormData({ name: '', projectId: '' });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingWarehouse(null);
    setFormData({ name: '', projectId: '' });
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.projectId) {
      alert('Пожалуйста, заполните все поля');
      return;
    }

    try {
      if (editingWarehouse) {
        await axios.put(`/api/warehouses/${editingWarehouse.id}`, formData);
      } else {
        await axios.post('/api/warehouses', formData);
      }
      fetchWarehouses();
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving warehouse:', error);
      alert('Ошибка при сохранении склада');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Вы уверены, что хотите удалить этот склад?')) {
      return;
    }

    try {
      await axios.delete(`/api/warehouses/${id}`);
      fetchWarehouses();
    } catch (error) {
      console.error('Error deleting warehouse:', error);
      alert('Ошибка при удалении склада');
    }
  };

  if (loading) {
    return (
      <Container>
        <Typography>Загрузка...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <IconButton onClick={() => navigate('/reference')} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1">
            Склады
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">
            Управление складами
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Добавить склад
          </Button>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Название</TableCell>
                <TableCell>Проект</TableCell>
                <TableCell align="right">Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {warehouses.map((warehouse) => (
                <TableRow key={warehouse.id}>
                  <TableCell>{warehouse.name}</TableCell>
                  <TableCell>{warehouse.project?.name || 'Не указан'}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      onClick={() => handleOpenDialog(warehouse)}
                      color="primary"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDelete(warehouse.id)}
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
      </Box>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingWarehouse ? 'Редактировать склад' : 'Добавить склад'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Название склада"
            fullWidth
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            sx={{ mb: 2 }}
          />
          <Autocomplete
            value={projects.find(p => p.id === formData.projectId) || null}
            onChange={(_, value) => setFormData({ ...formData, projectId: value ? value.id : '' })}
            options={projects}
            getOptionLabel={(option) => option.name}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Проект"
                required
                fullWidth
              />
            )}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Отмена</Button>
          <Button onClick={handleSave} variant="contained">
            {editingWarehouse ? 'Сохранить' : 'Добавить'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default WarehouseListPage; 