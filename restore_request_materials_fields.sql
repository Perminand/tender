-- SQL запрос для восстановления недостающих полей в таблице request_materials
-- Выполнять по порядку, проверяя наличие каждого поля перед добавлением

-- 1. Добавляем поле supplier_material_name (если не существует)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'request_materials' 
        AND column_name = 'supplier_material_name'
    ) THEN
        ALTER TABLE request_materials ADD COLUMN supplier_material_name VARCHAR(500);
        RAISE NOTICE 'Добавлено поле supplier_material_name';
    ELSE
        RAISE NOTICE 'Поле supplier_material_name уже существует';
    END IF;
END $$;

-- 2. Добавляем поле material_characteristics (если не существует)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'request_materials' 
        AND column_name = 'material_characteristics'
    ) THEN
        ALTER TABLE request_materials ADD COLUMN material_characteristics VARCHAR(1024);
        RAISE NOTICE 'Добавлено поле material_characteristics';
    ELSE
        RAISE NOTICE 'Поле material_characteristics уже существует';
    END IF;
END $$;

-- 3. Добавляем поле estimate_price (если не существует)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'request_materials' 
        AND column_name = 'estimate_price'
    ) THEN
        ALTER TABLE request_materials ADD COLUMN estimate_price DECIMAL(15,2);
        RAISE NOTICE 'Добавлено поле estimate_price';
    ELSE
        RAISE NOTICE 'Поле estimate_price уже существует';
    END IF;
END $$;

-- 4. Добавляем поле material_link (если не существует)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'request_materials' 
        AND column_name = 'material_link'
    ) THEN
        ALTER TABLE request_materials ADD COLUMN material_link VARCHAR(500);
        RAISE NOTICE 'Добавлено поле material_link';
    ELSE
        RAISE NOTICE 'Поле material_link уже существует';
    END IF;
END $$;

-- 5. Проверяем и создаем индексы для новых полей (если нужно)
-- Индекс для supplier_material_name
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'request_materials' 
        AND indexname = 'idx_request_materials_supplier_name'
    ) THEN
        CREATE INDEX idx_request_materials_supplier_name ON request_materials(supplier_material_name);
        RAISE NOTICE 'Создан индекс для supplier_material_name';
    ELSE
        RAISE NOTICE 'Индекс для supplier_material_name уже существует';
    END IF;
END $$;

-- Индекс для estimate_price
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'request_materials' 
        AND indexname = 'idx_request_materials_estimate_price'
    ) THEN
        CREATE INDEX idx_request_materials_estimate_price ON request_materials(estimate_price);
        RAISE NOTICE 'Создан индекс для estimate_price';
    ELSE
        RAISE NOTICE 'Индекс для estimate_price уже существует';
    END IF;
END $$;

-- 6. Проверяем структуру таблицы после изменений
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'request_materials' 
ORDER BY ordinal_position;

-- 7. Проверяем количество записей в таблице
SELECT COUNT(*) as total_records FROM request_materials;

-- 8. Показываем пример данных (первые 5 записей)
SELECT 
    id,
    request_id,
    number,
    work_type_id,
    material_id,
    size,
    quantity,
    unit_id,
    note,
    delivery_date,
    supplier_material_name,
    material_characteristics,
    estimate_price,
    material_link
FROM request_materials 
LIMIT 5; 