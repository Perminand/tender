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
  Alert
} from '@mui/material';
import {
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Send as SendIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import { useNavigate, Link } from 'react-router-dom';
import { fnsApi } from '../utils/fnsApi';
import Pagination from '@mui/material/Pagination';

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

  useEffect(() => {
    loadProposals();
    loadSuppliers();
  }, []);

  const loadProposals = async () => {
    try {
      setLoading(true);
      const response = await fnsApi.get('/api/proposals');
      setProposals(response.data);
    } catch (error) {
      console.error('Error loading proposals:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSuppliers = async () => {
    try {
      const response = await fnsApi.get('/api/companies');
      setSuppliers(response.data);
    } catch (error) {
      console.error('Error loading suppliers:', error);
    }
  };

  const handleDelete = async () => {
    if (selectedProposalId) {
      try {
        await fnsApi.delete(`/api/proposals/${selectedProposalId}`);
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
      await fnsApi.post(`/api/proposals/${proposalId}/submit`);
      await loadProposals();
    } catch (error) {
      console.error('Error submitting proposal:', error);
    }
  };

  const handleAccept = async (proposalId: string) => {
    try {
      await fnsApi.post(`/api/proposals/${proposalId}/accept`);
      await loadProposals();
    } catch (error) {
      console.error('Error accepting proposal:', error);
    }
  };

  const handleReject = async (proposalId: string) => {
    try {
      await fnsApi.post(`/api/proposals/${proposalId}/reject`);
      await loadProposals();
    } catch (error) {
      console.error('Error rejecting proposal:', error);
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
      currency: 'RUB'
    }).format(price);
  };

  const filteredProposals = proposals.filter(proposal => {
    const statusMatch = statusFilter === 'ALL' || proposal.status === statusFilter;
    const supplierMatch = !supplierFilter || proposal.supplierId === supplierFilter;
    return statusMatch && supplierMatch;
  });

  const sortedProposals = [...filteredProposals].sort((a, b) => new Date(b.submissionDate).getTime() - new Date(a.submissionDate).getTime());
  const paginatedProposals = sortedProposals.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  if (loading) {
    return <Typography>Загрузка...</Typography>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Реестр предложений
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate('/tenders')}
        >
          К тендерам
        </Button>
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
      <TableContainer component={Paper} sx={{ mb: 3 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>№</TableCell>
              <TableCell>Тендер</TableCell>
              <TableCell>Поставщик</TableCell>
              <TableCell>Дата подачи</TableCell>
              <TableCell>Статус</TableCell>
              <TableCell>Сумма</TableCell>
              <TableCell>Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedProposals.map((proposal, idx) => (
              <TableRow key={proposal.id} hover>
                <TableCell>{(page - 1) * rowsPerPage + idx + 1}</TableCell>
                <TableCell>
                  <Link to={`/tenders/${proposal.tenderId}`} style={{ textDecoration: 'none', color: '#1976d2' }}>
                    {proposal.tenderTitle || proposal.tenderNumber}
                  </Link>
                </TableCell>
                <TableCell>{proposal.supplierName}</TableCell>
                <TableCell>{formatDate(proposal.submissionDate)}</TableCell>
                <TableCell>
                  <Chip label={getStatusLabel(proposal.status)} color={getStatusColor(proposal.status)} size="small" />
                </TableCell>
                <TableCell>{formatPrice(proposal.totalPrice)}</TableCell>
                <TableCell>
                  <Tooltip title="Просмотр">
                    <IconButton size="small" onClick={() => navigate(`/proposals/${proposal.id}`)}>
                      <ViewIcon />
                    </IconButton>
                  </Tooltip>
                  {proposal.status === 'DRAFT' && (
                    <Tooltip title="Редактировать">
                      <IconButton size="small" onClick={() => navigate(`/proposals/${proposal.id}/edit`)}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                  {proposal.status === 'DRAFT' && (
                    <Tooltip title="Удалить">
                      <IconButton size="small" color="error" onClick={() => { setSelectedProposalId(proposal.id); setDeleteDialogOpen(true); }}>
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                  {proposal.status === 'DRAFT' && (
                    <Tooltip title="Подать">
                      <IconButton size="small" color="primary" onClick={() => handleSubmit(proposal.id)}>
                        <SendIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                  {proposal.status === 'SUBMITTED' && (
                    <Tooltip title="Принять">
                      <IconButton size="small" color="success" onClick={() => handleAccept(proposal.id)}>
                        <CheckIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                  {proposal.status === 'SUBMITTED' && (
                    <Tooltip title="Отклонить">
                      <IconButton size="small" color="error" onClick={() => handleReject(proposal.id)}>
                        <CloseIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {paginatedProposals.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center">Нет предложений</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

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