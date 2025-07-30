import React, { useState, useEffect, useRef } from 'react';
import {
  Container, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton, Box, Autocomplete, Snackbar, Alert,
  useTheme, useMediaQuery
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import Pagination from '@mui/material/Pagination';
import ResponsiveTable from '../components/ResponsiveTable';

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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
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
      const response = await api.get('/warehouses');
      console.log('Warehouses API response:', response.data);
      // Убеждаемся, что response.data является массивом
      const warehousesData = Array.isArray(response.data) ? response.data : [];
      console.log('Processed warehouses data:', warehousesData);
      setWarehouses(warehousesData);
    } catch (error) {
      console.error('Error fetching warehouses:', error);
      setSnackbar({open: true, message: 'Ошибка при загрузке складов', severity: 'error'});
      setWarehouses([]); // Устанавливаем пустой массив в случае ошибки
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await api.get('/projects');
      console.log('Projects API response:', response.data);
      // Убеждаемся, что response.data является массивом
      const projectsData = Array.isArray(response.data) ? response.data : [];
      console.log('Processed projects data:', projectsData);
      setProjects(projectsData);
    } catch (error) {
      console.error('Error fetching projects:', error);
      setSnackbar({open: true, message: 'Ошибка при загрузке проектов', severity: 'error'});
      setProjects([]); // Устанавливаем пустой массив в случае ошибки
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
        await api.put(`/warehouses/${editingWarehouse.id}`, formData);
        setSnackbar({open: true, message: 'Склад успешно обновлён', severity: 'success'});
      } else {
        await api.post('/warehouses', formData);
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
      await api.delete(`/warehouses/${id}`);
      setSnackbar({open: true, message: 'Склад успешно удалён', severity: 'success'});
      fetchWarehouses();
    } catch (error) {
      setSnackbar({open: true, message: 'Ошибка при удалении склада', severity: 'error'});
    }
  };

  // --- Импорт/экспорт ---
  const handleExport = async () => {
    try {
      const response = await api.get('/warehouses/export', { responseType: 'blob' });
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
      await api.post('/warehouses/import', formData);
      setSnackbar({open: true, message: 'Импорт успешно завершён', severity: 'success'});
      fetchWarehouses();
    } catch (error) {
      setSnackbar({open: true, message: 'Ошибка при импорте', severity: 'error'});
    }
  };

  // --- Поиск ---
  const filteredWarehouses = (Array.isArray(warehouses) ? warehouses : []).filter(warehouse =>
    warehouse.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (warehouse.project?.name && warehouse.project.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const paginatedWarehouses = filteredWarehouses.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  // Конфигурация колонок для ResponsiveTable
  const columns = [
    {
      id: 'name',
      label: 'Название склада',
      render: (value: any, row: Warehouse) => row.name
    },
    {
      id: 'project',
      label: 'Проект',
      render: (value: any, row: Warehouse) => row.project?.name || 'Не указан'
    },
    {
      id: 'actions',
      label: 'Действия',
      render: (value: any, row: Warehouse) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              handleOpenDialog(row);
            }}
            color="primary"
          >
            <EditIcon />
          </IconButton>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(row.id);
            }}
            color="error"
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      ),
      mobile: false
    }
  ];

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
          <Typography variant={isMobile ? "h5" : "h4"} component="h1">
            Склады
          </Typography>
        </Box>

        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 2,
          flexDirection: { xs: 'column', sm: 'row' },
          gap: { xs: 2, sm: 0 }
        }}>
          <Typography variant="body1" color="text.secondary">
            Управление складами по проектам
          </Typography>
          <Box sx={{ 
            display: 'flex', 
            gap: { xs: 1, sm: 2 },
            flexWrap: 'wrap'
          }}>
            <Button
              variant="outlined"
              startIcon={<FileDownloadIcon />}
              onClick={handleExport}
              size={isMobile ? 'small' : 'medium'}
            >
              Экспорт
            </Button>
            <Button
              variant="outlined"
              startIcon={<FileUploadIcon />}
              onClick={handleImportClick}
              component="label"
              size={isMobile ? 'small' : 'medium'}
            >
              Импорт
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
              size={isMobile ? 'small' : 'medium'}
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

        <ResponsiveTable
          columns={columns}
          data={paginatedWarehouses}
          getRowKey={(row) => row.id}
          onRowClick={(row) => handleOpenDialog(row)}
          title="Список складов"
          loading={loading}
        />
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