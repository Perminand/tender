import axios from 'axios';

// Определяем базовый URL в зависимости от окружения
const getBaseURL = () => {
  if (import.meta.env.DEV) {
    return 'http://localhost:8080';
  }
  // В продакшене используем тот же хост, но порт 8080
  // Проверяем, что мы не на localhost в продакшене
  const hostname = window.location.hostname;
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    console.warn('Frontend running on localhost in production mode');
  }
  return `${window.location.protocol}//${hostname}:8080`;
};

// Общий HTTP-клиент для API
export const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 секунд таймаут
});

// Добавляем перехватчик для логирования ошибок
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);

// Функция для добавления токена к запросам
export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

// Функция для получения токена из localStorage
export const getAuthToken = (): string | null => {
  return localStorage.getItem('token');
};

// Функция для удаления токена
export const removeAuthToken = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  delete api.defaults.headers.common['Authorization'];
};

export interface AnalyticsStats {
  totalTenders: number;
  tendersWithProposals: number;
  tendersWithoutProposals: number;
  totalProposals: number;
  averageProposalsPerTender: number;
  activeTenders: number;
  completedTenders: number;
  cancelledTenders: number;
}

export const getAnalyticsStats = async (): Promise<AnalyticsStats> => {
  try {
    const response = await api.get('/api/analytics/stats');
    return response.data;
  } catch (error) {
    console.error('Ошибка при получении статистики аналитики:', error);
    throw error;
  }
}; 