# Логика расчета победителя тендера

## Обзор

Система расчета победителя тендера была обновлена для учета всех компонентов стоимости, включая дополнительные расходы и различные типы доставки.

## Компоненты стоимости

### 1. Базовая стоимость позиций
- Сумма всех позиций предложения: `quantity * unitPrice`
- Учитывается НДС если указан `unitPriceWithVat`

### 2. Стоимость доставки из позиций
- Поле `deliveryCost` в каждой позиции предложения
- Суммируется по всем позициям предложения

### 3. Дополнительные расходы
- Модель `AdditionalExpense` для сторонних счетов
- Учитываются только расходы со статусом `APPROVED`
- Типы расходов: доставка, таможня, страхование, упаковка, погрузка, хранение, прочие

## Формула расчета полной стоимости

```java
// Полная стоимость предложения
double totalCost = baseCost + deliveryCost + additionalExpenses;

где:
- baseCost = сумма всех позиций (с учетом НДС)
- deliveryCost = сумма deliveryCost из всех позиций
- additionalExpenses = сумма одобренных дополнительных расходов
```

## Обновленная логика выбора победителя

### Backend (TenderServiceImpl)

```java
// Находим лучшее предложение среди полных предложений по общей цене с учетом дополнительных расходов
SupplierProposalDto bestProposal = completeProposals.stream()
    .filter(p -> p.getTotalPrice() != null)
    .min((p1, p2) -> {
        // Получаем полную стоимость с учетом дополнительных расходов
        double totalCost1 = calculateTotalProposalCost(p1);
        double totalCost2 = calculateTotalProposalCost(p2);
        return Double.compare(totalCost1, totalCost2);
    })
    .orElse(null);
```

### Frontend (TenderDetailPage)

```typescript
// Находим лучшее предложение с учетом дополнительных расходов
const best = tender.supplierProposals.reduce((min, p) => {
  if (!min) return p;
  
  // Получаем полную стоимость с учетом дополнительных расходов
  const totalCost1 = calculateTotalProposalCost(min);
  const totalCost2 = calculateTotalProposalCost(p);
  
  return totalCost1 < totalCost2 ? min : p;
});
```

## Обновленная логика анализа цен

### PriceAnalysisServiceImpl

Анализ цен теперь учитывает дополнительные расходы при определении лучшей цены:

```java
// Определяем лучшую цену по общей стоимости с учетом НДС, доставки и дополнительных расходов
double totalCostWithExpenses = priceDto.totalPriceWithVatAndDelivery() != null ? 
    priceDto.totalPriceWithVatAndDelivery() : 0.0;

// Добавляем дополнительные расходы
double additionalExpenses = additionalExpenseService.getTotalApprovedAmountByProposal(proposal.getId());
totalCostWithExpenses += additionalExpenses;

if (totalCostWithExpenses < minTotalPrice) {
    minTotalPrice = totalCostWithExpenses;
    bestPrice = createSupplierPriceDto(proposal, proposalItem, true);
}
```

## Отображение в интерфейсе

### TenderDetailPage

Обновлено отображение стоимости предложений:

```typescript
<Typography sx={{ flex: 1 }}>
  {proposal.supplierName} - {formatPrice(calculateTotalProposalCost(proposal))}
  {proposal.additionalExpenses && proposal.additionalExpenses.length > 0 && (
    <Typography variant="caption" color="text.secondary" display="block">
      + {formatPrice(proposal.additionalExpenses
        .filter((expense: any) => expense.status === 'APPROVED')
        .reduce((sum: number, expense: any) => sum + (expense.amount || 0), 0)
      )} доп. расходы
    </Typography>
  )}
</Typography>
```

## Автоматическое назначение победителя

### Кнопка "Автоматически назначить победителя"

1. Система анализирует все предложения
2. Рассчитывает полную стоимость каждого предложения
3. Выбирает предложение с минимальной полной стоимостью
4. Показывает диалог подтверждения с информацией о выбранном поставщике

### Логика выбора

```typescript
const handleAutoAwardClick = () => {
  if (!tender || tender.supplierProposals.length === 0) return;
  
  // Находим лучшее предложение с учетом дополнительных расходов
  const best = tender.supplierProposals.reduce((min, p) => {
    if (!min) return p;
    
    // Получаем полную стоимость с учетом дополнительных расходов
    const totalCost1 = calculateTotalProposalCost(min);
    const totalCost2 = calculateTotalProposalCost(p);
    
    return totalCost1 < totalCost2 ? min : p;
  });
  
  if (best) {
    setAutoAwardSupplier({ id: best.supplierId, name: best.supplierName });
    setAutoAwardDialogOpen(true);
  }
};
```

## Типы доставки и их влияние

### 1. INCLUDED_IN_PRICE
- Доставка включена в стоимость товара
- Учитывается в `unitPrice` или `totalPrice` позиций

### 2. SEPARATE_LINE
- Доставка отдельной строкой в счете
- Учитывается в поле `deliveryCost` позиций

### 3. THIRD_PARTY_INVOICE
- Сторонний счет на доставку
- Учитывается как `AdditionalExpense` с типом `DELIVERY`

## Примеры расчета

### Пример 1: Простое предложение
```
Позиция 1: 100 шт × 1000 ₽ = 100,000 ₽
Позиция 2: 50 шт × 2000 ₽ = 100,000 ₽
Доставка позиций: 10,000 ₽
Дополнительные расходы: 5,000 ₽ (одобрены)

Итого: 100,000 + 100,000 + 10,000 + 5,000 = 215,000 ₽
```

### Пример 2: Предложение с НДС
```
Позиция 1: 100 шт × 1000 ₽ (без НДС) = 100,000 ₽
Позиция 2: 50 шт × 2000 ₽ (с НДС 20%) = 120,000 ₽
Доставка позиций: 10,000 ₽
Дополнительные расходы: 0 ₽

Итого: 100,000 + 120,000 + 10,000 = 230,000 ₽
```

## Логирование

Добавлено подробное логирование расчетов:

```java
log.debug("Расчет полной стоимости предложения {}: базовая стоимость: {}, дополнительные расходы: {}, итого: {}", 
    proposal.getId(), baseCost, additionalExpenses, totalCost);
```

## Безопасность

- Контроль доступа через роли пользователей
- Валидация данных на уровне DTO
- Проверка прав доступа к предложениям поставщиков
- Учет только одобренных дополнительных расходов

## Тестирование

Рекомендуется протестировать:

1. Создание предложений с различными типами доставки
2. Добавление дополнительных расходов
3. Автоматическое назначение победителя
4. Анализ цен с учетом всех компонентов
5. Отображение полной стоимости в интерфейсе
6. Расчет экономии с учетом дополнительных расходов
