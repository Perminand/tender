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
  TablePagination,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Edit,
  FileUpload as FileUploadIcon,
  Visibility as VisibilityIcon,
  Add as AddIcon,
  Business as BusinessIcon,
  Delete as DeleteIcon,
  Send as SendIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import ResponsiveTable from '../components/ResponsiveTable';
import { RelatedEntitiesDialog } from '../components/RelatedEntitiesDialog';

interface RequestRegistryRowDto {
  requestId: string;
  requestNumber: string;
  requestDate: string;
  organization: string;
  project: string;
  materialsCount: number;
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
  { key: 'note', label: 'Примечание', width: '200px' },
  { key: 'actions', label: 'Действия', width: '120px' },
];

export default function RequestRegistryPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [data, setData] = useState<RequestRegistryRowDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [confirmCreateTender, setConfirmCreateTender] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [relatedEntitiesDialog, setRelatedEntitiesDialog] = useState(false);
  const [relatedEntitiesData, setRelatedEntitiesData] = useState<any>(null);
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

  const handleDelete = async () => {
    if (!selectedRequestId) return;
    
    try {
      await api.delete(`/api/requests/${selectedRequestId}`);
      fetchData();
      setConfirmDelete(false);
      setSelectedRequestId(null);
    } catch (error: any) {
      console.error('Ошибка при удалении заявки:', error);
      
      // Проверяем, является ли ошибка связанной с наличием связанных сущностей
      if (error.response?.status === 400 && error.response?.data) {
        // Отображаем модальное окно с информацией о связанных сущностях
        setRelatedEntitiesData(error.response.data);
        setRelatedEntitiesDialog(true);
      } else {
        alert('Ошибка при удалении заявки: ' + (error.response?.data?.message || error.message));
      }
      
      setConfirmDelete(false);
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

  // Конфигурация колонок для ResponsiveTable
  const responsiveColumns = [
    {
      id: 'requestNumber',
      label: 'Номер заявки',
      render: (value: any, row: RequestRegistryRowDto) => row.requestNumber
    },
    {
      id: 'requestDate',
      label: 'Дата заявки',
      render: (value: any, row: RequestRegistryRowDto) => formatDate(row.requestDate)
    },
    {
      id: 'organization',
      label: 'Организация',
      render: (value: any, row: RequestRegistryRowDto) => row.organization
    },
    {
      id: 'project',
      label: 'Проект',
      render: (value: any, row: RequestRegistryRowDto) => row.project
    },
    {
      id: 'status',
      label: 'Статус',
      render: (value: any, row: RequestRegistryRowDto) => (
        <Chip
          label={getStatusLabel(row.status)}
          color={getStatusColor(row.status)}
          size="small"
        />
      )
    },
    {
      id: 'materialsCount',
      label: 'Кол-во материалов',
      render: (value: any, row: RequestRegistryRowDto) => row.materialsCount
    },
    {
      id: 'note',
      label: 'Примечание',
      render: (value: any, row: RequestRegistryRowDto) => row.note
    },
    {
      id: 'actions',
      label: 'Действия',
      render: (value: any, row: RequestRegistryRowDto) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/requests/${row.requestId}`);
            }}
            title="Просмотр"
          >
            <VisibilityIcon />
          </IconButton>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/requests/${row.requestId}/customer-info`);
            }}
            title="Информация о заказчике"
          >
            <BusinessIcon />
          </IconButton>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/requests/${row.requestId}/edit`);
            }}
            title="Редактировать"
          >
            <Edit />
          </IconButton>

          {row.status === 'SAVED' && (
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedRequestId(row.requestId);
                setConfirmCreateTender(true);
              }}
              title="Создать тендер"
              color="success"
            >
              <SendIcon />
            </IconButton>
          )}
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedRequestId(row.requestId);
              setConfirmDelete(true);
            }}
            title="Удалить"
            color="error"
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      ),
      mobile: false
    }
  ];

  return (
    <Paper sx={{ p: { xs: 1, sm: 2 } }}>
      <Toolbar sx={{ 
        justifyContent: 'space-between', 
        flexWrap: 'wrap', 
        gap: { xs: 1, sm: 2 }, 
        mb: 2,
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { xs: 'stretch', sm: 'center' }
      }}>
        <Typography variant={isMobile ? "h6" : "h6"} component="div">Реестр заявок</Typography>
        <Box sx={{ 
          display: 'flex', 
          gap: { xs: 1, sm: 2 }, 
          alignItems: 'center',
          flexWrap: 'wrap'
        }}>
        <Button
            variant="outlined"
            startIcon={<FileUploadIcon />}
            onClick={handleExport}
            disabled={loading}
            size={isMobile ? 'small' : 'medium'}
          >
            Экспорт
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/requests/new')}
            startIcon={<Edit />}
            size={isMobile ? 'small' : 'medium'}
          >
            Создать заявку
          </Button>
          </Box>
      </Toolbar>

      {/* Фильтры */}
      <Paper sx={{ p: { xs: 1, sm: 2 }, mb: 2, backgroundColor: '#f5f5f5' }}>
        <Box component="form" onSubmit={handleFilterSubmit}>
          <Box sx={{ 
            display: 'flex', 
            gap: { xs: 1, sm: 2 }, 
            flexWrap: 'wrap', 
            alignItems: 'center' 
          }}>
            <TextField
              name="organization"
              label="Организация"
              size="small"
              value={filters.organization}
              onChange={handleFilterChange}
              sx={{ minWidth: { xs: '100%', sm: 200 } }}
            />
            <TextField
              name="project"
              label="Проект"
              size="small"
              value={filters.project}
              onChange={handleFilterChange}
              sx={{ minWidth: { xs: '100%', sm: 200 } }}
            />
            <TextField
              name="materialName"
              label="Материал"
              size="small"
              value={filters.materialName}
              onChange={handleFilterChange}
              sx={{ minWidth: { xs: '100%', sm: 200 } }}
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
              sx={{ minWidth: { xs: '100%', sm: 150 } }}
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
              sx={{ minWidth: { xs: '100%', sm: 150 } }}
            />
            <Button type="submit" variant="contained" color="primary" size={isMobile ? 'small' : 'medium'}>
              Фильтровать
            </Button>
            <Button type="button" variant="outlined" onClick={handleClearFilters} size={isMobile ? 'small' : 'medium'}>
              Сбросить
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Таблица */}
      <ResponsiveTable
        columns={responsiveColumns}
        data={paginatedData}
        getRowKey={(row) => row.requestId}
        onRowClick={(row) => navigate(`/requests/${row.requestId}`)}
        title="Реестр заявок"
        loading={loading}
      />
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
            Всего заявок: {data.length}
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

      {/* Диалог подтверждения удаления */}
      <Dialog open={confirmDelete} onClose={() => { setConfirmDelete(false); setSelectedRequestId(null); }}>
        <DialogTitle>Удалить заявку?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Вы уверены, что хотите удалить эту заявку? Это действие нельзя будет отменить.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setConfirmDelete(false); setSelectedRequestId(null); }}>
            Отмена
          </Button>
          <Button color="error" onClick={handleDelete}>
            Удалить
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог связанных сущностей */}
      <RelatedEntitiesDialog
        open={relatedEntitiesDialog}
        onClose={() => {
          setRelatedEntitiesDialog(false);
          setRelatedEntitiesData(null);
        }}
        data={relatedEntitiesData}
      />

    </Paper>
  );
} 