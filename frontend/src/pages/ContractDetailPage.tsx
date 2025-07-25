import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Button,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import dayjs from 'dayjs';
import { api } from '../utils/api';

interface ContractItem {
  id: string;
  contractId: string;
  materialId: string;
  materialName: string;
  quantity: number;
  unitName: string;
  unitPrice: number;
  totalPrice: number;
  description: string;
}

interface TenderItem {
  id: string;
  tenderId: string;
  requestMaterialId: string;
  materialId: string;
  itemNumber: number;
  description: string;
  quantity: number;
  unitId: string;
  unitName: string;
  specifications: string;
  deliveryRequirements: string;
  estimatedPrice: number;
  bestPrice?: number;
  materialName?: string;
  materialTypeName?: string;
}

interface Contract {
  id: string;
  contractNumber: string;
  title: string;
  tenderId: string;
  status: string;
  totalAmount: number;
  startDate: string;
  endDate: string;
  terms: string;
  description: string;
  paymentTerms: string;
  deliveryTerms: string;
  warrantyTerms: string;
  specialConditions: string;
  currency: string;
  createdAt: string;
  updatedAt: string;
  contractItems: ContractItem[];
  tender: {
    id: string;
    customer?: {
      id: string;
      name: string;
      shortName: string;
    };
    awardedSupplierId?: string;
    awardedSupplier?: {
      id: string;
      name: string;
      shortName: string;
    };
    tenderItems?: TenderItem[];
  };
}

const ContractDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchContract = async () => {
      try {
        const response = await api.get(`/contracts/${id}`);
        setContract(response.data);
        setError(null);
      } catch (e) {
        setError('Ошибка загрузки контракта');
      } finally {
        setLoading(false);
      }
    };
    fetchContract();
  }, [id]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      currencyDisplay: 'symbol'
    }).format(price);
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'Черновик';
      case 'ACTIVE': return 'Активный';
      case 'COMPLETED': return 'Завершен';
      case 'TERMINATED': return 'Расторгнут';
      case 'SUSPENDED': return 'Приостановлен';
      default: return status;
    }
  };

  if (loading) {
    return <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px"><CircularProgress /></Box>;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!contract) {
    return <Alert severity="info">Контракт не найден</Alert>;
  }

  // Позиции для отображения: contractItems
  const hasContractItems = contract.contractItems && contract.contractItems.length > 0;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)}>
        Назад
      </Button>
        <Button 
          variant="contained" 
          onClick={() => navigate(`/contracts/${id}/manage`)}
          sx={{ ml: 2 }}
        >
          Управление контрактом
        </Button>
      </Box>
      
      {/* Основная информация о контракте */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Контракт №{contract.contractNumber}
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography color="textSecondary">Название:</Typography>
              <Typography>{contract.title}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography color="textSecondary">Статус:</Typography>
              <Typography>{getStatusLabel(contract.status)}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography color="textSecondary">Сумма:</Typography>
              <Typography variant="h6" color="primary">
                {formatPrice(contract.totalAmount)}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography color="textSecondary">Валюта:</Typography>
              <Typography>{contract.currency || 'RUB'}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography color="textSecondary">Дата начала:</Typography>
              <Typography>{contract.startDate ? dayjs(contract.startDate).format('DD.MM.YYYY') : '-'}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography color="textSecondary">Дата окончания:</Typography>
              <Typography>{contract.endDate ? dayjs(contract.endDate).format('DD.MM.YYYY') : '-'}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography color="textSecondary">Поставщик:</Typography>
              <Typography>{contract.tender?.awardedSupplier?.shortName || contract.tender?.awardedSupplier?.name || contract.tender?.awardedSupplierId || 'Не указан'}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography color="textSecondary">Заказчик:</Typography>
              <Typography>{contract.tender?.customer?.shortName || contract.tender?.customer?.name || 'Не указан'}</Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Условия контракта */}
      {(contract.terms || contract.description || contract.paymentTerms || contract.deliveryTerms || contract.warrantyTerms || contract.specialConditions) && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Условия контракта
            </Typography>
            <Grid container spacing={2}>
              {contract.description && (
                <Grid item xs={12}>
                  <Typography color="textSecondary">Описание:</Typography>
                  <Typography>{contract.description}</Typography>
                </Grid>
              )}
              {contract.terms && (
            <Grid item xs={12}>
              <Typography color="textSecondary">Условия:</Typography>
              <Typography>{contract.terms}</Typography>
            </Grid>
              )}
              {contract.paymentTerms && (
                <Grid item xs={12} md={6}>
                  <Typography color="textSecondary">Условия оплаты:</Typography>
                  <Typography>{contract.paymentTerms}</Typography>
                </Grid>
              )}
              {contract.deliveryTerms && (
                <Grid item xs={12} md={6}>
                  <Typography color="textSecondary">Условия поставки:</Typography>
                  <Typography>{contract.deliveryTerms}</Typography>
                </Grid>
              )}
              {contract.warrantyTerms && (
                <Grid item xs={12} md={6}>
                  <Typography color="textSecondary">Гарантийные обязательства:</Typography>
                  <Typography>{contract.warrantyTerms}</Typography>
                </Grid>
              )}
              {contract.specialConditions && (
                <Grid item xs={12} md={6}>
                  <Typography color="textSecondary">Особые условия:</Typography>
                  <Typography>{contract.specialConditions}</Typography>
                </Grid>
              )}
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Позиции контракта */}
      {hasContractItems && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Позиции контракта
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
                    <TableCell>Цена за ед.</TableCell>
                    <TableCell>Сумма</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {contract.contractItems.map((item, index) => (
                    <TableRow key={item.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{item.description}</TableCell>
                      <TableCell>{item.materialName || '-'}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>{item.unitName}</TableCell>
                      <TableCell>{formatPrice(item.unitPrice)}</TableCell>
                      <TableCell>{formatPrice(item.totalPrice)}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell colSpan={6} align="right">
                      <Typography variant="h6">
                        Итого:
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="h6" color="primary">
                        {formatPrice(contract.totalAmount)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
        </CardContent>
      </Card>
      )}
    </Box>
  );
};

export default ContractDetailPage; 