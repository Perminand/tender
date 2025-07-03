import React, { useState, useEffect } from 'react';
import {
  Box, Button, Grid, Paper, TextField, Typography, Alert, Snackbar, CircularProgress,
  Accordion, AccordionSummary, AccordionDetails, List, ListItem, ListItemIcon, ListItemText
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LinkIcon from '@mui/icons-material/Link';
import { useNavigate } from 'react-router-dom';

interface Settings {
  fnsApiKey: string;
  fnsApiUsage: string;
}

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState<Settings>({ fnsApiKey: '', fnsApiUsage: '' });
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingUsage, setIsLoadingUsage] = useState(false);
  const [usageInfo, setUsageInfo] = useState<string | null>(null);

  useEffect(() => {
    // Загружаем настройки с backend
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/settings');
      if (response.ok) {
        const data = await response.json();
        setSettings({
          fnsApiKey: data.fnsApiKey || '',
          fnsApiUsage: data.fnsApiUsage || '',
        });
      } else {
        setErrorMessage('Ошибка при загрузке настроек');
        setShowError(true);
      }
    } catch (error) {
      setErrorMessage('Ошибка при загрузке настроек');
      setShowError(true);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/settings/fns-api-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: settings.fnsApiKey }),
      });
      
      if (response.ok) {
        setSuccessMessage('API-ключ успешно сохранен!');
        setShowSuccess(true);
        await loadSettings(); // Перезагружаем настройки
      } else {
        const errorText = await response.text();
        setErrorMessage(errorText);
        setShowError(true);
      }
    } catch (error) {
      setErrorMessage('Ошибка при сохранении настроек');
      setShowError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestApi = async () => {
    if (!settings.fnsApiKey || !settings.fnsApiKey.trim()) {
      setErrorMessage('Введите API-ключ для тестирования');
      setShowError(true);
      return;
    }

    setIsLoading(true);
    try {
      // Тестируем API с тестовым ИНН (например, ИНН Яндекса)
      const response = await fetch(`https://api-fns.ru/api/search?q=7736207543&key=${settings.fnsApiKey}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.items && data.items.length > 0) {
        setSuccessMessage('API-ключ работает корректно!');
        setShowSuccess(true);
      } else {
        setErrorMessage('API-ключ работает, но данные не найдены. Проверьте ключ.');
        setShowError(true);
      }
    } catch (error) {
      setErrorMessage('Ошибка при тестировании API. Проверьте правильность ключа.');
      setShowError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckUsage = async () => {
    if (!settings.fnsApiKey || !settings.fnsApiKey.trim()) {
      setErrorMessage('Сначала введите и сохраните API-ключ');
      setShowError(true);
      return;
    }

    setIsLoadingUsage(true);
    setUsageInfo(null);
    try {
      const response = await fetch('/api/settings/fns-api-usage');
      
      if (response.ok) {
        const usage = await response.text();
        setUsageInfo(usage);
      } else {
        const errorText = await response.text();
        setErrorMessage(errorText);
        setShowError(true);
        setUsageInfo('Не удалось загрузить данные.');
      }
    } catch (error) {
      setErrorMessage('Ошибка при получении информации об остатке');
      setShowError(true);
      setUsageInfo('Не удалось загрузить данные.');
    } finally {
      setIsLoadingUsage(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Настройки системы</Typography>
      
      {/* Инструкция по получению API-ключа */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Как получить API-ключ ФНС</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Для автоматического заполнения данных контрагентов по ИНН необходимо получить бесплатный API-ключ от сервиса ФНС.
        </Typography>
        
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1">📋 Пошаговая инструкция</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <List>
              <ListItem>
                <ListItemIcon>
                  <CheckCircleIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="1. Перейдите на сайт API-ФНС"
                  secondary={
                    <>
                      Откройте сайт{' '}
                      <a href="https://api-fns.ru/" target="_blank" rel="noopener noreferrer" style={{ color: '#1976d2' }}>
                        api-fns.ru
                      </a>
                      {' '}в новом окне
                    </>
                  }
                />
              </ListItem>
              
              <ListItem>
                <ListItemIcon>
                  <CheckCircleIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="2. Зарегистрируйтесь на сайте"
                  secondary="Нажмите кнопку 'Регистрация' и заполните форму регистрации"
                />
              </ListItem>
              
              <ListItem>
                <ListItemIcon>
                  <CheckCircleIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="3. Подтвердите email"
                  secondary="Проверьте почту и перейдите по ссылке для подтверждения регистрации"
                />
              </ListItem>
              
              <ListItem>
                <ListItemIcon>
                  <CheckCircleIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="4. Войдите в личный кабинет"
                  secondary="Используйте логин и пароль для входа в систему"
                />
              </ListItem>
              
              <ListItem>
                <ListItemIcon>
                  <CheckCircleIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="5. Проверьте почту для получения ключа"
                  secondary="API-ключ будет отправлен на вашу почту после активации аккаунта"
                />
              </ListItem>
              
              <ListItem>
                <ListItemIcon>
                  <CheckCircleIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="6. Вставьте ключ в поле ниже"
                  secondary="Скопируйте ключ из письма, вставьте его в поле 'API-ключ ФНС' и сохраните настройки"
                />
              </ListItem>
            </List>
            
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Важно:</strong> Бесплатный тариф включает 100 запросов в месяц.
                Этого достаточно для тестирования и небольшого объема работы.
              </Typography>
            </Alert>
          </AccordionDetails>
        </Accordion>
      </Paper>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>API ФНС</Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12} md={8}>
            <TextField
              label="API-ключ ФНС"
              fullWidth
              type="password"
              value={settings.fnsApiKey}
              onChange={(e) => setSettings({ ...settings, fnsApiKey: e.target.value })}
              placeholder="Введите ваш API-ключ от api-fns.ru"
              helperText="Ключ будет сохранен в базе данных и использован для автозаполнения данных контрагентов"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Button
              variant="outlined"
              onClick={handleTestApi}
              disabled={isLoading}
              sx={{ height: '56px', width: '100%' }}
            >
              {isLoading ? <CircularProgress size={20} /> : 'Тестировать API'}
            </Button>
          </Grid>
        </Grid>

        {settings.fnsApiUsage && (
          <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="subtitle2" gutterBottom>Информация об использовании:</Typography>
            <Typography variant="body2">{settings.fnsApiUsage}</Typography>
          </Box>
        )}
        
        <Box sx={{ mt: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
          {isLoadingUsage && <CircularProgress size={24} />}
          {usageInfo && (
              <Typography variant="body2" color="text.secondary">{usageInfo}</Typography>
          )}
        </Box>
        
        <Box sx={{ mt: 3 }}>
          <Button 
            variant="contained" 
            onClick={handleSave} 
            disabled={isLoading}
            sx={{ mr: 1 }}
          >
            {isLoading ? <CircularProgress size={24} /> : 'Сохранить настройки'}
          </Button>
          <Button variant="outlined" onClick={() => navigate('/counterparties')}>
            Вернуться к контрагентам
          </Button>
        </Box>
      </Paper>

      <Snackbar
        open={showSuccess}
        autoHideDuration={4000}
        onClose={() => setShowSuccess(false)}
      >
        <Alert onClose={() => setShowSuccess(false)} severity="success">
          {successMessage}
        </Alert>
      </Snackbar>

      <Snackbar
        open={showError}
        autoHideDuration={6000}
        onClose={() => setShowError(false)}
      >
        <Alert onClose={() => setShowError(false)} severity="error">
          {errorMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SettingsPage; 