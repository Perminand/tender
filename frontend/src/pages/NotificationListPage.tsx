import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Replay as RetryIcon,
  Cancel as CancelIcon,
  Visibility as ViewIcon,
  Email as EmailIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import ResponsiveTable from '../components/ResponsiveTable';

interface NotificationDto {
  id: string;
  type: string;
  title: string;
  message: string;
  recipientEmail: string;
  status: 'PENDING' | 'SENT' | 'FAILED' | 'CANCELLED';
  createdAt: string;
  sentAt?: string;
  errorMessage?: string;
  tenderId?: string;
  tenderNumber?: string;
  tenderTitle?: string;
  supplierName?: string;
}

const NotificationListPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [notifications, setNotifications] = useState<NotificationDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedNotification, setSelectedNotification] = useState<NotificationDto | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [page, setPage] = useState(1);
  const rowsPerPage = 20;
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
  }, [selectedStatus]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      let url = '/api/notifications';
      if (selectedStatus !== 'ALL') {
        url += `/status/${selectedStatus}`;
      }
      const response = await api.get(url);
      setNotifications(response.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = async (notificationId: string) => {
    try {
      const response = await api.post(`/api/notifications/${notificationId}/retry`);
      if (response.data) {
        fetchNotifications();
      }
    } catch (error) {
      console.error('Error retrying notification:', error);
    }
  };

  const handleCancel = async (notificationId: string) => {
    try {
      await api.post(`/api/notifications/${notificationId}/cancel`);
      fetchNotifications();
    } catch (error) {
      console.error('Error cancelling notification:', error);
    }
  };

  const handleSendPending = async () => {
    try {
      await api.post('/api/notifications/send-pending');
      fetchNotifications();
    } catch (error) {
      console.error('Error sending pending notifications:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'warning';
      case 'SENT': return 'success';
      case 'FAILED': return 'error';
      case 'CANCELLED': return 'default';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PENDING': return 'Ожидает';
      case 'SENT': return 'Отправлено';
      case 'FAILED': return 'Ошибка';
      case 'CANCELLED': return 'Отменено';
      default: return status;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'TENDER_PUBLISHED': return 'Тендер опубликован';
      case 'TENDER_REMINDER': return 'Напоминание о дедлайне';
      case 'PROPOSAL_SUBMITTED': return 'Получено предложение';
      case 'TENDER_AWARDED': return 'Тендер присужден';
      case 'TENDER_CANCELLED': return 'Тендер отменен';
      case 'SUPPLIER_INVITATION': return 'Приглашение поставщика';
      default: return type;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ru-RU');
  };

  const filteredNotifications = notifications.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  // Конфигурация колонок для ResponsiveTable
  const columns = [
    {
      id: 'type',
      label: 'Тип',
      render: (value: any, row: NotificationDto) => (
        <Chip 
          label={getTypeLabel(row.type)} 
          size="small" 
          color="primary" 
          variant="outlined"
        />
      )
    },
    {
      id: 'recipientEmail',
      label: 'Получатель',
      render: (value: any, row: NotificationDto) => row.recipientEmail
    },
    {
      id: 'title',
      label: 'Тема',
      render: (value: any, row: NotificationDto) => (
        <Typography variant="body2" sx={{ maxWidth: 300 }}>
          {row.title}
        </Typography>
      )
    },
    {
      id: 'status',
      label: 'Статус',
      render: (value: any, row: NotificationDto) => (
        <Chip 
          label={getStatusLabel(row.status)} 
          size="small" 
          color={getStatusColor(row.status) as any}
        />
      )
    },
    {
      id: 'createdAt',
      label: 'Создано',
      render: (value: any, row: NotificationDto) => formatDate(row.createdAt)
    },
    {
      id: 'sentAt',
      label: 'Отправлено',
      render: (value: any, row: NotificationDto) => 
        row.sentAt ? formatDate(row.sentAt) : '-'
    },
    {
      id: 'actions',
      label: 'Действия',
      render: (value: any, row: NotificationDto) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedNotification(row);
              setDialogOpen(true);
            }}
          >
            <ViewIcon />
          </IconButton>
          {row.status === 'FAILED' && (
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleRetry(row.id);
              }}
              color="primary"
            >
              <RetryIcon />
            </IconButton>
          )}
          {row.status === 'PENDING' && (
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleCancel(row.id);
              }}
              color="error"
            >
              <CancelIcon />
            </IconButton>
          )}
        </Box>
      ),
      mobile: false
    }
  ];

  if (loading) {
    return <div>Загрузка...</div>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 3,
        flexDirection: { xs: 'column', sm: 'row' },
        gap: { xs: 2, sm: 0 }
      }}>
        <Typography variant={isMobile ? "h5" : "h4"} component="h1">
          Уведомления
        </Typography>
        <Box sx={{ 
          display: 'flex', 
          gap: { xs: 1, sm: 2 },
          flexWrap: 'wrap',
          flexDirection: { xs: 'column', sm: 'row' }
        }}>
          <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 200 } }}>
            <InputLabel>Статус</InputLabel>
            <Select
              value={selectedStatus}
              label="Статус"
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <MenuItem value="ALL">Все</MenuItem>
              <MenuItem value="PENDING">Ожидающие</MenuItem>
              <MenuItem value="SENT">Отправленные</MenuItem>
              <MenuItem value="FAILED">Ошибки</MenuItem>
              <MenuItem value="CANCELLED">Отмененные</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchNotifications}
            size={isMobile ? 'small' : 'medium'}
          >
            Обновить
          </Button>
          <Button
            variant="contained"
            startIcon={<EmailIcon />}
            onClick={handleSendPending}
            size={isMobile ? 'small' : 'medium'}
          >
            Отправить ожидающие
          </Button>
        </Box>
      </Box>

      <Card>
        <CardContent>
          <ResponsiveTable
            columns={columns}
            data={filteredNotifications}
            getRowKey={(row) => row.id}
            onRowClick={(row) => {
              setSelectedNotification(row);
              setDialogOpen(true);
            }}
            title="Список уведомлений"
            loading={loading}
          />

          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Pagination
              count={Math.ceil(notifications.length / rowsPerPage)}
              page={page}
              onChange={(_, value) => setPage(value)}
              color="primary"
            />
          </Box>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Детали уведомления
        </DialogTitle>
        <DialogContent>
          {selectedNotification && (
            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>
                {selectedNotification.title}
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Тип: {getTypeLabel(selectedNotification.type)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Получатель: {selectedNotification.recipientEmail}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Статус: {getStatusLabel(selectedNotification.status)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Создано: {formatDate(selectedNotification.createdAt)}
                </Typography>
                {selectedNotification.sentAt && (
                  <Typography variant="body2" color="text.secondary">
                    Отправлено: {formatDate(selectedNotification.sentAt)}
                  </Typography>
                )}
                {selectedNotification.tenderNumber && (
                  <Typography variant="body2" color="text.secondary">
                    Тендер: {selectedNotification.tenderNumber} - {selectedNotification.tenderTitle}
                  </Typography>
                )}
              </Box>

              <Typography variant="h6" sx={{ mb: 1 }}>
                Сообщение:
              </Typography>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                {selectedNotification.message}
              </Typography>

              {selectedNotification.errorMessage && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    Ошибка: {selectedNotification.errorMessage}
                  </Typography>
                </Alert>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Закрыть</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default NotificationListPage; 