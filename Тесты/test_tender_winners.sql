-- Тестирование новой логики определения победителей тендера
-- Этот скрипт создает тестовые данные для проверки функциональности

-- Очистка существующих данных (опционально)
-- DELETE FROM proposal_items WHERE supplier_proposal_id IN (SELECT id FROM supplier_proposals WHERE tender_id = 'test-tender-id');
-- DELETE FROM supplier_proposals WHERE tender_id = 'test-tender-id';
-- DELETE FROM tender_items WHERE tender_id = 'test-tender-id';
-- DELETE FROM tenders WHERE id = 'test-tender-id';

-- Создание тестового тендера
INSERT INTO tenders (
    id, 
    tender_number, 
    title, 
    description, 
    customer_id, 
    status, 
    start_date, 
    end_date, 
    submission_deadline
) VALUES (
    '550e8400-e29b-41d4-a716-446655440001',
    'T-2024-001',
    'Тестовый тендер для проверки новой логики',
    'Тендер для тестирования определения победителей с учетом НДС и доставки',
    (SELECT id FROM companies WHERE name LIKE '%Тестовая компания%' LIMIT 1),
    'EVALUATION',
    NOW(),
    NOW() + INTERVAL '30 days',
    NOW() + INTERVAL '15 days'
) ON CONFLICT (id) DO NOTHING;

-- Создание позиций тендера
INSERT INTO tender_items (
    id,
    tender_id,
    item_number,
    description,
    quantity,
    unit_id,
    estimated_price
) VALUES 
(
    '550e8400-e29b-41d4-a716-446655440002',
    '550e8400-e29b-41d4-a716-446655440001',
    1,
    'Труба стальная 159x6 мм',
    100.0,
    (SELECT id FROM units WHERE name = 'м' LIMIT 1),
    1500.0
),
(
    '550e8400-e29b-41d4-a716-446655440003',
    '550e8400-e29b-41d4-a716-446655440001',
    2,
    'Кран шаровый DN150',
    10.0,
    (SELECT id FROM units WHERE name = 'шт' LIMIT 1),
    25000.0
),
(
    '550e8400-e29b-41d4-a716-446655440004',
    '550e8400-e29b-41d4-a716-446655440001',
    3,
    'Фланец стальной DN150',
    20.0,
    (SELECT id FROM units WHERE name = 'шт' LIMIT 1),
    5000.0
) ON CONFLICT (id) DO NOTHING;

-- Создание предложений от поставщиков
INSERT INTO supplier_proposals (
    id,
    tender_id,
    supplier_id,
    proposal_number,
    submission_date,
    status,
    total_price,
    currency
) VALUES 
(
    '550e8400-e29b-41d4-a716-446655440005',
    '550e8400-e29b-41d4-a716-446655440001',
    (SELECT id FROM companies WHERE name LIKE '%Поставщик 1%' LIMIT 1),
    'P-001',
    NOW() - INTERVAL '5 days',
    'SUBMITTED',
    450000.0,
    'RUB'
),
(
    '550e8400-e29b-41d4-a716-446655440006',
    '550e8400-e29b-41d4-a716-446655440001',
    (SELECT id FROM companies WHERE name LIKE '%Поставщик 2%' LIMIT 1),
    'P-002',
    NOW() - INTERVAL '3 days',
    'SUBMITTED',
    480000.0,
    'RUB'
),
(
    '550e8400-e29b-41d4-a716-446655440007',
    '550e8400-e29b-41d4-a716-446655440001',
    (SELECT id FROM companies WHERE name LIKE '%Поставщик 3%' LIMIT 1),
    'P-003',
    NOW() - INTERVAL '1 day',
    'SUBMITTED',
    420000.0,
    'RUB'
) ON CONFLICT (id) DO NOTHING;

-- Создание позиций предложений (Поставщик 1 - лучшие цены, но высокая доставка)
INSERT INTO proposal_items (
    id,
    supplier_proposal_id,
    tender_item_id,
    item_number,
    description,
    quantity,
    unit_price,
    total_price,
    delivery_cost
) VALUES 
-- Поставщик 1 - Позиция 1 (труба)
(
    '550e8400-e29b-41d4-a716-446655440008',
    '550e8400-e29b-41d4-a716-446655440005',
    '550e8400-e29b-41d4-a716-446655440002',
    1,
    'Труба стальная 159x6 мм',
    100.0,
    1400.0,  -- Лучшая цена
    140000.0,
    50000.0  -- Высокая доставка
),
-- Поставщик 1 - Позиция 2 (кран)
(
    '550e8400-e29b-41d4-a716-446655440009',
    '550e8400-e29b-41d4-a716-446655440005',
    '550e8400-e29b-41d4-a716-446655440003',
    2,
    'Кран шаровый DN150',
    10.0,
    22000.0, -- Лучшая цена
    220000.0,
    30000.0  -- Высокая доставка
),
-- Поставщик 1 - Позиция 3 (фланец)
(
    '550e8400-e29b-41d4-a716-446655440010',
    '550e8400-e29b-41d4-a716-446655440005',
    '550e8400-e29b-41d4-a716-446655440004',
    3,
    'Фланец стальной DN150',
    20.0,
    4500.0,  -- Лучшая цена
    90000.0,
    15000.0  -- Высокая доставка
),

