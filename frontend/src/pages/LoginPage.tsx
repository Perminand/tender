import React, { useState } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Container,
  Link,
  Divider,
} from '@mui/material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const LoginPage: React.FC = () => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(credentials);
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Ошибка входа:', error);
      setError(
        error.response?.data?.message || 
        'Ошибка при входе в систему. Проверьте логин и пароль.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value,
    });
  };

  const handleDemoLogin = async (username: string, password: string) => {
    setCredentials({ username, password });
    setError('');
    setIsLoading(true);

    try {
      await login({ username, password });
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Ошибка демо входа:', error);
      setError('Ошибка при демо входе');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 4,
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            width: '100%',
            maxWidth: 400,
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography variant="h4" component="h1" gutterBottom>
              Вход в систему
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Тендерная система отдела снабжения
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ mb: 3 }}>
            <TextField
              fullWidth
              label="Имя пользователя"
              name="username"
              value={credentials.username}
              onChange={handleChange}
              margin="normal"
              required
              autoComplete="username"
              autoFocus
            />
            <TextField
              fullWidth
              label="Пароль"
              name="password"
              type="password"
              value={credentials.password}
              onChange={handleChange}
              margin="normal"
              required
              autoComplete="current-password"
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={isLoading}
              sx={{ mt: 3, mb: 2 }}
            >
              {isLoading ? <CircularProgress size={24} /> : 'Войти'}
            </Button>
          </Box>

          <Divider sx={{ my: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Демо пользователи
            </Typography>
          </Divider>

          <Box sx={{ display: 'grid', gap: 1 }}>
            <Button
              variant="outlined"
              size="small"
              onClick={() => handleDemoLogin('admin', 'password')}
              disabled={isLoading}
            >
              Администратор
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={() => handleDemoLogin('manager', 'password')}
              disabled={isLoading}
            >
              Менеджер
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={() => handleDemoLogin('customer', 'password')}
              disabled={isLoading}
            >
              Заказчик
            </Button>
          </Box>


        </Paper>
      </Box>
    </Container>
  );
};

export default LoginPage; 