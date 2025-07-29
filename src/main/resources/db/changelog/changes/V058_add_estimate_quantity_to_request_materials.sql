-- Добавление поля estimate_quantity в таблицу request_materials
ALTER TABLE request_materials ADD COLUMN estimate_quantity DECIMAL(15,2); 