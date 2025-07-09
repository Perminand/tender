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
  Grid
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import dayjs from 'dayjs';

interface Contract {
  id: number;
  contractNumber: string;
  title: string;
  tenderId: number;
  supplierId: number;
  customerId: number;
  status: string;
  totalAmount: number;
  startDate: string;
  endDate: string;
  terms: string;
  description: string;
  createdAt: string;
  updatedAt: string;
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
        const response = await fetch(`/api/contracts/${id}`);
        if (!response.ok) throw new Error('Ошибка загрузки контракта');
        const data = await response.json();
        setContract(data);
        setError(null);
      } catch (e) {
        setError('Ошибка загрузки контракта');
      } finally {
        setLoading(false);
      }
    };
    fetchContract();
  }, [id]);

  if (loading) {
    return <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px"><CircularProgress /></Box>;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!contract) {
    return <Alert severity="info">Контракт не найден</Alert>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ mb: 2 }}>
        Назад
      </Button>
      <Card>
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
              <Typography>{contract.status}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography color="textSecondary">Сумма:</Typography>
              <Typography>{contract.totalAmount?.toLocaleString()} ₽</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography color="textSecondary">Дата начала:</Typography>
              <Typography>{contract.startDate ? dayjs(contract.startDate).format('DD.MM.YYYY') : '-'}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography color="textSecondary">Дата окончания:</Typography>
              <Typography>{contract.endDate ? dayjs(contract.endDate).format('DD.MM.YYYY') : '-'}</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography color="textSecondary">Условия:</Typography>
              <Typography>{contract.terms}</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography color="textSecondary">Описание:</Typography>
              <Typography>{contract.description}</Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ContractDetailPage; 