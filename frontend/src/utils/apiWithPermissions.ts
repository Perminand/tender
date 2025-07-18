import { api } from './api';
import { usePermissions } from '../hooks/usePermissions';

// Интерцептор для проверки прав доступа перед API запросами
export const createApiWithPermissions = () => {
  const { canAccessApi } = usePermissions();

  const apiWithPermissions = {
    get: async (url: string, config?: any) => {
      if (!canAccessApi(url)) {
        throw new Error(`Access denied to endpoint: ${url}`);
      }
      return api.get(url, config);
    },

    post: async (url: string, data?: any, config?: any) => {
      if (!canAccessApi(url)) {
        throw new Error(`Access denied to endpoint: ${url}`);
      }
      return api.post(url, data, config);
    },

    put: async (url: string, data?: any, config?: any) => {
      if (!canAccessApi(url)) {
        throw new Error(`Access denied to endpoint: ${url}`);
      }
      return api.put(url, data, config);
    },

    delete: async (url: string, config?: any) => {
      if (!canAccessApi(url)) {
        throw new Error(`Access denied to endpoint: ${url}`);
      }
      return api.delete(url, config);
    },

    patch: async (url: string, data?: any, config?: any) => {
      if (!canAccessApi(url)) {
        throw new Error(`Access denied to endpoint: ${url}`);
      }
      return api.patch(url, data, config);
    }
  };

  return apiWithPermissions;
};

// Хук для использования API с проверкой прав
export const useApiWithPermissions = () => {
  return createApiWithPermissions();
}; 