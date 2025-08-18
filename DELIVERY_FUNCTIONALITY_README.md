# Функционал доставки в предложениях поставщиков

## Обзор

Добавлен расширенный функционал для управления доставкой в предложениях поставщиков, включающий различные типы доставки и дополнительные расходы.

## Новые возможности

### 1. Типы доставки

Добавлены новые типы доставки в `DeliveryCondition.DeliveryType`:

- **INCLUDED_IN_PRICE** - Доставка включена в стоимость товара
- **SEPARATE_LINE** - Доставка отдельной строкой в счете
- **THIRD_PARTY_INVOICE** - Сторонний счет на доставку

### 2. Дополнительные расходы

Создана новая модель `AdditionalExpense` для управления дополнительными расходами:

#### Поля модели:
- `id` - Уникальный идентификатор
- `supplierProposalId` - Связь с предложением поставщика
- `expenseProviderId` - Поставщик расходов (компания)
- `expenseType` - Тип расхода (DELIVERY, CUSTOMS, INSURANCE, etc.)
- `description` - Описание расхода
- `amount` - Сумма расхода
- `currency` - Валюта (по умолчанию RUB)
- `invoiceNumber` - Номер счета
- `invoiceDate` - Дата счета
- `documentPath` - Путь к документу
- `notes` - Примечания
- `status` - Статус (PENDING, APPROVED, REJECTED, PAID)

#### Типы расходов:
- **DELIVERY** - Доставка
- **CUSTOMS** - Таможенные расходы
- **INSURANCE** - Страхование
- **PACKAGING** - Упаковка
- **LOADING** - Погрузка/разгрузка
- **STORAGE** - Хранение
- **OTHER** - Прочие расходы

### 3. Расчет стоимости

Обновлена логика расчета общей стоимости предложения:

```java
// Базовая стоимость позиций
double total = items.stream()
    .filter(i -> i.getTotalPrice() != null)
    .mapToDouble(ProposalItem::getTotalPrice)
    .sum();

// Стоимость доставки из позиций
double deliveryCost = items.stream()
    .filter(i -> i.getDeliveryCost() != null)
    .mapToDouble(ProposalItem::getDeliveryCost)
    .sum();

// Дополнительные расходы
double additionalExpenses = additionalExpenseService
    .getTotalApprovedAmountByProposal(savedProposal.getId());

// Итоговая стоимость
double totalWithDelivery = total + deliveryCost + additionalExpenses;
```

## API Endpoints

### Дополнительные расходы

- `POST /api/additional-expenses` - Создать дополнительный расход
- `PUT /api/additional-expenses/{id}` - Обновить дополнительный расход
- `GET /api/additional-expenses/{id}` - Получить дополнительный расход
- `GET /api/additional-expenses/proposal/{supplierProposalId}` - Получить расходы по предложению
- `GET /api/additional-expenses/status/{status}` - Получить расходы по статусу
- `DELETE /api/additional-expenses/{id}` - Удалить дополнительный расход
- `PUT /api/additional-expenses/{id}/status` - Изменить статус расхода
- `GET /api/additional-expenses/proposal/{supplierProposalId}/total-approved` - Общая сумма одобренных расходов
- `GET /api/additional-expenses/proposal/{supplierProposalId}/total-cost` - Общая стоимость предложения

## Frontend компоненты

### AdditionalExpensesManager

Новый компонент для управления дополнительными расходами:

```tsx
<AdditionalExpensesManager
  supplierProposalId={proposalId}
  onExpensesChange={(expenses) => {
    console.log('Расходы обновлены:', expenses);
  }}
/>
```

#### Функции:
- Добавление новых расходов
- Редактирование существующих расходов
- Удаление расходов
- Изменение статуса расходов
- Расчет общей суммы одобренных расходов
- Поддержка различных типов расходов
- Привязка к поставщикам расходов
- Управление счетами и документами

### Обновленный DeliveryConditionForm

Добавлены новые типы доставки в форму условий доставки:

- Доставка включена в стоимость
- Доставка отдельной строкой
- Сторонний счет на доставку

## База данных

### Новая таблица: additional_expenses

```sql
CREATE TABLE additional_expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supplier_proposal_id UUID NOT NULL REFERENCES supplier_proposals(id) ON DELETE CASCADE,
    expense_provider_id UUID REFERENCES companies(id),
    expense_type VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'RUB',
    invoice_number VARCHAR(100),
    invoice_date DATE,
    document_path TEXT,
    notes TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Индексы:
- `idx_additional_expenses_supplier_proposal` - по supplier_proposal_id
- `idx_additional_expenses_provider` - по expense_provider_id
- `idx_additional_expenses_status` - по status
- `idx_additional_expenses_type` - по expense_type

## Использование

### 1. Создание предложения с доставкой

1. Выберите тип доставки в форме условий доставки
2. Укажите стоимость доставки в позициях предложения
3. Добавьте дополнительные расходы через компонент AdditionalExpensesManager

### 2. Управление дополнительными расходами

1. Откройте предложение поставщика
2. Перейдите к разделу "Дополнительные расходы"
3. Нажмите "Добавить расход"
4. Заполните форму:
   - Тип расхода
   - Описание
   - Сумма
   - Поставщик расходов (опционально)
   - Номер и дата счета
   - Статус
   - Примечания

### 3. Расчет стоимости

Система автоматически рассчитывает общую стоимость предложения:
- Базовая стоимость позиций
- Стоимость доставки из позиций
- Сумма одобренных дополнительных расходов

## Логирование

Добавлено подробное логирование всех операций с дополнительными расходами:

```java
log.info("Создание дополнительного расхода для предложения: {}", expenseDto.getSupplierProposalId());
log.info("Расчет стоимости предложения: базовая стоимость: {}, доставка: {}, дополнительные расходы: {}, итого: {}", 
    total, deliveryCost, additionalExpenses, totalWithDelivery);
```

## Безопасность

- Контроль доступа через `@PreAuthorize`
- Валидация данных на уровне DTO
- Проверка прав доступа к предложениям поставщиков

## Миграция

Для применения изменений выполните:

```bash
# Применение миграций
./mvnw flyway:migrate

# Или через SQL
\i src/main/resources/db/changelog/changes/V064_create_additional_expenses_table.sql
```

## Тестирование

Рекомендуется протестировать:

1. Создание предложения с различными типами доставки
2. Добавление и редактирование дополнительных расходов
3. Расчет общей стоимости с учетом всех компонентов
4. Изменение статусов дополнительных расходов
5. Удаление дополнительных расходов
6. Отображение в отчетах и тендерных таблицах
