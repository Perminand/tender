# Структура меню тендерной системы

## Обзор

Меню системы структурировано по функциональным блокам с учетом ролей пользователей. Каждый пользователь видит только те разделы, к которым у него есть доступ согласно его ролям.

## Роли пользователей

### ROLE_ADMIN (Администратор)
- Полный доступ ко всем функциям системы
- Управление пользователями и настройками
- Аналитика и отчетность

### ROLE_MANAGER (Менеджер)
- Управление тендерными процедурами
- Работа с контрактами и поставками
- Управление справочниками

### ROLE_SUPPLIER (Поставщик)
- Просмотр доступных тендеров
- Подача предложений
- Управление своими контрактами
- **НЕ имеет доступа к дашборду** (внутренняя аналитика компании)

### ROLE_CUSTOMER (Заказчик)
- Создание заявок на закупку
- Просмотр реестра заявок
- Работа с контрактами

### ROLE_ANALYST (Аналитик)
- Анализ цен и тендеров
- Формирование отчетов
- Аналитическая работа

### ROLE_VIEWER (Просмотр)
- Просмотр данных без возможности редактирования
- Доступ к отчетам и аналитике

## Структура меню

### 1. Главная
- **Дашборд** - главная страница с обзором системы
  - Доступ: ADMIN, MANAGER, ANALYST, VIEWER
  - **ИСКЛЮЧЕНИЕ:** SUPPLIER не имеет доступа (внутренняя аналитика)

### 2. Тендерные процедуры
- **Реестр заявок** - управление заявками на закупку
  - Доступ: ADMIN, MANAGER, VIEWER, CUSTOMER
- **Тендеры** - управление тендерными процедурами
  - Доступ: ADMIN, MANAGER, SUPPLIER, VIEWER
- **Предложения** - работа с предложениями поставщиков
  - Доступ: SUPPLIER, MANAGER, ADMIN

### 3. Контрактная работа
- **Контракты** - управление контрактами
  - Доступ: ADMIN, MANAGER, VIEWER
- **Поставки** - управление поставками
  - Доступ: ADMIN, MANAGER, VIEWER
- **Платежи** - управление платежами
  - Доступ: ADMIN, MANAGER

### 4. Справочники
- **Контрагенты** - управление контрагентами
  - Доступ: ADMIN, MANAGER
- **Материалы** - управление материалами
  - Доступ: ADMIN, MANAGER
- **Категории** - управление категориями материалов
  - Доступ: ADMIN, MANAGER
- **Типы материалов** - управление типами материалов
  - Доступ: ADMIN, MANAGER
- **Единицы измерения** - управление единицами измерения
  - Доступ: ADMIN, MANAGER
- **Склады** - управление складами
  - Доступ: ADMIN, MANAGER
- **Проекты** - управление проектами
  - Доступ: ADMIN, MANAGER
- **Типы контактов** - управление типами контактов
  - Доступ: ADMIN, MANAGER

### 5. Документооборот
- **Документы** - управление документами
  - Доступ: ADMIN, MANAGER, VIEWER
- **Уведомления** - система уведомлений
  - Доступ: ADMIN, MANAGER, VIEWER

### 6. Аналитика
- **Анализ цен** - анализ цен по тендерам
  - Доступ: ADMIN, MANAGER, ANALYST

### 7. Администрирование
- **Настройки** - настройки системы
  - Доступ: ADMIN, MANAGER

## Дополнительные компоненты

### Хлебные крошки (Breadcrumbs)
- Отображают текущий путь в системе
- Позволяют быстро перейти к родительским разделам
- Автоматически обновляются при навигации

### Быстрые действия (Quick Actions)
- Отображаются на дашборде
- Показывают доступные действия в зависимости от роли
- Позволяют быстро перейти к созданию новых элементов

### Быстрые действия (Quick Actions)
- Отображаются на дашборде
- Показывают доступные действия в зависимости от роли
- Позволяют быстро перейти к созданию новых элементов

## Особенности реализации

### Фильтрация по ролям
```typescript
const filteredMenuStructure = menuStructure.map(section => ({
  ...section,
  items: section.items.filter(item =>
    !item.roles || item.roles.some(role => user?.roles.includes(role))
  )
})).filter(section => section.items.length > 0);
```

### Адаптивность
- Меню адаптируется под мобильные устройства
- На мобильных устройствах используется временный drawer
- На десктопе - постоянный sidebar

### Визуальное оформление
- Группировка по функциональным блокам
- Цветовое кодирование иконок
- Индикация активного раздела
- Разделители между группами

## Навигация

### Основные принципы
1. **Иерархичность** - четкая структура разделов
2. **Контекстность** - показ только релевантных разделов
3. **Доступность** - понятная навигация для всех ролей
4. **Эффективность** - быстрый доступ к нужным функциям

### URL структура
- `/dashboard` - главная страница
- `/requests/registry` - реестр заявок
- `/tenders` - тендеры
- `/contracts` - контракты
- `/reference/*` - справочники
- `/settings` - настройки

## Расширение меню

Для добавления новых разделов:

1. Добавить элемент в `menuStructure` в `Layout.tsx`
2. Определить доступные роли
3. Добавить соответствующий маршрут в `App.tsx`
4. Создать компонент страницы
5. Обновить хлебные крошки в `Breadcrumbs.tsx`
6. Добавить быстрые действия в `QuickActions.tsx` при необходимости 