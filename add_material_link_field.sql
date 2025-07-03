-- SQL запрос для добавления поля material_link в таблицу request_materials
-- Это поле используется для хранения ссылок на материалы в заявках

-- Добавляем поле material_link (если не существует)
ALTER TABLE request_materials ADD COLUMN IF NOT EXISTS material_link VARCHAR(500);

-- Создаем индекс для быстрого поиска по ссылкам (опционально)
CREATE INDEX IF NOT EXISTS idx_request_materials_material_link ON request_materials(material_link);

-- Проверяем результат
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'request_materials' 
AND column_name = 'material_link';

-- Показываем пример данных с новым полем
SELECT 
    id,
    request_id,
    material_id,
    material_link,
    supplier_material_name,
    estimate_price
FROM request_materials 
LIMIT 5; 