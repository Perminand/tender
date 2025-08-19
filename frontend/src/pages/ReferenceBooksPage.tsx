import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Container,
  Divider,
  Paper,
  Button
} from '@mui/material';
import {
  Category as CategoryIcon,
  Inventory as InventoryIcon,
  Straighten as StraightenIcon,
  ContactPhone as ContactPhoneIcon,
  Business as BusinessIcon,
  ShoppingCart as ShoppingCartIcon,
  Architecture as ArchitectureIcon,
  Label as LabelIcon,
  Warehouse as WarehouseIcon,
  LocalShipping as LocalShippingIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  Store as StoreIcon,
  Assignment as AssignmentIcon,
  Factory as FactoryIcon,
  Security as SecurityIcon,
  Payment as PaymentIcon,
  LocalShipping as DeliveryIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface ReferenceBook {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  path: string;
}

interface ReferenceGroup {
  id: string;
  title: string;
  description: string;
  books: ReferenceBook[];
}

const referenceGroups: ReferenceGroup[] = [
  {
    id: 'organizations',
    title: 'Организации',
    description: 'Управление контрагентами и поставщиками',
    books: [
      { id: 'counterparties', title: 'Контрагенты', description: 'Управление контрагентами', icon: <BusinessIcon sx={{ fontSize: 40 }} />, color: '#d32f2f', path: '/reference/counterparties' }
    ]
  },
  {
    id: 'materials',
    title: 'Номенклатура',
    description: 'Управление материалами и их классификацией',
    books: [
      { id: 'materials', title: 'Номенклатура', description: 'Управление номенклатурой', icon: <ShoppingCartIcon sx={{ fontSize: 40 }} />, color: '#ff9800', path: '/reference/materials' },
      { id: 'categories', title: 'Категории', description: 'Управление категориями', icon: <CategoryIcon sx={{ fontSize: 40 }} />, color: '#1976d2', path: '/reference/categories' },
      { id: 'material-types', title: 'Типы материалов', description: 'Управление типами', icon: <InventoryIcon sx={{ fontSize: 40 }} />, color: '#388e3c', path: '/reference/material-types' },
      { id: 'units', title: 'Ед. измерения', description: 'Управление ед. изм.', icon: <StraightenIcon sx={{ fontSize: 40 }} />, color: '#f57c00', path: '/reference/units' }
    ]
  },
  {
    id: 'product-info',
    title: 'Характеристики товаров',
    description: 'Справочники для описания товаров и материалов',
    books: [
      { id: 'brands', title: 'Бренды', description: 'Управление брендами', icon: <LabelIcon sx={{ fontSize: 40 }} />, color: '#e91e63', path: '/reference/brands' },
      { id: 'manufacturers', title: 'Производители', description: 'Управление производителями', icon: <FactoryIcon sx={{ fontSize: 40 }} />, color: '#9c27b0', path: '/reference/manufacturers' },
      { id: 'warranties', title: 'Гарантии', description: 'Управление гарантиями', icon: <SecurityIcon sx={{ fontSize: 40 }} />, color: '#ff5722', path: '/reference/warranties' }
    ]
  },
  {
    id: 'infrastructure',
    title: 'Инфраструктура',
    description: 'Управление объектами и складами',
    books: [
      { id: 'projects', title: 'Объекты', description: 'Управление объектами и проектами', icon: <ArchitectureIcon sx={{ fontSize: 40 }} />, color: '#9c27b0', path: '/reference/projects' },
      { id: 'warehouses', title: 'Склады', description: 'Управление складами по проектам', icon: <WarehouseIcon sx={{ fontSize: 40 }} />, color: '#607d8b', path: '/reference/warehouses' }
    ]
  },
  {
    id: 'communication',
    title: 'Коммуникации',
    description: 'Управление контактами и связями',
    books: [
      { id: 'contact-types', title: 'Типы контактов', description: 'Управление типами контактов', icon: <ContactPhoneIcon sx={{ fontSize: 40 }} />, color: '#7b1fa2', path: '/reference/contact-types' }
    ]
  },
  {
    id: 'business-conditions',
    title: 'Бизнес-условия',
    description: 'Управление условиями оплаты и доставки',
    books: [
      { id: 'payment-conditions', title: 'Условия оплаты', description: 'Управление схемами оплаты', icon: <PaymentIcon sx={{ fontSize: 40 }} />, color: '#4caf50', path: '/reference/payment-conditions' },
      { id: 'delivery-conditions', title: 'Условия доставки', description: 'Управление условиями доставки', icon: <DeliveryIcon sx={{ fontSize: 40 }} />, color: '#2196f3', path: '/reference/delivery-conditions' },
      { id: 'delivery-types', title: 'Типы доставки', description: 'Справочник типов доставки', icon: <DeliveryIcon sx={{ fontSize: 40 }} />, color: '#1976d2', path: '/reference/delivery-types' }
    ]
  }
];

const ReferenceBooksPage: React.FC = () => {
  const navigate = useNavigate();

  const referenceItems = [
    {
      title: 'Контрагенты',
      description: 'Управление поставщиками и заказчиками',
      icon: <BusinessIcon sx={{ fontSize: 40 }} />,
      color: '#1976d2',
      path: '/counterparties'
    },
    {
      title: 'Материалы',
      description: 'Справочник материалов и товаров',
      icon: <InventoryIcon sx={{ fontSize: 40 }} />,
      color: '#388e3c',
      path: '/materials'
    },
    {
      title: 'Категории',
      description: 'Категории материалов',
      icon: <CategoryIcon sx={{ fontSize: 40 }} />,
      color: '#f57c00',
      path: '/reference/categories'
    },
    {
      title: 'Типы материалов',
      description: 'Типы и виды материалов',
      icon: <LocalShippingIcon sx={{ fontSize: 40 }} />,
      color: '#7b1fa2',
      path: '/reference/material-types'
    },
    {
      title: 'Единицы измерения',
      description: 'Единицы измерения материалов',
      icon: <SettingsIcon sx={{ fontSize: 40 }} />,
      color: '#d32f2f',
      path: '/reference/units'
    },
    {
      title: 'Склады',
      description: 'Управление складами',
      icon: <StoreIcon sx={{ fontSize: 40 }} />,
      color: '#1976d2',
      path: '/reference/warehouses'
    },
    {
      title: 'Проекты',
      description: 'Управление проектами',
      icon: <AssignmentIcon sx={{ fontSize: 40 }} />,
      color: '#388e3c',
      path: '/reference/projects'
    },
    {
      title: 'Типы контактов',
      description: 'Типы контактной информации',
      icon: <PersonIcon sx={{ fontSize: 40 }} />,
      color: '#f57c00',
      path: '/reference/contact-types'
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
        {referenceGroups.map((group) => (
          <Paper key={group.id} sx={{ mb: 4, p: 3 }}>
                        <Box sx={{ mb: 3 }}>
                          <Typography variant="h5" component="h2" gutterBottom>
                            {group.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {group.description}
                          </Typography>
                        </Box>
                        <Divider sx={{ mb: 3 }} />
                        <Grid container spacing={3}>
                          {group.books.map((book) => (
                            <Grid item xs={12} sm={6} md={4} key={book.id}>
                        <Card
                          sx={{
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            transition: 'transform 0.2s, box-shadow 0.2s, background 0.2s',
                            cursor: 'pointer',
                            '&:hover': {
                              transform: 'translateY(-4px)',
                              boxShadow: 4,
                              background: 'rgba(0,0,0,0.04)'
                            }
                          }}
                          onClick={() => navigate(book.path)}
                        >
                          <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                            <Box sx={{ color: book.color, mb: 2 }}>
                              {book.icon}
                            </Box>
                                  <Typography variant="h6" component="h3" gutterBottom>
                              {book.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {book.description}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                          ))}
                        </Grid>
                      </Paper>
                ))}
      </Box>

      {/* Быстрые действия */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Быстрые действия
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => navigate('/counterparties/new?role=SUPPLIER')}
          >
            Добавить поставщика
          </Button>
          <Button 
            variant="contained" 
            color="secondary"
            onClick={() => navigate('/counterparties/new?role=CUSTOMER')}
          >
            Добавить заказчика
          </Button>
          <Button 
            variant="outlined" 
            onClick={() => navigate('/materials/new')}
          >
            Добавить материал
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default ReferenceBooksPage; 