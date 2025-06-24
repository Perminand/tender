import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Typography, TextField, Container, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

interface Warehouse {
  id: string;
  name: string;
}

const WarehouseListPage: React.FC = () => {
  const navigate = useNavigate();
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null);
  const [formData, setFormData] = useState({ name: '' });

  useEffect(() => {
    fetchWarehouses();
  }, []);

  const fetchWarehouses = async () => {
    const res = await fetch('/api/warehouses');
    const data = await res.json();
    setWarehouses(data);
  };

  const handleOpenDialog = (warehouse?: Warehouse) => {
    if (warehouse) {
      setEditingWarehouse(warehouse);
      setFormData({ name: warehouse.name });
    } else {
      setEditingWarehouse(null);
      setFormData({ name: '' });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingWarehouse(null);
    setFormData({ name: '' });
  };

  const handleSubmit = async () => {
    if (editingWarehouse) {
      await fetch(`/api/warehouses/${editingWarehouse.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...editingWarehouse, ...formData }),
      });
    } else {
      await fetch('/api/warehouses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
    }
    handleCloseDialog();
    fetchWarehouses();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Удалить склад?')) {
      await fetch(`/api/warehouses/${id}`, { method: 'DELETE' });
      fetchWarehouses();
    }
  };

  const filteredWarehouses = warehouses.filter(w => w.name.toLowerCase().includes(searchTerm.toLowerCase()));

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

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="body1" color="text.secondary">
            Управление складами
          </Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
            Добавить склад
          </Button>
        </Box>

        <Paper sx={{ mb: 2 }}>
          <TextField
            fullWidth
            label="Поиск"
            variant="outlined"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            sx={{ mb: 2 }}
          />
        </Paper>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Название</TableCell>
                <TableCell align="right">Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredWarehouses.map((warehouse) => (
                <TableRow key={warehouse.id}>
                  <TableCell>{warehouse.name}</TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => handleOpenDialog(warehouse)} color="primary">
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(warehouse.id)} color="error">
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>{editingWarehouse ? 'Редактировать склад' : 'Добавить склад'}</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Название"
              type="text"
              fullWidth
              variant="outlined"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Отмена</Button>
            <Button onClick={handleSubmit} variant="contained">
              {editingWarehouse ? 'Сохранить' : 'Добавить'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default WarehouseListPage; 