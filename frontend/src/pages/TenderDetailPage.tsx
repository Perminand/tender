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
  Star as StarIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { fnsApi } from '../utils/fnsApi';

interface TenderItemDto {
  id: string;
  itemNumber: number;
  description: string;
  quantity: number;
  unitName: string;
  specifications: string;
  deliveryRequirements: string;
  estimatedPrice: number;
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

  useEffect(() => {
    if (id) {
      loadTender();
    }
  }, [id]);

  const loadTender = async () => {
    try {
      setLoading(true);
      const response = await fnsApi.get(`/api/tenders/${id}/with-best-offers`);
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

  if (loading) {
    return <Typography>Загрузка...</Typography>;
  }

  if (!tender) {
    return <Typography>Тендер не найден</Typography>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Тендер №{tender.tenderNumber}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            onClick={() => navigate(`/tenders/${id}/edit`)}
          >
            Редактировать
          </Button>
          <Button
            variant="contained"
            onClick={() => navigate(`/tenders/${id}/proposals/new`)}
          >
            Подать предложение
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Основная информация */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Typography variant="h5" component="h2">
                  {tender.title}
                </Typography>
                <Chip
                  label={getStatusLabel(tender.status)}
                  color={getStatusColor(tender.status)}
                />
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
                          {/* Здесь будет лучшая цена по позиции */}
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
                        {proposal.supplierName} - {formatPrice(proposal.totalPrice)}
                      </Typography>
                      {proposal.isBestOffer && (
                        <Tooltip title="Лучшее предложение">
                          <StarIcon color="primary" />
                        </Tooltip>
                      )}
                      <Chip
                        label={proposal.status}
                        size="small"
                        sx={{ ml: 2 }}
                      />
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
    </Box>
  );
};

export default TenderDetailPage; 