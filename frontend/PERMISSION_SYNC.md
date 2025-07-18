# 🔐 Синхронизация прав доступа между фронтендом и бэкендом

## Обзор

Система синхронизации прав доступа обеспечивает согласованность между фронтендом и бэкендом, предотвращая ситуации, когда пользователь видит элементы интерфейса, к которым у него нет доступа на сервере.

## Архитектура

### 1. Централизованная конфигурация ролей (`config/roles.ts`)

```typescript
export const ROLE_PERMISSIONS: RolePermissions = {
  'ROLE_ADMIN': {
    menuItems: ['dashboard', 'contracts', 'settings', ...],
    apiEndpoints: ['/api/dashboard', '/api/contracts/*', ...],
    features: ['dashboard', 'contract_management', ...],
    defaultRoute: '/dashboard'
  },
  // ... другие роли
};
```

### 2. Хук для проверки прав (`hooks/usePermissions.ts`)

```typescript
const { canAccess, hasRole, canAccessApi } = usePermissions();

// Проверка доступа к функции
if (canAccess('dashboard')) { ... }

// Проверка доступа к API
if (canAccessApi('/api/contracts')) { ... }
```

### 3. Автоматическая синхронизация (`components/PermissionSync.tsx`)

- Проверяет права доступа с бэкенда каждые 5 минут
- Выявляет расхождения между фронтендом и бэкендом
- Логирует предупреждения при несоответствиях

## Использование

### Проверка прав в компонентах

```typescript
import { usePermissions } from '../hooks/usePermissions';

const MyComponent = () => {
  const { canAccess, hasRole } = usePermissions();

  return (
    <div>
      {canAccess('dashboard') && <DashboardButton />}
      {hasRole('ROLE_ADMIN') && <AdminPanel />}
    </div>
  );
};
```

### Защищенные API запросы

```typescript
import { useApiWithPermissions } from '../utils/apiWithPermissions';

const MyComponent = () => {
  const api = useApiWithPermissions();

  const fetchData = async () => {
    try {
      // Автоматически проверяет права доступа
      const response = await api.get('/api/contracts');
    } catch (error) {
      if (error.message.includes('Access denied')) {
        // Обработка отказа в доступе
      }
    }
  };
};
```

### Фильтрация меню

```typescript
// В Layout.tsx
const filteredMenuStructure = menuStructure.map(section => ({
  ...section,
  items: section.items.filter(item => canAccess(item.to))
}));
```

## Синхронизация с бэкендом

### Требования к бэкенду

Бэкенд должен предоставлять эндпоинт `/api/auth/permissions`:

```json
{
  "/api/dashboard": {
    "allowed": true,
    "methods": ["GET"]
  },
  "/api/contracts/*": {
    "allowed": true,
    "methods": ["GET", "POST", "PUT", "DELETE"]
  }
}
```

### Обработка расхождений

При обнаружении расхождений система:

1. Логирует предупреждение в консоль
2. Может показать уведомление пользователю
3. Автоматически обновляет права доступа

## Безопасность

### Принципы

1. **Принцип наименьших привилегий** - пользователь получает минимально необходимые права
2. **Защита на уровне API** - все запросы проверяются на бэкенде
3. **UI как дополнительный слой** - интерфейс скрывает недоступные функции
4. **Периодическая синхронизация** - права обновляются автоматически

### Рекомендации

1. **Всегда проверяйте права на бэкенде** - фронтенд только для UX
2. **Используйте централизованную конфигурацию** - избегайте дублирования
3. **Логируйте все проверки прав** - для аудита безопасности
4. **Тестируйте граничные случаи** - проверяйте поведение при изменении ролей

## Добавление новых ролей

1. Добавьте роль в `config/roles.ts`
2. Определите права доступа
3. Обновите бэкенд для поддержки новой роли
4. Протестируйте синхронизацию

## Мониторинг

Система автоматически отслеживает:

- Успешность синхронизации
- Расхождения между фронтендом и бэкендом
- Частоту отказов в доступе
- Время отклика API

## Отладка

Для отладки проблем с правами доступа:

1. Проверьте консоль браузера на предупреждения
2. Убедитесь, что бэкенд возвращает корректные права
3. Проверьте, что роли пользователя актуальны
4. Убедитесь, что конфигурация ролей синхронизирована 