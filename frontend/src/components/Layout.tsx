import React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import { Link as RouterLink } from 'react-router-dom';

const menuItems = [
  { label: 'Реестр заявок', to: '/requests/registry' },
  { label: 'Тендеры', to: '/tenders' },
  { label: 'Предложения', to: '/proposals' },
  { label: 'Контракты', to: '/contracts' },
  { label: 'Поставки', to: '/deliveries' },
  { label: 'Платежи', to: '/payments' },
  { label: 'Документы', to: '/documents' },
  { label: 'Уведомления', to: '/notifications' },
  { label: 'Справочники', to: '/reference' },
  { label: 'Настройки', to: '/settings' },
  { label: 'Аналитика', to: '/analytics' },
  { label: 'Отчетность', to: '/reporting' },
];

const drawerWidth = 180;

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Box sx={{ display: 'flex' }}>
    <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar>
        <Typography variant="h6" noWrap component={RouterLink} to="/" sx={{ color: 'inherit', textDecoration: 'none' }}>
          Тендерная система
        </Typography>
      </Toolbar>
    </AppBar>
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
      }}
    >
      <Toolbar />
      <Box sx={{ overflow: 'auto' }}>
        <List>
          {menuItems.map((item) => (
            <ListItem key={item.to} disablePadding>
              <ListItemButton component={RouterLink} to={item.to}>
                <ListItemText primary={item.label} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
    </Drawer>
    <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8, width: 0, minWidth: 0, maxWidth: '100vw', overflowX: 'auto' }}>
      {children}
    </Box>
  </Box>
);

export default Layout; 