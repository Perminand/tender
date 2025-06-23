import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Paper,
  Snackbar,
  Alert
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, ArrowBack as ArrowBackIcon, FileDownload as FileDownloadIcon, FileUpload as FileUploadIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface MaterialType {
  id: string;
  name: string;
}

const MaterialTypeListPage: React.FC = () => {
  const [materialTypes, setMaterialTypes] = useState<MaterialType[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingMaterialType, setEditingMaterialType] = useState<MaterialType | null>(null);
  const [formData, setFormData] = useState({ name: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [snackbar, setSnackbar] = useState<{open: boolean, message: string, severity: 'success' | 'error'}>({open: false, message: '', severity: 'success'});

  const fetchMaterialTypes = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/material-types');
      if (response.ok) {
        const data = await response.json();
        setMaterialTypes(data);
      }
    } catch (error) {
      console.error('Error fetching material types:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterialTypes();
  }, []);

  const handleOpenDialog = (materialType?: MaterialType) => {
    if (materialType) {
      setEditingMaterialType(materialType);
      setFormData({ name: materialType.name });
    } else {
      setEditingMaterialType(null);
      setFormData({ name: '' });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingMaterialType(null);
    setFormData({ name: '' });
  };

  const handleSubmit = async () => {
    try {
      const url = editingMaterialType 
        ? `http://localhost:8080/api/material-types/${editingMaterialType.id}`
        : 'http://localhost:8080/api/material-types';
      
      const method = editingMaterialType ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        handleCloseDialog();
        fetchMaterialTypes();
      } else {
        console.error('Error saving material type');
      }
    } catch (error) {
      console.error('Error saving material type:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Вы уверены, что хотите удалить этот тип материала?')) {
      try {
        const response = await fetch(`http://localhost:8080/api/material-types/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          fetchMaterialTypes();
        } else {
          console.error('Error deleting material type');
        }
      } catch (error) {
        console.error('Error deleting material type:', error);
      }
    }
  };

  const handleExport = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/material-types/export');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'material_types.xlsx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Failed to export material types:", error);
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
      const response = await fetch('http://localhost:8080/api/material-types/import', { method: 'POST', body: formData });
      if (response.ok) {
        setSnackbar({open: true, message: 'Импорт успешно завершён', severity: 'success'});
        fetchMaterialTypes();
      } else {
        const text = await response.text();
        setSnackbar({open: true, message: 'Ошибка импорта: ' + text, severity: 'error'});
      }
    } catch (e) {
      setSnackbar({open: true, message: 'Ошибка импорта', severity: 'error'});
    }
  };

  const filteredMaterialTypes = materialTypes.filter(materialType =>
    materialType.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div>Загрузка...</div>;
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <IconButton onClick={() => navigate('/reference')} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1">
            Типы материалов
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="body1" color="text.secondary">
            Управление типами материалов
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<FileUploadIcon />}
              onClick={handleExport}
            >
              Экспорт в Excel
            </Button>
            <Button
              variant="outlined"
              startIcon={<FileDownloadIcon />}
              onClick={handleImportClick}
            >
              Импорт из Excel
            </Button>
            <input
              type="file"
              accept=".xlsx"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handleImport}
            />
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
            >
              Добавить тип материала
            </Button>
          </Box>
        </Box>

        <Card>
          <CardContent>
            <TextField
              fullWidth
              label="Поиск"
              variant="outlined"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ mb: 2 }}
            />

            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Название</TableCell>
                    <TableCell align="right">Действия</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredMaterialTypes.map((materialType) => (
                    <TableRow key={materialType.id}>
                      <TableCell>{materialType.name}</TableCell>
                      <TableCell align="right">
                        <IconButton
                          onClick={() => handleOpenDialog(materialType)}
                          color="primary"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          onClick={() => handleDelete(materialType.id)}
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

        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            {editingMaterialType ? 'Редактировать тип материала' : 'Добавить тип материала'}
          </DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Название"
              type="text"
              fullWidth
              variant="outlined"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Отмена</Button>
            <Button onClick={handleSubmit} variant="contained">
              {editingMaterialType ? 'Сохранить' : 'Добавить'}
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({...snackbar, open: false})}>
          <Alert onClose={() => setSnackbar({...snackbar, open: false})} severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Container>
  );
};

export default MaterialTypeListPage; 