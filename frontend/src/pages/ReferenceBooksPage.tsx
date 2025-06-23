import React, { useState, useEffect } from 'react';
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
  Architecture as ArchitectureIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';

const initialBooks = [
  { id: 'counterparties', title: 'Контрагенты', description: 'Управление контрагентами', icon: <BusinessIcon sx={{ fontSize: 40 }} />, color: '#d32f2f', path: '/reference/counterparties' },
  { id: 'materials', title: 'Номенклатура', description: 'Управление номенклатурой', icon: <ShoppingCartIcon sx={{ fontSize: 40 }} />, color: '#ff9800', path: '/reference/materials' },
  { id: 'project-objects', title: 'Объекты проекта', description: 'Управление объектами', icon: <ArchitectureIcon sx={{ fontSize: 40 }} />, color: '#9c27b0', path: '/reference/project-objects' },
  { id: 'categories', title: 'Категории', description: 'Управление категориями', icon: <CategoryIcon sx={{ fontSize: 40 }} />, color: '#1976d2', path: '/reference/categories' },
  { id: 'material-types', title: 'Типы материалов', description: 'Управление типами', icon: <InventoryIcon sx={{ fontSize: 40 }} />, color: '#388e3c', path: '/reference/material-types' },
  { id: 'units', title: 'Ед. измерения', description: 'Управление ед. изм.', icon: <StraightenIcon sx={{ fontSize: 40 }} />, color: '#f57c00', path: '/reference/units' },
  { id: 'contact-types', title: 'Типы контактов', description: 'Управление типами контактов', icon: <ContactPhoneIcon sx={{ fontSize: 40 }} />, color: '#7b1fa2', path: '/reference/contact-types' }
];

const REFERENCE_ORDER_KEY = 'referenceBooksOrder';

const ReferenceBooksPage: React.FC = () => {
  const navigate = useNavigate();
  const [referenceBooks, setReferenceBooks] = useState(initialBooks);

  useEffect(() => {
    const savedOrder = localStorage.getItem(REFERENCE_ORDER_KEY);
    if (savedOrder) {
      try {
        const orderedIds = JSON.parse(savedOrder);
        const orderedBooks = orderedIds.map((id: string) => initialBooks.find(book => book.id === id)).filter(Boolean);
        const remainingBooks = initialBooks.filter(book => !orderedIds.includes(book.id));
        setReferenceBooks([...orderedBooks, ...remainingBooks]);
      } catch (e) {
        console.error("Failed to parse reference books order from localStorage", e);
        setReferenceBooks(initialBooks);
      }
    }
  }, []);

  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result;
    if (!destination) return;

    const items = Array.from(referenceBooks);
    const [reorderedItem] = items.splice(source.index, 1);
    items.splice(destination.index, 0, reorderedItem);

    setReferenceBooks(items);
    localStorage.setItem(REFERENCE_ORDER_KEY, JSON.stringify(items.map(item => item.id)));
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Справочники
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Управление справочными данными системы
        </Typography>

        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="reference-books" direction="horizontal">
            {(provided) => (
              <Grid container spacing={3} {...provided.droppableProps} ref={provided.innerRef}>
                {referenceBooks.map((book, index) => (
                  <Draggable key={book.id} draggableId={book.id} index={index}>
                    {(provided, snapshot) => (
                      <Grid item xs={12} sm={6} md={4} ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                        <Card
                          sx={{
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            transition: 'transform 0.2s, box-shadow 0.2s',
                            transform: snapshot.isDragging ? 'rotate(3deg)' : 'none',
                            boxShadow: snapshot.isDragging ? 8 : 1,
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
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </Grid>
            )}
          </Droppable>
        </DragDropContext>
      </Box>
    </Container>
  );
};

export default ReferenceBooksPage; 