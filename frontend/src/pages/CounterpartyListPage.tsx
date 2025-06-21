import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Typography } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

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

  useEffect(() => {
    const fetchCounterparties = async () => {
      try {
        const response = await fetch('/api/companies');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setCounterparties(data);
      } catch (error) {
        console.error("Failed to fetch counterparties:", error);
      }
    };

    fetchCounterparties();
  }, []);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Контрагенты</Typography>
      <Button variant="contained" color="primary" sx={{ mb: 2 }} onClick={() => navigate('/counterparties/new')}>
        + Добавить контрагента
      </Button>
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
            {counterparties.map((counterparty) => (
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
    </Box>
  );
};

export default CounterpartyListPage; 