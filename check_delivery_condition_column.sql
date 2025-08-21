-- Проверка наличия поля delivery_condition_id в таблице supplier_proposals
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'supplier_proposals' 
AND column_name = 'delivery_condition_id';

-- Проверка внешних ключей для поля delivery_condition_id
SELECT 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name='supplier_proposals' 
AND kcu.column_name = 'delivery_condition_id';

-- Проверка индексов для поля delivery_condition_id
SELECT 
    indexname, 
    indexdef 
FROM pg_indexes 
WHERE tablename = 'supplier_proposals' 
AND indexdef LIKE '%delivery_condition_id%';

