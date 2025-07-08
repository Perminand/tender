import React, { useState, useEffect, useRef } from 'react';
import {
  Container, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton, Box, Autocomplete, Snackbar, Alert
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Pagination from '@mui/material/Pagination';

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
  const [snackbar, setSnackbar] = useState<{open: boolean, message: string, severity: 'success' | 'error'}>({open: false, message: '', severity: 'success'});
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [page, setPage] = useState(1);
  const rowsPerPage = 50;

  const fetchWarehouses = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/warehouses');
      setWarehouses(response.data);
    } catch (error) {
      setSnackbar({open: true, message: 'Ошибка при загрузке складов', severity: 'error'});
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await axios.get('/api/projects');
      setProjects(response.data);
    } catch (error) {
      setSnackbar({open: true, message: 'Ошибка при загрузке проектов', severity: 'error'});
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
      setSnackbar({open: true, message: 'Пожалуйста, заполните все поля', severity: 'error'});
      return;
    }
    try {
      if (editingWarehouse) {
        await axios.put(`/api/warehouses/${editingWarehouse.id}`, formData);
        setSnackbar({open: true, message: 'Склад успешно обновлён', severity: 'success'});
      } else {
        await axios.post('/api/warehouses', formData);
        setSnackbar({open: true, message: 'Склад успешно добавлен', severity: 'success'});
      }
      fetchWarehouses();
      handleCloseDialog();
    } catch (error) {
      setSnackbar({open: true, message: 'Ошибка при сохранении склада', severity: 'error'});
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот склад?')) {
      return;
    }
    try {
      await axios.delete(`/api/warehouses/${id}`);
      setSnackbar({open: true, message: 'Склад успешно удалён', severity: 'success'});
      fetchWarehouses();
    } catch (error) {
      setSnackbar({open: true, message: 'Ошибка при удалении склада', severity: 'error'});
    }
  };

  // --- Импорт/экспорт ---
  const handleExport = async () => {
    try {
      const response = await axios.get('/api/warehouses/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'warehouses.xlsx');
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      setSnackbar({open: true, message: 'Ошибка при экспорте', severity: 'error'});
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files?.length) return;
    const file = event.target.files[0];
    const formData = new FormData();
    formData.append('file', file);
    try {
      await axios.post('/api/warehouses/import', formData);
      setSnackbar({open: true, message: 'Импорт успешно завершён', severity: 'success'});
      fetchWarehouses();
    } catch (error) {
      setSnackbar({open: true, message: 'Ошибка при импорте', severity: 'error'});
    }
  };

  // --- Поиск ---
  const filteredWarehouses = warehouses.filter(warehouse =>
    warehouse.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedWarehouses = filteredWarehouses.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: 4, mb: 4 }}>
          <Typography>Загрузка...</Typography>
        </Box>
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

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="body1" color="text.secondary">
            Управление складами по проектам
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<FileDownloadIcon />}
              onClick={handleExport}
            >
              Экспорт в Excel
            </Button>
            <Button
              variant="outlined"
              startIcon={<FileUploadIcon />}
              onClick={handleImportClick}
              component="label"
            >
              Импорт из Excel
              <input
                type="file"
                accept=".xlsx,.xls"
                hidden
                ref={fileInputRef}
                onChange={handleImport}
              />
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
            >
              Добавить склад
            </Button>
          </Box>
        </Box>

        <TextField
          label="Поиск"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          size="small"
          fullWidth
          sx={{ mb: 2 }}
        />

        <TableContainer component={Paper} sx={{ mb: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Название склада</TableCell>
                <TableCell>Проект</TableCell>
                <TableCell align="right">Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedWarehouses.map((warehouse) => (
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
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Pagination
            count={Math.ceil(filteredWarehouses.length / rowsPerPage)}
            page={page}
            onChange={(_, value) => setPage(value)}
            color="primary"
          />
        </Box>
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
            renderInput={(params) => <TextField {...params} label="Проект" fullWidth />}
            sx={{ mb: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Отмена</Button>
          <Button onClick={handleSave} variant="contained">Сохранить</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default WarehouseListPage; 