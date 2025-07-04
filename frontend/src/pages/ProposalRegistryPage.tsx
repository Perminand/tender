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
import { useNavigate } from 'react-router-dom';
import { fnsApi } from '../utils/fnsApi';

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

const ProposalRegistryPage: React.FC = () => {
  const [proposals, setProposals] = useState<ProposalDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProposalId, setSelectedProposalId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [supplierFilter, setSupplierFilter] = useState<string>('');
  const [suppliers, setSuppliers] = useState<Array<{id: string, name: string}>>([]);
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

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'Черновик';
      case 'SUBMITTED': return 'Подано';
      case 'UNDER_REVIEW': return 'На рассмотрении';
      case 'ACCEPTED': return 'Принято';
      case 'REJECTED': return 'Отклонено';
      case 'WITHDRAWN': return 'Отозвано';
      default: return status;
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
      <Grid container spacing={3}>
        {filteredProposals.map((proposal) => (
          <Grid item xs={12} md={6} lg={4} key={proposal.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Typography variant="h6" component="h2" sx={{ flex: 1 }}>
                    {proposal.tenderTitle}
                  </Typography>
                  <Chip
                    label={getStatusLabel(proposal.status)}
                    color={getStatusColor(proposal.status)}
                    size="small"
                  />
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  №{proposal.proposalNumber}
                </Typography>

                <Typography variant="body2" sx={{ mb: 1 }}>
                  Поставщик: {proposal.supplierName}
                </Typography>

                <Typography variant="body2" sx={{ mb: 1 }}>
                  Тендер: №{proposal.tenderNumber}
                </Typography>

                <Typography variant="body2" sx={{ mb: 1 }}>
                  Дата подачи: {formatDate(proposal.submissionDate)}
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Typography variant="body2" sx={{ mr: 1 }}>
                    Цена: {formatPrice(proposal.totalPrice)}
                  </Typography>
                  {proposal.isBestOffer && (
                    <Box sx={{ display: 'flex', alignItems: 'center', ml: 'auto' }}>
                      <TrendingUpIcon sx={{ fontSize: 16, mr: 0.5, color: 'success.main' }} />
                      <Typography variant="body2" color="success.main">
                        Лучшее
                      </Typography>
                    </Box>
                  )}
                </Box>

                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Tooltip title="Просмотр">
                    <IconButton
                      size="small"
                      onClick={() => navigate(`/proposals/${proposal.id}`)}
                    >
                      <ViewIcon />
                    </IconButton>
                  </Tooltip>

                  {proposal.status === 'DRAFT' && (
                    <>
                      <Tooltip title="Редактировать">
                        <IconButton
                          size="small"
                          onClick={() => navigate(`/proposals/${proposal.id}/edit`)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Подать">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleSubmit(proposal.id)}
                        >
                          <SendIcon />
                        </IconButton>
                      </Tooltip>
                    </>
                  )}

                  {proposal.status === 'SUBMITTED' && (
                    <>
                      <Tooltip title="Принять">
                        <IconButton
                          size="small"
                          color="success"
                          onClick={() => handleAccept(proposal.id)}
                        >
                          <CheckIcon />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Отклонить">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleReject(proposal.id)}
                        >
                          <CloseIcon />
                        </IconButton>
                      </Tooltip>
                    </>
                  )}

                  {proposal.status === 'DRAFT' && (
                    <Tooltip title="Удалить">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => {
                          setSelectedProposalId(proposal.id);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

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