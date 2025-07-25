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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import dayjs from 'dayjs';
import { api } from '../utils/api';

interface Company { id: string; name: string; shortName?: string; legalName?: string; }
interface Project { id: string; name: string; }
interface Unit { id: string; shortName: string; }
interface Warehouse { id: string; name: string; projectId: string; }
interface RequestMaterial {
  id?: string;
  workType?: { name: string } | string | null;
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

// Функция для перевода статуса на русский
const getStatusLabel = (status?: string) => {
  if (!status) return '-';
  
  const upperStatus = status.toUpperCase();
  switch (upperStatus) {
    case 'DRAFT': return 'Черновик';
    case 'PUBLISHED': return 'Опубликован';
    case 'BIDDING': return 'Прием предложений';
    case 'EVALUATION': return 'Оценка';
    case 'AWARDED': return 'Присужден';
    case 'CANCELLED': return 'Отменен';
    case 'TENDER': return 'Тендер';
    default: return status;
  }
};

const RequestDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [request, setRequest] = useState<RequestDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createTenderLoading, setCreateTenderLoading] = useState(false);
  const [confirmCreateTender, setConfirmCreateTender] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRequest = async () => {
      try {
        const response = await api.get(`/api/requests/${id}`);
        setRequest({
          ...response.data,
          materials: response.data.requestMaterials || [],
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

  const handleCreateTender = async () => {
    if (!id) return;
    
    setCreateTenderLoading(true);
    try {
      const response = await api.post(`/api/requests/${id}/create-tender`);
      const tender = response.data;
      
      // Обновляем статус заявки на 'TENDER'
      setRequest(prev => prev ? { ...prev, status: 'TENDER' } : null);
      
      // Закрываем диалог
      setConfirmCreateTender(false);
      
      // Показываем сообщение об успехе
      setError(null);
      
      // Открываем тендер в новом окне
      window.open(`/tenders/${tender.id}`, '_blank');
    } catch (error: any) {
      console.error('Ошибка при создании тендера:', error);
      setError('Ошибка при создании тендера: ' + (error.response?.data?.message || error.message));
    } finally {
      setCreateTenderLoading(false);
    }
  };

  // Проверяем, можно ли создать тендер
  const canCreateTender = request && 
    request.materials && 
    request.materials.length > 0;

  // Определяем текст кнопки в зависимости от статуса
  const getButtonText = () => {
    if (!request) return 'Создать тендер';
    const upperStatus = request.status?.toUpperCase();
    if (upperStatus === 'DRAFT') return 'Создать тендер';
    return 'Создать тендер повторно';
  };

  // Отладочная информация
  console.log('Request status:', request?.status);
  console.log('Can create tender:', canCreateTender);
  console.log('Materials count:', request?.materials?.length);

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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)}>
          Назад
        </Button>
        {canCreateTender && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => setConfirmCreateTender(true)}
            disabled={createTenderLoading}
          >
            {getButtonText()}
          </Button>
        )}
      </Box>
      
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
      
      {/* Предупреждение, если нет материалов */}
      {(!request.materials || request.materials.length === 0) && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          Заявка не содержит материалов. Для создания тендера необходимо добавить материалы в заявку.
        </Alert>
      )}
      
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
                    <TableCell>{mat.workType && typeof mat.workType === 'object' ? (mat.workType as { name: string }).name : mat.workType || '-'}</TableCell>
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

      {/* Диалог подтверждения создания тендера */}
      <Dialog open={confirmCreateTender} onClose={() => setConfirmCreateTender(false)}>
        <DialogTitle>
          {request.status?.toUpperCase() === 'DRAFT' ? 'Создать тендер?' : 'Создать тендер повторно?'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {request.status?.toUpperCase() === 'DRAFT' 
              ? `Вы уверены, что хотите создать тендер по заявке №${request.requestNumber}? После создания статус заявки изменится на "Тендер".`
              : `Вы уверены, что хотите создать тендер повторно по заявке №${request.requestNumber}? Это создаст новый тендер, а статус заявки изменится на "Тендер".`
            }
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmCreateTender(false)} disabled={createTenderLoading}>
            Отмена
          </Button>
          <Button 
            onClick={handleCreateTender} 
            color="primary" 
            variant="contained"
            disabled={createTenderLoading}
            startIcon={createTenderLoading ? <CircularProgress size={16} /> : null}
          >
            {createTenderLoading ? 'Создание...' : (request.status?.toUpperCase() === 'DRAFT' ? 'Создать' : 'Создать повторно')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RequestDetailPage; 