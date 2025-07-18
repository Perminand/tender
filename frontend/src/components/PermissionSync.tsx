import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usePermissions } from '../hooks/usePermissions';
import { api } from '../utils/api';

interface BackendPermissions {
  [endpoint: string]: {
    allowed: boolean;
    methods: string[];
  };
}

const PermissionSync: React.FC = () => {
  const { user } = useAuth();
  const { canAccessApi } = usePermissions();
  const [backendPermissions, setBackendPermissions] = useState<BackendPermissions>({});
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');

  // Синхронизация прав доступа с бэкендом
  const syncPermissions = async () => {
    if (!user) return;

    try {
      setSyncStatus('syncing');
      
      // Получаем права доступа с бэкенда
      const response = await api.get('/api/auth/permissions', {
        params: { username: user.username }
      });
      
      setBackendPermissions(response.data);
      setSyncStatus('success');
      
      // Проверяем расхождения между фронтендом и бэкендом
      const frontendEndpoints = Object.keys(backendPermissions);
      const mismatches = frontendEndpoints.filter(endpoint => {
        const backendAllowed = backendPermissions[endpoint]?.allowed;
        const frontendAllowed = canAccessApi(endpoint);
        return backendAllowed !== frontendAllowed;
      });

      if (mismatches.length > 0) {
        console.warn('Permission mismatches detected:', mismatches);
        // Здесь можно добавить логику для обработки расхождений
      }
      
    } catch (error) {
      console.error('Failed to sync permissions:', error);
      setSyncStatus('error');
    }
  };

  useEffect(() => {
    if (user) {
      syncPermissions();
    }
  }, [user]);

  // Периодическая синхронизация (каждые 5 минут)
  useEffect(() => {
    const interval = setInterval(() => {
      if (user) {
        syncPermissions();
      }
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [user]);

  // Компонент не рендерит ничего видимого
  return null;
};

export default PermissionSync; 