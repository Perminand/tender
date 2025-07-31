import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { Box, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Typography, TextField, InputAdornment, Container, Snackbar, Alert, Dialog, DialogTitle, DialogContent, DialogActions, Chip, FormControl, InputLabel, Select, MenuItem, useTheme, useMediaQuery } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import Pagination from '@mui/material/Pagination';
import ResponsiveTable from '../components/ResponsiveTable';
import { CompanyRelatedEntitiesDialog } from '../components/CompanyRelatedEntitiesDialog';

interface Counterparty {
  id: number;
  name: string;
  legalName: string;
  inn: string;
  kpp: string;
  ogrn: string;
  address: string;
  shortName?: string;
  role?: string;
}

const CounterpartyListPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const [counterparties, setCounterparties] = useState<Counterparty[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCounterparties, setFilteredCounterparties] = useState<Counterparty[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [snackbar, setSnackbar] = useState<{open: boolean, message: string, severity: 'success' | 'error'}>({open: false, message: '', severity: 'success'});
  const [importLog, setImportLog] = useState<{imported: number, errors: {row: number, message: string}[]} | null>(null);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [page, setPage] = useState(1);
  const rowsPerPage = 50;
  const [roleFilter, setRoleFilter] = useState('');
  const [relatedEntitiesDialog, setRelatedEntitiesDialog] = useState(false);
  const [relatedEntitiesData, setRelatedEntitiesData] = useState<any>(null);

  useEffect(() => {
    const fetchCounterparties = async () => {
      try {
        const response = await api.get('/api/companies');
        setCounterparties(response.data);
        setFilteredCounterparties(response.data);
      } catch (error) {
        console.error("Failed to fetch counterparties:", error);
      }
    };

    fetchCounterparties();
  }, []);

  useEffect(() => {
    console.log('Загруженные компании:', counterparties);
  }, [counterparties]);

  useEffect(() => {
    let filtered = counterparties;
    
    // Фильтр по поиску
    if (searchTerm) {
      filtered = filtered.filter(counterparty =>
        counterparty.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        counterparty.legalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        counterparty.inn.includes(searchTerm) ||
        counterparty.kpp.includes(searchTerm) ||
        counterparty.address.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Фильтр по роли
    if (roleFilter) {
      filtered = filtered.filter(counterparty => counterparty.role === roleFilter);
    }
    
    setFilteredCounterparties(filtered);
  }, [counterparties, searchTerm, roleFilter]);

  const handleExport = async () => {
    try {
      const response = await api.get('/api/companies/export', { responseType: 'blob' });
      const blob = response.data;
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'companies.xlsx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Failed to export companies:", error);
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
      const response = await api.post('/api/companies/import', formData);
      setImportLog(response.data);
      setImportDialogOpen(true);
      // обновить список
      const dataResponse = await api.get('/api/companies');
      setCounterparties(dataResponse.data);
      setFilteredCounterparties(dataResponse.data);
    } catch (e) {
      setImportLog({imported: 0, errors: [{row: 0, message: 'Ошибка сети или сервера'}]});
      setImportDialogOpen(true);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Вы уверены, что хотите удалить этого контрагента?')) return;
    try {
      await api.delete(`/api/companies/${id}`);
      setSnackbar({open: true, message: 'Контрагент удалён', severity: 'success'});
      const dataResponse = await api.get('/api/companies');
      setCounterparties(dataResponse.data);
      setFilteredCounterparties(dataResponse.data);
    } catch (error: any) {
      // Проверяем, является ли ошибка связанной с наличием связанных сущностей
      if (error.response?.status === 400 && error.response?.data) {
        // Отображаем модальное окно с информацией о связанных сущностях
        setRelatedEntitiesData(error.response.data);
        setRelatedEntitiesDialog(true);
      } else {
        const errorText = error.response?.data || error.message || 'Ошибка удаления';
        setSnackbar({open: true, message: `Ошибка удаления: ${errorText}`, severity: 'error'});
      }
    }
  };

  const paginatedCounterparties = filteredCounterparties.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  // Конфигурация колонок для ResponsiveTable
  const columns = [
    {
      id: 'name',
      label: 'Название',
      render: (value: any, row: Counterparty) => row.shortName || row.name
    },
    {
      id: 'legalName',
      label: 'Фирменное наименование',
      render: (value: any, row: Counterparty) => row.legalName
    },
    {
      id: 'inn',
      label: 'ИНН',
      render: (value: any, row: Counterparty) => row.inn
    },
    {
      id: 'kpp',
      label: 'КПП',
      render: (value: any, row: Counterparty) => row.kpp
    },
    {
      id: 'ogrn',
      label: 'ОГРН',
      render: (value: any, row: Counterparty) => row.ogrn
    },
    {
      id: 'address',
      label: 'Адрес',
      render: (value: any, row: Counterparty) => row.address
    },
    {
      id: 'role',
      label: 'Роль',
      render: (value: any, row: Counterparty) => (
        <Chip
          label={getRoleLabel(row.role)}
          color={getRoleColor(row.role) as any}
          size="small"
        />
      )
    },
    {
      id: 'actions',
      label: 'Действия',
      render: (value: any, row: Counterparty) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/reference/counterparties/${row.id}/edit`);
            }}
            color="primary"
          >
            <EditIcon />
          </IconButton>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(row.id);
            }}
            color="error"
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      ),
      mobile: false
    }
  ];

  const getRoleLabel = (role: string | undefined) => {
    switch (role) {
      case 'SUPPLIER':
        return 'Поставщик';
      case 'CUSTOMER':
        return 'Заказчик';
      default:
        return 'Не указана';
    }
  };

  const getRoleColor = (role: string | undefined) => {
    switch (role) {
      case 'SUPPLIER':
        return 'success';
      case 'CUSTOMER':
        return 'primary';
      default:
        return 'default';
    }
  };

  const getRoleFilterLabel = (role: string) => {
    switch (role) {
      case 'Поставщик':
        return 'Поставщики';
      case 'Заказчик':
        return 'Заказчики';
      case '':
        return 'Все контрагенты';
      default:
        return role;
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <IconButton onClick={() => navigate('/reference')} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant={isMobile ? "h5" : "h4"} component="h1">
            Контрагенты
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
            Управление контрагентами
          </Typography>
          <Box sx={{ 
            display: 'flex', 
            gap: { xs: 1, sm: 2 },
            flexWrap: 'wrap'
          }}>
            <Button
              variant="outlined"
              startIcon={<FileUploadIcon />}
              onClick={handleExport}
              size={isMobile ? 'small' : 'medium'}
            >
              Экспорт
            </Button>
            <Button
              variant="outlined"
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
              onClick={() => navigate('/reference/counterparties/new')}
              size={isMobile ? 'small' : 'medium'}
            >
              + Добавить контрагента
            </Button>
          </Box>
        </Box>

        <Box sx={{ 
          display: 'flex', 
          gap: { xs: 1, sm: 2 }, 
          flexWrap: 'wrap', 
          mb: 2,
          flexDirection: { xs: 'column', sm: 'row' }
        }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Поиск по названию, краткому названию или ИНН..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: { xs: '100%', sm: 400 } }}
          />
          <FormControl sx={{ minWidth: { xs: '100%', sm: 200 } }}>
            <InputLabel>Фильтр по роли</InputLabel>
            <Select
              value={roleFilter}
              label="Фильтр по роли"
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <MenuItem value="">Все контрагенты</MenuItem>
              <MenuItem value="SUPPLIER">Поставщики</MenuItem>
              <MenuItem value="CUSTOMER">Заказчики</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <ResponsiveTable
          columns={columns}
          data={paginatedCounterparties}
          getRowKey={(row) => row.id.toString()}
          onRowClick={(row) => navigate(`/reference/counterparties/${row.id}/edit`)}
          title="Список контрагентов"
          loading={false}
        />
        
        {filteredCounterparties.length === 0 && searchTerm && (
          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Typography variant="body1" color="text.secondary">
              По запросу "{searchTerm}" ничего не найдено
            </Typography>
          </Box>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Pagination
            count={Math.ceil(filteredCounterparties.length / rowsPerPage)}
            page={page}
            onChange={(_, value) => setPage(value)}
            color="primary"
          />
        </Box>

        <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({...snackbar, open: false})}>
          <Alert onClose={() => setSnackbar({...snackbar, open: false})} severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>

        <Dialog open={importDialogOpen} onClose={() => setImportDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Результат импорта</DialogTitle>
          <DialogContent>
            <Typography>Успешно импортировано: <b>{importLog?.imported ?? 0}</b></Typography>
            <Typography>Ошибок: <b>{importLog?.errors.length ?? 0}</b></Typography>
            {importLog?.errors.length > 0 && (
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

        {/* Диалог связанных сущностей */}
        <CompanyRelatedEntitiesDialog
          open={relatedEntitiesDialog}
          onClose={() => {
            setRelatedEntitiesDialog(false);
            setRelatedEntitiesData(null);
          }}
          data={relatedEntitiesData}
        />
      </Box>
    </Container>
  );
};

export default CounterpartyListPage; 