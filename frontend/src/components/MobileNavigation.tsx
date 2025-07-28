import React from 'react';
import {
  BottomNavigation,
  BottomNavigationAction,
  Paper,
  Box,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Assignment as AssignmentIcon,
  Gavel as GavelIcon,
  Description as DescriptionIcon,
  MenuBook as MenuBookIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { usePermissions } from '../hooks/usePermissions';

const MobileNavigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { canAccess } = usePermissions();

  if (!isMobile) {
    return null;
  }

  const navigationItems = [
    {
      label: 'Дашборд',
      value: '/dashboard',
      icon: <DashboardIcon />,
      roles: ['ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_ANALYST', 'ROLE_VIEWER', 'ROLE_CUSTOMER']
    },
    {
      label: 'Заявки',
      value: '/requests/registry',
      icon: <AssignmentIcon />,
      roles: ['ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_VIEWER', 'ROLE_CUSTOMER']
    },
    {
      label: 'Тендеры',
      value: '/tenders',
      icon: <GavelIcon />,
      roles: ['ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_SUPPLIER', 'ROLE_VIEWER']
    },
    {
      label: 'Контракты',
      value: '/contracts',
      icon: <DescriptionIcon />,
      roles: ['ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_VIEWER']
    },
    {
      label: 'Справочники',
      value: '/reference',
      icon: <MenuBookIcon />,
      roles: ['ROLE_ADMIN', 'ROLE_MANAGER']
    }
  ];

  // Фильтруем элементы по правам доступа
  const filteredItems = navigationItems.filter(item => {
    const menuPath = item.value.replace('/', '').replace('/', '/');
    return canAccess(menuPath);
  });

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    if (newValue !== location.pathname) {
      navigate(newValue);
    }
  };

  // Определяем текущий активный элемент
  const getCurrentValue = () => {
    const currentPath = location.pathname;
    const matchingItem = filteredItems.find(item => 
      currentPath.startsWith(item.value)
    );
    return matchingItem ? matchingItem.value : '/dashboard';
  };

  return (
    <Paper 
      sx={{ 
        position: 'fixed', 
        bottom: 0, 
        left: 0, 
        right: 0, 
        zIndex: 1000,
        borderTop: 1,
        borderColor: 'divider'
      }} 
      elevation={3}
    >
      <BottomNavigation
        value={getCurrentValue()}
        onChange={handleChange}
        showLabels
        sx={{
          height: 60,
          '& .MuiBottomNavigationAction-root': {
            minWidth: 'auto',
            padding: '6px 8px',
            '&.Mui-selected': {
              color: 'primary.main',
            },
          },
          '& .MuiBottomNavigationAction-label': {
            fontSize: '0.7rem',
            fontWeight: 500,
          },
        }}
      >
        {filteredItems.map((item) => (
          <BottomNavigationAction
            key={item.value}
            label={item.label}
            value={item.value}
            icon={item.icon}
            sx={{
              '& .MuiBottomNavigationAction-icon': {
                fontSize: '1.2rem',
              },
            }}
          />
        ))}
      </BottomNavigation>
    </Paper>
  );
};

export default MobileNavigation; 