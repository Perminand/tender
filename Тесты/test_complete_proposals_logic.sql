-- Тест логики полных предложений
-- Создаем тестовые данные для проверки логики определения лучшего полного предложения

-- 1. Создаем тестовый тендер с несколькими позициями
INSERT INTO tenders (id, tender_number, title, description, customer_id, start_date, end_date, submission_deadline, status, requirements, terms_and_conditions, created_at, updated_at)
VALUES (
    '11111111-1111-1111-1111-111111111111',
    'TEST-COMPLETE-001',
    'Тест полных предложений',
    'Тестовый тендер для проверки логики полных предложений',
    (SELECT id FROM companies WHERE name = 'ООО "Тестовый заказчик"' LIMIT 1),
    NOW(),
    NOW() + INTERVAL '30 days',
    NOW() + INTERVAL '15 days',
    'BIDDING',
    'Тестовые требования',
    'Тестовые условия',
    NOW(),
    NOW()
);

-- 2. Создаем позиции тендера
INSERT INTO tender_items (id, tender_id, item_number, description, quantity, unit_id, estimated_price, specifications, delivery_requirements, created_at, updated_at)
VALUES 
    ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 1, 'Позиция 1 - Полная', 10.0, (SELECT id FROM units WHERE name = 'шт' LIMIT 1), 1000.0, 'Спецификация 1', 'Доставка 1', NOW(), NOW()),
    ('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 2, 'Позиция 2 - Полная', 5.0, (SELECT id FROM units WHERE name = 'шт' LIMIT 1), 2000.0, 'Спецификация 2', 'Доставка 2', NOW(), NOW()),
    ('44444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', 3, 'Позиция 3 - Полная', 3.0, (SELECT id FROM units WHERE name = 'шт' LIMIT 1), 1500.0, 'Спецификация 3', 'Доставка 3', NOW(), NOW());

-- 3. Создаем предложения от разных поставщиков

-- Поставщик 1: Полное предложение (все позиции) - лучшая цена
INSERT INTO supplier_proposals (id, tender_id, supplier_id, proposal_number, submission_date, status, total_price, currency, payment_terms, delivery_terms, warranty_terms, is_best_offer, price_difference, created_at, updated_at)
VALUES (
    '55555555-5555-5555-5555-555555555555',
    '11111111-1111-1111-1111-111111111111',
    (SELECT id FROM companies WHERE name LIKE '%Поставщик 1%' LIMIT 1),
    'PROP-001',
    NOW(),
    'SUBMITTED',
    45000.0, -- 10*1000 + 5*2000 + 3*1500 = 45000
    'RUB',
    'Оплата по факту',
    'Доставка 30 дней',
    'Гарантия 1 год',
    false,
    0.0,
    NOW(),
    NOW()
);

-- Поставщик 2: Полное предложение (все позиции) - вторая цена
INSERT INTO supplier_proposals (id, tender_id, supplier_id, proposal_number, submission_date, status, total_price, currency, payment_terms, delivery_terms, warranty_terms, is_best_offer, price_difference, created_at, updated_at)
VALUES (
    '66666666-6666-6666-6666-666666666666',
    '11111111-1111-1111-1111-111111111111',
    (SELECT id FROM companies WHERE name LIKE '%Поставщик 2%' LIMIT 1),
    'PROP-002',
    NOW(),
    'SUBMITTED',
    50000.0, -- 10*1100 + 5*2200 + 3*1600 = 50000
    'RUB',
    'Оплата по факту',
    'Доставка 30 дней',
    'Гарантия 1 год',
    false,
    0.0,
    NOW(),
    NOW()
);

-- Поставщик 3: Неполное предложение (только 2 позиции) - самая низкая цена, но не должна быть лучшей
INSERT INTO supplier_proposals (id, tender_id, supplier_id, proposal_number, submission_date, status, total_price, currency, payment_terms, delivery_terms, warranty_terms, is_best_offer, price_difference, created_at, updated_at)
VALUES (
    '77777777-7777-7777-7777-777777777777',
    '11111111-1111-1111-1111-111111111111',
    (SELECT id FROM companies WHERE name LIKE '%Поставщик 3%' LIMIT 1),
    'PROP-003',
    NOW(),
    'SUBMITTED',
    30000.0, -- Только 2 позиции, но самая низкая цена
    'RUB',
    'Оплата по факту',
    'Доставка 30 дней',
    'Гарантия 1 год',
    false,
    0.0,
    NOW(),
    NOW()
);

-- 4. Создаем позиции предложений

-- Позиции для Поставщика 1 (полное предложение)
INSERT INTO proposal_items (id, supplier_proposal_id, tender_item_id, item_number, description, quantity, unit_id, unit_price, total_price, specifications, delivery_period, warranty, additional_info, created_at, updated_at)
VALUES 
    ('88888888-8888-8888-8888-888888888888', '55555555-5555-5555-5555-555555555555', '22222222-2222-2222-2222-222222222222', 1, 'Позиция 1 - Полная', 10.0, (SELECT id FROM units WHERE name = 'шт' LIMIT 1), 1000.0, 10000.0, 'Спецификация 1', '30 дней', '1 год', 'Дополнительная информация', NOW(), NOW()),
    ('99999999-9999-9999-9999-999999999999', '55555555-5555-5555-5555-555555555555', '33333333-3333-3333-3333-333333333333', 2, 'Позиция 2 - Полная', 5.0, (SELECT id FROM units WHERE name = 'шт' LIMIT 1), 2000.0, 10000.0, 'Спецификация 2', '30 дней', '1 год', 'Дополнительная информация', NOW(), NOW()),
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '55555555-5555-5555-5555-555555555555', '44444444-4444-4444-4444-444444444444', 3, 'Позиция 3 - Полная', 3.0, (SELECT id FROM units WHERE name = 'шт' LIMIT 1), 1500.0, 4500.0, 'Спецификация 3', '30 дней', '1 год', 'Дополнительная информация', NOW(), NOW());

