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

interface Alert {
  id: string;
  title: string;
  message: string;
  type: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
}

interface AlertNotificationProps {
  username?: string;
}

const AlertNotification: React.FC<AlertNotificationProps> = ({ username = 'admin' }) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAlerts();
    fetchUnreadCount();
  }, [username]);

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      <IconButton
        color="inherit"
        onClick={() => setDrawerOpen(true)}
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
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Уведомления
              {unreadCount > 0 && (
                <Chip 
                  label={unreadCount} 
                  size="small" 
                  color="error" 
                  sx={{ ml: 1 }}
                />
              )}
            </Typography>
            <Box>
              {unreadCount > 0 && (
                <Button 
                  size="small" 
                  onClick={markAllAsRead}
                  sx={{ mr: 1 }}
                >
                  Отметить все как прочитанные
                </Button>
              )}
              <IconButton onClick={() => setDrawerOpen(false)}>
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>

          <Divider sx={{ mb: 2 }} />

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : alerts.length === 0 ? (
            <Box sx={{ textAlign: 'center', p: 3 }}>
              <Typography color="textSecondary">
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
                    '&:hover': {
                      bgcolor: 'action.hover'
                    }
                  }}
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
                          label={alert.severity} 
                          size="small" 
                          color={getSeverityColor(alert.severity) as any}
                        />
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                          {alert.message}
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
                      onClick={() => markAsRead(alert.id)}
                      title="Отметить как прочитанное"
                    >
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                    {alert.actionUrl && (
                      <IconButton
                        size="small"
                        onClick={() => window.open(alert.actionUrl, '_blank')}
                        title="Перейти к действию"
                      >
                        <VisibilityOffIcon fontSize="small" />
                      </IconButton>
                    )}
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