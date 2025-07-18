import axios from 'axios';

// Определяем базовый URL в зависимости от окружения
const getBaseURL = () => {
  if (import.meta.env.DEV) {
    return 'http://localhost:8080';
  }
  // В продакшене используем текущий хост
  return window.location.origin.replace(':5173', ':8080');
};

// Общий HTTP-клиент для API
export const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
});

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