-- Исправление существующих тендеров
-- Устанавливаем request_id для тендеров, которые его не имеют

-- Сначала посмотрим на существующие тендеры без request_id
SELECT '=== ТЕНДЕРЫ БЕЗ REQUEST_ID ===' as info;
SELECT id, tender_number, title, request_id FROM tenders WHERE request_id IS NULL;

-- Посмотрим на заявки
SELECT '=== ЗАЯВКИ ===' as info;
SELECT id, request_number FROM requests LIMIT 5;

-- Обновляем тендеры, устанавливая request_id на основе номера заявки в названии
-- Предполагаем, что в названии тендера указан номер заявки (например, "Тендер по заявке 22")
UPDATE tenders 
SET request_id = (
    SELECT r.id 
    FROM requests r 
    WHERE r.request_number = 'REQ-022'  -- Извлекаем номер из названия тендера
    LIMIT 1
)
WHERE request_id IS NULL 
AND title LIKE '%заявке 22%';

-- Проверяем результат
SELECT '=== РЕЗУЛЬТАТ ОБНОВЛЕНИЯ ===' as info;
SELECT id, tender_number, title, request_id FROM tenders;

-- Альтернативный вариант: обновляем все тендеры без request_id, устанавливая первую заявку
-- (раскомментировать если нужно)
/*
UPDATE tenders 
SET request_id = (SELECT id FROM requests LIMIT 1)
WHERE request_id IS NULL;
*/ 