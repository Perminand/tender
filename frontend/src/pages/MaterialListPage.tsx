import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Typography, TextField, InputAdornment, Container } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

interface Category {
  id: string;
  name: string;
}

interface MaterialType {
  id: string;
  name: string;
}

interface Unit {
  id: string;
  name: string;
  shortName: string;
}

interface Material {
  id: string;
  name: string;
  description: string;
  materialType: MaterialType | null;
  link: string;
  units: Unit[];
  code: string;
  category: Category | null;
  createdAt: string;
  updatedAt: string;
}

const MaterialListPage: React.FC = () => {
  const navigate = useNavigate();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredMaterials, setFilteredMaterials] = useState<Material[]>([]);

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const response = await fetch('/api/materials');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setMaterials(data);
        setFilteredMaterials(data);
      } catch (error) {
        console.error("Failed to fetch materials:", error);
      }
    };

    fetchMaterials();
  }, []);

  useEffect(() => {
    const filtered = materials.filter(material => {
      const searchLower = searchTerm.toLowerCase();
      return (
        material.name.toLowerCase().includes(searchLower) ||
        material.code.toLowerCase().includes(searchLower) ||
        (material.category?.name.toLowerCase().includes(searchLower) || false) ||
        (material.materialType?.name.toLowerCase().includes(searchLower) || false) ||
        (material.units?.some(unit => 
            unit.name.toLowerCase().includes(searchLower) || 
            unit.shortName.toLowerCase().includes(searchLower)
        ) || false) ||
        material.description.toLowerCase().includes(searchLower) ||
        material.link.toLowerCase().includes(searchLower)
      );
    });
    setFilteredMaterials(filtered);
  }, [searchTerm, materials]);

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <IconButton onClick={() => navigate('/reference')} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1">
            Номенклатура
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="body1" color="text.secondary">
            Управление номенклатурой материалов
          </Typography>
          <Button variant="contained" color="primary" onClick={() => navigate('/reference/materials/new')}>
            + Добавить материал
          </Button>
        </Box>

        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            placeholder="Поиск по названию, коду, категории, типу, единице измерения, описанию, ссылке..."
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
                <TableCell>Код</TableCell>
                <TableCell>Категория</TableCell>
                <TableCell>Тип</TableCell>
                <TableCell>Ед. измерения</TableCell>
                <TableCell>Описание</TableCell>
                <TableCell>Ссылка</TableCell>
                <TableCell>Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredMaterials.map((material) => (
                <TableRow key={material.id}>
                  <TableCell>{material.name}</TableCell>
                  <TableCell>{material.code}</TableCell>
                  <TableCell>{material.category?.name || '-'}</TableCell>
                  <TableCell>{material.materialType?.name || '-'}</TableCell>
                  <TableCell>{material.units?.map(u => u.shortName).join(', ') || '-'}</TableCell>
                  <TableCell>{material.description}</TableCell>
                  <TableCell>
                    {material.link && (
                      <a href={material.link} target="_blank" rel="noopener noreferrer">
                        {material.link}
                      </a>
                    )}
                  </TableCell>
                  <TableCell>
                    <IconButton color="primary" onClick={() => navigate(`/reference/materials/${material.id}/edit`)}>
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
        
        {filteredMaterials.length === 0 && searchTerm && (
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

export default MaterialListPage; 