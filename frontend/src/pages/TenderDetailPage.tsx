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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  Alert,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  TrendingUp as TrendingUpIcon,
  Visibility as ViewIcon,
  Star as StarIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { fnsApi } from '../utils/fnsApi';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';

interface TenderItemDto {
  id: string;
  itemNumber: number;
  description: string;
  quantity: number;
  unitName: string;
  specifications: string;
  deliveryRequirements: string;
  estimatedPrice: number;
  bestPrice?: number;
  materialName: string;
  materialTypeName: string;
}

interface ProposalItemDto {
  id: string;
  itemNumber: number;
  description: string;
  brand: string;
  model: string;
  manufacturer: string;
  countryOfOrigin: string;
  quantity: number;
  unitName: string;
  unitPrice: number;
  totalPrice: number;
  specifications: string;
  deliveryPeriod: string;
  warranty: string;
  additionalInfo: string;
  isBestPrice: boolean;
  priceDifference: number;
}

interface SupplierProposalDto {
  id: string;
  supplierName: string;
  proposalNumber: string;
  submissionDate: string;
  status: string;
  totalPrice: number;
  currency: string;
  paymentTerms: string;
  deliveryTerms: string;
  warrantyTerms: string;
  isBestOffer: boolean;
  priceDifference: number;
  proposalItems: ProposalItemDto[];
}

interface TenderDto {
  id: string;
  tenderNumber: string;
  title: string;
  description: string;
  customerName: string;
  startDate: string;
  endDate: string;
  submissionDeadline: string;
  status: string;
  requirements: string;
  termsAndConditions: string;
  tenderItems: TenderItemDto[];
  supplierProposals: SupplierProposalDto[];
  bestPrice: number;
  bestSupplierName: string;
}

const TenderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tender, setTender] = useState<TenderDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [closeDialogOpen, setCloseDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [startBiddingDialogOpen, setStartBiddingDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadTender();
    }
  }, [id]);

  const loadTender = async () => {
    try {
      setLoading(true);
      const response = await fnsApi.get(`/api/tenders/${id}/with-best-prices-by-items`);
      setTender(response.data);
    } catch (error) {
      console.error('Error loading tender:', error);
    } finally {
      setLoading(false);
    }
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
      currency: 'RUB'
    }).format(price);
  };

  const handleCloseBidding = async () => {
    if (!id) return;
    try {
      await fnsApi.post(`/api/tenders/${id}/close`);
      setCloseDialogOpen(false);
      setError(null);
      await loadTender();
    } catch (e: any) {
      setError(e.response?.data?.message || 'Ошибка закрытия приема предложений');
    }
  };

  const handleCancelTender = async () => {
    if (!id) return;
    try {
      await fnsApi.post(`/api/tenders/${id}/cancel`);
      setCancelDialogOpen(false);
      setError(null);
      await loadTender();
    } catch (e: any) {
      setError(e.response?.data?.message || 'Ошибка отмены тендера');
    }
  };

  const getProposalTotal = (proposal: any) =>
    proposal.proposalItems
      ? proposal.proposalItems.reduce((sum: number, item: any) => sum + (item.totalPrice || 0), 0)
      : 0;



  if (loading) {
    return <Typography>Загрузка...</Typography>;
  }

  if (!tender) {
    return <Typography>Тендер не найден</Typography>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 1 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/tenders')}
          sx={{ minWidth: 0, p: 1 }}
        />
        <Typography variant="h4" component="h1">
          Тендер №{tender.tenderNumber}
        </Typography>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Управление статусом тендера</Typography>
            <Chip
              label={getStatusLabel(tender.status)}
              color={getStatusColor(tender.status)}
            />
          </Box>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {/* Кнопки смены статуса */}
            {tender.status === 'DRAFT' && (
              <Button
                variant="contained"
                color="primary"
                onClick={() => setPublishDialogOpen(true)}
              >
                Опубликовать тендер
              </Button>
            )}
            {tender.status === 'PUBLISHED' && (
              <Button
                variant="contained"
                color="primary"
                onClick={() => setStartBiddingDialogOpen(true)}
              >
                Принимать предложения
              </Button>
            )}
            {tender.status === 'BIDDING' && (
          <Button
                variant="contained"
                color="primary"
                onClick={() => setCloseDialogOpen(true)}
          >
                Закрыть прием
          </Button>
            )}
            {tender.status === 'BIDDING' && (
          <Button
            variant="contained"
                color="success"
            onClick={() => navigate(`/tenders/${id}/proposals/new`)}
          >
            Подать предложение
          </Button>
            )}
            {/* Кнопка отмены */}
            {tender.status !== 'CANCELLED' && tender.status !== 'AWARDED' && (
              <Button
                variant="outlined"
                color="error"
                onClick={() => setCancelDialogOpen(true)}
              >
                Отменить тендер
              </Button>
            )}
        </Box>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {/* Основная информация */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Typography variant="h5" component="h2">
                  {tender.title}
                </Typography>
              </Box>

              <Typography variant="body1" sx={{ mb: 2 }}>
                {tender.description}
              </Typography>

              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Заказчик
                  </Typography>
                  <Typography variant="body1">
                    {tender.customerName}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Срок подачи
                  </Typography>
                  <Typography variant="body1">
                    {formatDate(tender.submissionDeadline)}
                  </Typography>
                </Grid>
              </Grid>

              {tender.bestPrice && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <TrendingUpIcon sx={{ mr: 1 }} />
                    <Typography>
                      Лучшее предложение: {tender.bestSupplierName} - {formatPrice(tender.bestPrice)}
                    </Typography>
                  </Box>
                </Alert>
              )}

              {tender.requirements && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    Требования
                  </Typography>
                  <Typography variant="body2">
                    {tender.requirements}
                  </Typography>
                </Box>
              )}

              {tender.termsAndConditions && (
                <Box>
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    Условия
                  </Typography>
                  <Typography variant="body2">
                    {tender.termsAndConditions}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Статистика */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Статистика
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Позиций в тендере
                </Typography>
                <Typography variant="h4">
                  {tender.tenderItems.length}
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Предложений
                </Typography>
                <Typography variant="h4">
                  {tender.supplierProposals.length}
                </Typography>
              </Box>

              {tender.bestPrice && (
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Лучшая цена
                  </Typography>
                  <Typography variant="h4" color="success.main">
                    {formatPrice(tender.bestPrice)}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Позиции тендера */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Позиции тендера
              </Typography>
              
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>№</TableCell>
                      <TableCell>Описание</TableCell>
                      <TableCell>Материал</TableCell>
                      <TableCell>Количество</TableCell>
                      <TableCell>Ед. изм.</TableCell>
                      <TableCell>Оцен. цена</TableCell>
                      <TableCell>Лучшая цена</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {tender.tenderItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.itemNumber}</TableCell>
                        <TableCell>{item.description}</TableCell>
                        <TableCell>{item.materialName}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>{item.unitName}</TableCell>
                        <TableCell>{formatPrice(item.estimatedPrice)}</TableCell>
                        <TableCell>
                          {item.bestPrice != null
                            ? formatPrice(item.bestPrice)
                            : ''}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Предложения поставщиков */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Предложения поставщиков
              </Typography>

              {tender.supplierProposals.map((proposal, index) => (
                <Accordion key={proposal.id}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                      <Typography sx={{ flex: 1 }}>
                        {proposal.supplierName} - {formatPrice(proposal.totalPrice != null ? proposal.totalPrice : getProposalTotal(proposal))}
                      </Typography>
                      {proposal.isBestOffer && (
                        <Tooltip title="Лучшее предложение">
                          <StarIcon color="primary" />
                        </Tooltip>
                      )}
                      <Box
                        sx={{
                          ml: 2,
                          px: 1.5,
                          py: 0.5,
                          borderRadius: 2,
                          backgroundColor: proposal.status === 'SUBMITTED' ? 'info.light' : 'grey.200',
                          display: 'inline-block',
                          fontWeight: 500,
                          fontSize: 14,
                        }}
                      >
                        {getStatusLabel(proposal.status)}
                      </Box>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" sx={{ mb: 1 }}>
                          Коммерческие условия
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 2 }}>
                          {proposal.paymentTerms}
                        </Typography>
                        
                        <Typography variant="subtitle2" sx={{ mb: 1 }}>
                          Условия поставки
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 2 }}>
                          {proposal.deliveryTerms}
                        </Typography>
                        
                        <Typography variant="subtitle2" sx={{ mb: 1 }}>
                          Гарантия
                        </Typography>
                        <Typography variant="body2">
                          {proposal.warrantyTerms}
                        </Typography>
                      </Grid>
                      
                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" sx={{ mb: 1 }}>
                          Позиции предложения
                        </Typography>
                        <TableContainer component={Paper} variant="outlined">
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell>№</TableCell>
                                <TableCell>Описание</TableCell>
                                <TableCell>Цена</TableCell>
                                <TableCell>Лучшая</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {proposal.proposalItems.map((item) => (
                                <TableRow key={item.id}>
                                  <TableCell>{item.itemNumber}</TableCell>
                                  <TableCell>{item.description}</TableCell>
                                  <TableCell>{formatPrice(item.totalPrice)}</TableCell>
                                  <TableCell>
                                    {item.isBestPrice && (
                                      <StarIcon color="primary" fontSize="small" />
                                    )}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </Grid>
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Dialog
        open={closeDialogOpen}
        onClose={() => setCloseDialogOpen(false)}
        aria-labelledby="close-bidding-dialog-title"
        aria-describedby="close-bidding-dialog-description"
      >
        <DialogTitle id="close-bidding-dialog-title">Закрыть прием предложений</DialogTitle>
        <DialogContent>
          <DialogContentText id="close-bidding-dialog-description">
            Вы уверены, что хотите закрыть прием предложений? После этого новые предложения приниматься не будут.
          </DialogContentText>
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCloseDialogOpen(false)} color="primary">
            Отмена
          </Button>
          <Button onClick={handleCloseBidding} color="secondary" autoFocus>
            Подтвердить
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={cancelDialogOpen}
        onClose={() => setCancelDialogOpen(false)}
        aria-labelledby="cancel-tender-dialog-title"
        aria-describedby="cancel-tender-dialog-description"
      >
        <DialogTitle id="cancel-tender-dialog-title">Отменить тендер</DialogTitle>
        <DialogContent>
          <DialogContentText id="cancel-tender-dialog-description">
            Вы уверены, что хотите отменить тендер? После отмены тендер будет недоступен для дальнейших действий.
          </DialogContentText>
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialogOpen(false)} color="primary">
            Отмена
          </Button>
          <Button onClick={handleCancelTender} color="secondary" autoFocus>
            Подтвердить
          </Button>
        </DialogActions>
      </Dialog>

      {/* Модальное окно подтверждения публикации */}
      <Dialog
        open={publishDialogOpen}
        onClose={() => setPublishDialogOpen(false)}
        aria-labelledby="publish-tender-dialog-title"
        aria-describedby="publish-tender-dialog-description"
      >
        <DialogTitle id="publish-tender-dialog-title">Опубликовать тендер</DialogTitle>
        <DialogContent>
          <DialogContentText id="publish-tender-dialog-description">
            Вы уверены, что хотите опубликовать тендер? После публикации его нельзя будет редактировать как черновик.
          </DialogContentText>
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPublishDialogOpen(false)} color="primary">
            Отмена
          </Button>
          <Button
            onClick={async () => {
              try {
                await fnsApi.post(`/api/tenders/${id}/publish`);
                setPublishDialogOpen(false);
                await loadTender();
              } catch (e: any) {
                setError(e.response?.data?.message || 'Ошибка публикации тендера');
              }
            }}
            color="primary"
            variant="contained"
            autoFocus
          >
            Подтвердить
          </Button>
        </DialogActions>
      </Dialog>

      {/* Модальное окно подтверждения открытия приема предложений */}
      <Dialog
        open={startBiddingDialogOpen}
        onClose={() => setStartBiddingDialogOpen(false)}
        aria-labelledby="start-bidding-dialog-title"
        aria-describedby="start-bidding-dialog-description"
      >
        <DialogTitle id="start-bidding-dialog-title">Открыть прием предложений</DialogTitle>
        <DialogContent>
          <DialogContentText id="start-bidding-dialog-description">
            Вы уверены, что хотите открыть прием предложений? После этого тендер перейдет в статус "Прием предложений" и станет доступен для подачи заявок.
          </DialogContentText>
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStartBiddingDialogOpen(false)} color="primary">
            Отмена
          </Button>
          <Button
            onClick={async () => {
              try {
                await fnsApi.post(`/api/tenders/${id}/start-bidding`);
                setStartBiddingDialogOpen(false);
                await loadTender();
              } catch (e: any) {
                setError(e.response?.data?.message || 'Ошибка открытия приема предложений');
              }
            }}
            color="primary"
            variant="contained"
            autoFocus
          >
            Подтвердить
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TenderDetailPage; 