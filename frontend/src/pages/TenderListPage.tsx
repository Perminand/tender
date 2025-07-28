import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Chip,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  DialogContentText,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  TextField,
  OutlinedInput,
  Checkbox,
  ListItemText,
  Collapse,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Add as AddIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Publish as PublishIcon,
  Close as CloseIcon,
  TrendingUp as TrendingUpIcon,
  CheckCircle as CheckCircleIcon,
  Assessment as AssessmentIcon,
  FilterList as FilterListIcon,
  ExpandMore as ExpandMoreIcon,
  Description as ContractIcon,
  TableView as TableViewIcon,
  ViewModule as ViewModuleIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import type { SelectChangeEvent } from '@mui/material/Select';
import Pagination from '@mui/material/Pagination';
import ResponsiveTable from '../components/ResponsiveTable';

interface TenderDto {
  id: string;
  tenderNumber: string;
  title: string;
  description: string;
  customerName: string;
  startDate: string;
  endDate: string;
  submissionDeadline: string;
  status: 'DRAFT' | 'PUBLISHED' | 'BIDDING' | 'EVALUATION' | 'AWARDED' | 'CANCELLED';
  proposalsCount: number;
  bestPrice: number;
  bestSupplierName: string;
}

const TenderListPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [tenders, setTenders] = useState<TenderDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTenderId, setSelectedTenderId] = useState<string | null>(null);
  const [statusDialog, setStatusDialog] = useState<{
    open: boolean;
    tenderId: string | null;
    action: 'publish' | 'start-bidding' | 'close' | 'complete' | 'cancel' | null;
    title: string;
    description: string;
    onConfirm: (() => void) | null;
  }>({
    open: false,
    tenderId: null,
    action: null,
    title: '',
    description: '',
    onConfirm: null
  });
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  const statusOrder = [
    'DRAFT',
    'PUBLISHED',
    'BIDDING',
    'EVALUATION',
    'AWARDED',
    'CANCELLED'
  ];
  
  // Расширенные фильтры
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [customerFilter, setCustomerFilter] = useState<string>('');
  const [dateFromFilter, setDateFromFilter] = useState<string>('');
  const [dateToFilter, setDateToFilter] = useState<string>('');
  const [proposalsCountFilter, setProposalsCountFilter] = useState<string>('');
  const [priceFromFilter, setPriceFromFilter] = useState<string>('');
  const [priceToFilter, setPriceToFilter] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);
  
  const [page, setPage] = useState(1);
  const cardRowsPerPage = 12;
  const tableRowsPerPage = 50;
  const rowsPerPage = viewMode === 'cards' ? cardRowsPerPage : tableRowsPerPage;

  // Получаем роль пользователя
  const userRole = localStorage.getItem('userRole');
  const isSupplier = userRole === 'SUPPLIER';

  useEffect(() => {
    loadTenders();
  }, []);

  const loadTenders = async () => {
    try {
      setLoading(true);
      
      // Получаем роль пользователя из localStorage
      const userRole = localStorage.getItem('userRole');
      
      // Для поставщика используем специальный эндпоинт
      const endpoint = userRole === 'SUPPLIER' 
        ? '/api/tenders/supplier-list'
        : '/api/tenders';
      
      const response = await api.get(endpoint);
      setTenders(response.data);
    } catch (error) {
      console.error('Error loading tenders:', error);
      setError('Ошибка загрузки тендеров');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (tenderId: string) => {
    setSelectedTenderId(tenderId);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (selectedTenderId) {
      try {
        await api.delete(`/api/tenders/${selectedTenderId}`);
        await loadTenders();
        setDeleteDialogOpen(false);
        setSelectedTenderId(null);
        setError(null);
      } catch (error: any) {
        console.error('Error deleting tender:', error);
        const errorMessage = error.response?.data?.message || 'Ошибка удаления тендера';
        setError(errorMessage);
        setDeleteDialogOpen(false);
        setSelectedTenderId(null);
      }
    }
  };

  const handlePublish = async (tenderId: string) => {
    try {
      await api.post(`/api/tenders/${tenderId}/publish`);
      await loadTenders();
      setError(null);
    } catch (error: any) {
      console.error('Error publishing tender:', error);
      const errorMessage = error.response?.data?.message || 'Ошибка публикации тендера';
      setError(errorMessage);
    }
  };

  const handleClose = async (tenderId: string) => {
    try {
      await api.post(`/api/tenders/${tenderId}/close`);
      await loadTenders();
      setError(null);
    } catch (error: any) {
      console.error('Error closing tender:', error);
      const errorMessage = error.response?.data?.message || 'Ошибка закрытия тендера';
      setError(errorMessage);
    }
  };

  const handleStartBidding = async (tenderId: string) => {
    try {
      await api.post(`/api/tenders/${tenderId}/start-bidding`);
      await loadTenders();
      setError(null);
    } catch (error: any) {
      console.error('Error starting bidding:', error);
      const errorMessage = error.response?.data?.message || 'Ошибка начала приема предложений';
      setError(errorMessage);
    }
  };

  const handleComplete = async (tenderId: string) => {
    try {
      await api.post(`/api/tenders/${tenderId}/complete`);
      await loadTenders();
      setError(null);
    } catch (error: any) {
      console.error('Error completing tender:', error);
      const errorMessage = error.response?.data?.message || 'Ошибка завершения тендера';
      setError(errorMessage);
    }
  };

  const handleCancel = async (tenderId: string) => {
    try {
      await api.post(`/api/tenders/${tenderId}/cancel`);
      await loadTenders();
      setError(null);
    } catch (error: any) {
      console.error('Error cancelling tender:', error);
      const errorMessage = error.response?.data?.message || 'Ошибка отмены тендера';
      setError(errorMessage);
    }
  };

  const openStatusDialog = (tenderId: string, action: 'publish' | 'start-bidding' | 'close' | 'complete' | 'cancel') => {
    let title = '';
    let description = '';
    let onConfirm: (() => void) | null = null;
    switch (action) {
      case 'publish':
        title = 'Опубликовать тендер';
        description = 'Вы уверены, что хотите опубликовать тендер? После публикации тендер станет доступен для просмотра.';
        onConfirm = () => handlePublish(tenderId);
        break;
      case 'start-bidding':
        title = 'Начать прием предложений';
        description = 'Вы уверены, что хотите начать прием предложений? После этого поставщики смогут подавать предложения.';
        onConfirm = () => handleStartBidding(tenderId);
        break;
      case 'close':
        title = 'Закрыть прием предложений';
        description = 'Вы уверены, что хотите закрыть прием предложений? После этого новые предложения приниматься не будут.';
        onConfirm = () => handleClose(tenderId);
        break;
      case 'complete':
        title = 'Завершить тендер';
        description = 'Вы уверены, что хотите завершить тендер? Это действие нельзя будет отменить.';
        onConfirm = () => handleComplete(tenderId);
        break;
      case 'cancel':
        title = 'Отменить тендер';
        description = 'Вы уверены, что хотите отменить тендер? После отмены тендер будет недоступен для дальнейших действий.';
        onConfirm = () => handleCancel(tenderId);
        break;
    }
    setStatusDialog({ open: true, tenderId, action, title, description, onConfirm });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'default';
      case 'PUBLISHED': return 'info';
      case 'BIDDING': return 'warning';
      case 'EVALUATION': return 'primary';
      case 'AWARDED': return 'success';
      case 'CANCELLED': return 'error';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'Черновик';
      case 'PUBLISHED': return 'Опубликован';
      case 'BIDDING': return 'Прием предложений';
      case 'EVALUATION': return 'Оценка';
      case 'AWARDED': return 'Присужден';
      case 'CANCELLED': return 'Отменен';
      default: return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      currencyDisplay: 'symbol'
    }).format(price);
  };

  const handleStatusFilterChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    setStatusFilter(typeof value === 'string' ? value.split(',') : value);
  };

  const clearFilters = () => {
    setStatusFilter([]);
    setSearchFilter('');
    setCustomerFilter('');
    setDateFromFilter('');
    setDateToFilter('');
    setProposalsCountFilter('');
    setPriceFromFilter('');
    setPriceToFilter('');
    setPage(1);
  };

  // Конфигурация колонок для ResponsiveTable
  const columns = [
    {
      id: 'tenderNumber',
      label: 'Номер',
      render: (value: any, row: TenderDto) => row.tenderNumber
    },
    {
      id: 'title',
      label: 'Название',
      render: (value: any, row: TenderDto) => (
        <Box>
          <Typography variant="body2" fontWeight={600}>
            {row.title}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {row.description}
          </Typography>
        </Box>
      )
    },
    {
      id: 'customerName',
      label: 'Заказчик',
      render: (value: any, row: TenderDto) => row.customerName
    },
    {
      id: 'submissionDeadline',
      label: 'Срок подачи',
      render: (value: any, row: TenderDto) => formatDate(row.submissionDeadline)
    },
    {
      id: 'status',
      label: 'Статус',
      render: (value: any, row: TenderDto) => (
        <Chip 
          label={getStatusLabel(row.status)} 
          color={getStatusColor(row.status) as any} 
          size="small" 
        />
      )
    },
    {
      id: 'proposalsCount',
      label: 'Предложений',
      render: (value: any, row: TenderDto) => row.proposalsCount
    },
    {
      id: 'bestPrice',
      label: 'Лучшая цена',
      render: (value: any, row: TenderDto) => row.bestPrice ? formatPrice(row.bestPrice) : '-'
    },
    {
      id: 'actions',
      label: 'Действия',
      render: (value: any, row: TenderDto) => (
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Tooltip title="Просмотр">
            <IconButton size="small" onClick={(e) => {
              e.stopPropagation();
              navigate(`/tenders/${row.id}`);
            }}>
              <ViewIcon />
            </IconButton>
          </Tooltip>
          {!isSupplier && (
            <>
              {row.status === 'DRAFT' && (
                <>
                  <Tooltip title="Редактировать">
                    <IconButton size="small" onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/tenders/${row.id}/edit`);
                    }}>
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Опубликовать">
                    <IconButton size="small" onClick={(e) => {
                      e.stopPropagation();
                      openStatusDialog(row.id, 'publish');
                    }}>
                      <PublishIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Удалить">
                    <IconButton size="small" color="error" onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClick(row.id);
                    }}>
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </>
              )}
              {row.status === 'PUBLISHED' && (
                <Tooltip title="Начать прием предложений">
                  <IconButton size="small" color="warning" onClick={(e) => {
                    e.stopPropagation();
                    openStatusDialog(row.id, 'start-bidding');
                  }}>
                    <TrendingUpIcon />
                  </IconButton>
                </Tooltip>
              )}
              {row.status === 'BIDDING' && (
                <Tooltip title="Закрыть прием">
                  <IconButton size="small" onClick={(e) => {
                    e.stopPropagation();
                    openStatusDialog(row.id, 'close');
                  }}>
                    <CloseIcon />
                  </IconButton>
                </Tooltip>
              )}
              {row.status === 'EVALUATION' && (
                <>
                  <Tooltip title="Завершить тендер">
                    <IconButton size="small" color="success" onClick={(e) => {
                      e.stopPropagation();
                      openStatusDialog(row.id, 'complete');
                    }}>
                      <CheckCircleIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Заключить контракт">
                    <IconButton size="small" color="primary" onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/tenders/${row.id}/contract/new`);
                    }}>
                      <ContractIcon />
                    </IconButton>
                  </Tooltip>
                </>
              )}
              {row.status !== 'CANCELLED' && row.status !== 'AWARDED' && (
                <Tooltip title="Отменить тендер">
                  <IconButton size="small" color="error" onClick={(e) => {
                    e.stopPropagation();
                    openStatusDialog(row.id, 'cancel');
                  }}>
                    <CloseIcon />
                  </IconButton>
                </Tooltip>
              )}
              {(row.status === 'BIDDING' || row.status === 'EVALUATION' || row.status === 'AWARDED') && (
                <Tooltip title="Анализ цен">
                  <IconButton size="small" color="info" onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/tenders/${row.id}/price-analysis`);
                  }}>
                    <AssessmentIcon />
                  </IconButton>
                </Tooltip>
              )}
              {row.status === 'AWARDED' && (
                <Tooltip title="Просмотр контракта">
                  <IconButton size="small" color="primary" onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/tenders/${row.id}/contract`);
                  }}>
                    <ContractIcon />
                  </IconButton>
                </Tooltip>
              )}
            </>
          )}
          {row.status === 'BIDDING' && (
            <Tooltip title="Подать предложение">
              <IconButton size="small" color="success" onClick={(e) => {
                e.stopPropagation();
                navigate(`/tenders/${row.id}/proposals/new`);
              }}>
                <PublishIcon />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      ),
      mobile: false
    }
  ];

  const filteredAndSortedTenders = tenders
    .filter(t => {
      // Фильтр по статусам
      if (statusFilter.length > 0 && !statusFilter.includes(t.status)) {
        return false;
      }
      
      // Фильтр по поиску
      if (searchFilter && !t.title.toLowerCase().includes(searchFilter.toLowerCase()) && 
          !t.description.toLowerCase().includes(searchFilter.toLowerCase()) &&
          !t.tenderNumber.toLowerCase().includes(searchFilter.toLowerCase())) {
        return false;
      }
      
      // Фильтр по заказчику
      if (customerFilter && !t.customerName.toLowerCase().includes(customerFilter.toLowerCase())) {
        return false;
      }
      
      // Фильтр по датам
      if (dateFromFilter && t.startDate < dateFromFilter) {
        return false;
      }
      if (dateToFilter && t.startDate > dateToFilter) {
        return false;
      }
      
      // Фильтр по количеству предложений
      if (proposalsCountFilter) {
        const count = parseInt(proposalsCountFilter);
        if (t.proposalsCount < count) {
          return false;
        }
      }
      
      // Фильтр по цене
      if (priceFromFilter && t.bestPrice && t.bestPrice < parseFloat(priceFromFilter)) {
        return false;
      }
      if (priceToFilter && t.bestPrice && t.bestPrice > parseFloat(priceToFilter)) {
        return false;
      }
      
      return true;
    })
    .sort((a, b) => {
      const statusDiff = statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status);
      if (statusDiff !== 0) return statusDiff;
      return a.title.localeCompare(b.title, 'ru', { sensitivity: 'base' });
    });

  const paginatedTenders = filteredAndSortedTenders.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  if (loading) {
    return <Typography>Загрузка...</Typography>;
  }

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 3,
        flexDirection: { xs: 'column', sm: 'row' },
        gap: { xs: 2, sm: 0 }
      }}>
        <Typography variant={isMobile ? "h5" : "h4"} component="h1">
          Тендеры
        </Typography>
        <Box sx={{ 
          display: 'flex', 
          gap: { xs: 1, sm: 2 },
          flexWrap: 'wrap'
        }}>
          {!isMobile && (
            <>
              <Button
                variant={viewMode === 'cards' ? 'contained' : 'outlined'}
                startIcon={<ViewModuleIcon />}
                onClick={() => setViewMode('cards')}
                size="small"
              >
                Карточки
              </Button>
              <Button
                variant={viewMode === 'table' ? 'contained' : 'outlined'}
                startIcon={<TableViewIcon />}
                onClick={() => setViewMode('table')}
                size="small"
              >
                Таблица
              </Button>
            </>
          )}
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/tenders/new')}
            size={isMobile ? 'small' : 'medium'}
          >
            Создать тендер
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
        <Button
          variant="outlined"
          startIcon={<FilterListIcon />}
          onClick={() => setShowFilters(!showFilters)}
          sx={{ minWidth: 120 }}
        >
          Фильтры
        </Button>
        
        <FormControl size="small" sx={{ minWidth: 300 }}>
          <InputLabel id="status-filter-label">Статусы</InputLabel>
          <Select
            labelId="status-filter-label"
            multiple
            value={statusFilter}
            onChange={handleStatusFilterChange}
            input={<OutlinedInput label="Статусы" />}
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selected.map((value) => (
                  <Chip key={value} label={getStatusLabel(value)} size="small" />
                ))}
              </Box>
            )}
          >
            {/* Статусы DRAFT и CANCELLED скрыты для поставщика */}
            {!isSupplier && (
              <MenuItem value="DRAFT">
                <Checkbox checked={statusFilter.indexOf('DRAFT') > -1} />
                <ListItemText primary="Черновик" />
              </MenuItem>
            )}
            <MenuItem value="PUBLISHED">
              <Checkbox checked={statusFilter.indexOf('PUBLISHED') > -1} />
              <ListItemText primary="Опубликован" />
            </MenuItem>
            <MenuItem value="BIDDING">
              <Checkbox checked={statusFilter.indexOf('BIDDING') > -1} />
              <ListItemText primary="Прием предложений" />
            </MenuItem>
            <MenuItem value="EVALUATION">
              <Checkbox checked={statusFilter.indexOf('EVALUATION') > -1} />
              <ListItemText primary="Оценка" />
            </MenuItem>
            <MenuItem value="AWARDED">
              <Checkbox checked={statusFilter.indexOf('AWARDED') > -1} />
              <ListItemText primary="Присужден" />
            </MenuItem>
            {!isSupplier && (
              <MenuItem value="CANCELLED">
                <Checkbox checked={statusFilter.indexOf('CANCELLED') > -1} />
                <ListItemText primary="Отменен" />
              </MenuItem>
            )}
          </Select>
        </FormControl>
        
        <TextField
          size="small"
          label="Поиск"
          placeholder="Название, описание, номер"
          value={searchFilter}
          onChange={(e) => setSearchFilter(e.target.value)}
          sx={{ minWidth: 200 }}
        />
        
        <Button
          variant="outlined"
          onClick={clearFilters}
          size="small"
        >
          Сбросить
        </Button>
      </Box>

      <Collapse in={showFilters}>
        <Paper sx={{ p: 2, mb: 2, backgroundColor: '#f5f5f5' }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                size="small"
                label="Заказчик"
                placeholder="Название заказчика"
                value={customerFilter}
                onChange={(e) => setCustomerFilter(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                size="small"
                label="Дата начала с"
                type="date"
                value={dateFromFilter}
                onChange={(e) => setDateFromFilter(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                size="small"
                label="Дата начала по"
                type="date"
                value={dateToFilter}
                onChange={(e) => setDateToFilter(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            {/* Фильтры по предложениям и ценам - скрыты для поставщика */}
            {!isSupplier && (
              <>
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Мин. предложений"
                    type="number"
                    value={proposalsCountFilter}
                    onChange={(e) => setProposalsCountFilter(e.target.value)}
                    inputProps={{ min: 0 }}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Цена от"
                    type="number"
                    value={priceFromFilter}
                    onChange={(e) => setPriceFromFilter(e.target.value)}
                    inputProps={{ min: 0, step: 0.01 }}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Цена до"
                    type="number"
                    value={priceToFilter}
                    onChange={(e) => setPriceToFilter(e.target.value)}
                    inputProps={{ min: 0, step: 0.01 }}
                  />
                </Grid>
              </>
            )}
          </Grid>
        </Paper>
      </Collapse>

      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Найдено тендеров: {filteredAndSortedTenders.length}
        </Typography>
      </Box>

      {viewMode === 'cards' ? (
        <Grid container spacing={3}>
          {paginatedTenders.map((tender) => (
            <Grid item xs={12} md={6} lg={4} key={tender.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h6" component="h2" sx={{ flex: 1 }}>
                      {tender.title}
                    </Typography>
                    <Chip
                      label={getStatusLabel(tender.status)}
                      color={getStatusColor(tender.status)}
                      size="small"
                    />
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    №{tender.tenderNumber}
                  </Typography>

                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Заказчик: {tender.customerName}
                  </Typography>

                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Срок подачи: {formatDate(tender.submissionDeadline)}
                  </Typography>

                  {/* Информация о предложениях - скрыта для поставщика */}
                  {!isSupplier && (
                    <>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Typography variant="body2" sx={{ mr: 1 }}>
                          Предложений: {tender.proposalsCount}
                        </Typography>
                        {tender.bestPrice && (
                          <Box sx={{ display: 'flex', alignItems: 'center', ml: 'auto' }}>
                            <TrendingUpIcon sx={{ fontSize: 16, mr: 0.5, color: 'success.main' }} />
                            <Typography variant="body2" color="success.main">
                              {formatPrice(tender.bestPrice)}
                            </Typography>
                          </Box>
                        )}
                      </Box>

                      {tender.bestSupplierName && (
                        <Typography variant="body2" color="success.main" sx={{ mb: 2 }}>
                          Лучшее предложение: {tender.bestSupplierName}
                        </Typography>
                      )}
                    </>
                  )}

                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Tooltip title="Просмотр">
                      <IconButton
                        size="small"
                        onClick={() => navigate(`/tenders/${tender.id}`)}
                      >
                        <ViewIcon />
                      </IconButton>
                    </Tooltip>

                    {/* Кнопки управления - скрыты для поставщика */}
                    {!isSupplier && (
                      <>
                        {tender.status === 'DRAFT' && (
                          <Tooltip title="Редактировать">
                            <IconButton
                              size="small"
                              onClick={() => navigate(`/tenders/${tender.id}/edit`)}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                        )}

                        {tender.status === 'DRAFT' && (
                          <>
                          <Tooltip title="Опубликовать">
                              <IconButton
                                size="small"
                                onClick={() => openStatusDialog(tender.id, 'publish')}
                              >
                                <PublishIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Удалить">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDeleteClick(tender.id)}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}

                        {tender.status === 'PUBLISHED' && (
                          <Tooltip title="Начать прием предложений">
                            <IconButton
                              size="small"
                              color="warning"
                              onClick={() => openStatusDialog(tender.id, 'start-bidding')}
                            >
                              <TrendingUpIcon />
                            </IconButton>
                          </Tooltip>
                        )}

                        {tender.status === 'BIDDING' && (
                          <Tooltip title="Закрыть прием">
                            <IconButton
                              size="small"
                              onClick={() => openStatusDialog(tender.id, 'close')}
                            >
                              <CloseIcon />
                            </IconButton>
                          </Tooltip>
                        )}

                        {tender.status === 'EVALUATION' && (
                          <>
                            <Tooltip title="Завершить тендер">
                              <IconButton
                                size="small"
                                color="success"
                                onClick={() => openStatusDialog(tender.id, 'complete')}
                              >
                                <CheckCircleIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Заключить контракт">
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => navigate(`/tenders/${tender.id}/contract/new`)}
                              >
                                <ContractIcon />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}

                        {tender.status !== 'CANCELLED' && tender.status !== 'AWARDED' && (
                          <Tooltip title="Отменить тендер">
                          <IconButton
                            size="small"
                            color="error"
                              onClick={() => openStatusDialog(tender.id, 'cancel')}
                            >
                              <CloseIcon />
                            </IconButton>
                          </Tooltip>
                        )}

                        {(tender.status === 'BIDDING' || tender.status === 'EVALUATION' || tender.status === 'AWARDED') && (
                          <Tooltip title="Анализ цен">
                            <IconButton
                              size="small"
                              color="info"
                              onClick={() => navigate(`/tenders/${tender.id}/price-analysis`)}
                            >
                              <AssessmentIcon />
                            </IconButton>
                          </Tooltip>
                        )}

                        {tender.status === 'AWARDED' && (
                          <Tooltip title="Просмотр контракта">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => navigate(`/tenders/${tender.id}/contract`)}
                            >
                              <ContractIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                      </>
                    )}

                    {/* Кнопка подачи предложения - доступна для всех в статусе BIDDING */}
                    {tender.status === 'BIDDING' && (
                      <Tooltip title="Подать предложение">
                        <IconButton
                          size="small"
                          color="success"
                          onClick={() => navigate(`/tenders/${tender.id}/proposals/new`)}
                      >
                          <PublishIcon />
                      </IconButton>
                    </Tooltip>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <ResponsiveTable
          columns={columns}
          data={paginatedTenders}
          getRowKey={(row) => row.id}
          onRowClick={(row) => navigate(`/tenders/${row.id}`)}
          title="Список тендеров"
          loading={loading}
        />
      )}

      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
        <Pagination
          count={Math.ceil(filteredAndSortedTenders.length / rowsPerPage)}
          page={page}
          onChange={(_, value) => setPage(value)}
          color="primary"
        />
      </Box>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          Подтверждение удаления
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Вы уверены, что хотите удалить этот тендер? Это действие нельзя будет отменить.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="primary">
            Отмена
          </Button>
          <Button onClick={handleDelete} color="error" autoFocus>
            Удалить
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={statusDialog.open}
        onClose={() => setStatusDialog(prev => ({ ...prev, open: false }))}
        aria-labelledby="status-dialog-title"
        aria-describedby="status-dialog-description"
      >
        <DialogTitle id="status-dialog-title">{statusDialog.title}</DialogTitle>
        <DialogContent>
          <DialogContentText id="status-dialog-description">
            {statusDialog.description}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusDialog(prev => ({ ...prev, open: false }))} color="primary">
            Отмена
          </Button>
          <Button
            onClick={() => {
              if (statusDialog.onConfirm) statusDialog.onConfirm();
              setStatusDialog(prev => ({ ...prev, open: false }));
            }}
            color="secondary"
            autoFocus
          >
            Подтвердить
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TenderListPage; 