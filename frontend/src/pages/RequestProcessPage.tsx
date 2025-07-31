import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  CircularProgress,
  Alert,
  Paper,
  Toolbar,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  ViewList as ViewListIcon,
  ViewModule as ViewModuleIcon,
  ExpandMore as ExpandMoreIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import RequestProcessBrief from '../components/RequestProcessBrief';
import RequestProcessDetailed from '../components/RequestProcessDetailed';
import RequestProcessMatryoshka from '../components/RequestProcessMatryoshka';
import ProcessStatistics from '../components/ProcessStatistics';
import { RequestProcess, ViewMode, RequestProcessFilters } from '../types/requestProcess';



export default function RequestProcessPage() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<RequestProcess[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('brief');
  const [expandedRequests, setExpandedRequests] = useState<string[]>([]);
  const [filters, setFilters] = useState<RequestProcessFilters>({
    organization: '',
    project: '',
    status: '',
    fromDate: '',
    toDate: ''
  });
  const [searchTerm, setSearchTerm] = useState('');

  const fetchRequests = async (detailed: boolean = false) => {
    setLoading(true);
    setError(null);
    try {
      const endpoint = detailed ? '/api/requests/process/list' : '/api/requests/process/brief/list';
      const response = await api.get<RequestProcess[]>(endpoint);
      setRequests(response.data);
    } catch (err) {
      console.error('Ошибка при загрузке процессов заявок:', err);
      setError('Ошибка при загрузке данных');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests(viewMode === 'detailed' || viewMode === 'matryoshka');
  }, [viewMode]);

  const handleViewModeChange = (event: React.MouseEvent<HTMLElement>, newMode: ViewMode | null) => {
    if (newMode !== null) {
      setViewMode(newMode);
    }
  };

  const handleRequestExpand = (requestId: string) => {
    setExpandedRequests(prev => 
      prev.includes(requestId) 
        ? prev.filter(id => id !== requestId)
        : [...prev, requestId]
    );
  };

  const handleRefresh = () => {
    fetchRequests(viewMode === 'detailed' || viewMode === 'matryoshka');
  };

  const handleFilterChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const filteredRequests = requests.filter(request => {
    const matchesSearch = searchTerm === '' || 
      request.requestNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.organization.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.project.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.location.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilters = 
      (filters.organization === '' || request.organization.includes(filters.organization)) &&
      (filters.project === '' || request.project.includes(filters.project)) &&
      (filters.status === '' || request.status === filters.status) &&
      (filters.fromDate === '' || request.requestDate >= filters.fromDate) &&
      (filters.toDate === '' || request.requestDate <= filters.toDate);

    return matchesSearch && matchesFilters;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'success';
      case 'IN_PROGRESS':
        return 'warning';
      case 'CANCELLED':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return 'Черновик';
      case 'SUBMITTED':
        return 'Подана';
      case 'APPROVED':
        return 'Одобрена';
      case 'IN_PROGRESS':
        return 'В работе';
      case 'COMPLETED':
        return 'Завершена';
      case 'CANCELLED':
        return 'Отменена';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <Container maxWidth="xl">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      {/* Заголовок страницы */}
      <Box mb={3}>
        <Typography variant="h4" component="h1" gutterBottom>
          Реестр процессов заявок
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Отслеживание полной цепочки: Заявка → Тендер → Предложения → Счет → Поставка
        </Typography>
      </Box>

      {/* Панель инструментов */}
      <Paper sx={{ mb: 3 }}>
        <Toolbar>
          <Grid container spacing={2} alignItems="center">
            <Grid item>
              <ToggleButtonGroup
                value={viewMode}
                exclusive
                onChange={handleViewModeChange}
                size="small"
              >
                <ToggleButton value="brief">
                  <Tooltip title="Краткий вид">
                    <ViewListIcon />
                  </Tooltip>
                </ToggleButton>
                <ToggleButton value="detailed">
                  <Tooltip title="Подробный вид">
                    <ViewModuleIcon />
                  </Tooltip>
                </ToggleButton>
                <ToggleButton value="matryoshka">
                  <Tooltip title="Матрешка">
                    <ExpandMoreIcon />
                  </Tooltip>
                </ToggleButton>
              </ToggleButtonGroup>
            </Grid>

            <Grid item xs>
              <TextField
                placeholder="Поиск по номеру, организации, проекту..."
                value={searchTerm}
                onChange={handleSearchChange}
                size="small"
                fullWidth
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
            </Grid>

            <Grid item>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={handleRefresh}
                size="small"
              >
                Обновить
              </Button>
            </Grid>
          </Grid>
        </Toolbar>

        {/* Фильтры */}
        <Box p={2} borderTop={1} borderColor="divider">
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                label="Организация"
                value={filters.organization}
                onChange={handleFilterChange('organization')}
                size="small"
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                label="Проект"
                value={filters.project}
                onChange={handleFilterChange('project')}
                size="small"
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                label="Статус"
                value={filters.status}
                onChange={handleFilterChange('status')}
                size="small"
                fullWidth
                select
                SelectProps={{ native: true }}
              >
                <option value="">Все</option>
                <option value="DRAFT">Черновик</option>
                <option value="SUBMITTED">Подана</option>
                <option value="APPROVED">Одобрена</option>
                <option value="IN_PROGRESS">В работе</option>
                <option value="COMPLETED">Завершена</option>
                <option value="CANCELLED">Отменена</option>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                label="С даты"
                type="date"
                value={filters.fromDate}
                onChange={handleFilterChange('fromDate')}
                size="small"
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                label="По дату"
                type="date"
                value={filters.toDate}
                onChange={handleFilterChange('toDate')}
                size="small"
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </Box>
      </Paper>

      {/* Сообщение об ошибке */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Статистика */}
      <ProcessStatistics requests={filteredRequests} />

      {/* Список заявок */}
      <Box>
        {filteredRequests.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="textSecondary" gutterBottom>
              Заявки не найдены
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Попробуйте изменить параметры поиска или фильтры
            </Typography>
          </Paper>
        ) : (
          filteredRequests.map((request) => (
            <Box key={request.requestId}>
              {viewMode === 'brief' ? (
                <RequestProcessBrief
                  request={request}
                  onExpand={() => handleRequestExpand(request.requestId)}
                  expanded={expandedRequests.includes(request.requestId)}
                />
              ) : viewMode === 'detailed' ? (
                <RequestProcessDetailed request={request} />
              ) : (
                <RequestProcessMatryoshka request={request} />
              )}
            </Box>
          ))
        )}
      </Box>
    </Container>
  );
} 