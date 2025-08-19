import React, { useEffect, useState } from 'react';
import { Box, Card, CardContent, Typography, Grid, TextField, Button, IconButton, Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material';
import { Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import { api } from '../utils/api';

interface DeliveryType {
  id?: string;
  name: string;
}

const DeliveryTypesPage: React.FC = () => {
  const [items, setItems] = useState<DeliveryType[]>([]);
  const [name, setName] = useState('');

  const load = async () => {
    const res = await api.get('/api/delivery-types');
    setItems(res.data || []);
  };

  useEffect(() => { load(); }, []);

  const add = async () => {
    if (!name.trim()) return;
    await api.post('/api/delivery-types', { name: name.trim() });
    setName('');
    await load();
  };

  const remove = async (id: string) => {
    await api.delete(`/api/delivery-types/${id}`);
    await load();
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>Типы доставки</Typography>
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={8}>
              <TextField fullWidth label="Наименование" value={name} onChange={e => setName(e.target.value)} />
            </Grid>
            <Grid item xs={12} md={4}>
              <Button variant="contained" startIcon={<AddIcon />} sx={{ height: '100%' }} onClick={add}>
                Добавить
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      <Card>
        <CardContent>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Наименование</TableCell>
                <TableCell align="right">Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((it) => (
                <TableRow key={it.id}>
                  <TableCell>{it.name}</TableCell>
                  <TableCell align="right">
                    <IconButton color="error" onClick={() => it.id && remove(it.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </Box>
  );
};

export default DeliveryTypesPage;


