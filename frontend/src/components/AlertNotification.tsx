import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  IconButton,
  Badge,
  Drawer,
  Divider,
  Button,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
  Close as CloseIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon
} from '@mui/icons-material';
import { api } from '../utils/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface Alert {
  id: string;
  title: string;
  message: string;
  type: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
  companyName?: string;
  deliveryId?: string;
  paymentId?: string;
  proposalId?: string;
}

interface AlertNotificationProps {}

const AlertNotification: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user, token, isLoading: authLoading } = useAuth();
  const username = user?.username;

  useEffect(() => {
    if (!token || authLoading || !username) return;
    
    // Небольшая задержка для обновления Axios interceptor
    const timer = setTimeout(() => {
      fetchAlerts();
      fetchUnreadCount();
    }, 100);
    
    return () => clearTimeout(timer);
  }, [token, authLoading, username]);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/alerts/unread?username=${username}`);
      setAlerts(response.data);
    } catch (error) {
      console.error('Ошибка при загрузке алертов:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await api.get(`/api/alerts/stats/unread-count?username=${username}`);
      setUnreadCount(response.data);
    } catch (error) {
      console.error('Ошибка при загрузке количества непрочитанных алертов:', error);
    }
  };

  const markAsRead = async (alertId: string) => {
    try {
      await api.post(`/api/alerts/${alertId}/read`);
      setAlerts(alerts.filter(alert => alert.id !== alertId));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Ошибка при отметке алерта как прочитанного:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.post(`/api/alerts/mark-all-read?username=${username}`);
      setAlerts([]);
      setUnreadCount(0);
    } catch (error) {
      console.error('Ошибка при отметке всех алертов как прочитанных:', error);
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return <ErrorIcon color="error" />;
      case 'HIGH':
        return <WarningIcon color="warning" />;
      case 'MEDIUM':
        return <InfoIcon color="info" />;
      case 'LOW':
        return <CheckCircleIcon color="success" />;
      default:
        return <InfoIcon />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return 'error';
      case 'HIGH':
        return 'warning';
      case 'MEDIUM':
        return 'info';
      case 'LOW':
        return 'success';
      default:
        return 'default';
    }
  };

  // Русские статусы важности
  const getSeverityLabel = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'Критично';
      case 'HIGH': return 'Высокая';
      case 'MEDIUM': return 'Средняя';
      case 'LOW': return 'Низкая';
      default: return severity;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Универсальный обработчик перехода по уведомлению
  const handleAlertClick = (alert: Alert) => {
    markAsRead(alert.id); // Помечаем как прочитанное сразу при клике
    if (alert.actionUrl) {
      window.open(alert.actionUrl, '_blank');
      return;
    }
    if (alert.type === 'DELIVERY' && alert.deliveryId) {
      navigate(`/deliveries/${alert.deliveryId}`);
      return;
    }
    if (alert.type === 'PAYMENT' && alert.paymentId) {
      navigate(`/payments/${alert.paymentId}`);
      return;
    }
    if (alert.type === 'PROPOSAL' && alert.proposalId) {
      navigate(`/proposals/${alert.proposalId}`);
      return;
    }
    // Можно добавить другие типы
  };

  return (
    <>
      <IconButton
        color="inherit"
        onClick={() => setDrawerOpen(open => !open)}
        sx={{ ml: 1 }}
      >
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{
          sx: { width: 400 }
        }}
      >
        <Box sx={{ p: 2 }}>
              {unreadCount > 0 && (
                <Button 
                  size="small" 
                  onClick={markAllAsRead}
              sx={{ mb: 2 }}
                >
                  Отметить все как прочитанные
                </Button>
              )}

          <Divider sx={{ mb: 2 }} />

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : alerts.length === 0 ? (
            <Box sx={{ textAlign: 'center', mt: 8, p: 3 }}>
              <Typography color="text.secondary" variant="h6">
                Нет непрочитанных уведомлений
              </Typography>
            </Box>
          ) : (
            <List sx={{ p: 0 }}>
              {alerts.map((alert) => (
                <ListItem
                  key={alert.id}
                  sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    mb: 1,
                    cursor: alert.actionUrl || alert.deliveryId || alert.paymentId || alert.proposalId ? 'pointer' : 'default',
                    '&:hover': {
                      bgcolor: (alert.actionUrl || alert.deliveryId || alert.paymentId || alert.proposalId) ? 'action.hover' : undefined
                    }
                  }}
                  onClick={() => handleAlertClick(alert)}
                >
                  <ListItemIcon>
                    {getSeverityIcon(alert.severity)}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                          {alert.title}
                        </Typography>
                        <Chip 
                          label={getSeverityLabel(alert.severity)}
                          size="small" 
                          color={getSeverityColor(alert.severity) as any}
                        />
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                          {/* Показываем companyName, если есть, иначе message */}
                          {alert.companyName ? (
                            <b>{alert.companyName}</b>
                          ) : (
                            alert.message
                          )}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {formatDate(alert.createdAt)}
                        </Typography>
                      </Box>
                    }
                  />
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <IconButton
                      size="small"
                      onClick={e => { e.stopPropagation(); markAsRead(alert.id); }}
                      title="Отметить как прочитанное"
                    >
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </ListItem>
              ))}
            </List>
          )}
        </Box>
      </Drawer>
    </>
  );
};

export default AlertNotification; 