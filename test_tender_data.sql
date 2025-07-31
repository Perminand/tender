-- Проверка данных тендеров
SELECT '=== ЗАЯВКИ ===' as info;
SELECT id, request_number, date FROM requests LIMIT 5;

SELECT '=== ТЕНДЕРЫ ===' as info;
SELECT id, request_id, tender_number, title, status FROM tenders LIMIT 5;

SELECT '=== СВЯЗЬ ЗАЯВОК И ТЕНДЕРОВ ===' as info;
SELECT 
    r.id as request_id,
    r.request_number,
    t.id as tender_id,
    t.tender_number,
    t.title,
    t.status
FROM requests r
LEFT JOIN tenders t ON r.id = t.request_id
LIMIT 10;

SELECT '=== КОЛИЧЕСТВО ТЕНДЕРОВ ПО ЗАЯВКАМ ===' as info;
SELECT 
    r.id as request_id,
    r.request_number,
    COUNT(t.id) as tender_count
FROM requests r
LEFT JOIN tenders t ON r.id = t.request_id
GROUP BY r.id, r.request_number
ORDER BY tender_count DESC;

SELECT '=== ЭЛЕМЕНТЫ ТЕНДЕРОВ ===' as info;
SELECT 
    t.tender_number,
    COUNT(ti.id) as items_count
FROM tenders t
LEFT JOIN tender_items ti ON t.id = ti.tender_id
GROUP BY t.id, t.tender_number
ORDER BY items_count DESC; 