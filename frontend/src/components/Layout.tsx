import React, { useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import AssignmentIcon from '@mui/icons-material/Assignment';
import GavelIcon from '@mui/icons-material/Gavel';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import DescriptionIcon from '@mui/icons-material/Description';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import PaymentIcon from '@mui/icons-material/Payment';
import ReceiptIcon from '@mui/icons-material/Receipt';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import NotificationsIcon from '@mui/icons-material/Notifications';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import SettingsIcon from '@mui/icons-material/Settings';
import BarChartIcon from '@mui/icons-material/BarChart';
import AssessmentIcon from '@mui/icons-material/Assessment';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import BusinessIcon from '@mui/icons-material/Business';
import PeopleIcon from '@mui/icons-material/People';
import InventoryIcon from '@mui/icons-material/Inventory';
import CategoryIcon from '@mui/icons-material/Category';
import WarehouseIcon from '@mui/icons-material/Warehouse';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import ListSubheader from '@mui/material/ListSubheader';
import Collapse from '@mui/material/Collapse';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import AlertNotification from './AlertNotification';
import Breadcrumbs from './Breadcrumbs';
import MobileNavigation from './MobileNavigation';
import { useAuth } from '../contexts/AuthContext';
import { usePermissions } from '../hooks/usePermissions';

// Структурированное меню по функциональным блокам
const menuStructure = [
  {
    title: 'Главная',
    items: [
      { label: 'Процессы заявок', to: '/requests/process', icon: <AssessmentIcon />, roles: ['ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_VIEWER'] },
      { label: 'Дашборд', to: '/dashboard', icon: <DashboardIcon />, roles: ['ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_ANALYST', 'ROLE_VIEWER', 'ROLE_CUSTOMER'] }
    ]
  },
  {
    title: 'Тендерные процедуры',
    items: [
      { label: 'Реестр заявок', to: '/requests/registry', icon: <AssignmentIcon />, roles: ['ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_VIEWER', 'ROLE_CUSTOMER'] },
      { label: 'Тендеры', to: '/tenders', icon: <GavelIcon />, roles: ['ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_SUPPLIER', 'ROLE_VIEWER'] },
      { label: 'Предложения', to: '/proposals', icon: <LocalOfferIcon />, roles: ['ROLE_SUPPLIER', 'ROLE_MANAGER', 'ROLE_ADMIN'] },
      { label: 'Информация о заказчиках', to: '/customer-summary', icon: <BusinessIcon />, roles: ['ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_VIEWER'] }
    ]
  },
  {
    title: 'Контрактная работа',
    items: [
      { label: 'Контракты', to: '/contracts', icon: <DescriptionIcon />, roles: ['ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_VIEWER'] },
      { label: 'Поставки', to: '/deliveries', icon: <LocalShippingIcon />, roles: ['ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_VIEWER'] },
      { label: 'Счета', to: '/invoices', icon: <ReceiptIcon />, roles: ['ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_VIEWER'] },
      { label: 'Платежи', to: '/payments', icon: <PaymentIcon />, roles: ['ROLE_ADMIN', 'ROLE_MANAGER'] }
    ]
  },
  {
    title: 'Документооборот',
    items: [
      { label: 'Документы', to: '/documents', icon: <InsertDriveFileIcon />, roles: ['ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_VIEWER'] },
      { label: 'Уведомления', to: '/notifications', icon: <NotificationsIcon />, roles: ['ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_VIEWER'] }
    ]
  },
  {
    title: 'Справочники',
    items: []
  },
  {
    title: 'Администрирование',
    items: [
      { label: 'Управление пользователями', to: '/users', icon: <PeopleIcon />, roles: ['ROLE_ADMIN'] },
      { label: 'Настройки', to: '/settings', icon: <SettingsIcon />, roles: ['ROLE_ADMIN', 'ROLE_MANAGER'] },
      { label: 'Журнал аудита', to: '/audit-log', icon: <BarChartIcon />, roles: ['ROLE_ADMIN'] }
    ]
  }
];

const drawerWidth = 280;

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['Главная']));

  // Автоматически раскрываем раздел "Главная" если пользователь на главной странице
  React.useEffect(() => {
    if (location.pathname === '/' || location.pathname === '/dashboard') {
      setExpandedSections(prev => new Set([...prev, 'Главная']));
    }
  }, [location.pathname]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const { canAccess } = usePermissions();
  const navigate = useNavigate();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleSidebarToggle = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    handleUserMenuClose();
  };

  const handleSectionToggle = (sectionTitle: string) => {
    // Для раздела "Справочники" - переход на страницу справочников
    if (sectionTitle === 'Справочники') {
      navigate('/reference');
      if (isMobile) {
        setMobileOpen(false);
      }
      return;
    }
    
    // Для остальных разделов - стандартное поведение раскрытия
    const newExpandedSections = new Set(expandedSections);
    if (newExpandedSections.has(sectionTitle)) {
      newExpandedSections.delete(sectionTitle);
    } else {
      newExpandedSections.add(sectionTitle);
    }
    setExpandedSections(newExpandedSections);
  };

  // Фильтрация меню по правам доступа
  const filteredMenuStructure = menuStructure.map(section => ({
    ...section,
    items: section.items.filter(item => {
      // Проверяем права доступа через централизованную систему
      const menuPath = item.to.startsWith('/') ? item.to.slice(1) : item.to;
      return canAccess(menuPath);
    })
  })).filter(section => {
    // Все разделы отображаются только если есть доступные подпункты
    return section.items.length > 0;
  });

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'background.paper' }}>
      <Toolbar />
      <List sx={{ flexGrow: 1, py: 0, overflow: 'auto' }}>
        {filteredMenuStructure.map((section, sectionIndex) => {
          const isExpanded = expandedSections.has(section.title);
          const isReferenceSection = section.title === 'Справочники';
          
          return (
            <React.Fragment key={section.title}>
              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => handleSectionToggle(section.title)}
                  sx={{
                    borderRadius: 2,
                    mx: 1,
                    my: 0.5,
                    color: 'text.secondary',
                    bgcolor: 'transparent',
                    '&:hover': {
                      bgcolor: 'primary.100',
                    },
                    transition: 'background 0.2s',
                    pl: { xs: 2, md: 3 },
                    pr: { xs: 1, md: 2 },
                  }}
                >
                  <ListItemText 
                    primary={section.title} 
                    primaryTypographyProps={{
                      fontSize: { xs: '0.8rem', md: '0.875rem' },
                      fontWeight: 600
                    }}
                  />
                  {!isReferenceSection && (
                    <ListItemIcon sx={{ minWidth: 'auto', color: 'text.secondary' }}>
                      {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </ListItemIcon>
                  )}
                </ListItemButton>
              </ListItem>
              {!isReferenceSection && (
                <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {section.items.map((item) => {
                      const selected = location.pathname === item.to || 
                        (item.to === '/requests/process' && location.pathname === '/');
                      return (
                        <ListItem key={item.to} disablePadding>
                          <ListItemButton
                            component={RouterLink}
                            to={item.to}
                            selected={selected}
                            sx={{
                              borderRadius: 2,
                              mx: 1,
                              my: 0.5,
                              color: selected ? 'primary.main' : 'text.primary',
                              bgcolor: selected ? 'primary.50' : 'transparent',
                              '&:hover': {
                                bgcolor: 'primary.100',
                              },
                              transition: 'background 0.2s',
                              pl: { xs: 3, md: 5 },
                            }}
                            onClick={() => isMobile && setMobileOpen(false)}
                          >
                            <ListItemIcon sx={{ 
                              color: selected ? 'primary.main' : 'text.secondary', 
                              minWidth: { xs: 32, md: 36 },
                              fontSize: { xs: '1.2rem', md: '1.5rem' }
                            }}>
                              {item.icon}
                            </ListItemIcon>
                            <ListItemText 
                              primary={item.label} 
                              primaryTypographyProps={{
                                fontSize: { xs: '0.75rem', md: '0.875rem' },
                                fontWeight: selected ? 600 : 400
                              }}
                            />
                          </ListItemButton>
                        </ListItem>
                      );
                    })}
                  </List>
                </Collapse>
              )}
              {sectionIndex < filteredMenuStructure.length - 1 && (
                <Divider sx={{ my: 1, mx: 2 }} />
              )}
            </React.Fragment>
          );
        })}
      </List>
      <Box sx={{ 
        flexShrink: 0, 
        p: { xs: 1, md: 2 }, 
        textAlign: 'center', 
        color: 'text.secondary', 
        fontSize: { xs: 11, md: 13 } 
      }}>
        &copy; {new Date().getFullYear()} Тендерная система
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, bgcolor: 'primary.main' }}>
        <Toolbar sx={{ minHeight: { xs: 56, md: 64 } }}>
          {isMobile ? (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 1 }}
            >
              <MenuIcon />
            </IconButton>
          ) : (
            <IconButton
              color="inherit"
              aria-label="toggle sidebar"
              edge="start"
              onClick={handleSidebarToggle}
              sx={{ mr: 1 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Typography 
            variant={isSmallMobile ? "subtitle1" : "h6"} 
            noWrap 
            component={RouterLink} 
            to="/" 
            sx={{ 
              color: 'inherit', 
              textDecoration: 'none', 
              fontWeight: 700,
              fontSize: { xs: '1rem', sm: '1.25rem' }
            }}
          >
            {isSmallMobile ? 'Тендер' : 'Тендерная система'}
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          <AlertNotification />
          
          {/* Пользовательское меню */}
          {user && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1 } }}>
              {!isSmallMobile && (
                <Chip
                  label={user.roles.join(', ')}
                  size="small"
                  color="secondary"
                  variant="outlined"
                  sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                />
              )}
              <IconButton
                color="inherit"
                onClick={handleUserMenuOpen}
                sx={{ ml: { xs: 0.5, sm: 1 } }}
              >
                <Avatar sx={{ 
                  width: { xs: 28, sm: 32 }, 
                  height: { xs: 28, sm: 32 }, 
                  bgcolor: 'secondary.main',
                  fontSize: { xs: '0.8rem', sm: '1rem' }
                }}>
                  {user.firstName.charAt(0).toUpperCase()}
                </Avatar>
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleUserMenuClose}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                PaperProps={{
                  sx: { minWidth: { xs: 200, sm: 250 } }
                }}
              >
                <MenuItem disabled>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                    <Typography variant="subtitle2">
                      {user.firstName} {user.lastName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {user.email}
                    </Typography>
                  </Box>
                </MenuItem>
                <MenuItem onClick={handleLogout}>
                  <LogoutIcon sx={{ mr: 1 }} />
                  Выйти
                </MenuItem>
              </Menu>
            </Box>
          )}
        </Toolbar>
      </AppBar>
      {/* Permanent drawer for desktop, temporary for mobile */}
      <Box component="nav" sx={{ width: { md: sidebarCollapsed ? 0 : drawerWidth }, flexShrink: { md: 0 } }} aria-label="menu">
        <Drawer
          variant={isMobile ? 'temporary' : 'permanent'}
          open={isMobile ? mobileOpen : !sidebarCollapsed}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'block' },
            '& .MuiDrawer-paper': {
              width: { xs: '85vw', sm: sidebarCollapsed ? 0 : drawerWidth },
              boxSizing: 'border-box',
              borderRight: 0,
              bgcolor: 'background.paper',
              boxShadow: isMobile ? 3 : 1,
              overflow: 'auto',
              transition: 'width 0.3s ease-in-out',
            },
          }}
        >
          {drawer}
        </Drawer>
      </Box>
      <Box component="main" sx={{ 
        flexGrow: 1, 
        p: { xs: 1, sm: 2, md: 3 }, 
        mt: { xs: 7, md: 8 }, 
        pb: { xs: 8, md: 3 }, // Добавляем отступ снизу для мобильной навигации
        width: 0, 
        minWidth: 0, 
        maxWidth: '100vw', 
        overflowX: 'auto', 
        bgcolor: 'background.default', 
        minHeight: '100vh',
        transition: 'margin-left 0.3s ease-in-out',
        ml: { md: sidebarCollapsed ? 0 : 0 }
      }}>
        <Breadcrumbs />
        {children}
      </Box>
      <MobileNavigation />
    </Box>
  );
};

export default Layout; 