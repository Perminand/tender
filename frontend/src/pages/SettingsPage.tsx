import React, { useState, useEffect } from 'react';
import {
  Box, Button, Grid, Paper, TextField, Typography, Alert, Snackbar, CircularProgress,
  Accordion, AccordionSummary, AccordionDetails, List, ListItem, ListItemIcon, ListItemText,
  FormControl, InputLabel, Select, MenuItem, Chip, Divider
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LinkIcon from '@mui/icons-material/Link';
import { useNavigate } from 'react-router-dom';
import { 
  emailProviders, 
  detectEmailProvider, 
  getProviderByName, 
  getProviderSuggestions,
  EmailProvider 
} from '../utils/emailProviders';
import GmailSetupGuide from '../components/GmailSetupGuide';

interface Settings {
  fnsApiKey: string;
  fnsApiUsage: string;
}

interface EmailSettings {
  smtpHost: string;
  smtpPort: string;
  username: string;
  password: string;
  fromEmail: string;
  fromName: string;
  enabled: boolean;
  useSsl: boolean;
  useTls: boolean;
}

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState<Settings>({ fnsApiKey: '', fnsApiUsage: '' });
  const [emailSettings, setEmailSettings] = useState<EmailSettings>({
    smtpHost: 'smtp.gmail.com',
    smtpPort: '587',
    username: '',
    password: '',
    fromEmail: '',
    fromName: '',
    enabled: false,
    useSsl: false,
    useTls: true,
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingUsage, setIsLoadingUsage] = useState(false);
  const [isLoadingEmail, setIsLoadingEmail] = useState(false);
  const [isTestingEmail, setIsTestingEmail] = useState(false);
  const [usageInfo, setUsageInfo] = useState<string | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [showProviderInstructions, setShowProviderInstructions] = useState(false);
  const [showGmailGuide, setShowGmailGuide] = useState(false);

  useEffect(() => {
    // Загружаем настройки с backend
    loadSettings();
    loadEmailSettings();
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

  const loadEmailSettings = async () => {
    try {
      const response = await fetch('/api/settings/email');
      if (response.ok) {
        const data = await response.json();
        setEmailSettings(data);
      } else {
        console.warn('Не удалось загрузить настройки email');
      }
    } catch (error) {
      console.warn('Ошибка при загрузке настроек email:', error);
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

  const handleSaveEmailSettings = async () => {
    setIsLoadingEmail(true);
    try {
      const response = await fetch('/api/settings/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailSettings),
      });
      
      if (response.ok) {
        setSuccessMessage('Настройки email успешно сохранены!');
        setShowSuccess(true);
      } else {
        const errorText = await response.text();
        setErrorMessage(errorText);
        setShowError(true);
      }
    } catch (error) {
      setErrorMessage('Ошибка при сохранении настроек email');
      setShowError(true);
    } finally {
      setIsLoadingEmail(false);
    }
  };

  const handleTestEmailConnection = async () => {
    setIsTestingEmail(true);
    try {
      const response = await fetch('/api/settings/email/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailSettings),
      });
      
      if (response.ok) {
        setSuccessMessage('Соединение с SMTP сервером успешно установлено!');
        setShowSuccess(true);
      } else {
        const errorText = await response.text();
        setErrorMessage(errorText);
        setShowError(true);
      }
    } catch (error) {
      setErrorMessage('Ошибка при тестировании соединения email');
      setShowError(true);
    } finally {
      setIsTestingEmail(false);
    }
  };

  const handleEmailChange = (field: keyof EmailSettings, value: string | boolean) => {
    const newSettings = { ...emailSettings, [field]: value };
    setEmailSettings(newSettings);
    
    // Автоопределение провайдера при изменении email
    if (field === 'username' && typeof value === 'string') {
      const detectedProvider = detectEmailProvider(value);
      if (detectedProvider) {
        setSelectedProvider(detectedProvider.name);
        // Автоматически заполняем настройки провайдера
        setEmailSettings({
          ...newSettings,
          smtpHost: detectedProvider.smtpHost,
          smtpPort: detectedProvider.smtpPort,
          useSsl: detectedProvider.useSsl,
          useTls: detectedProvider.useTls,
          fromEmail: value
        });
      }
    }
  };

  const handleProviderChange = (providerName: string) => {
    setSelectedProvider(providerName);
    const provider = getProviderByName(providerName);
    if (provider) {
      setEmailSettings({
        ...emailSettings,
        smtpHost: provider.smtpHost,
        smtpPort: provider.smtpPort,
        useSsl: provider.useSsl,
        useTls: provider.useTls
      });
    }
  };

  const getCurrentProvider = (): EmailProvider | null => {
    if (selectedProvider) {
      return getProviderByName(selectedProvider);
    }
    return detectEmailProvider(emailSettings.username);
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

      {/* Email настройки */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Настройки Email уведомлений</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Настройте SMTP сервер для отправки email уведомлений о тендерах и предложениях.
        </Typography>
        
        {/* Выбор провайдера */}
        <Box sx={{ mb: 3 }}>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Email провайдер</InputLabel>
            <Select
              value={selectedProvider}
              onChange={(e) => handleProviderChange(e.target.value)}
              label="Email провайдер"
            >
              <MenuItem value="">
                <em>Автоопределение по email</em>
              </MenuItem>
              {emailProviders.map((provider) => (
                <MenuItem key={provider.name} value={provider.name}>
                  {provider.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          {getCurrentProvider() && (
            <Alert severity="info" sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip 
                  label="Автоопределен" 
                  color="success" 
                  size="small" 
                  variant="outlined"
                />
                <Typography variant="body2">
                  <strong>{getCurrentProvider()?.name}:</strong> {getCurrentProvider()?.description}
                </Typography>
              </Box>
              {getCurrentProvider()?.name === 'Gmail' && (
                <Box sx={{ mt: 1 }}>
                  <Typography variant="body2" sx={{ color: 'warning.main', mb: 1 }}>
                    ⚠️ <strong>Важно:</strong> Для Gmail необходимо использовать пароль приложения, а не обычный пароль!
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => setShowGmailGuide(true)}
                    sx={{ fontSize: '0.75rem' }}
                  >
                    Подробная инструкция по настройке Gmail
                  </Button>
                </Box>
              )}
            </Alert>
          )}
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              label="Email пользователя"
              fullWidth
              type="email"
              value={emailSettings.username}
              onChange={(e) => handleEmailChange('username', e.target.value)}
              placeholder="your-email@gmail.com"
              helperText="Email для авторизации на SMTP сервере"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="Пароль"
              fullWidth
              type="password"
              value={emailSettings.password}
              onChange={(e) => handleEmailChange('password', e.target.value)}
              placeholder="Пароль или app password"
              helperText="Пароль для авторизации на SMTP сервере"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="SMTP хост"
              fullWidth
              value={emailSettings.smtpHost}
              onChange={(e) => handleEmailChange('smtpHost', e.target.value)}
              placeholder="smtp.gmail.com"
              helperText="Адрес SMTP сервера"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="SMTP порт"
              fullWidth
              value={emailSettings.smtpPort}
              onChange={(e) => handleEmailChange('smtpPort', e.target.value)}
              placeholder="587"
              helperText="Порт SMTP сервера"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="Email отправителя"
              fullWidth
              type="email"
              value={emailSettings.fromEmail}
              onChange={(e) => handleEmailChange('fromEmail', e.target.value)}
              placeholder="noreply@yourcompany.com"
              helperText="Email, который будет указан как отправитель"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="Имя отправителя"
              fullWidth
              value={emailSettings.fromName}
              onChange={(e) => handleEmailChange('fromName', e.target.value)}
              placeholder="Система тендеров"
              helperText="Имя, которое будет отображаться как отправитель"
            />
          </Grid>
        </Grid>

        <Box sx={{ mt: 3, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <Button
            variant="outlined"
            onClick={() => handleEmailChange('enabled', !emailSettings.enabled)}
            color={emailSettings.enabled ? "success" : "primary"}
          >
            {emailSettings.enabled ? "✓ Включено" : "✗ Отключено"}
          </Button>
          <Button
            variant="outlined"
            onClick={() => handleEmailChange('useSsl', !emailSettings.useSsl)}
            color={emailSettings.useSsl ? "success" : "primary"}
          >
            {emailSettings.useSsl ? "✓ SSL" : "✗ SSL"}
          </Button>
          <Button
            variant="outlined"
            onClick={() => handleEmailChange('useTls', !emailSettings.useTls)}
            color={emailSettings.useTls ? "success" : "primary"}
          >
            {emailSettings.useTls ? "✓ TLS" : "✗ TLS"}
          </Button>
          
          {getCurrentProvider() && (
            <Button
              variant="text"
              onClick={() => setShowProviderInstructions(!showProviderInstructions)}
              size="small"
            >
              {showProviderInstructions ? "Скрыть инструкции" : "Показать инструкции"}
            </Button>
          )}
        </Box>

        {/* Инструкции для провайдера */}
        {showProviderInstructions && getCurrentProvider() && (
          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Инструкции для {getCurrentProvider()?.name}:
            </Typography>
            <List dense>
              {getCurrentProvider()?.instructions.map((instruction, index) => (
                <ListItem key={index} sx={{ py: 0.5 }}>
                  <ListItemIcon sx={{ minWidth: 24 }}>
                    <CheckCircleIcon fontSize="small" color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary={instruction}
                    primaryTypographyProps={{ variant: 'body2' }}
                  />
                </ListItem>
              ))}
            </List>
          </Alert>
        )}

        <Box sx={{ mt: 3 }}>
          <Button 
            variant="contained" 
            onClick={handleSaveEmailSettings} 
            disabled={isLoadingEmail}
            sx={{ mr: 1 }}
          >
            {isLoadingEmail ? <CircularProgress size={24} /> : 'Сохранить настройки email'}
          </Button>
          <Button 
            variant="outlined" 
            onClick={handleTestEmailConnection}
            disabled={isTestingEmail}
            sx={{ mr: 1 }}
          >
            {isTestingEmail ? <CircularProgress size={24} /> : 'Тестировать соединение'}
          </Button>
        </Box>

        <Alert severity="info" sx={{ mt: 2 }}>
          <Typography variant="body2">
            <strong>Советы:</strong> 
            {getCurrentProvider() ? 
              `Для ${getCurrentProvider()?.name} используйте порт ${getCurrentProvider()?.smtpPort} с ${getCurrentProvider()?.useSsl ? 'SSL' : getCurrentProvider()?.useTls ? 'TLS' : 'обычным соединением'}.` :
              'Выберите провайдера или введите email для автоопределения настроек.'
            }
          </Typography>
        </Alert>
      </Paper>

      {/* Gmail Setup Guide */}
      <GmailSetupGuide 
        open={showGmailGuide} 
        onClose={() => setShowGmailGuide(false)} 
      />

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