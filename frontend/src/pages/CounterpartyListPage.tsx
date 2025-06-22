import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Typography, TextField, InputAdornment } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';

interface Counterparty {
  id: number;
  name: string;
  legalName: string;
  inn: string;
  kpp: string;
  ogrn: string;
  address: string;
}

const CounterpartyListPage: React.FC = () => {
  const navigate = useNavigate();
  const [counterparties, setCounterparties] = useState<Counterparty[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCounterparties, setFilteredCounterparties] = useState<Counterparty[]>([]);

  useEffect(() => {
    const fetchCounterparties = async () => {
      try {
        const response = await fetch('/api/companies');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setCounterparties(data);
        setFilteredCounterparties(data);
      } catch (error) {
        console.error("Failed to fetch counterparties:", error);
      }
    };

    fetchCounterparties();
  }, []);

  useEffect(() => {
    const filtered = counterparties.filter(counterparty => {
      const searchLower = searchTerm.toLowerCase();
      return (
        counterparty.name.toLowerCase().includes(searchLower) ||
        counterparty.legalName.toLowerCase().includes(searchLower) ||
        counterparty.inn.toLowerCase().includes(searchLower) ||
        counterparty.kpp.toLowerCase().includes(searchLower) ||
        counterparty.address.toLowerCase().includes(searchLower)
      );
    });
    setFilteredCounterparties(filtered);
  }, [searchTerm, counterparties]);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Контрагенты</Typography>
      
      <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
        <Button variant="contained" color="primary" onClick={() => navigate('/counterparties/new')}>
          + Добавить контрагента
        </Button>
        
        <TextField
          placeholder="Поиск по названию, ИНН, КПП, адресу..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ minWidth: 300 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Название</TableCell>
              <TableCell>Фирменное наименование</TableCell>
              <TableCell>ИНН</TableCell>
              <TableCell>КПП</TableCell>
              <TableCell>ОГРН</TableCell>
              <TableCell>Адрес</TableCell>
              <TableCell>Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredCounterparties.map((counterparty) => (
              <TableRow key={counterparty.id}>
                <TableCell>{counterparty.name}</TableCell>
                <TableCell>{counterparty.legalName}</TableCell>
                <TableCell>{counterparty.inn}</TableCell>
                <TableCell>{counterparty.kpp}</TableCell>
                <TableCell>{counterparty.ogrn}</TableCell>
                <TableCell>{counterparty.address}</TableCell>
                <TableCell>
                  <IconButton color="primary" onClick={() => navigate(`/counterparties/${counterparty.id}/edit`)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton color="error">
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      
      {filteredCounterparties.length === 0 && searchTerm && (
        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Typography variant="body1" color="text.secondary">
            По запросу "{searchTerm}" ничего не найдено
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default CounterpartyListPage; 