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
  Divider,
  Alert,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Edit as EditIcon,
  Send as SendIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Star as StarIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../utils/api';

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
  unitPriceWithVat?: number;
  weight?: number;
  deliveryCost?: number;
}

interface ProposalDto {
  id: string;
  tenderId: string;
  tenderNumber: string;
  tenderTitle: string;
  supplierId: string;
  supplierName: string;
  proposalNumber: string;
  submissionDate: string;
  status: string;
  coverLetter: string;
  technicalProposal: string;
  commercialTerms: string;
  totalPrice: number;
  currency: string;
  paymentTerms: string;
  deliveryTerms: string;
  warrantyTerms: string;
  validUntil: string;
  isBestOffer: boolean;
  priceDifference: number;
  proposalItems: ProposalItemDto[];
  // Условия из справочников
  paymentConditionId?: string;
  paymentCondition?: {
    id: string;
    name: string;
    description?: string;
  };
  deliveryConditionId?: string;
  deliveryCondition?: {
    id: string;
    name: string;
    description?: string;
    deliveryType?: string;
    deliveryCost?: number;
    deliveryAddress?: string;
    deliveryPeriod?: string;
    deliveryResponsibility?: string;
    additionalTerms?: string;
  };
  // Инлайновые поля для обратной совместимости
  deliveryType?: string;
  deliveryCost?: number;
  deliveryAddress?: string;
  deliveryPeriod?: string;
  deliveryResponsibility?: string;
  deliveryAdditionalTerms?: string;
  deliveryConditionName?: string;
  deliveryConditionDescription?: string;
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

const ProposalDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [proposal, setProposal] = useState<ProposalDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadProposal();
    }
  }, [id]);

  const loadProposal = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/proposals/${id}/with-best-offers`);
      setProposal(response.data);
    } catch (error) {
      console.error('Error loading proposal:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!proposal) return;
    
    try {
      await api.post(`/api/proposals/${proposal.id}/submit`);
      await loadProposal();
    } catch (error) {
      console.error('Error submitting proposal:', error);
    }
  };

  const handleAccept = async () => {
    if (!proposal) return;
    
    try {
      await api.post(`/api/proposals/${proposal.id}/accept`);
      await loadProposal();
    } catch (error) {
      console.error('Error accepting proposal:', error);
    }
  };

  const handleReject = async () => {
    if (!proposal) return;
    
    try {
      await api.post(`/api/proposals/${proposal.id}/reject`);
      await loadProposal();
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
      currency: 'RUB',
      currencyDisplay: 'symbol'
    }).format(price);
  };

  if (loading) {
    return <Typography>Загрузка...</Typography>;
  }

  if (!proposal) {
    return <Typography>Предложение не найдено</Typography>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Предложение №{proposal.proposalNumber}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<EditIcon />}
            onClick={() => navigate(`/proposals/${id}/edit`)}
          >
            Редактировать
          </Button>
          {proposal.status === 'DRAFT' && (
            <Button
              variant="contained"
              startIcon={<SendIcon />}
              onClick={handleSubmit}
            >
              Подать предложение
            </Button>
          )}
          {proposal.status === 'SUBMITTED' && (
            <>
              <Button
                variant="contained"
                color="success"
                startIcon={<CheckIcon />}
                onClick={handleAccept}
              >
                Принять
              </Button>
              <Button
                variant="contained"
                color="error"
                startIcon={<CloseIcon />}
                onClick={handleReject}
              >
                Отклонить
              </Button>
            </>
          )}
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Основная информация */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Typography variant="h5" component="h2">
                  {proposal.tenderTitle}
                </Typography>
                <Chip
                  label={getStatusLabel(proposal.status)}
                  color={getStatusColor(proposal.status)}
                />
              </Box>

              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Поставщик
                  </Typography>
                  <Typography variant="body1">
                    {proposal.supplierName}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Тендер
                  </Typography>
                  <Typography variant="body1">
                    №{proposal.tenderNumber}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Дата подачи
                  </Typography>
                  <Typography variant="body1">
                    {formatDate(proposal.submissionDate)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Срок действия
                  </Typography>
                  <Typography variant="body1">
                    {proposal.validUntil ? formatDate(proposal.validUntil) : 'Не указан'}
                  </Typography>
                </Grid>
              </Grid>

              {proposal.isBestOffer && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <TrendingUpIcon sx={{ mr: 1 }} />
                    <Typography>
                      Лучшее предложение по цене: {formatPrice(proposal.totalPrice)}
                    </Typography>
                  </Box>
                </Alert>
              )}

              {proposal.coverLetter && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    Сопроводительное письмо
                  </Typography>
                  <Typography variant="body2">
                    {proposal.coverLetter}
                  </Typography>
                </Box>
              )}

              {proposal.technicalProposal && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    Техническое предложение
                  </Typography>
                  <Typography variant="body2">
                    {proposal.technicalProposal}
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
                Коммерческие условия
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Общая цена
                </Typography>
                <Typography variant="h4" color="primary">
                  {formatPrice(proposal.totalPrice)}
                </Typography>
              </Box>

              {proposal.paymentTerms && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Условия оплаты
                  </Typography>
                  <Typography variant="body2">
                    {proposal.paymentTerms}
                  </Typography>
                </Box>
              )}

              {proposal.paymentCondition && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Условие оплаты (справочник)
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    {proposal.paymentCondition.name}
                  </Typography>
                  {proposal.paymentCondition.description && (
                    <Typography variant="body2" color="text.secondary">
                      {proposal.paymentCondition.description}
                    </Typography>
                  )}
                </Box>
              )}

              {proposal.deliveryTerms && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Условия поставки
                  </Typography>
                  <Typography variant="body2">
                    {proposal.deliveryTerms}
                  </Typography>
                </Box>
              )}

              {proposal.deliveryCondition && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Условие доставки (справочник)
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    {proposal.deliveryCondition.name}
                  </Typography>
                  {proposal.deliveryCondition.description && (
                    <Typography variant="body2" color="text.secondary">
                      {proposal.deliveryCondition.description}
                    </Typography>
                  )}
                  {proposal.deliveryCondition.deliveryType && (
                    <Typography variant="body2" color="text.secondary">
                      Тип доставки: {proposal.deliveryCondition.deliveryType}
                    </Typography>
                  )}
                  {proposal.deliveryCondition.deliveryCost && (
                    <Typography variant="body2" color="text.secondary">
                      Стоимость доставки: {formatPrice(proposal.deliveryCondition.deliveryCost)}
                    </Typography>
                  )}
                  {proposal.deliveryCondition.deliveryAddress && (
                    <Typography variant="body2" color="text.secondary">
                      Адрес доставки: {proposal.deliveryCondition.deliveryAddress}
                    </Typography>
                  )}
                  {proposal.deliveryCondition.deliveryPeriod && (
                    <Typography variant="body2" color="text.secondary">
                      Срок доставки: {proposal.deliveryCondition.deliveryPeriod}
                    </Typography>
                  )}
                  {proposal.deliveryCondition.additionalTerms && (
                    <Typography variant="body2" color="text.secondary">
                      Дополнительные условия: {proposal.deliveryCondition.additionalTerms}
                    </Typography>
                  )}
                </Box>
              )}

              {/* Отображение инлайновых полей для обратной совместимости */}
              {!proposal.deliveryCondition && proposal.deliveryConditionName && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Условие доставки
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    {proposal.deliveryConditionName}
                  </Typography>
                  {proposal.deliveryConditionDescription && (
                    <Typography variant="body2" color="text.secondary">
                      {proposal.deliveryConditionDescription}
                    </Typography>
                  )}
                  {proposal.deliveryType && (
                    <Typography variant="body2" color="text.secondary">
                      Тип доставки: {proposal.deliveryType}
                    </Typography>
                  )}
                  {proposal.deliveryCost && (
                    <Typography variant="body2" color="text.secondary">
                      Стоимость доставки: {formatPrice(proposal.deliveryCost)}
                    </Typography>
                  )}
                  {proposal.deliveryAddress && (
                    <Typography variant="body2" color="text.secondary">
                      Адрес доставки: {proposal.deliveryAddress}
                    </Typography>
                  )}
                  {proposal.deliveryPeriod && (
                    <Typography variant="body2" color="text.secondary">
                      Срок доставки: {proposal.deliveryPeriod}
                    </Typography>
                  )}
                  {proposal.deliveryAdditionalTerms && (
                    <Typography variant="body2" color="text.secondary">
                      Дополнительные условия: {proposal.deliveryAdditionalTerms}
                    </Typography>
                  )}
                </Box>
              )}

              {proposal.warrantyTerms && (
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Гарантийные обязательства
                  </Typography>
                  <Typography variant="body2">
                    {proposal.warrantyTerms}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Позиции предложения */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Позиции предложения
              </Typography>
              
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>№</TableCell>
                      <TableCell>Описание</TableCell>
                      <TableCell>Бренд/Модель</TableCell>
                      <TableCell>Производитель</TableCell>
                      <TableCell>Количество</TableCell>
                      <TableCell>Ед. изм.</TableCell>
                      <TableCell>Цена за ед.</TableCell>
                      <TableCell>Цена с НДС</TableCell>
                      <TableCell>Вес</TableCell>
                      <TableCell>Доставка</TableCell>
                      <TableCell>Сумма</TableCell>
                      <TableCell>Лучшая цена</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {proposal.proposalItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.itemNumber}</TableCell>
                        <TableCell>{item.description}</TableCell>
                        <TableCell>
                          {item.brand} {item.model}
                        </TableCell>
                        <TableCell>{item.manufacturer}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>{item.unitName || '-'}</TableCell>
                        <TableCell>{formatPrice(item.unitPrice)}</TableCell>
                        <TableCell>{item.unitPriceWithVat ? formatPrice(item.unitPriceWithVat) : '-'}</TableCell>
                        <TableCell>{item.weight ? `${item.weight} кг` : '-'}</TableCell>
                        <TableCell>{item.deliveryCost ? formatPrice(item.deliveryCost) : '-'}</TableCell>
                        <TableCell>{formatPrice(item.totalPrice)}</TableCell>
                        <TableCell>
                          {item.isBestPrice && (
                            <Tooltip title="Лучшая цена">
                              <StarIcon color="primary" fontSize="small" />
                            </Tooltip>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell colSpan={10} align="right">
                        <Typography variant="h6">
                          Итого:
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="h6">
                          {formatPrice(proposal.totalPrice)}
                        </Typography>
                      </TableCell>
                      <TableCell />
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProposalDetailPage; 