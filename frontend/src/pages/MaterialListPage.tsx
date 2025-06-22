import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Typography, TextField, InputAdornment } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';

interface Category {
  id: string;
  name: string;
}

interface Material {
  id: string;
  name: string;
  description: string;
  type: string;
  link: string;
  unit: string;
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
        material.description.toLowerCase().includes(searchLower) ||
        material.type.toLowerCase().includes(searchLower) ||
        material.link.toLowerCase().includes(searchLower) ||
        material.code.toLowerCase().includes(searchLower) ||
        (material.category?.name.toLowerCase().includes(searchLower) || false)
      );
    });
    setFilteredMaterials(filtered);
  }, [searchTerm, materials]);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Номенклатура</Typography>
      
      <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
        <Button variant="contained" color="primary" onClick={() => navigate('/materials/new')}>
          + Добавить материал
        </Button>
        
        <TextField
          placeholder="Поиск по названию, описанию, типу, коду, категории..."
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
                <TableCell>{material.type}</TableCell>
                <TableCell>{material.unit}</TableCell>
                <TableCell>{material.description}</TableCell>
                <TableCell>
                  {material.link && (
                    <a href={material.link} target="_blank" rel="noopener noreferrer">
                      {material.link}
                    </a>
                  )}
                </TableCell>
                <TableCell>
                  <IconButton color="primary" onClick={() => navigate(`/materials/${material.id}/edit`)}>
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
  );
};

export default MaterialListPage; 