import React, { useEffect } from 'react';
import { Box, Typography, Paper, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AssignmentIcon from '@mui/icons-material/Assignment';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';

const SupplierRedirect: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Перенаправляем поставщика на тендеры через 3 секунды
    const timer = setTimeout(() => {
      navigate('/tenders');
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  const handleGoToTenders = () => {
    navigate('/tenders');
  };

  const handleGoToProposals = () => {
    navigate('/proposals');
  };

  return (
    <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <Paper sx={{ p: 4, maxWidth: 500, textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom color="primary">
          Доступ к дашборду ограничен
        </Typography>
        
        <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
          Дашборд содержит внутреннюю аналитику компании и доступен только для сотрудников.
        </Typography>

        <Typography variant="body2" sx={{ mb: 4, color: 'text.secondary' }}>
          Как поставщик, вы можете работать с доступными тендерами и предложениями.
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            startIcon={<AssignmentIcon />}
            onClick={handleGoToTenders}
            sx={{ minWidth: 200 }}
          >
            Просмотр тендеров
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<LocalOfferIcon />}
            onClick={handleGoToProposals}
            sx={{ minWidth: 200 }}
          >
            Мои предложения
          </Button>
        </Box>

        <Typography variant="caption" sx={{ mt: 3, display: 'block', color: 'text.secondary' }}>
          Автоматическое перенаправление через 3 секунды...
        </Typography>
      </Paper>
    </Box>
  );
};

export default SupplierRedirect; 