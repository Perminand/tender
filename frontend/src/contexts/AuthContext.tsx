import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '../utils/api';

export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  companyName?: string;
  companyId?: string;
  roles: string[];
}

export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  userId: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  companyName?: string;
  companyId?: string;
  roles: string[];
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName?: string;
  middleName?: string;
  phone?: string;
  companyId?: string;
  roles?: string[];
}

interface AuthContextType extends AuthState {
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => void;
  refreshAuth: () => Promise<void>;
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: localStorage.getItem('token'),
    refreshToken: localStorage.getItem('refreshToken'),
    isAuthenticated: false,
    isLoading: true,
  });

  // Проверяем токен при загрузке приложения
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      const refreshToken = localStorage.getItem('refreshToken');

      if (token && refreshToken) {
        try {
          // Проверяем валидность токена
          await refreshAuth();
        } catch (error) {
          console.error('Ошибка при инициализации аутентификации:', error);
          logout();
        }
      }
      setAuthState(prev => ({ ...prev, isLoading: false }));
    };

    initializeAuth();
  }, []);

  // Настройка перехватчика для автоматического добавления токена
  useEffect(() => {
    // Логируем токены при старте
    const token = localStorage.getItem('token');
    const refreshToken = localStorage.getItem('refreshToken');
    console.log('[AuthContext] Текущий токен:', token);
    console.log('[AuthContext] Текущий refreshToken:', refreshToken);
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      console.log('[AuthContext] Authorization header установлен при старте');
    }

    const requestInterceptor = api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          console.log('Добавлен токен к запросу:', config.url);
        } else {
          console.log('Токен не найден для запроса:', config.url);
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    const responseInterceptor = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            await refreshAuth();
            // Повторяем оригинальный запрос с новым токеном
            const token = localStorage.getItem('token');
            if (token) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return api(originalRequest);
          } catch (refreshError) {
            logout();
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.request.eject(requestInterceptor);
      api.interceptors.response.eject(responseInterceptor);
    };
  }, [authState.token]);

  const login = async (credentials: LoginRequest) => {
    try {
      const response = await api.post<LoginResponse>('/api/auth/login', credentials);
      const { token, refreshToken, ...userData } = response.data;

      console.log('Получен токен при входе:', token ? 'токен получен' : 'токен отсутствует');

      const user: User = {
        id: userData.userId,
        username: userData.username,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        companyName: userData.companyName,
        companyId: userData.companyId,
        roles: userData.roles,
      };

      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);

      console.log('Токен сохранен в localStorage');

      setAuthState({
        user,
        token,
        refreshToken,
        isAuthenticated: true,
        isLoading: false,
      });

      console.log('Состояние аутентификации обновлено');
    } catch (error) {
      console.error('Ошибка при входе:', error);
      throw error;
    }
  };

  const register = async (userData: RegisterRequest) => {
    try {
      const response = await api.post<LoginResponse>('/api/auth/register', userData);
      const { token, refreshToken, ...userInfo } = response.data;

      const user: User = {
        id: userInfo.userId,
        username: userInfo.username,
        email: userInfo.email,
        firstName: userInfo.firstName,
        lastName: userInfo.lastName,
        companyName: userInfo.companyName,
        companyId: userInfo.companyId,
        roles: userInfo.roles,
      };

      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);

      setAuthState({
        user,
        token,
        refreshToken,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      console.error('Ошибка при регистрации:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    setAuthState({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
    });
  };

  const refreshAuth = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('Refresh token not found');
    }

    try {
      const response = await api.post<LoginResponse>('/api/auth/refresh', {
        refreshToken,
      });
      const { token, refreshToken: newRefreshToken, ...userData } = response.data;

      const user: User = {
        id: userData.userId,
        username: userData.username,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        companyName: userData.companyName,
        companyId: userData.companyId,
        roles: userData.roles,
      };

      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', newRefreshToken);

      setAuthState({
        user,
        token,
        refreshToken: newRefreshToken,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      console.error('Ошибка при обновлении токена:', error);
      throw error;
    }
  };

  const hasRole = (role: string): boolean => {
    return authState.user?.roles.includes(role) || false;
  };

  const hasAnyRole = (roles: string[]): boolean => {
    return authState.user?.roles.some(role => roles.includes(role)) || false;
  };

  const value: AuthContextType = {
    ...authState,
    login,
    register,
    logout,
    refreshAuth,
    hasRole,
    hasAnyRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 