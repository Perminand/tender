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
  Paper
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import dayjs from 'dayjs';

interface Company { id: string; name: string; shortName?: string; legalName?: string; }
interface Project { id: string; name: string; }
interface Unit { id: string; shortName: string; }
interface Warehouse { id: string; name: string; projectId: string; }
interface RequestMaterial {
  id?: string;
  workType?: string;
  material?: { id: string; name: string } | null;
  characteristics?: string;
  quantity?: string;
  unit?: Unit | null;
  note?: string;
  deliveryDate?: string;
  supplierMaterialName?: string;
  estimatePrice?: string;
  materialLink?: string;
}
interface RequestDto {
  id?: string;
  organization?: Company | null;
  project?: Project | null;
  date?: string;
  status?: string;
  materials: RequestMaterial[];
  warehouse?: Warehouse | null;
  requestNumber?: string;
  applicant?: string;
  description?: string;
}

const getStatusLabel = (status?: string) => {
  switch (status) {
    case 'DRAFT': return 'Черновик';
    case 'SAVED': return 'Сохранен';
    case 'TENDER': return 'Тендер';
    case 'COMPLETED': return 'Исполнена';
    case 'CANCELLED': return 'Отменена';
    default: return status || '-';
  }
};

const RequestDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [request, setRequest] = useState<RequestDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRequest = async () => {
      try {
        const response = await fetch(`/api/requests/${id}`);
        if (!response.ok) throw new Error('Ошибка загрузки заявки');
        const data = await response.json();
        setRequest({
          ...data,
          materials: data.requestMaterials || [],
        });
        setError(null);
      } catch (e) {
        setError('Ошибка загрузки заявки');
      } finally {
        setLoading(false);
      }
    };
    fetchRequest();
  }, [id]);

  if (loading) {
    return <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px"><CircularProgress /></Box>;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!request) {
    return <Alert severity="info">Заявка не найдена</Alert>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ mb: 2 }}>
        Назад
      </Button>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Заявка №{request.requestNumber}
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}><Typography color="textSecondary">Статус:</Typography><Typography>{getStatusLabel(request.status)}</Typography></Grid>
            <Grid item xs={12} sm={6}><Typography color="textSecondary">Дата:</Typography><Typography>{request.date ? dayjs(request.date).format('DD.MM.YYYY') : '-'}</Typography></Grid>
            <Grid item xs={12} sm={6}><Typography color="textSecondary">Организация:</Typography><Typography>{request.organization?.name || '-'}</Typography></Grid>
            <Grid item xs={12} sm={6}><Typography color="textSecondary">Проект:</Typography><Typography>{request.project?.name || '-'}</Typography></Grid>
            <Grid item xs={12} sm={6}><Typography color="textSecondary">Склад:</Typography><Typography>{request.warehouse?.name || '-'}</Typography></Grid>
            <Grid item xs={12} sm={6}><Typography color="textSecondary">Заявитель:</Typography><Typography>{request.applicant || '-'}</Typography></Grid>
            <Grid item xs={12}><Typography color="textSecondary">Описание:</Typography><Typography>{request.description || '-'}</Typography></Grid>
          </Grid>
        </CardContent>
      </Card>
      <Typography variant="h6" gutterBottom>Материалы заявки</Typography>
      <TableContainer component={Paper} sx={{ mb: 3 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>Вид работ</TableCell>
              <TableCell>Наименование материала</TableCell>
              <TableCell>Характеристики</TableCell>
              <TableCell>Наименование в заявке</TableCell>
              <TableCell>Кол-во</TableCell>
              <TableCell>Ед. изм.</TableCell>
              <TableCell>Сметная цена</TableCell>
              <TableCell>Сметная стоимость</TableCell>
              <TableCell>Ссылка</TableCell>
              <TableCell>Примечание</TableCell>
              <TableCell>Поставить к дате</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.isArray(request.materials) && request.materials.length > 0 ? (
              request.materials.map((mat, idx) => {
                const estimateTotal = mat.estimatePrice && mat.quantity ?
                  (parseFloat(mat.estimatePrice) * parseFloat(mat.quantity)).toLocaleString() : '';
                return (
                  <TableRow key={mat.id || idx}>
                    <TableCell>{idx + 1}</TableCell>
                    <TableCell>{mat.workType && typeof mat.workType === 'object' ? mat.workType.name : mat.workType || '-'}</TableCell>
                    <TableCell>{mat.material && typeof mat.material === 'object' ? mat.material.name : mat.material || '-'}</TableCell>
                    <TableCell>{mat.characteristics || '-'}</TableCell>
                    <TableCell>{mat.supplierMaterialName || '-'}</TableCell>
                    <TableCell>{mat.quantity || '-'}</TableCell>
                    <TableCell>{mat.unit && typeof mat.unit === 'object' ? mat.unit.shortName : mat.unit || '-'}</TableCell>
                    <TableCell>{mat.estimatePrice || '-'}</TableCell>
                    <TableCell>{estimateTotal || '-'}</TableCell>
                    <TableCell>{mat.materialLink || '-'}</TableCell>
                    <TableCell>{mat.note || '-'}</TableCell>
                    <TableCell>{mat.deliveryDate ? dayjs(mat.deliveryDate).format('DD.MM.YYYY') : '-'}</TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={12} align="center" sx={{ color: 'text.secondary' }}>
                  Нет материалов
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default RequestDetailPage; 