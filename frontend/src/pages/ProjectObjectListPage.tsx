import React, { useState, useEffect } from 'react';
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
  Paper
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, ArrowBack as ArrowBackIcon, FileDownload as FileDownloadIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface ProjectObject {
  id: string;
  name: string;
  description: string;
}

const ProjectObjectListPage: React.FC = () => {
  const [projectObjects, setProjectObjects] = useState<ProjectObject[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingProjectObject, setEditingProjectObject] = useState<ProjectObject | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const fetchProjectObjects = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/project-objects');
      if (response.ok) {
        const data = await response.json();
        setProjectObjects(data);
      }
    } catch (error) {
      console.error('Error fetching project objects:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectObjects();
  }, []);

  const handleOpenDialog = (projectObject?: ProjectObject) => {
    if (projectObject) {
      setEditingProjectObject(projectObject);
      setFormData({ name: projectObject.name, description: projectObject.description });
    } else {
      setEditingProjectObject(null);
      setFormData({ name: '', description: '' });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingProjectObject(null);
    setFormData({ name: '', description: '' });
  };

  const handleSubmit = async () => {
    try {
      const url = editingProjectObject 
        ? `http://localhost:8080/api/project-objects/${editingProjectObject.id}`
        : 'http://localhost:8080/api/project-objects';
      
      const method = editingProjectObject ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        handleCloseDialog();
        fetchProjectObjects();
      } else {
        console.error('Error saving project object');
      }
    } catch (error) {
      console.error('Error saving project object:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Вы уверены, что хотите удалить этот объект проекта?')) {
      try {
        const response = await fetch(`http://localhost:8080/api/project-objects/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          fetchProjectObjects();
        } else {
          console.error('Error deleting project object');
        }
      } catch (error) {
        console.error('Error deleting project object:', error);
      }
    }
  };

  const handleExport = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/project-objects/export');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'project_objects.xlsx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Failed to export project objects:", error);
    }
  };

  const filteredProjectObjects = projectObjects.filter(projectObject =>
    projectObject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    projectObject.description.toLowerCase().includes(searchTerm.toLowerCase())
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
            Объекты проекта
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="body1" color="text.secondary">
            Управление объектами проекта
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
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
            >
              Добавить объект
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
                    <TableCell>Описание</TableCell>
                    <TableCell align="right">Действия</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredProjectObjects.map((projectObject) => (
                    <TableRow key={projectObject.id}>
                      <TableCell>{projectObject.name}</TableCell>
                      <TableCell>{projectObject.description}</TableCell>
                      <TableCell align="right">
                        <IconButton
                          onClick={() => handleOpenDialog(projectObject)}
                          color="primary"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          onClick={() => handleDelete(projectObject.id)}
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
            {editingProjectObject ? 'Редактировать объект проекта' : 'Добавить объект проекта'}
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
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              label="Описание"
              type="text"
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
              {editingProjectObject ? 'Сохранить' : 'Добавить'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default ProjectObjectListPage; 