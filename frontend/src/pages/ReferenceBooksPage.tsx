import React from 'react';
import {
  Box,
  Card,
  CardContent,
  CardActions,
  Grid,
  Typography,
  Button,
  Container
} from '@mui/material';
import {
  Category as CategoryIcon,
  Inventory as InventoryIcon,
  Straighten as StraightenIcon,
  ContactPhone as ContactPhoneIcon,
  Business as BusinessIcon,
  ShoppingCart as ShoppingCartIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const ReferenceBooksPage: React.FC = () => {
  const navigate = useNavigate();

  const referenceBooks = [
    {
      id: 'categories',
      title: 'Категории',
      description: 'Управление категориями материалов',
      icon: <CategoryIcon sx={{ fontSize: 40 }} />,
      color: '#1976d2',
      path: '/reference/categories'
    },
    {
      id: 'material-types',
      title: 'Типы материалов',
      description: 'Управление типами материалов',
      icon: <InventoryIcon sx={{ fontSize: 40 }} />,
      color: '#388e3c',
      path: '/reference/material-types'
    },
    {
      id: 'units',
      title: 'Единицы измерения',
      description: 'Управление единицами измерения',
      icon: <StraightenIcon sx={{ fontSize: 40 }} />,
      color: '#f57c00',
      path: '/reference/units'
    },
    {
      id: 'contact-types',
      title: 'Типы контактов',
      description: 'Управление типами контактов',
      icon: <ContactPhoneIcon sx={{ fontSize: 40 }} />,
      color: '#7b1fa2',
      path: '/reference/contact-types'
    },
    {
      id: 'counterparties',
      title: 'Контрагенты',
      description: 'Управление контрагентами',
      icon: <BusinessIcon sx={{ fontSize: 40 }} />,
      color: '#d32f2f',
      path: '/reference/counterparties'
    },
    {
      id: 'materials',
      title: 'Номенклатура',
      description: 'Управление номенклатурой материалов',
      icon: <ShoppingCartIcon sx={{ fontSize: 40 }} />,
      color: '#ff9800',
      path: '/reference/materials'
    }
  ];

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Справочники
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Управление справочными данными системы
        </Typography>

        <Grid container spacing={3}>
          {referenceBooks.map((book) => (
            <Grid item xs={12} sm={6} md={4} key={book.id}>
              <Card 
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4
                  }
                }}
              >
                <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                  <Box sx={{ color: book.color, mb: 2 }}>
                    {book.icon}
                  </Box>
                  <Typography variant="h6" component="h2" gutterBottom>
                    {book.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {book.description}
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
                  <Button
                    variant="outlined"
                    endIcon={<ArrowForwardIcon />}
                    onClick={() => navigate(book.path)}
                    sx={{ 
                      borderColor: book.color,
                      color: book.color,
                      '&:hover': {
                        borderColor: book.color,
                        backgroundColor: `${book.color}10`
                      }
                    }}
                  >
                    Открыть
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
};

export default ReferenceBooksPage; 