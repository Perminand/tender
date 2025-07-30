import React from 'react';
import { Box, Typography, Container, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const TestPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Container>
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Тестовая страница
        </Typography>
        <Typography variant="body1" sx={{ mb: 4 }}>
          Эта страница создана для тестирования роутинга.
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button 
            variant="contained" 
            onClick={() => navigate('/reference/brands')}
          >
            Перейти к брендам
          </Button>
          <Button 
            variant="contained" 
            onClick={() => navigate('/reference/manufacturers')}
          >
            Перейти к производителям
          </Button>
          <Button 
            variant="contained" 
            onClick={() => navigate('/reference/warranties')}
          >
            Перейти к гарантиям
          </Button>
          <Button 
            variant="outlined" 
            onClick={() => navigate('/reference')}
          >
            Вернуться к справочникам
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default TestPage; 