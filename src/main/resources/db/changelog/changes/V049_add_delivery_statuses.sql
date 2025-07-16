-- Добавление новых статусов поставки
-- Обновляем существующие записи с новыми статусами

-- Обновляем enum в базе данных (если используется PostgreSQL)
-- Для MySQL/H2 просто обновляем существующие записи

-- Добавляем комментарии к изменениям статусов
ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS status_change_history TEXT;

-- Создаем индекс для быстрого поиска по статусу
CREATE INDEX IF NOT EXISTS idx_deliveries_status ON deliveries(status);

-- Создаем индекс для поиска по дате поставки
CREATE INDEX IF NOT EXISTS idx_deliveries_planned_date ON deliveries(planned_delivery_date);

-- Создаем индекс для поиска по контракту
CREATE INDEX IF NOT EXISTS idx_deliveries_contract_id ON deliveries(contract_id);

-- Создаем индекс для поиска по поставщику
CREATE INDEX IF NOT EXISTS idx_deliveries_supplier_id ON deliveries(supplier_id); 