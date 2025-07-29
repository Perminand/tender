import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { api } from '../utils/api';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Alert,
  IconButton,
  Collapse,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  ArrowBack as ArrowBackIcon,
  Business as BusinessIcon,
  Visibility as VisibilityIcon,
  Assignment as AssignmentIcon,
  Gavel as GavelIcon,
  LocalShipping as DeliveryIcon
} from '@mui/icons-material';

interface DeliveryHierarchy {
  deliveryId: string;
  deliveryNumber: string;
  date: string;
  supplierName: string;
  amount: number;
  status: string;
}

interface TenderHierarchy {
  tenderId: string;
  tenderNumber: string;
  date: string;
  location: string;
  amount: number;
  status: string;
  deliveries: DeliveryHierarchy[];
}

interface RequestHierarchy {
  requestId: string;
  requestNumber: string;
  date: string;
  location: string;
  amount: number;
  status: string;
  tenders: TenderHierarchy[];
}

interface CustomerHierarchy {
  customerId: string;
  customerName: string;
  customerShortName: string;
  requests: RequestHierarchy[];
}

const CustomerSummaryPage: React.FC = () => {
  const [customerHierarchies, setCustomerHierarchies] = useState<CustomerHierarchy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedCustomers, setExpandedCustomers] = useState<Set<string>>(new Set());
  const [expandedRequests, setExpandedRequests] = useState<Set<string>>(new Set());
  const [expandedTenders, setExpandedTenders] = useState<Set<string>>(new Set());
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchCustomerHierarchy();
  }, []);

  const fetchCustomerHierarchy = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/customer-info/hierarchy');
      setCustomerHierarchies(response.data);
      setError(null);
    } catch (err: any) {
      console.error('Ошибка при загрузке иерархической сводки по заказчикам:', err);
      if (err.response?.status === 403) {
        setError('У вас нет прав для просмотра этой информации');
      } else if (err.response?.status === 500) {
        setError('Ошибка сервера. Попробуйте позже.');
      } else {
        setError('Ошибка при загрузке данных. Проверьте подключение к интернету.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCustomerToggle = (customerId: string) => {
    const newExpanded = new Set(expandedCustomers);
    if (newExpanded.has(customerId)) {
      newExpanded.delete(customerId);
    } else {
      newExpanded.add(customerId);
    }
    setExpandedCustomers(newExpanded);
  };

  const handleRequestToggle = (requestId: string) => {
    const newExpanded = new Set(expandedRequests);
    if (newExpanded.has(requestId)) {
      newExpanded.delete(requestId);
    } else {
      newExpanded.add(requestId);
    }
    setExpandedRequests(newExpanded);
  };

  const handleTenderToggle = (tenderId: string) => {
    const newExpanded = new Set(expandedTenders);
    if (newExpanded.has(tenderId)) {
      newExpanded.delete(tenderId);
    } else {
      newExpanded.add(tenderId);
    }
    setExpandedTenders(newExpanded);
  };

  const formatDate = (dateString: string) => {
    return dayjs(dateString).format('DD.MM.YY');
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'SAVED':
      case 'AWARDED':
        return 'success';
      case 'CANCELLED':
        return 'error';
      case 'IN_PROGRESS':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status.toUpperCase()) {
      case 'SAVED':
        return 'Сохранена';
      case 'AWARDED':
        return 'Присужден';
      case 'CANCELLED':
        return 'Отменен';
      case 'IN_PROGRESS':
        return 'В процессе';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)}>
          Назад
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ mr: 2 }}>
          Назад
        </Button>
        <Typography variant="h4" component="h1">
          Сводка по заказчикам
        </Typography>
      </Box>

      {customerHierarchies.length === 0 ? (
        <Alert severity="info">
          Нет данных для отображения
        </Alert>
      ) : (
        <Box>
          {customerHierarchies.map((customer) => (
            <Card key={customer.customerId} sx={{ mb: 2 }}>
              <CardContent sx={{ p: 0 }}>
                {/* Customer Header */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    p: 2,
                    backgroundColor: 'primary.main',
                    color: 'primary.contrastText',
                    cursor: 'pointer'
                  }}
                  onClick={() => handleCustomerToggle(customer.customerId)}
                >
                  <BusinessIcon sx={{ mr: 1 }} />
                  <Typography variant="h6" sx={{ flexGrow: 1 }}>
                    {customer.customerShortName || customer.customerName}
                  </Typography>
                  <IconButton size="small" sx={{ color: 'inherit' }}>
                    {expandedCustomers.has(customer.customerId) ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </IconButton>
                </Box>

                {/* Customer Details */}
                <Collapse in={expandedCustomers.has(customer.customerId)}>
                  <Box sx={{ p: 2 }}>
                    {customer.requests.length === 0 ? (
                      <Typography variant="body2" color="text.secondary">
                        Нет заявок для этого заказчика
                      </Typography>
                    ) : (
                      <Box>
                        {customer.requests.map((request) => (
                          <Card key={request.requestId} sx={{ mb: 2 }}>
                            <CardContent sx={{ p: 0 }}>
                              {/* Request Header */}
                              <Box
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  p: 2,
                                  backgroundColor: 'success.light',
                                  color: 'success.contrastText',
                                  cursor: 'pointer'
                                }}
                                onClick={() => handleRequestToggle(request.requestId)}
                              >
                                <AssignmentIcon sx={{ mr: 1 }} />
                                <Box sx={{ flexGrow: 1 }}>
                                  <Typography variant="subtitle1">
                                    Заявка № {request.requestNumber}
                                  </Typography>
                                  <Typography variant="body2">
                                    {formatDate(request.date)} • {request.location} • {formatAmount(request.amount)}
                                  </Typography>
                                </Box>
                                <Chip 
                                  label={getStatusLabel(request.status)} 
                                  color={getStatusColor(request.status)}
                                  size="small"
                                  sx={{ mr: 1 }}
                                />
                                <Button
                                  size="small"
                                  startIcon={<VisibilityIcon />}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/requests/${request.requestId}/customer-info`);
                                  }}
                                  sx={{ mr: 1 }}
                                >
                                  Детали
                                </Button>
                                <IconButton size="small" sx={{ color: 'inherit' }}>
                                  {expandedRequests.has(request.requestId) ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                </IconButton>
                              </Box>

                              {/* Request Details */}
                              <Collapse in={expandedRequests.has(request.requestId)}>
                                <Box sx={{ p: 2 }}>
                                  {request.tenders.length === 0 ? (
                                    <Typography variant="body2" color="text.secondary">
                                      Нет тендеров для этой заявки
                                    </Typography>
                                  ) : (
                                    <Box>
                                      {request.tenders.map((tender) => (
                                        <Card key={tender.tenderId} sx={{ mb: 2 }}>
                                          <CardContent sx={{ p: 0 }}>
                                            {/* Tender Header */}
                                            <Box
                                              sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                p: 2,
                                                backgroundColor: 'info.light',
                                                color: 'info.contrastText',
                                                cursor: 'pointer'
                                              }}
                                              onClick={() => handleTenderToggle(tender.tenderId)}
                                            >
                                              <GavelIcon sx={{ mr: 1 }} />
                                              <Box sx={{ flexGrow: 1 }}>
                                                <Typography variant="subtitle1">
                                                  Тендер № {tender.tenderNumber}
                                                </Typography>
                                                <Typography variant="body2">
                                                  {formatDate(tender.date)} • {tender.location} • {formatAmount(tender.amount)}
                                                </Typography>
                                              </Box>
                                              <Chip 
                                                label={getStatusLabel(tender.status)} 
                                                color={getStatusColor(tender.status)}
                                                size="small"
                                                sx={{ mr: 1 }}
                                              />
                                              <IconButton size="small" sx={{ color: 'inherit' }}>
                                                {expandedTenders.has(tender.tenderId) ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                              </IconButton>
                                            </Box>

                                            {/* Tender Details */}
                                            <Collapse in={expandedTenders.has(tender.tenderId)}>
                                              <Box sx={{ p: 2 }}>
                                                {tender.deliveries.length === 0 ? (
                                                  <Typography variant="body2" color="text.secondary">
                                                    Нет поставок для этого тендера
                                                  </Typography>
                                                ) : (
                                                  <List dense>
                                                    {tender.deliveries.map((delivery) => (
                                                      <React.Fragment key={delivery.deliveryId}>
                                                        <ListItem>
                                                          <ListItemText
                                                            primary={
                                                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                                <DeliveryIcon sx={{ mr: 1, fontSize: 'small' }} />
                                                                <Typography variant="body2">
                                                                  Поставка № {delivery.deliveryNumber}
                                                                </Typography>
                                                              </Box>
                                                            }
                                                            secondary={
                                                              <Box>
                                                                <Typography variant="body2" color="text.secondary">
                                                                  {formatDate(delivery.date)} • {delivery.supplierName} • {formatAmount(delivery.amount)}
                                                                </Typography>
                                                                <Chip 
                                                                  label={getStatusLabel(delivery.status)} 
                                                                  color={getStatusColor(delivery.status)}
                                                                  size="small"
                                                                  sx={{ mt: 0.5 }}
                                                                />
                                                              </Box>
                                                            }
                                                          />
                                                        </ListItem>
                                                        <Divider />
                                                      </React.Fragment>
                                                    ))}
                                                  </List>
                                                )}
                                              </Box>
                                            </Collapse>
                                          </CardContent>
                                        </Card>
                                      ))}
                                    </Box>
                                  )}
                                </Box>
                              </Collapse>
                            </CardContent>
                          </Card>
                        ))}
                      </Box>
                    )}
                  </Box>
                </Collapse>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default CustomerSummaryPage; 