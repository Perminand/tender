import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
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
  const { user } = useAuth();
  
  // Определяем, является ли пользователь заказчиком
  const isCustomer = user?.roles.includes('ROLE_CUSTOMER');
  
  // Определяем столбцы в зависимости от роли пользователя
  const getColumns = () => {
    if (isCustomer) {
      // Для заказчиков скрываем сметные столбцы
      return ['#', 'Вид работ', 'Наименование в заявке', 'Кол-во', 'Ед. изм.', 'Ссылка', 'Примечание', 'Поставить к дате'];
    } else {
      // Для остальных ролей показываем все столбцы
      return ['#', 'Вид работ', 'Наименование в заявке', 'Кол-во', 'Ед. изм.', 'Наименование материала (смета)', 'Характеристики (смета)', 'Кол-во (смета)', 'Ед. изм.(смета)', 'Цена (смета)', 'Стоимость (смета)', 'Ссылка', 'Примечание', 'Поставить к дате'];
    }
  };
  
  const columns = getColumns();
  
  // Функция для рендеринга ячейки в зависимости от столбца
  const renderCell = (mat: RequestMaterial, idx: number, column: string) => {
    switch (column) {
      case '#':
        return (
          <TableCell sx={{ width: colWidths[0] }} title={`${idx + 1}`}>
            {idx + 1}
          </TableCell>
        );
      case 'Вид работ':
        return (
          <TableCell sx={{ width: colWidths[1] }} title={mat.workType && typeof mat.workType === 'object' ? (mat.workType as { name: string }).name : mat.workType || '-'}>
            {mat.workType && typeof mat.workType === 'object' ? (mat.workType as { name: string }).name : mat.workType || '-'}
          </TableCell>
        );
      case 'Наименование в заявке':
        return (
          <TableCell sx={{ width: colWidths[2] }} title={mat.supplierMaterialName || '-'}>
            {mat.supplierMaterialName || '-'}
          </TableCell>
        );
      case 'Кол-во':
        return (
          <TableCell sx={{ width: colWidths[3] }} title={mat.quantity || '-'}>
            {mat.quantity || '-'}
          </TableCell>
        );
      case 'Ед. изм.':
        return (
          <TableCell sx={{ width: colWidths[4] }} title={mat.unit && typeof mat.unit === 'object' ? mat.unit.shortName : mat.unit || '-'}>
            {mat.unit && typeof mat.unit === 'object' ? mat.unit.shortName : mat.unit || '-'}
          </TableCell>
        );
      case 'Наименование материала (смета)':
        return (
          <TableCell sx={{ 
            width: colWidths[5],
            backgroundColor: '#f0f8ff',
            borderLeft: '2px solid #1976d2'
          }} title={mat.estimateMaterialName || '-'}>
            {mat.estimateMaterialName || '-'}
          </TableCell>
        );
      case 'Характеристики (смета)':
        return (
          <TableCell sx={{ width: colWidths[6], backgroundColor: '#f0f8ff' }} title={mat.size || '-'}>
            {mat.size || '-'}
          </TableCell>
        );
      case 'Кол-во (смета)':
        return (
          <TableCell sx={{ width: colWidths[7], backgroundColor: '#f0f8ff' }} title={mat.estimateQuantity || '-'}>
            {mat.estimateQuantity || '-'}
          </TableCell>
        );
      case 'Ед. изм.(смета)':
        return (
          <TableCell sx={{ width: colWidths[8], backgroundColor: '#f0f8ff' }} title={mat.estimateUnit && typeof mat.estimateUnit === 'object' ? mat.estimateUnit.shortName : mat.estimateUnit || '-'}>
            {mat.estimateUnit && typeof mat.estimateUnit === 'object' ? mat.estimateUnit.shortName : mat.estimateUnit || '-'}
          </TableCell>
        );
      case 'Цена (смета)':
        return (
          <TableCell sx={{ width: colWidths[9], backgroundColor: '#f0f8ff' }} title={mat.estimatePrice || '-'}>
            {mat.estimatePrice || '-'}
          </TableCell>
        );
      case 'Стоимость (смета)':
        const estimateTotal = mat.estimatePrice && (mat.estimateQuantity || mat.quantity) ?
          (parseFloat(mat.estimatePrice) * parseFloat(mat.estimateQuantity || mat.quantity)).toLocaleString() : '';
        return (
          <TableCell sx={{ 
            width: colWidths[10],
            backgroundColor: '#f0f8ff',
            borderRight: '2px solid #1976d2'
          }} title={estimateTotal || '-'}>
            {estimateTotal || '-'}
          </TableCell>
        );
      case 'Ссылка':
        return (
          <TableCell sx={{ width: colWidths[11] }} title={mat.materialLink || '-'}>
            {mat.materialLink || '-'}
          </TableCell>
        );
      case 'Примечание':
        return (
          <TableCell sx={{ width: colWidths[12] }} title={mat.note || '-'}>
            {mat.note || '-'}
          </TableCell>
        );
      case 'Поставить к дате':
        return (
          <TableCell sx={{ width: colWidths[13] }} title={mat.deliveryDate ? dayjs(mat.deliveryDate).format('DD.MM.YYYY') : '-'}>
            {mat.deliveryDate ? dayjs(mat.deliveryDate).format('DD.MM.YYYY') : '-'}
          </TableCell>
        );
      default:
        return null;
    }
  };
  
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

    const columnHeaders = columns;

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
      // Определяем тип столбца на основе его названия
      const isNumericColumn = header === '#' || header === 'Кол-во' || (isCustomer ? false : (header === 'Кол-во (смета)' || header === 'Цена (смета)' || header === 'Стоимость (смета)'));
      const isShortTextColumn = header === 'Ед. изм.' || (isCustomer ? false : header === 'Ед. изм.(смета)');
      const isPriceColumn = isCustomer ? false : (header === 'Цена (смета)' || header === 'Стоимость (смета)');
      const isCompactColumn = isNumericColumn || isPriceColumn;
      let maxWidth = calculateTextWidth(header, true, isCompactColumn);

      request.materials.forEach((mat, rowIndex) => {
        let cellText = '';
        
        // Определяем содержимое ячейки на основе названия столбца
        if (header === '#') {
            cellText = (rowIndex + 1).toString();
        } else if (header === 'Вид работ') {
            cellText = mat.workType && typeof mat.workType === 'object' ? (mat.workType as { name: string }).name : (mat.workType || '');
        } else if (header === 'Наименование в заявке') {
            cellText = mat.supplierMaterialName || '';
        } else if (header === 'Кол-во') {
            cellText = mat.quantity || '';
        } else if (header === 'Ед. изм.') {
            cellText = mat.unit && typeof mat.unit === 'object' ? mat.unit.shortName : (mat.unit || '');
        } else if (header === 'Наименование материала (смета)') {
            cellText = mat.estimateMaterialName || '';
        } else if (header === 'Характеристики (смета)') {
            cellText = mat.characteristics || '';
        } else if (header === 'Кол-во (смета)') {
            cellText = mat.estimateQuantity || '';
        } else if (header === 'Ед. изм.(смета)') {
            cellText = mat.estimateUnit && typeof mat.estimateUnit === 'object' ? mat.estimateUnit.shortName : (mat.estimateUnit || '');
        } else if (header === 'Цена (смета)') {
            cellText = mat.estimatePrice || '';
        } else if (header === 'Стоимость (смета)') {
            const estimateTotal = mat.estimatePrice && (mat.estimateQuantity || mat.quantity) ?
              (parseFloat(mat.estimatePrice) * parseFloat(mat.estimateQuantity || mat.quantity)).toLocaleString() : '';
            cellText = estimateTotal;
        } else if (header === 'Ссылка') {
            cellText = mat.materialLink || '';
        } else if (header === 'Примечание') {
            cellText = mat.note || '';
        } else if (header === 'Поставить к дате') {
            cellText = mat.deliveryDate ? dayjs(mat.deliveryDate).format('DD.MM.YYYY') : '';
        }

        let cellWidth;
        // Специальная логика для столбцов единиц измерения
        if (header === 'Ед. изм.' || header === 'Ед. изм.(смета)') {
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
              {columns.map((column, idx) => (
                <TableCell 
                  key={column}
                  sx={{ 
                    width: colWidths[idx],
                    // Выделяем сметные столбцы
                    backgroundColor: (column === 'Наименование материала (смета)' || column === 'Характеристики (смета)' || column === 'Кол-во (смета)' || column === 'Ед. изм.(смета)' || column === 'Цена (смета)' || column === 'Стоимость (смета)') ? '#f0f8ff' : 'inherit',
                    borderLeft: column === 'Наименование материала (смета)' ? '2px solid #1976d2' : 'inherit',
                    borderRight: column === 'Стоимость (смета)' ? '2px solid #1976d2' : 'inherit',
                    fontWeight: (column === 'Наименование материала (смета)' || column === 'Характеристики (смета)' || column === 'Кол-во (смета)' || column === 'Ед. изм.(смета)' || column === 'Цена (смета)' || column === 'Стоимость (смета)') ? 'bold' : 'normal'
                  }}
                >
                  {column}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.isArray(request.materials) && request.materials.length > 0 ? (
              request.materials.map((mat, idx) => (
                  <TableRow key={mat.id || idx}>
                  {columns.map((column) => renderCell(mat, idx, column))}
                  </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} align="center" sx={{ color: 'text.secondary' }}>
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