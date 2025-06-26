import React, { useEffect, useState } from 'react';
import {
  Paper, Typography, Box, Button, CircularProgress, TextField, MenuItem, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Dialog, DialogTitle, DialogContent, DialogActions, Autocomplete
} from '@mui/material';
import axios from 'axios';

interface Material { id: string; name: string; }
interface Company { id: string; name: string; }
interface SupplierMaterialName { id: string; name: string; material: Material; supplier: Company; }

export default function SupplierMaterialNamesPage() {
  const [loading, setLoading] = useState(false);
  const [supplierMaterialNames, setSupplierMaterialNames] = useState<SupplierMaterialName[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [suppliers, setSuppliers] = useState<Company[]>([]);
  
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [selectedSupplier, setSelectedSupplier] = useState<Company | null>(null);
  const [newName, setNewName] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [materialsRes, suppliersRes, namesRes] = await Promise.all([
        axios.get('/api/materials'),
        axios.get('/api/companies'),
        axios.get('/api/supplier-material-names')
      ]);
      setMaterials(materialsRes.data);
      setSuppliers(suppliersRes.data);
      setSupplierMaterialNames(namesRes.data);
    } catch (error) {
      console.error('Ошибка при загрузке данных:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!selectedMaterial || !selectedSupplier || !newName.trim()) {
      alert('Заполните все поля');
      return;
    }

    try {
      await axios.post('/api/supplier-material-names', null, {
        params: {
          materialId: selectedMaterial.id,
          supplierId: selectedSupplier.id,
          name: newName
        }
      });
      setOpenDialog(false);
      setSelectedMaterial(null);
      setSelectedSupplier(null);
      setNewName('');
      loadData();
    } catch (error) {
      console.error('Ошибка при создании:', error);
      alert('Ошибка при создании');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Удалить запись?')) {
      try {
        await axios.delete(`/api/supplier-material-names/${id}`);
        loadData();
      } catch (error) {
        console.error('Ошибка при удалении:', error);
        alert('Ошибка при удалении');
      }
    }
  };

  if (loading) {
    return <Box display="flex" justifyContent="center" mt={4}><CircularProgress /></Box>;
  }

  return (
    <Paper sx={{ p: 3, width: '100%', mx: 'auto', mt: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6">Названия материалов у поставщиков</Typography>
        <Button variant="contained" onClick={() => setOpenDialog(true)}>
          Добавить
        </Button>
      </Box>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Поставщик</TableCell>
              <TableCell>Материал</TableCell>
              <TableCell>Название у поставщика</TableCell>
              <TableCell>Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {supplierMaterialNames.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.supplier.name}</TableCell>
                <TableCell>{item.material.name}</TableCell>
                <TableCell>{item.name}</TableCell>
                <TableCell>
                  <Button color="error" size="small" onClick={() => handleDelete(item.id)}>
                    Удалить
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Добавить название материала у поставщика</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Autocomplete
              value={selectedSupplier}
              onChange={(_, value) => setSelectedSupplier(value)}
              options={suppliers}
              getOptionLabel={(option) => option.name}
              renderInput={(params) => <TextField {...params} label="Поставщик" required />}
            />
            <Autocomplete
              value={selectedMaterial}
              onChange={(_, value) => setSelectedMaterial(value)}
              options={materials}
              getOptionLabel={(option) => option.name}
              renderInput={(params) => <TextField {...params} label="Материал" required />}
            />
            <TextField
              label="Название у поставщика"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              required
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Отмена</Button>
          <Button onClick={handleCreate} variant="contained">Создать</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
} 