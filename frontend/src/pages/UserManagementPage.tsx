import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  IconButton,
  Chip,
  Alert,
  Snackbar,
  Tooltip,
  Avatar,
  Switch,
  FormControlLabel,
  useTheme,
  useMediaQuery,
  Fab,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Lock as LockIcon,
  LockOpen as UnlockIcon,
  Refresh as RefreshIcon,
  Person as PersonIcon,
  Business as BusinessIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../utils/api';
import ResponsiveTable from '../components/ResponsiveTable';
import MobileForm from '../components/MobileForm';

interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  phone?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'BLOCKED' | 'PENDING_ACTIVATION';
  roles: string[];
  company?: {
    id: string;
    name: string;
  };
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
  isEnabled: boolean;
  isAccountNonLocked: boolean;
}

interface Company {
  id: string;
  name: string;
  shortName?: string;
}

const UserManagementPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [users, setUsers] = useState<User[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success'
  });

  // Форма пользователя
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    middleName: '',
    phone: '',
    roles: [] as string[],
    companyId: '',
    status: 'ACTIVE' as User['status'],
    isEnabled: true,
    isAccountNonLocked: true
  });

  const roles = [
    { value: 'ROLE_ADMIN', label: 'Администратор' },
    { value: 'ROLE_MANAGER', label: 'Менеджер' },
    { value: 'ROLE_SUPPLIER', label: 'Поставщик' },
    { value: 'ROLE_CUSTOMER', label: 'Заказчик' },
    { value: 'ROLE_ANALYST', label: 'Аналитик' },
    { value: 'ROLE_VIEWER', label: 'Просмотр' }
  ];

  const statusOptions = [
    { value: 'ACTIVE', label: 'Активен' },
    { value: 'INACTIVE', label: 'Неактивен' },
    { value: 'BLOCKED', label: 'Заблокирован' },
    { value: 'PENDING_ACTIVATION', label: 'Ожидает активации' }
  ];

  useEffect(() => {
    loadUsers();
    loadCompanies();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Ошибка при загрузке пользователей:', error);
      showSnackbar('Ошибка при загрузке пользователей', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadCompanies = async () => {
    try {
      const response = await api.get('/api/companies');
      setCompanies(response.data);
    } catch (error) {
      console.error('Ошибка при загрузке компаний:', error);
      showSnackbar('Ошибка при загрузке компаний', 'error');
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleOpenDialog = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        username: user.username,
        email: user.email,
        password: '',
        firstName: user.firstName,
        lastName: user.lastName,
        middleName: user.middleName || '',
        phone: user.phone || '',
        roles: user.roles,
        companyId: user.company?.id || '',
        status: user.status,
        isEnabled: user.isEnabled,
        isAccountNonLocked: user.isAccountNonLocked
      });
    } else {
      setEditingUser(null);
      setFormData({
        username: '',
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        middleName: '',
        phone: '',
        roles: [],
        companyId: '',
        status: 'ACTIVE',
        isEnabled: true,
        isAccountNonLocked: true
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingUser(null);
  };

  const handleSubmit = async (values: any) => {
    try {
      const rolesForBackend = values.roles.map((r: string) => r.replace('ROLE_', ''));
      if (editingUser) {
        // Обновление пользователя
        await api.put(`/api/users/${editingUser.id}`, {
          ...values,
          roles: rolesForBackend,
          password: values.password || undefined
        });
        showSnackbar('Пользователь успешно обновлен', 'success');
      } else {
        // Создание нового пользователя
        await api.post('/api/users', {
          ...values,
          roles: rolesForBackend
        });
        showSnackbar('Пользователь успешно создан', 'success');
      }
      handleCloseDialog();
      loadUsers();
    } catch (error) {
      console.error('Ошибка при сохранении пользователя:', error);
      showSnackbar('Ошибка при сохранении пользователя', 'error');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Вы уверены, что хотите удалить этого пользователя?')) {
      return;
    }

    try {
      await api.delete(`/api/users/${userId}`);
      showSnackbar('Пользователь успешно удален', 'success');
      loadUsers();
    } catch (error) {
      console.error('Ошибка при удалении пользователя:', error);
      showSnackbar('Ошибка при удалении пользователя', 'error');
    }
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: User['status']) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await api.put(`/api/users/${userId}/status?status=${newStatus}`);
      showSnackbar(`Статус пользователя изменен на ${newStatus === 'ACTIVE' ? 'активен' : 'неактивен'}`, 'success');
      loadUsers();
    } catch (error) {
      console.error('Ошибка при изменении статуса пользователя:', error);
      showSnackbar('Ошибка при изменении статуса пользователя', 'error');
    }
  };

  const getStatusColor = (status: User['status']) => {
    switch (status) {
      case 'ACTIVE': return 'success';
      case 'INACTIVE': return 'warning';
      case 'BLOCKED': return 'error';
      case 'PENDING_ACTIVATION': return 'info';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: User['status']) => {
    switch (status) {
      case 'ACTIVE': return 'Активен';
      case 'INACTIVE': return 'Неактивен';
      case 'BLOCKED': return 'Заблокирован';
      case 'PENDING_ACTIVATION': return 'Ожидает активации';
      default: return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ru-RU');
  };

  // Конфигурация колонок для адаптивной таблицы
  const columns = [
    {
      id: 'avatar',
      label: '',
      render: (value: any, row: User) => (
        <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
          {row.firstName.charAt(0).toUpperCase()}
        </Avatar>
      ),
      mobile: false
    },
    {
      id: 'name',
      label: 'Имя',
      render: (value: any, row: User) => (
        <Box>
          <Typography variant="body2" fontWeight={600}>
            {row.firstName} {row.lastName}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            @{row.username}
          </Typography>
        </Box>
      )
    },
    {
      id: 'email',
      label: 'Email',
      render: (value: any, row: User) => row.email
    },
    {
      id: 'company',
      label: 'Компания',
      render: (value: any, row: User) => row.company?.name || '-'
    },
    {
      id: 'roles',
      label: 'Роли',
      render: (value: any, row: User) => (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {row.roles.map((role) => (
            <Chip 
              key={role} 
              label={role.replace('ROLE_', '')} 
              size="small" 
              variant="outlined"
            />
          ))}
        </Box>
      )
    },
    {
      id: 'status',
      label: 'Статус',
      render: (value: any, row: User) => (
        <Chip 
          label={getStatusLabel(row.status)} 
          color={getStatusColor(row.status) as any}
          size="small"
        />
      )
    },
    {
      id: 'actions',
      label: 'Действия',
      render: (value: any, row: User) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Редактировать">
            <IconButton 
              size="small" 
              onClick={(e) => {
                e.stopPropagation();
                handleOpenDialog(row);
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Удалить">
            <IconButton 
              size="small" 
              color="error"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteUser(row.id);
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
      mobile: false
    }
  ];

  // Конфигурация полей для формы
  const formFields = [
    {
      name: 'username',
      label: 'Имя пользователя',
      type: 'text' as const,
      required: true
    },
    {
      name: 'email',
      label: 'Email',
      type: 'email' as const,
      required: true
    },
    {
      name: 'password',
      label: 'Пароль',
      type: 'password' as const,
      required: !editingUser
    },
    {
      name: 'firstName',
      label: 'Имя',
      type: 'text' as const,
      required: true
    },
    {
      name: 'lastName',
      label: 'Фамилия',
      type: 'text' as const,
      required: true
    },
    {
      name: 'middleName',
      label: 'Отчество',
      type: 'text' as const
    },
    {
      name: 'phone',
      label: 'Телефон',
      type: 'text' as const
    },
    {
      name: 'roles',
      label: 'Роли',
      type: 'multiselect' as const,
      options: roles,
      required: true
    },
    {
      name: 'companyId',
      label: 'Компания',
      type: 'select' as const,
      options: companies.map(c => ({ value: c.id, label: c.name }))
    },
    {
      name: 'status',
      label: 'Статус',
      type: 'select' as const,
      options: statusOptions
    },
    {
      name: 'isEnabled',
      label: 'Активен',
      type: 'switch' as const
    },
    {
      name: 'isAccountNonLocked',
      label: 'Не заблокирован',
      type: 'switch' as const
    }
  ];

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Управление пользователями
        </Typography>
        <Typography>Загрузка...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 3,
        flexDirection: { xs: 'column', sm: 'row' },
        gap: { xs: 2, sm: 0 }
      }}>
        <Typography variant="h4" gutterBottom>
          Управление пользователями
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadUsers}
            size={isMobile ? 'small' : 'medium'}
          >
            Обновить
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            size={isMobile ? 'small' : 'medium'}
          >
            Добавить пользователя
          </Button>
        </Box>
      </Box>

      <ResponsiveTable
        columns={columns}
        data={users}
        getRowKey={(row) => row.id}
        title="Список пользователей"
        loading={loading}
        onRowClick={(row) => handleOpenDialog(row)}
      />

      {/* Мобильная кнопка добавления */}
      {isMobile && (
        <Fab
          color="primary"
          aria-label="add"
          sx={{
            position: 'fixed',
            bottom: 80,
            right: 16,
            zIndex: 1000
          }}
          onClick={() => handleOpenDialog()}
        >
          <AddIcon />
        </Fab>
      )}

      {/* Адаптивная форма */}
      {dialogOpen && (
        <MobileForm
          title={editingUser ? 'Редактирование пользователя' : 'Создание пользователя'}
          fields={formFields}
          initialValues={formData}
          onSubmit={handleSubmit}
          onCancel={handleCloseDialog}
          submitText={editingUser ? 'Обновить' : 'Создать'}
          loading={loading}
          isEdit={!!editingUser}
        />
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UserManagementPage; 