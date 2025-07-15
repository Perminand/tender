import axios from 'axios';

// Общий HTTP-клиент для API
export const api = axios.create({
  baseURL: 'http://localhost:8080',
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
    const response = await fetch(`http://localhost:8080/api/analytics/stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Ошибка при получении статистики аналитики');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Ошибка при получении статистики аналитики:', error);
    throw error;
  }
}; 