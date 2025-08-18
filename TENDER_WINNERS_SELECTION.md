# Выбор победителей по позициям и заключение контрактов

## Обзор

Добавлен функционал для выбора победителей по каждой позиции тендера с возможностью заключения контракта с выбранными поставщиками.

## Новые возможности

### 1. Выбор победителей по позициям

В компоненте `TenderWinnersDisplay` добавлены:
- Галочки для выбора победителя по каждой позиции
- Возможность выбрать любого поставщика из предложений
- Отображение количества выбранных позиций
- Кнопка для заключения контракта с выбранными победителями

### 2. Заключение контракта

- Создание контракта на основе выбранных победителей
- Автоматическое формирование позиций контракта
- Расчет общей стоимости контракта
- Поддержка множественных поставщиков в одном контракте

## Компоненты интерфейса

### TenderWinnersDisplay

Обновленный компонент для отображения победителей с функционалом выбора:

```typescript
// Состояние для выбора победителей
const [selectedWinners, setSelectedWinners] = useState<Map<string, string>>(new Map());

// Обработчик выбора победителя
const handleWinnerSelection = (tenderItemId: string, supplierId: string) => {
  setSelectedWinners(prev => {
    const newMap = new Map(prev);
    if (newMap.get(tenderItemId) === supplierId) {
      newMap.delete(tenderItemId);
    } else {
      newMap.set(tenderItemId, supplierId);
    }
    return newMap;
  });
};
```

### Таблица с галочками

```typescript
<TableHead>
  <TableRow>
    <TableCell padding="checkbox">Выбрать</TableCell>
    <TableCell>Поставщик</TableCell>
    <TableCell align="right">Цена за ед.</TableCell>
    <TableCell align="right">НДС</TableCell>
    <TableCell align="right">Доставка</TableCell>
    <TableCell align="right">Итого с НДС и доставкой</TableCell>
    <TableCell align="right">Экономия</TableCell>
    <TableCell>Статус</TableCell>
  </TableRow>
</TableHead>
<TableBody>
  {itemWinner.allPrices.map((price, priceIndex) => (
    <TableRow key={price.proposalId}>
      <TableCell padding="checkbox">
        <Checkbox
          checked={selectedWinners.get(itemWinner.tenderItemId) === price.supplierId}
          onChange={() => handleWinnerSelection(itemWinner.tenderItemId, price.supplierId)}
          color="primary"
        />
      </TableCell>
      {/* Остальные ячейки */}
    </TableRow>
  ))}
</TableBody>
```

### Диалог создания контракта

```typescript
<Dialog open={contractDialogOpen} onClose={() => setContractDialogOpen(false)} maxWidth="md" fullWidth>
  <DialogTitle>
    Создание контракта с выбранными победителями
  </DialogTitle>
  <DialogContent>
    {/* Поля для ввода данных контракта */}
    <TextField label="Название контракта" />
    <TextField label="Дата начала" type="date" />
    <TextField label="Дата окончания" type="date" />
    <TextField label="Описание" multiline rows={3} />
    
    {/* Список выбранных позиций */}
    <Typography variant="subtitle2">
      Выбранные позиции для контракта:
    </Typography>
    {Array.from(selectedWinners.entries()).map(([tenderItemId, supplierId]) => (
      <Box key={tenderItemId}>
        <Typography>Позиция {item?.itemNumber}: {item?.description}</Typography>
        <Typography>Поставщик: {supplier?.supplierName}</Typography>
      </Box>
    ))}
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setContractDialogOpen(false)}>Отмена</Button>
    <Button onClick={handleContractSubmit} variant="contained">
      Создать контракт
    </Button>
  </DialogActions>
</Dialog>
```

## Backend API

### Новый DTO

```java
public record ContractFromWinnersDto(
    UUID tenderId,
    String title,
    LocalDate startDate,
    LocalDate endDate,
    String description,
    List<SelectedWinnerItemDto> selectedItems
) {
    public record SelectedWinnerItemDto(
        UUID tenderItemId,
        UUID supplierId
    ) {}
}
```