-- Позиции для Поставщика 2 (полное предложение)
INSERT INTO proposal_items (id, supplier_proposal_id, tender_item_id, item_number, description, quantity, unit_id, unit_price, total_price, specifications, delivery_period, warranty, additional_info, created_at, updated_at)
VALUES 
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '66666666-6666-6666-6666-666666666666', '22222222-2222-2222-2222-222222222222', 1, 'Позиция 1 - Полная', 10.0, (SELECT id FROM units WHERE name = 'шт' LIMIT 1), 1100.0, 11000.0, 'Спецификация 1', '30 дней', '1 год', 'Дополнительная информация', NOW(), NOW()),
    ('cccccccc-cccc-cccc-cccc-cccccccccccc', '66666666-6666-6666-6666-666666666666', '33333333-3333-3333-3333-333333333333', 2, 'Позиция 2 - Полная', 5.0, (SELECT id FROM units WHERE name = 'шт' LIMIT 1), 2200.0, 11000.0, 'Спецификация 2', '30 дней', '1 год', 'Дополнительная информация', NOW(), NOW()),
    ('dddddddd-dddd-dddd-dddd-dddddddddddd', '66666666-6666-6666-6666-666666666666', '44444444-4444-4444-4444-444444444444', 3, 'Позиция 3 - Полная', 3.0, (SELECT id FROM units WHERE name = 'шт' LIMIT 1), 1600.0, 4800.0, 'Спецификация 3', '30 дней', '1 год', 'Дополнительная информация', NOW(), NOW());

-- Позиции для Поставщика 3 (неполное предложение - только 2 позиции)
INSERT INTO proposal_items (id, supplier_proposal_id, tender_item_id, item_number, description, quantity, unit_id, unit_price, total_price, specifications, delivery_period, warranty, additional_info, created_at, updated_at)
VALUES 
    ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '77777777-7777-7777-7777-777777777777', '22222222-2222-2222-2222-222222222222', 1, 'Позиция 1 - Полная', 10.0, (SELECT id FROM units WHERE name = 'шт' LIMIT 1), 800.0, 8000.0, 'Спецификация 1', '30 дней', '1 год', 'Дополнительная информация', NOW(), NOW()),
    ('ffffffff-ffff-ffff-ffff-ffffffffffff', '77777777-7777-7777-7777-777777777777', '33333333-3333-3333-3333-333333333333', 2, 'Позиция 2 - Полная', 5.0, (SELECT id FROM units WHERE name = 'шт' LIMIT 1), 1800.0, 9000.0, 'Спецификация 2', '30 дней', '1 год', 'Дополнительная информация', NOW(), NOW());
    -- Отсутствует позиция 3!

-- Проверочные запросы:

-- 1. Проверим все предложения для тендера
SELECT 
    sp.id,
    c.name as supplier_name,
    sp.proposal_number,
    sp.total_price,
    COUNT(pi.id) as items_count,
    (SELECT COUNT(*) FROM tender_items WHERE tender_id = '11111111-1111-1111-1111-111111111111') as total_tender_items
FROM supplier_proposals sp
JOIN companies c ON sp.supplier_id = c.id
LEFT JOIN proposal_items pi ON sp.id = pi.supplier_proposal_id
WHERE sp.tender_id = '11111111-1111-1111-1111-111111111111'
GROUP BY sp.id, c.name, sp.proposal_number, sp.total_price
ORDER BY sp.total_price;

-- 2. Проверим полные предложения (содержащие все позиции)
WITH tender_items_count AS (
    SELECT COUNT(*) as total_items
    FROM tender_items 
    WHERE tender_id = '11111111-1111-1111-1111-111111111111'
),
proposal_items_count AS (
    SELECT 
        sp.id,
        sp.total_price,
        COUNT(pi.id) as items_count
    FROM supplier_proposals sp
    LEFT JOIN proposal_items pi ON sp.id = pi.supplier_proposal_id
    WHERE sp.tender_id = '11111111-1111-1111-1111-111111111111'
    GROUP BY sp.id, sp.total_price
)
SELECT 
    sp.id,
    c.name as supplier_name,
    sp.proposal_number,
    sp.total_price,
    pic.items_count,
    tic.total_items,
    CASE WHEN pic.items_count = tic.total_items THEN 'ПОЛНОЕ' ELSE 'НЕПОЛНОЕ' END as proposal_type
FROM supplier_proposals sp
JOIN companies c ON sp.supplier_id = c.id
JOIN proposal_items_count pic ON sp.id = pic.id
CROSS JOIN tender_items_count tic
WHERE sp.tender_id = '11111111-1111-1111-1111-111111111111'
ORDER BY sp.total_price;

-- Ожидаемый результат:
-- Поставщик 1: ПОЛНОЕ предложение, цена 45000 - должно быть лучшим
-- Поставщик 2: ПОЛНОЕ предложение, цена 50000 - второе место
-- Поставщик 3: НЕПОЛНОЕ предложение, цена 30000 - не должно учитываться как лучшее
