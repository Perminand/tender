import React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { Link as RouterLink } from 'react-router-dom';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Box sx={{ flexGrow: 1 }}>
    <AppBar position="fixed" sx={{ boxShadow: 3 }}>
      <Toolbar>
        <Typography variant="h6" component={RouterLink} to="/" sx={{ flexGrow: 1, color: 'inherit', textDecoration: 'none' }}>
          Тендерная система
        </Typography>
        <Button color="inherit" component={RouterLink} to="/requests/registry">Реестр заявок</Button>
        <Button color="inherit" component={RouterLink} to="/tenders">Тендеры</Button>
        <Button color="inherit" component={RouterLink} to="/proposals">Предложения</Button>
        <Button color="inherit" component={RouterLink} to="/notifications">Уведомления</Button>
        <Button color="inherit" component={RouterLink} to="/reference">Справочники</Button>
        <Button color="inherit" component={RouterLink} to="/settings">Настройки</Button>
        <Button color="inherit" component={RouterLink} to="/analytics">Аналитика</Button>
      </Toolbar>
    </AppBar>
    <Box sx={{ p: 3, mt: 8 }}>{children}</Box>
  </Box>
);

export default Layout; 