### Новый endpoint

```java
@PostMapping("/create-from-winners")
public ResponseEntity<ContractDto> createContractFromWinners(
    @RequestBody ContractFromWinnersDto contractFromWinnersDto
) {
    ContractDto dto = contractService.createContractFromWinners(contractFromWinnersDto);
    return ResponseEntity.ok(dto);
}
```

### Сервисный метод

```java
@Override
public ContractDto createContractFromWinners(ContractFromWinnersDto contractFromWinnersDto) {
    // Создание контракта
    Contract contract = new Contract();
    contract.setTender(tender);
    contract.setTitle(contractFromWinnersDto.title());
    contract.setStartDate(contractFromWinnersDto.startDate());
    contract.setEndDate(contractFromWinnersDto.endDate());
    contract.setDescription(contractFromWinnersDto.description());
    
    // Создание позиций контракта для выбранных победителей
    for (SelectedWinnerItemDto selectedItem : contractFromWinnersDto.selectedItems()) {
        // Получение данных о позиции и поставщике
        TenderItem tenderItem = tenderItemRepository.findById(selectedItem.tenderItemId());
        SupplierProposal supplierProposal = supplierProposalRepository
            .findByTenderIdAndSupplierId(tenderId, selectedItem.supplierId());
        ProposalItem proposalItem = proposalItemRepository
            .findBySupplierProposalId(supplierProposal.getId())
            .stream()
            .filter(pi -> pi.getTenderItem().getId().equals(selectedItem.tenderItemId()))
            .findFirst();
        
        // Создание позиции контракта
        ContractItem contractItem = new ContractItem();
        contractItem.setContract(contract);
        contractItem.setTenderItem(tenderItem);
        contractItem.setItemNumber(proposalItem.getItemNumber());
        contractItem.setDescription(proposalItem.getDescription());
        contractItem.setQuantity(proposalItem.getQuantity());
        contractItem.setUnitPrice(proposalItem.getUnitPrice());
        contractItem.setTotalPrice(proposalItem.getTotalPrice());
        // ... остальные поля
        
        contractItemRepository.save(contractItem);
    }
    
    return getContractById(contract.getId());
}
```

## Использование

### 1. Выбор победителей

1. Откройте тендер и перейдите на вкладку "Победители"
2. Для каждой позиции выберите поставщика, поставив галочку
3. Система покажет количество выбранных позиций

### 2. Создание контракта

1. Нажмите кнопку "Заключить контракт с выбранными победителями"
2. Заполните форму контракта:
   - Название контракта
   - Дата начала и окончания
   - Описание
3. Проверьте список выбранных позиций
4. Нажмите "Создать контракт"

### 3. Результат

- Создается контракт с позициями от выбранных поставщиков
- Рассчитывается общая стоимость контракта
- Контракт сохраняется в статусе "Черновик"
- Можно перейти к редактированию контракта

## Преимущества

### 1. Гибкость выбора
- Возможность выбрать любого поставщика, не только с лучшей ценой
- Поддержка множественных поставщиков в одном контракте
- Учет дополнительных критериев (сроки, качество, репутация)

### 2. Удобство работы
- Визуальный интерфейс с галочками
- Предварительный просмотр выбранных позиций
- Автоматический расчет стоимости

### 3. Автоматизация
- Автоматическое создание позиций контракта
- Копирование данных из предложений поставщиков
- Расчет общей стоимости

## Безопасность

- Контроль доступа через роли пользователей
- Валидация данных на уровне DTO
- Проверка прав доступа к тендерам и контрактам
- Логирование всех операций

## Тестирование

Рекомендуется протестировать:

1. Выбор победителей по позициям
2. Создание контракта с одним поставщиком
3. Создание контракта с несколькими поставщиками
4. Валидацию формы создания контракта
5. Обработку ошибок при создании контракта
6. Отображение созданного контракта в списке контрактов
