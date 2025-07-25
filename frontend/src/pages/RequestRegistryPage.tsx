import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Toolbar,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  DialogContentText,
  TablePagination
} from '@mui/material';
import {
  Edit,
  FileUpload as FileUploadIcon,
  Visibility as VisibilityIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';

interface RequestRegistryRowDto {
  requestId: string;
  requestNumber: string;
  requestDate: string;
  organization: string;
  project: string;
  materialsCount: number;
  totalQuantity: number;
  note: string;
  status: string;
}

const columns = [
  { key: 'requestNumber', label: 'Номер заявки', width: '120px' },
  { key: 'requestDate', label: 'Дата заявки', width: '100px' },
  { key: 'organization', label: 'Организация', width: '200px' },
  { key: 'project', label: 'Проект', width: '200px' },
  { key: 'status', label: 'Статус', width: '120px' },
  { key: 'materialsCount', label: 'Кол-во материалов', width: '120px' },
  { key: 'totalQuantity', label: 'Общее кол-во', width: '120px' },
  { key: 'note', label: 'Примечание', width: '200px' },
  { key: 'actions', label: 'Действия', width: '120px' },
];

export default function RequestRegistryPage() {
  const [data, setData] = useState<RequestRegistryRowDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [confirmCreateTender, setConfirmCreateTender] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    organization: '',
    project: '',
    fromDate: '',
    toDate: '',
    materialName: '',
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);

  const navigate = useNavigate();

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v)
      );
      const res = await api.get<RequestRegistryRowDto[]>('/api/requests/registry', { params });
      setData(res.data);
    } catch (error) {
      console.error('Ошибка при загрузке реестра заявок:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, []);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData();
  };

  const handleClearFilters = () => {
    setFilters({
      organization: '',
      project: '',
      fromDate: '',
      toDate: '',
      materialName: '',
    });
  };

  const handleExport = async () => {
    try {
      const params = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v)
      );
      const res = await api.get('/api/requests/registry/export', {
        params,
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `реестр_заявок_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Ошибка при экспорте:', error);
    }
  };

  const handleCreateTender = async () => {
    if (!selectedRequestId) return;
    
    try {
      const response = await api.post(`/api/requests/${selectedRequestId}/create-tender`);
      const tender = response.data;
      // Перезагружаем данные, так как статус обновляется на бэкенде
      fetchData();
      setConfirmCreateTender(false);
      setSelectedRequestId(null);
      // Открываем тендер в новом окне
      window.open(`/tenders/${tender.id}`, '_blank');
    } catch (error: any) {
      console.error('Ошибка при создании тендера:', error);
      alert('Ошибка при создании тендера: ' + (error.response?.data?.message || error.message));
      setConfirmCreateTender(false);
      setSelectedRequestId(null);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('ru-RU');
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'Черновик';
      case 'SAVED': return 'Сохранен';
      case 'TENDER': return 'Тендер';
      case 'COMPLETED': return 'Исполнена';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'default';
      case 'SAVED': return 'primary';
      case 'TENDER': return 'warning';
      case 'COMPLETED': return 'success';
      default: return 'default';
    }
  };

  // Пагинация: slice данных для текущей страницы
  const paginatedData = data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Paper sx={{ p: 2 }}>
      <Toolbar sx={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 2 }}>
        <Typography variant="h6" component="div">Реестр заявок</Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
        <Button
            variant="outlined"
            startIcon={<FileUploadIcon />}
            onClick={handleExport}
            disabled={loading}
          >
            Экспорт в Excel
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/requests/new')}
            startIcon={<Edit />}
          >
            Создать заявку
          </Button>
          </Box>
      </Toolbar>

      {/* Фильтры */}
      <Paper sx={{ p: 2, mb: 2, backgroundColor: '#f5f5f5' }}>
        <Box component="form" onSubmit={handleFilterSubmit}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <TextField
              name="organization"
              label="Организация"
              size="small"
              value={filters.organization}
              onChange={handleFilterChange}
              sx={{ minWidth: 200 }}
            />
            <TextField
              name="project"
              label="Проект"
              size="small"
              value={filters.project}
              onChange={handleFilterChange}
              sx={{ minWidth: 200 }}
            />
            <TextField
              name="materialName"
              label="Материал"
              size="small"
              value={filters.materialName}
              onChange={handleFilterChange}
              sx={{ minWidth: 200 }}
            />
            <TextField
              name="fromDate"
              label="С даты"
              type="date"
              size="small"
              value={filters.fromDate}
              onChange={handleFilterChange}
              InputLabelProps={{ shrink: true }}
              inputProps={{ placeholder: 'ДД.ММ.ГГГГ' }}
            />
            <TextField
              name="toDate"
              label="По дату"
              type="date"
              size="small"
              value={filters.toDate}
              onChange={handleFilterChange}
              InputLabelProps={{ shrink: true }}
              inputProps={{ placeholder: 'ДД.ММ.ГГГГ' }}
            />
            <Button type="submit" variant="contained" color="primary">
              Фильтровать
            </Button>
            <Button type="button" variant="outlined" onClick={handleClearFilters}>
              Сбросить
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Таблица */}
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              {columns.map(col => (
                <TableCell 
                  key={col.key}
                  sx={{ 
                    fontWeight: 'bold',
                    width: col.width,
                    whiteSpace: 'nowrap'
                  }}
                >
                  {col.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center" sx={{ py: 4 }}>
                  <CircularProgress size={24} />
                </TableCell>
              </TableRow>
            ) : paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    Нет данных для отображения
                  </Typography>
                </TableCell>
              </TableRow>
            ) : paginatedData.map((row, idx) => (
              <TableRow 
                key={row.requestId + '-' + idx}
                hover
                sx={{ '&:hover': { backgroundColor: '#f8f9fa' } }}
              >
                <TableCell>
                  <Typography variant="body2" fontWeight="medium">
                    {row.requestNumber}
                  </Typography>
                </TableCell>
                <TableCell>{formatDate(row.requestDate)}</TableCell>
                <TableCell>{row.organization}</TableCell>
                <TableCell>{row.project}</TableCell>
                <TableCell align="center">
                  <Chip 
                    label={getStatusLabel(row.status)} 
                    size="small" 
                    color={getStatusColor(row.status) as any}
                  />
                </TableCell>
                <TableCell align="center">
                  <Chip 
                    label={row.materialsCount} 
                    size="small" 
                    color="secondary"
                  />
                </TableCell>
                <TableCell align="center">
                  <Typography variant="body2" fontWeight="medium">
                    {row.totalQuantity.toFixed(2)}
                  </Typography>
                </TableCell>
                <TableCell>
                  {row.note ? (
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        maxWidth: 200,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                      title={row.note}
                    >
                      {row.note}
                    </Typography>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      -
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="Просмотреть">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => navigate(`/requests/${row.requestId}`)}
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Редактировать">
                      <IconButton
                        size="small"
                        color="secondary"
                        onClick={() => navigate(`/requests/${row.requestId}/edit`)}
                      >
                        <Edit />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Создать тендер">
                      <IconButton
                        size="small"
                        color="success"
                        onClick={() => {
                          setSelectedRequestId(row.requestId);
                          setConfirmCreateTender(true);
                        }}
                      >
                        <FileUploadIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={data.length}
        page={page}
        onPageChange={(_, newPage) => setPage(newPage)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(parseInt(e.target.value, 10));
          setPage(0);
        }}
        labelRowsPerPage="Строк на странице:"
        labelDisplayedRows={({ from, to, count }) => `${from}-${to} из ${count}`}
        rowsPerPageOptions={[5, 10, 25, 50]}
      />

      {/* Статистика */}
      {!loading && data.length > 0 && (
        <Box sx={{ mt: 2, p: 2, backgroundColor: '#f8f9fa', borderRadius: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Всего заявок: {data.length} | 
            Общее количество материалов: {data.reduce((sum, row) => sum + row.materialsCount, 0)}
          </Typography>
        </Box>
      )}

      {/* Диалог подтверждения создания тендера */}
      <Dialog open={confirmCreateTender} onClose={() => { setConfirmCreateTender(false); setSelectedRequestId(null); }}>
        <DialogTitle>Создать тендер?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Вы уверены, что хотите создать тендер по этой заявке? После создания статус заявки изменится на "Тендер".
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setConfirmCreateTender(false); setSelectedRequestId(null); }}>
            Отмена
          </Button>
          <Button color="success" onClick={handleCreateTender}>
            Создать
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
} 