import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Container,
  Divider,
  Paper
} from '@mui/material';
import {
  Category as CategoryIcon,
  Inventory as InventoryIcon,
  Straighten as StraightenIcon,
  ContactPhone as ContactPhoneIcon,
  Business as BusinessIcon,
  ShoppingCart as ShoppingCartIcon,
  Architecture as ArchitectureIcon,
  Label as LabelIcon
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
      { id: 'counterparties', title: 'Контрагенты', description: 'Управление контрагентами', icon: <BusinessIcon sx={{ fontSize: 40 }} />, color: '#d32f2f', path: '/reference/counterparties' },
      { id: 'supplier-material-names', title: 'Названия у поставщиков', description: 'Управление названиями материалов у поставщиков', icon: <LabelIcon sx={{ fontSize: 40 }} />, color: '#795548', path: '/reference/supplier-material-names' }
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
    id: 'infrastructure',
    title: 'Инфраструктура',
    description: 'Управление объектами',
    books: [
      { id: 'projects', title: 'Объекты', description: 'Управление объектами и проектами', icon: <ArchitectureIcon sx={{ fontSize: 40 }} />, color: '#9c27b0', path: '/reference/projects' }
    ]
  },
  {
    id: 'communication',
    title: 'Коммуникации',
    description: 'Управление контактами и связями',
    books: [
      { id: 'contact-types', title: 'Типы контактов', description: 'Управление типами контактов', icon: <ContactPhoneIcon sx={{ fontSize: 40 }} />, color: '#7b1fa2', path: '/reference/contact-types' }
    ]
  }
];

const ReferenceBooksPage: React.FC = () => {
  const navigate = useNavigate();

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
    </Container>
  );
};

export default ReferenceBooksPage; 