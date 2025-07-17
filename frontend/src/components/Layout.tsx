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
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import NotificationsIcon from '@mui/icons-material/Notifications';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import SettingsIcon from '@mui/icons-material/Settings';
import BarChartIcon from '@mui/icons-material/BarChart';
import AssessmentIcon from '@mui/icons-material/Assessment';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

const menuItems = [
  { label: 'Реестр заявок', to: '/requests/registry', icon: <AssignmentIcon /> },
  { label: 'Тендеры', to: '/tenders', icon: <GavelIcon /> },
  { label: 'Предложения', to: '/proposals', icon: <LocalOfferIcon /> },
  { label: 'Контракты', to: '/contracts', icon: <DescriptionIcon /> },
  { label: 'Поставки', to: '/deliveries', icon: <LocalShippingIcon /> },
  { label: 'Платежи', to: '/payments', icon: <PaymentIcon /> },
  { label: 'Документы', to: '/documents', icon: <InsertDriveFileIcon /> },
  { label: 'Уведомления', to: '/notifications', icon: <NotificationsIcon /> },
  { label: 'Справочники', to: '/reference', icon: <MenuBookIcon /> },
  { label: 'Настройки', to: '/settings', icon: <SettingsIcon /> },
  { label: 'Аналитика', to: '/analytics', icon: <BarChartIcon /> },
  { label: 'Отчетность', to: '/reporting', icon: <AssessmentIcon /> },
];

const drawerWidth = 220;

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'background.paper' }}>
      <Toolbar />
      <List sx={{ flexGrow: 1 }}>
        {menuItems.map((item) => {
          const selected = location.pathname.startsWith(item.to);
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
                }}
                onClick={() => isMobile && setMobileOpen(false)}
              >
                <ListItemIcon sx={{ color: selected ? 'primary.main' : 'text.secondary', minWidth: 36 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
      <Box sx={{ flexShrink: 0, p: 2, textAlign: 'center', color: 'text.secondary', fontSize: 13 }}>
        &copy; {new Date().getFullYear()} Tender
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, bgcolor: 'primary.main' }}>
        <Toolbar>
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Typography variant="h6" noWrap component={RouterLink} to="/" sx={{ color: 'inherit', textDecoration: 'none', fontWeight: 700 }}>
            Тендерная система
          </Typography>
        </Toolbar>
      </AppBar>
      {/* Permanent drawer for desktop, temporary for mobile */}
      <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }} aria-label="menu">
        <Drawer
          variant={isMobile ? 'temporary' : 'permanent'}
          open={isMobile ? mobileOpen : true}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'block' },
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
              borderRight: 0,
              bgcolor: 'background.paper',
              boxShadow: isMobile ? 3 : 1,
            },
          }}
        >
          {drawer}
        </Drawer>
      </Box>
      <Box component="main" sx={{ flexGrow: 1, p: { xs: 1, sm: 2, md: 3 }, mt: 8, width: 0, minWidth: 0, maxWidth: '100vw', overflowX: 'auto', bgcolor: 'background.default', minHeight: '100vh' }}>
        {children}
      </Box>
    </Box>
  );
};

export default Layout; 