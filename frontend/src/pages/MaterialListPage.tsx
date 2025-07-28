import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { Box, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Typography, TextField, InputAdornment, Container, useTheme, useMediaQuery } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Pagination from '@mui/material/Pagination';
import ResponsiveTable from '../components/ResponsiveTable';

interface CategoryDto {
  id: string;
  name: string;
}

interface MaterialTypeDto {
  id: string;
  name: string;
}

interface UnitDto {
  id: string;
  name: string;
  shortName: string;
}

interface MaterialDto {
  id: string;
  name: string;
  description: string;
  materialType: MaterialTypeDto | null;
  link: string;
  units: UnitDto[];
  code: string;
  category: CategoryDto | null;
  createdAt: string;
  updatedAt: string;
}

const MaterialListPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const [materials, setMaterials] = useState<MaterialDto[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredMaterials, setFilteredMaterials] = useState<MaterialDto[]>([]);
  const [importLog, setImportLog] = useState<{imported: number, errors: {row: number, message: string}[]} | null>(null);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [page, setPage] = useState(1);
  const rowsPerPage = 50;

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const response = await api.get('/api/materials');
        setMaterials(response.data);
        setFilteredMaterials(response.data);
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
        (material.link && material.link.toLowerCase().includes(searchLower))
      );
    });
    setFilteredMaterials(filtered);
  }, [searchTerm, materials]);

  const handleExport = async () => {
    try {
      const response = await api.get('/api/materials/export', { responseType: 'blob' });
      const blob = response.data;
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'materials.xlsx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Failed to export materials:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Вы уверены, что хотите удалить этот материал?')) {
      try {
        await api.delete(`/api/materials/${id}`);
        setMaterials(materials.filter(m => m.id !== id));
      } catch (error) {
        console.error('Error deleting material:', error);
      }
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files?.length) return;
    const file = event.target.files[0];
    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await api.post('/api/materials/import', formData);
      setImportLog(response.data);
      setImportDialogOpen(true);
      // обновить список материалов
      const materialsResp = await api.get('/api/materials');
      setMaterials(materialsResp.data);
      setFilteredMaterials(materialsResp.data);
    } catch (error: any) {
      const errorMessage = error.response?.data || 'Ошибка сети или сервера';
      setImportLog({imported: 0, errors: [{row: 0, message: errorMessage}]});
      setImportDialogOpen(true);
    }
  };

  const paginatedMaterials = filteredMaterials.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  // Конфигурация колонок для ResponsiveTable
  const columns = [
    {
      id: 'name',
      label: 'Название',
      render: (value: any, row: MaterialDto) => (
        <Box>
          <Typography variant="body2" fontWeight={600}>
            {row.name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {row.code}
          </Typography>
        </Box>
      )
    },
    {
      id: 'category',
      label: 'Категория',
      render: (value: any, row: MaterialDto) => row.category?.name || '-'
    },
    {
      id: 'materialType',
      label: 'Тип',
      render: (value: any, row: MaterialDto) => row.materialType?.name || '-'
    },
    {
      id: 'units',
      label: 'Ед. измерения',
      render: (value: any, row: MaterialDto) => row.units?.map(u => u.shortName).join(', ') || '-'
    },
    {
      id: 'description',
      label: 'Описание',
      render: (value: any, row: MaterialDto) => row.description
    },
    {
      id: 'link',
      label: 'Ссылка',
      render: (value: any, row: MaterialDto) => (
        row.link ? (
          <a href={row.link} target="_blank" rel="noopener noreferrer">
            {row.link}
          </a>
        ) : '-'
      )
    },
    {
      id: 'actions',
      label: 'Действия',
      render: (value: any, row: MaterialDto) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton 
            color="primary" 
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/reference/materials/${row.id}/edit`);
            }}
          >
            <EditIcon />
          </IconButton>
          <IconButton 
            color="error" 
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(row.id);
            }}
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      ),
      mobile: false
    }
  ];

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: { xs: 2, md: 4 }, mb: { xs: 2, md: 4 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <IconButton onClick={() => navigate('/reference')} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant={isMobile ? "h5" : "h4"} component="h1">
            Номенклатура
          </Typography>
        </Box>

        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 3,
          flexDirection: { xs: 'column', sm: 'row' },
          gap: { xs: 2, sm: 0 }
        }}>
          <Typography variant="body1" color="text.secondary">
            Управление номенклатурой материалов
          </Typography>
          <Box sx={{ 
            display: 'flex', 
            gap: { xs: 1, sm: 2 },
            flexWrap: 'wrap'
          }}>
            <Button 
              variant="outlined" 
              color="primary" 
              startIcon={<FileUploadIcon />}
              onClick={handleExport}
              size={isMobile ? 'small' : 'medium'}
            >
              Экспорт
            </Button>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<FileDownloadIcon />}
              onClick={handleImportClick}
              size={isMobile ? 'small' : 'medium'}
            >
              Импорт
            </Button>
            <input
              type="file"
              accept=".xlsx"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handleImport}
            />
            <Button 
              variant="contained" 
              color="primary" 
              onClick={() => navigate('/reference/materials/new')}
              size={isMobile ? 'small' : 'medium'}
            >
              + Добавить
            </Button>
          </Box>
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

        <ResponsiveTable
          columns={columns}
          data={paginatedMaterials}
          getRowKey={(row) => row.id}
          onRowClick={(row) => navigate(`/reference/materials/${row.id}/edit`)}
          title="Список материалов"
          loading={false}
        />
        
        {filteredMaterials.length === 0 && searchTerm && (
          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Typography variant="body1" color="text.secondary">
              По запросу "{searchTerm}" ничего не найдено
            </Typography>
          </Box>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Pagination
            count={Math.ceil(filteredMaterials.length / rowsPerPage)}
            page={page}
            onChange={(_, value) => setPage(value)}
            color="primary"
          />
        </Box>
      </Box>
      <Dialog open={importDialogOpen} onClose={() => setImportDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Результат импорта</DialogTitle>
        <DialogContent>
          <Typography>Успешно импортировано: <b>{importLog?.imported ?? 0}</b></Typography>
          <Typography>Ошибок: <b>{importLog?.errors?.length ?? 0}</b></Typography>
          {importLog?.errors && importLog.errors.length > 0 && (
            <Table size="small" sx={{ mt: 2 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Строка</TableCell>
                  <TableCell>Ошибка</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {importLog.errors.map((err, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{err.row}</TableCell>
                    <TableCell>{err.message}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImportDialogOpen(false)}>Закрыть</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MaterialListPage; 