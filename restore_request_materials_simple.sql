-- Упрощенный SQL запрос для восстановления полей в таблице request_materials
-- Выполнять в PostgreSQL

-- Добавляем недостающие поля (без проверки существования)
ALTER TABLE request_materials ADD COLUMN IF NOT EXISTS supplier_material_name VARCHAR(500);
ALTER TABLE request_materials ADD COLUMN IF NOT EXISTS material_characteristics VARCHAR(1024);
ALTER TABLE request_materials ADD COLUMN IF NOT EXISTS estimate_price DECIMAL(15,2);
ALTER TABLE request_materials ADD COLUMN IF NOT EXISTS material_link VARCHAR(500);

-- Создаем индексы для новых полей
CREATE INDEX IF NOT EXISTS idx_request_materials_supplier_name ON request_materials(supplier_material_name);
CREATE INDEX IF NOT EXISTS idx_request_materials_estimate_price ON request_materials(estimate_price);

-- Проверяем результат
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'request_materials' 
ORDER BY ordinal_position; 