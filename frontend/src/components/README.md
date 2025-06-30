# DictionaryPage - Универсальный компонент для справочников

## Описание

`DictionaryPage` - это универсальный React компонент для создания страниц справочников с единым стилем и функциональностью. Компонент предоставляет стандартный интерфейс для работы с данными справочников, включая просмотр, добавление, редактирование, удаление, поиск, экспорт и импорт.

## Основные возможности

- ✅ Единообразный интерфейс для всех справочников
- ✅ CRUD операции (создание, чтение, обновление, удаление)
- ✅ Поиск по нескольким полям
- ✅ Экспорт в Excel
- ✅ Импорт из Excel с отображением результатов
- ✅ Валидация форм
- ✅ Уведомления об операциях
- ✅ Подтверждение удаления
- ✅ Адаптивный дизайн
- ✅ Поддержка различных типов полей

## Использование

### Базовый пример

```tsx
import React from 'react';
import DictionaryPage, { DictionaryField } from '../components/DictionaryPage';

const CategoryListPage: React.FC = () => {
  const fields: DictionaryField[] = [
    {
      name: 'name',
      label: 'Название',
      required: true
    }
  ];

  return (
    <DictionaryPage
      title="Категории"
      description="Управление категориями материалов"
      apiEndpoint="http://localhost:8080/api/categories"
      fields={fields}
      backUrl="/reference"
      exportFileName="categories.xlsx"
      searchFields={['name']}
    />
  );
};
```

### Пример с несколькими полями

```tsx
const UnitListPage: React.FC = () => {
  const fields: DictionaryField[] = [
    {
      name: 'name',
      label: 'Название',
      required: true
    },
    {
      name: 'shortName',
      label: 'Краткое название',
      required: true
    }
  ];

  return (
    <DictionaryPage
      title="Единицы измерения"
      description="Управление единицами измерения"
      apiEndpoint="http://localhost:8080/api/units"
      fields={fields}
      backUrl="/reference"
      exportFileName="units.xlsx"
      searchFields={['name', 'shortName']}
    />
  );
};
```

## Props

### DictionaryPageProps

| Параметр | Тип | Обязательный | Описание |
|----------|-----|--------------|----------|
| `title` | `string` | ✅ | Заголовок страницы |
| `description` | `string` | ✅ | Описание страницы |
| `apiEndpoint` | `string` | ✅ | URL API для работы с данными |
| `fields` | `DictionaryField[]` | ✅ | Массив полей формы |
| `backUrl` | `string` | ✅ | URL для кнопки "Назад" |
| `exportFileName` | `string` | ✅ | Имя файла при экспорте |
| `searchFields` | `string[]` | ❌ | Поля для поиска (по умолчанию `['name']`) |
| `renderRow` | `function` | ❌ | Кастомная функция рендеринга строк таблицы |
| `transformData` | `function` | ❌ | Функция трансформации данных с сервера |
| `validateForm` | `function` | ❌ | Функция валидации формы |

### DictionaryField

| Параметр | Тип | Обязательный | Описание |
|----------|-----|--------------|----------|
| `name` | `string` | ✅ | Имя поля в данных |
| `label` | `string` | ✅ | Отображаемое название поля |
| `type` | `'text' \| 'number' \| 'email'` | ❌ | Тип поля (по умолчанию `'text'`) |
| `required` | `boolean` | ❌ | Обязательное поле (по умолчанию `false`) |

## API Endpoints

Компонент ожидает следующие API endpoints:

### GET /api/{resource}
Получение списка элементов

### POST /api/{resource}
Создание нового элемента

### PUT /api/{resource}/{id}
Обновление элемента

### DELETE /api/{resource}/{id}
Удаление элемента

### GET /api/{resource}/export
Экспорт в Excel

### POST /api/{resource}/import
Импорт из Excel

## Кастомизация

### Кастомный рендеринг строк

```tsx
const renderRow = (item: DictionaryItem) => (
  <TableRow key={item.id}>
    <TableCell>{item.name}</TableCell>
    <TableCell>{item.customField}</TableCell>
    <TableCell align="right">
      <IconButton onClick={() => handleCustomAction(item)}>
        <CustomIcon />
      </IconButton>
    </TableCell>
  </TableRow>
);

<DictionaryPage
  // ... другие props
  renderRow={renderRow}
/>
```

### Валидация формы

```tsx
const validateForm = (formData: any) => {
  if (!formData.name.trim()) {
    return 'Название обязательно для заполнения';
  }
  if (formData.name.length < 3) {
    return 'Название должно содержать минимум 3 символа';
  }
  return null; // нет ошибок
};

<DictionaryPage
  // ... другие props
  validateForm={validateForm}
/>
```

### Трансформация данных

```tsx
const transformData = (data: any) => ({
  ...data,
  displayName: `${data.name} (${data.code})`
});

<DictionaryPage
  // ... другие props
  transformData={transformData}
/>
```

## Стилизация

Компонент использует Material-UI и поддерживает стандартные темы. Основные стили:

- Контейнер: `Container maxWidth="lg"`
- Заголовок: `Typography variant="h4"`
- Таблица: `TableContainer` с `Paper`
- Кнопки: стандартные Material-UI кнопки
- Диалоги: `Dialog` с `DialogTitle`, `DialogContent`, `DialogActions`

## Обработка ошибок

Компонент автоматически обрабатывает:
- Ошибки сети
- Ошибки валидации
- Ошибки сервера
- Ошибки импорта

Все ошибки отображаются в виде уведомлений (Snackbar) или в диалогах.

## Примеры использования в проекте

В проекте уже обновлены следующие страницы:

1. **CategoryListPage** - Категории материалов
2. **MaterialTypeListPage** - Типы материалов  
3. **UnitListPage** - Единицы измерения
4. **LegalFormListPage** - Правовые формы
5. **ContactTypesPage** - Типы контактов
6. **SupplierMaterialNamesPage** - Названия материалов поставщиков

## Преимущества унификации

1. **Единообразие** - все справочники выглядят одинаково
2. **Поддержка** - изменения в одном месте применяются везде
3. **Надежность** - проверенная логика работы
4. **Производительность** - оптимизированный код
5. **UX** - консистентный пользовательский опыт 