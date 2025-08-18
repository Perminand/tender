# Инструкция по решению проблемы с миграциями

## Проблема
Ошибка: `column sp1_0.delivery_condition_id does not exist`

Эта ошибка возникает потому, что Hibernate пытается выполнить запрос с новыми полями `delivery_condition_id` и `payment_condition_id`, но эти колонки еще не существуют в таблице `supplier_proposals`.

## Решение

### Вариант 1: Автоматическое применение миграций (Рекомендуется)

1. **Перезапустите приложение**
   ```bash
   # Остановите приложение и запустите заново
   ./mvnw spring-boot:run
   ```

2. **Проверьте логи запуска**
   - В логах должны появиться сообщения о применении миграций Liquibase
   - Ищите строки типа: `Liquibase: ChangeSet V052_create_payment_and_delivery_conditions.sql::create_payment_conditions_table::system ran successfully`

### Вариант 2: Ручное применение миграций

Если автоматические миграции не сработали, выполните SQL скрипт вручную:

1. **Подключитесь к базе данных PostgreSQL**
   ```bash
   psql -h localhost -U tender_user -d tender
   ```

2. **Выполните скрипт миграции**
   ```sql
   \i apply_migrations.sql
   ```

3. **Проверьте результат**
   ```sql
   -- Проверка создания таблиц
   SELECT 'payment_conditions' as table_name, COUNT(*) as row_count FROM payment_conditions
   UNION ALL
   SELECT 'payment_parts' as table_name, COUNT(*) as row_count FROM payment_parts
   UNION ALL
   SELECT 'delivery_conditions' as table_name, COUNT(*) as row_count FROM delivery_conditions;

   -- Проверка наличия новых колонок
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_name = 'supplier_proposals' 
   AND column_name IN ('payment_condition_id', 'delivery_condition_id');
   ```

### Вариант 3: Проверка статуса миграций

1. **Проверьте таблицу Liquibase**
   ```sql
   SELECT * FROM databasechangelog ORDER BY orderexecuted DESC LIMIT 10;
   ```

2. **Если миграции не применились, принудительно примените их**
   ```sql
   -- Очистите записи о миграциях (если нужно)
   DELETE FROM databasechangelog WHERE filename LIKE '%V052%' OR filename LIKE '%V053%';
   
   -- Перезапустите приложение
   ```

## Созданные миграции

### V052_create_payment_and_delivery_conditions.sql
- Создает таблицы `payment_conditions`, `payment_parts`, `delivery_conditions`
- Добавляет колонки в `supplier_proposals`
- Создает индексы и триггеры
- Вставляет базовые стандартные условия

### V053_add_additional_payment_delivery_data.sql
- Добавляет дополнительные стандартные условия
- Создает представления для удобного просмотра

## Проверка успешности миграции

После применения миграций проверьте:

1. **Существование таблиц**
   ```sql
   \dt payment_conditions
   \dt payment_parts
   \dt delivery_conditions
   ```

2. **Наличие данных**
   ```sql
   SELECT COUNT(*) FROM payment_conditions;
   SELECT COUNT(*) FROM payment_parts;
   SELECT COUNT(*) FROM delivery_conditions;
   ```

3. **Наличие колонок в supplier_proposals**
   ```sql
   \d supplier_proposals
   ```

4. **Работу API**
   ```bash
   curl http://localhost:8080/api/payment-conditions
   curl http://localhost:8080/api/delivery-conditions
   ```

## Возможные проблемы

### Проблема: Миграции не применяются автоматически
**Решение**: Проверьте настройки Liquibase в `application.yml`:
```yaml
spring:
  liquibase:
    enabled: true
    change-log: classpath:db/changelog/db.changelog-master.yaml
```

### Проблема: Ошибки в SQL скриптах
**Решение**: Проверьте синтаксис SQL и убедитесь, что все зависимости (например, функция `update_updated_at_column()`) существуют.

### Проблема: Конфликты с существующими данными
**Решение**: Используйте `ON CONFLICT DO NOTHING` в INSERT запросах или очистите существующие данные перед миграцией.

## Контакты для поддержки

Если проблемы не решаются, проверьте:
1. Логи приложения на наличие ошибок
2. Статус базы данных
3. Права доступа пользователя базы данных
4. Версию PostgreSQL (должна быть 12+)
