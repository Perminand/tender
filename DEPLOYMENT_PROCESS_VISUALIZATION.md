# Руководство по развертыванию: Визуализация процесса заявок

## Предварительные требования

1. Java 17 или выше
2. Maven 3.6+
3. PostgreSQL 12+
4. Node.js 16+ (для frontend)

## Шаги развертывания

### 1. Обновление базы данных

Выполните SQL-миграцию для создания новых таблиц:

```bash
# Подключитесь к базе данных PostgreSQL
psql -U your_username -d your_database

# Выполните миграцию
\i src/main/resources/db/migration/V1.1__create_process_tables.sql
```

Или используйте автоматическую миграцию через Spring Boot:

```bash
# Убедитесь, что в application.properties настроена миграция
spring.jpa.hibernate.ddl-auto=validate
spring.flyway.enabled=true
```

### 2. Сборка и запуск backend

```bash
# Перейдите в корневую директорию проекта
cd /path/to/tender

# Соберите проект
mvn clean install

# Запустите приложение
mvn spring-boot:run
```

### 3. Сборка и запуск frontend

```bash
# Перейдите в директорию frontend
cd frontend

# Установите зависимости
npm install

# Соберите проект для разработки
npm run dev

# Или для продакшена
npm run build
```

### 4. Проверка работоспособности

#### Тест API endpoints:

```bash
# Краткий вид списка заявок
curl -X GET http://localhost:8080/api/requests/process/brief/list

# Подробный вид списка заявок
curl -X GET http://localhost:8080/api/requests/process/list

# Краткий вид одной заявки (замените UUID на реальный ID)
curl -X GET http://localhost:8080/api/requests/process/brief/{requestId}

# Подробный вид одной заявки
curl -X GET http://localhost:8080/api/requests/process/{requestId}
```

#### Тест через браузер:

1. Откройте `test_request_process.html` в браузере
2. Нажмите кнопки для тестирования API
3. Проверьте, что данные загружаются корректно

### 5. Доступ к новому функционалу

1. Откройте приложение в браузере: `http://localhost:3000`
2. Войдите в систему
3. Перейдите в меню: "Тендерные процедуры" → "Процесс заявок"
4. Проверьте работу краткого и подробного режимов

## Конфигурация

### Backend конфигурация

Убедитесь, что в `application.properties` настроены:

```properties
# База данных
spring.datasource.url=jdbc:postgresql://localhost:5432/tender
spring.datasource.username=your_username
spring.datasource.password=your_password

# JPA
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.show-sql=false

# Flyway (миграции)
spring.flyway.enabled=true
spring.flyway.locations=classpath:db/migration

# CORS (для frontend)
spring.web.cors.allowed-origins=http://localhost:3000
spring.web.cors.allowed-methods=GET,POST,PUT,DELETE,OPTIONS
spring.web.cors.allowed-headers=*
```

### Frontend конфигурация

В `frontend/src/config/api.ts` убедитесь, что настроен правильный URL API:

```typescript
export const API_BASE_URL = 'http://localhost:8080/api';
```

## Возможные проблемы и решения

### 1. Ошибка миграции базы данных

**Проблема:** `ERROR: relation "invoices" already exists`

**Решение:** 
```sql
-- Проверьте существующие таблицы
\dt invoices
\dt receipts

-- Если таблицы существуют, удалите их и пересоздайте
DROP TABLE IF EXISTS receipt_items CASCADE;
DROP TABLE IF EXISTS receipts CASCADE;
DROP TABLE IF EXISTS invoice_items CASCADE;
DROP TABLE IF EXISTS invoices CASCADE;

-- Затем выполните миграцию заново
```

### 2. Ошибка CORS

**Проблема:** `Access to fetch at 'http://localhost:8080/api/...' from origin 'http://localhost:3000' has been blocked by CORS policy`

**Решение:** Добавьте в backend конфигурацию CORS:

```java
@Configuration
public class CorsConfig {
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:3000"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
```

### 3. Ошибка компиляции TypeScript

**Проблема:** `Cannot find module './components/RequestProcessBrief'`

**Решение:** Убедитесь, что все компоненты созданы и экспортированы правильно:

```typescript
// В файле компонента
export default function RequestProcessBrief() { ... }

// В файле, который импортирует компонент
import RequestProcessBrief from './components/RequestProcessBrief';
```

### 4. Пустые данные в API

**Проблема:** API возвращает пустые массивы

**Решение:** 
1. Проверьте, что в базе данных есть тестовые данные
2. Убедитесь, что связи между таблицами настроены правильно
3. Проверьте логи приложения на наличие ошибок

## Тестирование

### Автоматические тесты

```bash
# Запуск тестов backend
mvn test

# Запуск тестов frontend
cd frontend
npm test
```

### Ручное тестирование

1. **Создание тестовых данных:**
   - Создайте заявку через интерфейс
   - Создайте тендер для заявки
   - Добавьте предложения поставщиков
   - Создайте контракт
   - Добавьте счета и поступления

2. **Проверка функционала:**
   - Откройте страницу "Процесс заявок"
   - Проверьте краткий и подробный режимы
   - Проверьте фильтрацию и поиск
   - Проверьте развертывание деталей

## Мониторинг

### Логи приложения

```bash
# Просмотр логов backend
tail -f logs/application.log

# Просмотр логов frontend (если настроены)
tail -f frontend/logs/dev.log
```

### Метрики производительности

- Время ответа API
- Количество запросов к базе данных
- Использование памяти
- Время загрузки страниц

## Обновление

При обновлении функционала:

1. Остановите приложение
2. Выполните новые миграции базы данных
3. Обновите код
4. Пересоберите и перезапустите приложение
5. Проверьте работоспособность

## Поддержка

При возникновении проблем:

1. Проверьте логи приложения
2. Убедитесь, что все зависимости установлены
3. Проверьте конфигурацию базы данных
4. Обратитесь к документации API
5. Создайте issue в системе отслеживания ошибок 