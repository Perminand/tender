import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Send as SendIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  TrendingUp as TrendingUpIcon,
  FileUpload as FileUploadIcon
} from '@mui/icons-material';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { api } from '../utils/api';
import Pagination from '@mui/material/Pagination';
import ResponsiveTable from '../components/ResponsiveTable';

interface ProposalDto {
  id: string;
  tenderId: string;
  tenderNumber: string;
  tenderTitle: string;
  supplierId: string;
  supplierName: string;
  proposalNumber: string;
  submissionDate: string;
  status: 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN';
  totalPrice: number;
  currency: string;
  isBestOffer: boolean;
  priceDifference: number;
}

// Функция для перевода статуса на русский
const getStatusLabel = (status: string) => {
  switch (status) {
    case 'DRAFT': return 'Черновик';
    case 'SUBMITTED': return 'Подано';
    case 'UNDER_REVIEW': return 'На рассмотрении';
    case 'ACCEPTED': return 'Принято';
    case 'REJECTED': return 'Отклонено';
    case 'WITHDRAWN': return 'Отозвано';
    case 'PUBLISHED': return 'Опубликован';
    case 'BIDDING': return 'Прием предложений';
    case 'EVALUATION': return 'Оценка';
    case 'AWARDED': return 'Присужден';
    case 'CANCELLED': return 'Отменен';
    default: return status;
  }
};

const ProposalRegistryPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [searchParams] = useSearchParams();
  const [proposals, setProposals] = useState<ProposalDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProposalId, setSelectedProposalId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [supplierFilter, setSupplierFilter] = useState<string>('');
  const [suppliers, setSuppliers] = useState<Array<{id: string, name: string}>>([]);
  const [page, setPage] = useState(1);
  const rowsPerPage = 50;
  const navigate = useNavigate();
  
  // Получаем tenderId из URL параметров
  const tenderIdFromUrl = searchParams.get('tenderId');

  useEffect(() => {
    loadProposals();
    loadSuppliers();
  }, []);

  const loadProposals = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/proposals');
      setProposals(response.data);
    } catch (error) {
      console.error('Error loading proposals:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSuppliers = async () => {
    try {
      const response = await api.get('/api/companies');
      setSuppliers(response.data);
    } catch (error) {
      console.error('Error loading suppliers:', error);
    }
  };

  const handleDelete = async () => {
    if (selectedProposalId) {
      try {
        await api.delete(`/api/proposals/${selectedProposalId}`);
        await loadProposals();
        setDeleteDialogOpen(false);
        setSelectedProposalId(null);
      } catch (error) {
        console.error('Error deleting proposal:', error);
      }
    }
  };

  const handleSubmit = async (proposalId: string) => {
    try {
      await api.post(`/api/proposals/${proposalId}/submit`);
      await loadProposals();
    } catch (error) {
      console.error('Error submitting proposal:', error);
    }
  };

  const handleAccept = async (proposalId: string) => {
    try {
      await api.post(`/api/proposals/${proposalId}/accept`);
      await loadProposals();
    } catch (error) {
      console.error('Error accepting proposal:', error);
    }
  };

  const handleReject = async (proposalId: string) => {
    try {
      await api.post(`/api/proposals/${proposalId}/reject`);
      await loadProposals();
    } catch (error) {
      console.error('Error rejecting proposal:', error);
    }
  };

  const handleExportExcel = async () => {
    try {
      const response = await api.get('/api/proposal-registry/export', {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Реестр_предложений.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Ошибка при экспорте:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'default';
      case 'SUBMITTED': return 'info';
      case 'UNDER_REVIEW': return 'warning';
      case 'ACCEPTED': return 'success';
      case 'REJECTED': return 'error';
      case 'WITHDRAWN': return 'default';
      default: return 'default';
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

  const filteredProposals = proposals.filter(proposal => {
    const statusMatch = statusFilter === 'ALL' || proposal.status === statusFilter;
    const supplierMatch = !supplierFilter || proposal.supplierId === supplierFilter;
    const tenderMatch = !tenderIdFromUrl || proposal.tenderId === tenderIdFromUrl;
    return statusMatch && supplierMatch && tenderMatch;
  });

  const sortedProposals = [...filteredProposals].sort((a, b) => new Date(b.submissionDate).getTime() - new Date(a.submissionDate).getTime());
  const paginatedProposals = sortedProposals.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  // Конфигурация колонок для ResponsiveTable
  const columns = [
    {
      id: 'proposalNumber',
      label: '№',
      render: (value: any, row: ProposalDto) => row.proposalNumber
    },
    {
      id: 'tenderTitle',
      label: 'Тендер',
      render: (value: any, row: ProposalDto) => (
        <Box>
          <Typography variant="body2" fontWeight="bold">
            {row.tenderNumber}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {row.tenderTitle}
          </Typography>
        </Box>
      )
    },
    {
      id: 'supplierName',
      label: 'Поставщик',
      render: (value: any, row: ProposalDto) => row.supplierName
    },
    {
      id: 'submissionDate',
      label: 'Дата подачи',
      render: (value: any, row: ProposalDto) => formatDate(row.submissionDate)
    },
    {
      id: 'status',
      label: 'Статус',
      render: (value: any, row: ProposalDto) => (
        <Chip
          label={getStatusLabel(row.status)}
          color={getStatusColor(row.status) as any}
          size="small"
        />
      )
    },
    {
      id: 'totalPrice',
      label: 'Сумма',
      render: (value: any, row: ProposalDto) => formatPrice(row.totalPrice)
    },
    {
      id: 'actions',
      label: 'Действия',
      render: (value: any, row: ProposalDto) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/proposals/${row.id}`);
            }}
          >
            <ViewIcon />
          </IconButton>
          {row.status === 'DRAFT' && (
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/proposals/${row.id}/edit`);
              }}
              color="primary"
            >
              <EditIcon />
            </IconButton>
          )}
          {row.status === 'DRAFT' && (
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleSubmit(row.id);
              }}
              color="success"
            >
              <SendIcon />
            </IconButton>
          )}
          {row.status === 'UNDER_REVIEW' && (
            <>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAccept(row.id);
                }}
                color="success"
              >
                <CheckIcon />
              </IconButton>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleReject(row.id);
                }}
                color="error"
              >
                <CloseIcon />
              </IconButton>
            </>
          )}
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedProposalId(row.id);
              setDeleteDialogOpen(true);
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

  if (loading) {
    return <Typography>Загрузка...</Typography>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 3,
        flexDirection: { xs: 'column', sm: 'row' },
        gap: { xs: 2, sm: 0 }
      }}>
        <Box>
          <Typography variant={isMobile ? "h5" : "h4"} component="h1">
            Реестр предложений
          </Typography>
          {tenderIdFromUrl && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Отфильтровано по тендеру
            </Typography>
          )}
        </Box>
        <Box sx={{ 
          display: 'flex', 
          gap: { xs: 1, sm: 2 },
          flexWrap: 'wrap'
        }}>
          <Button
            variant="outlined"
            startIcon={<FileUploadIcon />}
            onClick={handleExportExcel}
            size={isMobile ? 'small' : 'medium'}
          >
            Экспорт
          </Button>
          {tenderIdFromUrl && (
            <Button
              variant="outlined"
              onClick={() => navigate('/proposals')}
              size={isMobile ? 'small' : 'medium'}
            >
              Показать все
            </Button>
          )}
          <Button
            variant="contained"
            onClick={() => navigate('/tenders')}
            size={isMobile ? 'small' : 'medium'}
          >
            К тендерам
          </Button>
        </Box>
      </Box>

      {/* Фильтры */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Статус</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  label="Статус"
                >
                  <MenuItem value="ALL">Все статусы</MenuItem>
                  <MenuItem value="DRAFT">Черновик</MenuItem>
                  <MenuItem value="SUBMITTED">Подано</MenuItem>
                  <MenuItem value="UNDER_REVIEW">На рассмотрении</MenuItem>
                  <MenuItem value="ACCEPTED">Принято</MenuItem>
                  <MenuItem value="REJECTED">Отклонено</MenuItem>
                  <MenuItem value="WITHDRAWN">Отозвано</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Поставщик</InputLabel>
                <Select
                  value={supplierFilter}
                  onChange={(e) => setSupplierFilter(e.target.value)}
                  label="Поставщик"
                >
                  <MenuItem value="">Все поставщики</MenuItem>
                  {suppliers.map((supplier) => (
                    <MenuItem key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="body2" color="text.secondary">
                Найдено: {filteredProposals.length} предложений
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Список предложений */}
      <ResponsiveTable
        columns={columns}
        data={paginatedProposals}
        getRowKey={(row) => row.id}
        onRowClick={(row) => navigate(`/proposals/${row.id}`)}
        title="Реестр предложений"
        loading={loading}
      />

      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
        <Pagination
          count={Math.ceil(sortedProposals.length / rowsPerPage)}
          page={page}
          onChange={(_, value) => setPage(value)}
          color="primary"
        />
      </Box>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Подтверждение удаления</DialogTitle>
        <DialogContent>
          <Typography>
            Вы уверены, что хотите удалить это предложение?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            Отмена
          </Button>
          <Button onClick={handleDelete} color="error">
            Удалить
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProposalRegistryPage; 