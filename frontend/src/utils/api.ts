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