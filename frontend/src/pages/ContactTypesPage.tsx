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
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, ArrowBack as ArrowBackIcon, Download as DownloadIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface ContactType {
  id: string;
  name: string;
}

const ContactTypesPage: React.FC = () => {
  const [contactTypes, setContactTypes] = useState<ContactType[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingContactType, setEditingContactType] = useState<ContactType | null>(null);
  const [formData, setFormData] = useState({ name: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const fetchContactTypes = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/contact-types');
      if (response.ok) {
        const data = await response.json();
        setContactTypes(data);
      }
    } catch (error) {
      console.error('Error fetching contact types:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContactTypes();
  }, []);

  const handleOpenDialog = (contactType?: ContactType) => {
    if (contactType) {
      setEditingContactType(contactType);
      setFormData({ name: contactType.name });
    } else {
      setEditingContactType(null);
      setFormData({ name: '' });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingContactType(null);
    setFormData({ name: '' });
  };

  const handleSubmit = async () => {
    try {
      const url = editingContactType 
        ? `http://localhost:8080/api/contact-types/${editingContactType.id}`
        : 'http://localhost:8080/api/contact-types';
      
      const method = editingContactType ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        handleCloseDialog();
        fetchContactTypes();
      } else {
        console.error('Error saving contact type');
      }
    } catch (error) {
      console.error('Error saving contact type:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Вы уверены, что хотите удалить этот тип контакта?')) {
      try {
        const response = await fetch(`http://localhost:8080/api/contact-types/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          fetchContactTypes();
        } else {
          console.error('Error deleting contact type');
        }
      } catch (error) {
        console.error('Error deleting contact type:', error);
      }
    }
  };

  const filteredContactTypes = contactTypes.filter(contactType =>
    contactType.name.toLowerCase().includes(searchTerm.toLowerCase())
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
            Типы контактов
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="body1" color="text.secondary">
            Управление типами контактов
          </Typography>
          <Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
              sx={{ mr: 1 }}
            >
              Добавить тип
            </Button>
            <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                href="http://localhost:8080/api/contact-types/export"
                target="_blank"
            >
              Экспорт
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
                  {filteredContactTypes.map((contactType) => (
                    <TableRow key={contactType.id}>
                      <TableCell>{contactType.name}</TableCell>
                      <TableCell align="right">
                        <IconButton
                          onClick={() => handleOpenDialog(contactType)}
                          color="primary"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          onClick={() => handleDelete(contactType.id)}
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

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingContactType ? 'Редактировать тип контакта' : 'Добавить тип контакта'}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Название"
            variant="outlined"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Отмена</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingContactType ? 'Сохранить' : 'Добавить'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ContactTypesPage; 