-- Поставщик 2 - средние цены, средняя доставка
-- Поставщик 2 - Позиция 1 (труба)
(
    '550e8400-e29b-41d4-a716-446655440011',
    '550e8400-e29b-41d4-a716-446655440006',
    '550e8400-e29b-41d4-a716-446655440002',
    1,
    'Труба стальная 159x6 мм',
    100.0,
    1500.0,  -- Средняя цена
    150000.0,
    25000.0  -- Средняя доставка
),
-- Поставщик 2 - Позиция 2 (кран)
(
    '550e8400-e29b-41d4-a716-446655440012',
    '550e8400-e29b-41d4-a716-446655440006',
    '550e8400-e29b-41d4-a716-446655440003',
    2,
    'Кран шаровый DN150',
    10.0,
    25000.0, -- Средняя цена
    250000.0,
    15000.0  -- Средняя доставка
),
-- Поставщик 2 - Позиция 3 (фланец)
(
    '550e8400-e29b-41d4-a716-446655440013',
    '550e8400-e29b-41d4-a716-446655440006',
    '550e8400-e29b-41d4-a716-446655440004',
    3,
    'Фланец стальной DN150',
    20.0,
    5000.0,  -- Средняя цена
    100000.0,
    8000.0   -- Средняя доставка
),

-- Поставщик 3 - высокие цены, но низкая доставка
-- Поставщик 3 - Позиция 1 (труба)
(
    '550e8400-e29b-41d4-a716-446655440014',
    '550e8400-e29b-41d4-a716-446655440007',
    '550e8400-e29b-41d4-a716-446655440002',
    1,
    'Труба стальная 159x6 мм',
    100.0,
    1600.0,  -- Высокая цена
    160000.0,
    10000.0  -- Низкая доставка
),
-- Поставщик 3 - Позиция 2 (кран)
(
    '550e8400-e29b-41d4-a716-446655440015',
    '550e8400-e29b-41d4-a716-446655440007',
    '550e8400-e29b-41d4-a716-446655440003',
    2,
    'Кран шаровый DN150',
    10.0,
    28000.0, -- Высокая цена
    280000.0,
    5000.0   -- Низкая доставка
),
-- Поставщик 3 - Позиция 3 (фланец)
(
    '550e8400-e29b-41d4-a716-446655440016',
    '550e8400-e29b-41d4-a716-446655440007',
    '550e8400-e29b-41d4-a716-446655440004',
    3,
    'Фланец стальной DN150',
    20.0,
    5500.0,  -- Высокая цена
    110000.0,
    3000.0   -- Низкая доставка
) ON CONFLICT (id) DO NOTHING;

-- Вывод тестовых данных для проверки
SELECT 
    'Тендер' as entity_type,
    t.tender_number,
    t.title,
    t.status
FROM tenders t 
WHERE t.id = '550e8400-e29b-41d4-a716-446655440001';

SELECT 
    'Позиции тендера' as entity_type,
    ti.item_number,
    ti.description,
    ti.quantity,
    ti.estimated_price,
    u.name as unit_name
FROM tender_items ti
LEFT JOIN units u ON ti.unit_id = u.id
WHERE ti.tender_id = '550e8400-e29b-41d4-a716-446655440001'
ORDER BY ti.item_number;

SELECT 
    'Предложения поставщиков' as entity_type,
    sp.proposal_number,
    c.name as supplier_name,
    sp.total_price,
    sp.status
FROM supplier_proposals sp
LEFT JOIN companies c ON sp.supplier_id = c.id
WHERE sp.tender_id = '550e8400-e29b-41d4-a716-446655440001'
ORDER BY sp.submission_date;

SELECT 
    'Позиции предложений' as entity_type,
    c.name as supplier_name,
    pi.item_number,
    pi.description,
    pi.quantity,
    pi.unit_price,
    pi.total_price,
    pi.delivery_cost,
    -- Расчет с НДС и доставкой
    (pi.total_price * 1.2 + pi.delivery_cost) as total_with_vat_and_delivery
FROM proposal_items pi
LEFT JOIN supplier_proposals sp ON pi.supplier_proposal_id = sp.id
LEFT JOIN companies c ON sp.supplier_id = c.id
WHERE sp.tender_id = '550e8400-e29b-41d4-a716-446655440001'
ORDER BY pi.item_number, (pi.total_price * 1.2 + pi.delivery_cost);

-- Ожидаемые результаты:
-- Позиция 1 (труба): Поставщик 3 должен быть победителем (218000 vs 205000 vs 192000)
-- Позиция 2 (кран): Поставщик 3 должен быть победителем (341000 vs 315000 vs 294000)  
-- Позиция 3 (фланец): Поставщик 3 должен быть победителем (135000 vs 128000 vs 123000)

-- Комментарий: Поставщик 3 имеет самые высокие цены, но самую низкую доставку,
-- что делает его общую стоимость с НДС и доставкой самой низкой по всем позициям.
