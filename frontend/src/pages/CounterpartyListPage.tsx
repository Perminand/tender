import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Typography, TextField, InputAdornment, Container } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

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
        const response = await fetch('http://localhost:8080/api/companies');
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
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <IconButton onClick={() => navigate('/reference')} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1">
            Контрагенты
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="body1" color="text.secondary">
            Управление контрагентами
          </Typography>
          <Button variant="contained" color="primary" onClick={() => navigate('/reference/counterparties/new')}>
            + Добавить контрагента
          </Button>
        </Box>

        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            placeholder="Поиск по названию, ИНН, КПП, адресу..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
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
                    <IconButton color="primary" onClick={() => navigate(`/reference/counterparties/${counterparty.id}/edit`)}>
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
    </Container>
  );
};

export default CounterpartyListPage; 