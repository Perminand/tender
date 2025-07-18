# JWT Аутентификация для системы отдела снабжения

## Обзор

Система JWT аутентификации реализована для безопасного доступа к API системы отдела снабжения. Аутентификация основана на токенах JWT (JSON Web Tokens) и поддерживает различные роли пользователей.

## Архитектура

### Компоненты системы

1. **User** - модель пользователя с ролями и связью с компанией
2. **JwtService** - сервис для работы с JWT токенами
3. **AuthService** - сервис аутентификации и регистрации
4. **CustomUserDetailsService** - сервис для Spring Security
5. **JwtAuthenticationFilter** - фильтр для обработки JWT токенов
6. **SecurityConfig** - конфигурация безопасности

### Роли пользователей

- **ADMIN** - Администратор системы
- **MANAGER** - Менеджер отдела снабжения
- **SUPPLIER** - Поставщик
- **CUSTOMER** - Заказчик
- **ANALYST** - Аналитик
- **VIEWER** - Пользователь с правами просмотра

## API Эндпоинты

### Аутентификация

#### Вход в систему
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "password"
}
```

**Ответ:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tokenType": "Bearer",
  "expiresIn": 86400000,
  "userId": "uuid",
  "username": "admin",
  "email": "admin@tender.ru",
  "firstName": "Администратор",
  "lastName": "Системы",
  "companyName": "ООО Заказчик",
  "companyId": "uuid",
  "roles": ["ROLE_ADMIN"]
}
```

#### Регистрация
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "newuser",
  "email": "user@example.com",
  "password": "password123",
  "firstName": "Иван",
  "lastName": "Иванов",
  "middleName": "Иванович",
  "phone": "+7-999-123-45-67",
  "companyId": "uuid",
  "roles": ["MANAGER"]
}
```

#### Обновление токена
```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Выход из системы
```http
POST /api/auth/logout
Authorization: Bearer <token>
```

### Управление пользователями (только для ADMIN)

#### Получить всех пользователей
```http
GET /api/users
Authorization: Bearer <token>
```

#### Получить пользователя по ID
```http
GET /api/users/{id}
Authorization: Bearer <token>
```

#### Создать пользователя
```http
POST /api/users
Authorization: Bearer <token>
Content-Type: application/json

{
  "username": "newuser",
  "email": "user@example.com",
  "password": "password123",
  "firstName": "Иван",
  "lastName": "Иванов",
  "roles": ["MANAGER"]
}
```

#### Обновить пользователя
```http
PUT /api/users/{id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "username": "updateduser",
  "email": "updated@example.com",
  "firstName": "Петр",
  "lastName": "Петров",
  "roles": ["ANALYST"]
}
```

#### Удалить пользователя
```http
DELETE /api/users/{id}
Authorization: Bearer <token>
```

#### Сменить пароль
```http
POST /api/users/{id}/change-password?oldPassword=old&newPassword=new
Authorization: Bearer <token>
```

#### Обновить статус пользователя
```http
PUT /api/users/{id}/status?status=ACTIVE
Authorization: Bearer <token>
```

#### Назначить компанию пользователю
```http
POST /api/users/{id}/assign-company?companyId=uuid
Authorization: Bearer <token>
```

## Конфигурация

### Настройки JWT в application.yml

```yaml
jwt:
  secret: ${JWT_SECRET:your-super-secret-jwt-key-for-development-only-change-in-production}
  expiration: ${JWT_EXPIRATION:86400000} # 24 hours in milliseconds
  refresh-expiration: ${JWT_REFRESH_EXPIRATION:604800000} # 7 days in milliseconds
```

### Переменные окружения

```bash
# Обязательные для продакшена
export JWT_SECRET=your-super-secret-jwt-key-at-least-256-bits-long
export JWT_EXPIRATION=86400000
export JWT_REFRESH_EXPIRATION=604800000
```

## Безопасность

### Права доступа по эндпоинтам

- `/api/auth/**` - публичные эндпоинты
- `/api/admin/**` - только ADMIN
- `/api/settings/**` - ADMIN, MANAGER
- `/api/analytics/**` - ADMIN, ANALYST
- `/api/reports/**` - ADMIN, ANALYST, MANAGER
- `/api/dashboard/**` - ADMIN, MANAGER, ANALYST
- `/api/alerts/**` - ADMIN, MANAGER, ANALYST
- `/api/supplier/**` - SUPPLIER, ADMIN
- `/api/customer/**` - CUSTOMER, ADMIN
- Остальные эндпоинты требуют аутентификации

### Использование токенов

1. **Получение токена**: Отправьте POST запрос на `/api/auth/login`
2. **Использование токена**: Добавьте заголовок `Authorization: Bearer <token>`
3. **Обновление токена**: Используйте refresh token для получения нового access token
4. **Выход**: Отправьте POST запрос на `/api/auth/logout`

### Пример использования

```javascript
// Вход в систему
const loginResponse = await fetch('/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    username: 'admin',
    password: 'password'
  })
});

const { token, refreshToken } = await loginResponse.json();

// Использование токена для запросов
const response = await fetch('/api/users', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

## Тестовые пользователи

После запуска приложения создаются следующие тестовые пользователи:

| Username | Password | Role | Email |
|----------|----------|------|-------|
| admin | password | ADMIN | admin@tender.ru |
| manager | password | MANAGER | manager@tender.ru |
| analyst | password | ANALYST | analyst@tender.ru |
| supplier | password | SUPPLIER | supplier@tender.ru |
| customer | password | CUSTOMER | customer@tender.ru |
| viewer | password | VIEWER | viewer@tender.ru |

## Миграции базы данных

Система автоматически создает необходимые таблицы:

- `users` - таблица пользователей
- `user_roles` - таблица ролей пользователей

Миграции выполняются автоматически при запуске приложения.

## Логирование

Все операции аутентификации логируются с уровнем INFO:

- Попытки входа
- Успешные входы
- Регистрация пользователей
- Обновление токенов
- Управление пользователями

## Troubleshooting

### Проблема: "Invalid JWT token"
**Решение:**
- Проверьте правильность токена
- Убедитесь, что токен не истек
- Проверьте секретный ключ JWT

### Проблема: "Access denied"
**Решение:**
- Проверьте роли пользователя
- Убедитесь, что у пользователя есть необходимые права
- Проверьте конфигурацию безопасности

### Проблема: "User not found"
**Решение:**
- Проверьте правильность username/email
- Убедитесь, что пользователь активен
- Проверьте связь с компанией

## Развертывание

### Docker Compose

```yaml
version: '3.8'
services:
  app:
    build: .
    environment:
      - JWT_SECRET=your-production-secret-key
      - JWT_EXPIRATION=86400000
      - JWT_REFRESH_EXPIRATION=604800000
    ports:
      - "8080:8080"
```

### Переменные окружения для продакшена

```bash
# Генерируйте безопасный секретный ключ
JWT_SECRET=$(openssl rand -base64 32)

# Настройте время жизни токенов
JWT_EXPIRATION=3600000  # 1 час
JWT_REFRESH_EXPIRATION=604800000  # 7 дней
```

## Заключение

JWT аутентификация обеспечивает безопасный доступ к API системы отдела снабжения с поддержкой различных ролей пользователей и гибкой системой прав доступа. 