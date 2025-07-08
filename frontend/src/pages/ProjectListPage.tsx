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
  Pagination
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, ArrowBack as ArrowBackIcon, FileDownload as FileDownloadIcon, FileUpload as FileUploadIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface ProjectDto {
  id: string;
  name: string;
  description: string;
}

const ProjectListPage: React.FC = () => {
  const [projects, setProjects] = useState<ProjectDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectDto | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const rowsPerPage = 50;

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const fetchProjects = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/projects');
      if (response.ok) {
        const data = await response.json();
        setProjects(data);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleOpenDialog = (project?: ProjectDto) => {
    if (project) {
      setEditingProject(project);
      setFormData({ name: project.name, description: project.description });
    } else {
      setEditingProject(null);
      setFormData({ name: '', description: '' });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingProject(null);
    setFormData({ name: '', description: '' });
  };

  const handleSubmit = async () => {
    try {
      const url = editingProject 
        ? `http://localhost:8080/api/projects/${editingProject.id}`
        : 'http://localhost:8080/api/projects';
      const method = editingProject ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        handleCloseDialog();
        fetchProjects();
      } else {
        console.error('Error saving project');
      }
    } catch (error) {
      console.error('Error saving project:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Вы уверены, что хотите удалить этот объект?')) {
      try {
        const response = await fetch(`http://localhost:8080/api/projects/${id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          fetchProjects();
        } else {
          console.error('Error deleting project');
        }
      } catch (error) {
        console.error('Error deleting project:', error);
      }
    }
  };

  const handleExport = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/projects/export');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'projects.xlsx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Failed to export projects:", error);
    }
  };

  const handleImportClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:8080/api/projects/import', {
        method: 'POST',
        body: formData,
      });
      const result = await response.text();
      alert(result);
      fetchProjects(); // обновить список после импорта
    } catch (error) {
      alert('Ошибка при импорте: ' + (error as Error).message);
    }
  };

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedProjects = filteredProjects.slice((page - 1) * rowsPerPage, page * rowsPerPage);

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
            Объекты
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="body1" color="text.secondary">
            Управление объектами/проектами
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
              Добавить объект/проект
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
                  {paginatedProjects.map((project) => (
                    <TableRow key={project.id}>
                      <TableCell>{project.name}</TableCell>
                      <TableCell>{project.description}</TableCell>
                      <TableCell align="right">
                        <IconButton
                          onClick={() => handleOpenDialog(project)}
                          color="primary"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          onClick={() => handleDelete(project.id)}
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
                count={Math.ceil(filteredProjects.length / rowsPerPage)}
                page={page}
                onChange={(_, value) => setPage(value)}
                color="primary"
              />
            </Box>
          </CardContent>
        </Card>

        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            {editingProject ? 'Редактировать объект' : 'Добавить объект'}
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
              {editingProject ? 'Сохранить' : 'Добавить'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default ProjectListPage; 