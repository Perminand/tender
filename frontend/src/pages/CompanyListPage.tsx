import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Typography } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const companies = [
  { id: 1, name: 'вапвплавапвапва', inn: '1234567890', kpp: '123456789', ogrn: '1234567890123', address: '1safgag' },
];

const CompanyListPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Компании</Typography>
      <Button variant="contained" color="primary" sx={{ mb: 2 }} onClick={() => navigate('/companies/new')}>
        + Добавить компанию
      </Button>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Название</TableCell>
              <TableCell>ИНН</TableCell>
              <TableCell>КПП</TableCell>
              <TableCell>ОГРН</TableCell>
              <TableCell>Адрес</TableCell>
              <TableCell>Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {companies.map((company) => (
              <TableRow key={company.id}>
                <TableCell>{company.name}</TableCell>
                <TableCell>{company.inn}</TableCell>
                <TableCell>{company.kpp}</TableCell>
                <TableCell>{company.ogrn}</TableCell>
                <TableCell>{company.address}</TableCell>
                <TableCell>
                  <IconButton color="primary" onClick={() => navigate(`/companies/${company.id}/edit`)}>
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

export default CompanyListPage; 