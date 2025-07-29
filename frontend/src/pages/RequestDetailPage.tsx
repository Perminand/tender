import React, { useEffect, useState, useCallback } from 'react';
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
import VisibilityIcon from '@mui/icons-material/Visibility';
import Edit from '@mui/icons-material/Edit';
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
  size?: string; // Характеристики (смета)
  quantity?: string;
  unit?: Unit | null;
  note?: string;
  deliveryDate?: string;
  supplierMaterialName?: string;
  estimateMaterialName?: string; // Наименование материала (смета)
  estimatePrice?: string;
  materialLink?: string;
  estimateUnit?: Unit | null;
  estimateQuantity?: string;
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
  const [colWidths, setColWidths] = useState<number[]>([40, 120, 200, 80, 80, 200, 150, 80, 80, 80, 100, 150, 150, 120]);
  const navigate = useNavigate();

  // Функция для расчета оптимальной ширины столбцов на основе содержимого
  const calculateOptimalColumnWidths = useCallback(() => {
    if (!request?.materials || request.materials.length === 0) {
      return [40, 120, 200, 80, 80, 200, 150, 80, 80, 80, 100, 150, 150, 120];
    }

    const columnHeaders = [
      '#', 'Вид работ', 'Наименование в заявке', 'Кол-во', 'Ед. изм.',
      'Наименование материала (смета)', 'Характеристики (смета)', 'Кол-во (смета)', 
      'Ед. изм.(смета)', 'Цена (смета)', 'Стоимость (смета)', 'Ссылка', 'Примечание', 'Поставить к дате'
    ];

    const calculateTextWidth = (text: string, isHeader: boolean = false, isCompact: boolean = false) => {
      // Для компактных столбцов (числовые, короткие тексты и цены) используем меньшую ширину
      if (isCompact) {
        const charWidth = 5; // Еще меньшая ширина для цифр, коротких текстов и цен
        const padding = isHeader ? 12 : 8; // Меньший отступ для компактных столбцов
        return Math.max(text.length * charWidth + padding, 40); // Минимальная ширина 40px для компактных
      }
      
      // Для текстовых столбцов обычная ширина
      const charWidth = 8;
      const padding = isHeader ? 20 : 16;
      return Math.max(text.length * charWidth + padding, 60);
    };

    const widths = columnHeaders.map((header, colIndex) => {
      // Определяем, является ли столбец числовым или коротким текстом
      const isNumericColumn = colIndex === 0 || colIndex === 3 || colIndex === 7 || colIndex === 9 || colIndex === 10;
      const isShortTextColumn = colIndex === 4 || colIndex === 8; // Ед. изм. и Ед. изм.(смета)
      const isPriceColumn = colIndex === 9 || colIndex === 10; // Цена (смета) и Стоимость (смета)
      const isCompactColumn = isNumericColumn || isPriceColumn; // Убрали isShortTextColumn из компактных
      let maxWidth = calculateTextWidth(header, true, isCompactColumn);

      request.materials.forEach((mat, rowIndex) => {
        let cellText = '';
        
        switch (colIndex) {
          case 0: // #
            cellText = (rowIndex + 1).toString();
            break;
          case 1: // Вид работ
            cellText = mat.workType && typeof mat.workType === 'object' ? (mat.workType as { name: string }).name : (mat.workType || '');
            break;
          case 2: // Наименование в заявке
            cellText = mat.supplierMaterialName || '';
            break;
          case 3: // Кол-во
            cellText = mat.quantity || '';
            break;
          case 4: // Ед. изм.
            cellText = mat.unit && typeof mat.unit === 'object' ? mat.unit.shortName : (mat.unit || '');
            break;
          case 5: // Наименование материала (смета)
            cellText = mat.estimateMaterialName || '';
            break;
          case 6: // Характеристики (смета)
            cellText = mat.characteristics || '';
            break;
          case 7: // Кол-во (смета)
            cellText = mat.estimateQuantity || '';
            break;
          case 8: // Ед. изм.(смета)
            cellText = mat.estimateUnit && typeof mat.estimateUnit === 'object' ? mat.estimateUnit.shortName : (mat.estimateUnit || '');
            break;
          case 9: // Цена (смета)
            cellText = mat.estimatePrice || '';
            break;
          case 10: // Стоимость (смета)
            const estimateTotal = mat.estimatePrice && (mat.estimateQuantity || mat.quantity) ?
              (parseFloat(mat.estimatePrice) * parseFloat(mat.estimateQuantity || mat.quantity)).toLocaleString() : '';
            cellText = estimateTotal;
            break;
          case 11: // Ссылка
            cellText = mat.materialLink || '';
            break;
          case 12: // Примечание
            cellText = mat.note || '';
            break;
          case 13: // Поставить к дате
            cellText = mat.deliveryDate ? dayjs(mat.deliveryDate).format('DD.MM.YYYY') : '';
            break;
        }

        let cellWidth;
        // Специальная логика для столбцов "Ед. изм." и "Ед. изм.(смета)"
        if (colIndex === 4 || colIndex === 8) {
          // Для единиц измерения: ширина по самой длинной записи + 5 пикселей
          const charWidth = 8; // Обычная ширина символа
          const padding = 16; // Отступ
          cellWidth = Math.max(cellText.length * charWidth + padding + 5, 60); // Минимум 60px
        } else {
          cellWidth = calculateTextWidth(cellText, false, isCompactColumn);
        }
        maxWidth = Math.max(maxWidth, cellWidth);
      });

      return Math.min(maxWidth, 500);
    });

    return widths;
  }, [request?.materials]);

  // Автоматически пересчитываем ширину столбцов при изменении данных
  useEffect(() => {
    const optimalWidths = calculateOptimalColumnWidths();
    setColWidths(optimalWidths);
  }, [calculateOptimalColumnWidths]);

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
    request.materials.length > 0 &&
    request.status && 
    request.status.toUpperCase() !== 'DRAFT';

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
        <Box>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<Edit />}
            onClick={() => navigate(`/requests/${id}/edit`)}
            sx={{ mr: 1 }}
          >
            Редактировать
          </Button>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<VisibilityIcon />}
            onClick={() => navigate(`/requests/${id}/customer-info`)}
            sx={{ mr: 1 }}
          >
            Информация о заказчике
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
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Материалы заявки</Typography>
        <Button 
          variant="outlined" 
          size="small"
          onClick={() => {
            const optimalWidths = calculateOptimalColumnWidths();
            setColWidths(optimalWidths);
            console.log('Оптимальные ширины столбцов:', optimalWidths);
          }}
          title="Автоматически подогнать ширину столбцов под содержимое"
        >
          Подогнать столбцы
        </Button>
      </Box>
      <TableContainer component={Paper} sx={{ mb: 3, overflowX: 'auto', width: '100%', maxWidth: '100%', maxHeight: '600px', overflowY: 'auto' }}>
        <Table size="small" sx={{ minWidth: 2000, width: 'max-content' }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: colWidths[0] }}>#</TableCell>
              <TableCell sx={{ width: colWidths[1] }}>Вид работ</TableCell>
              <TableCell sx={{ width: colWidths[2] }}>Наименование в заявке</TableCell>
              <TableCell sx={{ width: colWidths[3] }}>Кол-во</TableCell>
              <TableCell sx={{ width: colWidths[4] }}>Ед. изм.</TableCell>
              <TableCell sx={{ 
                width: colWidths[5],
                backgroundColor: '#f0f8ff',
                borderLeft: '2px solid #1976d2',
                fontWeight: 'bold'
              }}>Наименование материала (смета)</TableCell>
              <TableCell sx={{ 
                width: colWidths[6],
                backgroundColor: '#f0f8ff',
                fontWeight: 'bold'
              }}>Характеристики (смета)</TableCell>
              <TableCell sx={{ 
                width: colWidths[7],
                backgroundColor: '#f0f8ff',
                fontWeight: 'bold'
              }}>Кол-во (смета)</TableCell>
              <TableCell sx={{ 
                width: colWidths[8],
                backgroundColor: '#f0f8ff',
                fontWeight: 'bold'
              }}>Ед. изм.(смета)</TableCell>
              <TableCell sx={{ 
                width: colWidths[9],
                backgroundColor: '#f0f8ff',
                fontWeight: 'bold'
              }}>Цена (смета)</TableCell>
              <TableCell sx={{ 
                width: colWidths[10],
                backgroundColor: '#f0f8ff',
                borderRight: '2px solid #1976d2',
                fontWeight: 'bold'
              }}>Стоимость (смета)</TableCell>
              <TableCell sx={{ width: colWidths[11] }}>Ссылка</TableCell>
              <TableCell sx={{ width: colWidths[12] }}>Примечание</TableCell>
              <TableCell sx={{ width: colWidths[13] }}>Поставить к дате</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.isArray(request.materials) && request.materials.length > 0 ? (
              request.materials.map((mat, idx) => {
                const estimateTotal = mat.estimatePrice && (mat.estimateQuantity || mat.quantity) ?
                  (parseFloat(mat.estimatePrice) * parseFloat(mat.estimateQuantity || mat.quantity)).toLocaleString() : '';
                return (
                  <TableRow key={mat.id || idx}>
                    <TableCell sx={{ width: colWidths[0] }} title={`${idx + 1}`}>{idx + 1}</TableCell>
                    <TableCell sx={{ width: colWidths[1] }} title={mat.workType && typeof mat.workType === 'object' ? (mat.workType as { name: string }).name : mat.workType || '-'}>{mat.workType && typeof mat.workType === 'object' ? (mat.workType as { name: string }).name : mat.workType || '-'}</TableCell>
                    <TableCell sx={{ width: colWidths[2] }} title={mat.supplierMaterialName || '-'}>{mat.supplierMaterialName || '-'}</TableCell>
                    <TableCell sx={{ width: colWidths[3] }} title={mat.quantity || '-'}>{mat.quantity || '-'}</TableCell>
                    <TableCell sx={{ width: colWidths[4] }} title={mat.unit && typeof mat.unit === 'object' ? mat.unit.shortName : mat.unit || '-'}>{mat.unit && typeof mat.unit === 'object' ? mat.unit.shortName : mat.unit || '-'}</TableCell>
                    <TableCell sx={{ 
                      width: colWidths[5],
                      backgroundColor: '#f0f8ff',
                      borderLeft: '2px solid #1976d2'
                    }} title={mat.estimateMaterialName || '-'}>{mat.estimateMaterialName || '-'}</TableCell>
                    <TableCell sx={{ width: colWidths[6], backgroundColor: '#f0f8ff' }} title={mat.size || '-'}>{mat.size || '-'}</TableCell>
                    <TableCell sx={{ width: colWidths[7], backgroundColor: '#f0f8ff' }} title={mat.estimateQuantity || '-'}>{mat.estimateQuantity || '-'}</TableCell>
                    <TableCell sx={{ width: colWidths[8], backgroundColor: '#f0f8ff' }} title={mat.estimateUnit && typeof mat.estimateUnit === 'object' ? mat.estimateUnit.shortName : mat.estimateUnit || '-'}>{mat.estimateUnit && typeof mat.estimateUnit === 'object' ? mat.estimateUnit.shortName : mat.estimateUnit || '-'}</TableCell>
                    <TableCell sx={{ width: colWidths[9], backgroundColor: '#f0f8ff' }} title={mat.estimatePrice || '-'}>{mat.estimatePrice || '-'}</TableCell>
                    <TableCell sx={{ 
                      width: colWidths[10],
                      backgroundColor: '#f0f8ff',
                      borderRight: '2px solid #1976d2'
                    }} title={estimateTotal || '-'}>{estimateTotal || '-'}</TableCell>
                    <TableCell sx={{ width: colWidths[11] }} title={mat.materialLink || '-'}>{mat.materialLink || '-'}</TableCell>
                    <TableCell sx={{ width: colWidths[12] }} title={mat.note || '-'}>{mat.note || '-'}</TableCell>
                    <TableCell sx={{ width: colWidths[13] }} title={mat.deliveryDate ? dayjs(mat.deliveryDate).format('DD.MM.YYYY') : '-'}>{mat.deliveryDate ? dayjs(mat.deliveryDate).format('DD.MM.YYYY') : '-'}</TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                              <TableCell colSpan={14} align="center" sx={{ color: 'text.secondary' }}>
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