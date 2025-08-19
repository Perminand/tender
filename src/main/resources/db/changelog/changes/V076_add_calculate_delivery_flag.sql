-- Добавление признака calculate_delivery в таблицу delivery_conditions
ALTER TABLE delivery_conditions ADD COLUMN IF NOT EXISTS calculate_delivery BOOLEAN NOT NULL DEFAULT FALSE;

