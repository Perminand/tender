import React from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Grid, 
  Button, 
  Box,
  Chip
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AddIcon from '@mui/icons-material/Add';
import AssignmentIcon from '@mui/icons-material/Assignment';
import GavelIcon from '@mui/icons-material/Gavel';
import DescriptionIcon from '@mui/icons-material/Description';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import PaymentIcon from '@mui/icons-material/Payment';
import PeopleIcon from '@mui/icons-material/People';
import InventoryIcon from '@mui/icons-material/Inventory';
import AssessmentIcon from '@mui/icons-material/Assessment';

interface QuickAction {
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
  roles: string[];
  color: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info';
}

const quickActions: QuickAction[] = [
  {
    title: 'Новая заявка',
    description: 'Создать заявку на закупку',
    icon: <AssignmentIcon />,
    path: '/requests/new',
    roles: ['ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_CUSTOMER'],
    color: 'primary'
  },
  {
    title: 'Новый тендер',
    description: 'Создать тендерную процедуру',
    icon: <GavelIcon />,
    path: '/tenders/new',
    roles: ['ROLE_ADMIN', 'ROLE_MANAGER'],
    color: 'secondary'
  },
  {
    title: 'Новый платеж',
    description: 'Создать платеж',
    icon: <PaymentIcon />,
    path: '/payments/new',
    roles: ['ROLE_ADMIN', 'ROLE_MANAGER'],
    color: 'info'
  },
  {
    title: 'Новый контрагент',
    description: 'Добавить контрагента',
    icon: <PeopleIcon />,
    path: '/counterparties/new',
    roles: ['ROLE_ADMIN', 'ROLE_MANAGER'],
    color: 'primary'
  },
  {
    title: 'Новый материал',
    description: 'Добавить материал',
    icon: <InventoryIcon />,
    path: '/materials/new',
    roles: ['ROLE_ADMIN', 'ROLE_MANAGER'],
    color: 'secondary'
  }
];

const QuickActions: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Фильтруем действия по ролям пользователя
  const availableActions = quickActions.filter(action =>
    action.roles.some(role => user?.roles.includes(role))
  );

  const handleActionClick = (path: string) => {
    navigate(path);
  };

  if (availableActions.length === 0) {
    return null;
  }

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AddIcon />
          Быстрые действия
        </Typography>
        <Grid container spacing={2}>
          {availableActions.map((action, index) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
              <Button
                variant="outlined"
                fullWidth
                startIcon={action.icon}
                onClick={() => handleActionClick(action.path)}
                sx={{
                  height: 80,
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  p: 2,
                  borderColor: `${action.color}.main`,
                  color: `${action.color}.main`,
                  '&:hover': {
                    borderColor: `${action.color}.dark`,
                    backgroundColor: `${action.color}.50`,
                  }
                }}
              >
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                  <Typography variant="subtitle2" fontWeight={600}>
                    {action.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {action.description}
                  </Typography>
                </Box>
              </Button>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
};

export default QuickActions; 