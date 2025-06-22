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
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface Unit {
  id: string;
  name: string;
  shortName: string;
}

const UnitListPage: React.FC = () => {
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [formData, setFormData] = useState({ name: '', shortName: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const fetchUnits = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/units');
      if (response.ok) {
        const data = await response.json();
        setUnits(data);
      }
    } catch (error) {
      console.error('Error fetching units:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnits();
  }, []);

  const handleOpenDialog = (unit?: Unit) => {
    if (unit) {
      setEditingUnit(unit);
      setFormData({ name: unit.name, shortName: unit.shortName });
    } else {
      setEditingUnit(null);
      setFormData({ name: '', shortName: '' });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingUnit(null);
    setFormData({ name: '', shortName: '' });
  };

  const handleSubmit = async () => {
    try {
      const url = editingUnit 
        ? `http://localhost:8080/api/units/${editingUnit.id}`
        : 'http://localhost:8080/api/units';
      
      const method = editingUnit ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        handleCloseDialog();
        fetchUnits();
      } else {
        console.error('Error saving unit');
      }
    } catch (error) {
      console.error('Error saving unit:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Вы уверены, что хотите удалить эту единицу измерения?')) {
      try {
        const response = await fetch(`http://localhost:8080/api/units/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          fetchUnits();
        } else {
          console.error('Error deleting unit');
        }
      } catch (error) {
        console.error('Error deleting unit:', error);
      }
    }
  };

  const filteredUnits = units.filter(unit =>
    unit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    unit.shortName.toLowerCase().includes(searchTerm.toLowerCase())
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
            Единицы измерения
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="body1" color="text.secondary">
            Управление единицами измерения
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Добавить единицу измерения
          </Button>
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
                    <TableCell>Сокращение</TableCell>
                    <TableCell align="right">Действия</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredUnits.map((unit) => (
                    <TableRow key={unit.id}>
                      <TableCell>{unit.name}</TableCell>
                      <TableCell>{unit.shortName}</TableCell>
                      <TableCell align="right">
                        <IconButton
                          onClick={() => handleOpenDialog(unit)}
                          color="primary"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          onClick={() => handleDelete(unit.id)}
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
          {editingUnit ? 'Редактировать единицу измерения' : 'Добавить единицу измерения'}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Название"
            variant="outlined"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            sx={{ mt: 2, mb: 2 }}
          />
          <TextField
            fullWidth
            label="Сокращение"
            variant="outlined"
            value={formData.shortName}
            onChange={(e) => setFormData({ ...formData, shortName: e.target.value })}
            placeholder="шт., кг, м"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Отмена</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingUnit ? 'Сохранить' : 'Добавить'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default UnitListPage; 