-- Тест функциональности экспорта анализа цен в Excel
-- Создаем тестовые данные для проверки экспорта Excel отчета

-- 1. Создаем тестовый тендер с заявкой
INSERT INTO tenders (id, tender_number, title, description, customer_id, start_date, end_date, submission_deadline, status, requirements, terms_and_conditions, created_at, updated_at)
VALUES (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'TEST-EXCEL-001',
    'Тест экспорта Excel',
    'Тестовый тендер для проверки экспорта в Excel',
    (SELECT id FROM companies WHERE name = 'ООО "Тестовый заказчик"' LIMIT 1),
    NOW(),
    NOW() + INTERVAL '30 days',
    NOW() + INTERVAL '15 days',
    'BIDDING',
    'Тестовые требования для Excel',
    'Тестовые условия для Excel',
    NOW(),
    NOW()
);

-- 2. Создаем заявку для тендера
INSERT INTO requests (id, request_number, title, description, customer_id, status, created_at, updated_at)
VALUES (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    '22',
    'Заявка для тестирования Excel',
    'Тестовая заявка для проверки экспорта',
    (SELECT id FROM companies WHERE name = 'ООО "Тестовый заказчик"' LIMIT 1),
    'APPROVED',
    NOW(),
    NOW()
);

-- 3. Связываем тендер с заявкой
UPDATE tenders 
SET request_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'
WHERE id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

-- 4. Создаем позиции тендера (аналогично примеру Excel)
INSERT INTO tender_items (id, tender_id, item_number, description, quantity, unit_id, estimated_price, specifications, delivery_requirements, created_at, updated_at)
VALUES 
    ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 1, 'Монтажный дюбель-гвоздь 4.5х60, 1кг (111 шт.) - пакет', 1000.0, (SELECT id FROM units WHERE name = 'шт' LIMIT 1), 7.320, 'PH2 50', 'Доставка 30 дней', NOW(), NOW()),
    ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 2, 'Перчатки с двойным латексным обливом Gigant', 20.0, (SELECT id FROM units WHERE name = 'пар' LIMIT 1), 53.040, 'Размер L', 'Доставка 15 дней', NOW(), NOW()),
    ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 3, 'SORMAT Комплект для инжекции ITH 410 VE', 24.0, (SELECT id FROM units WHERE name = 'шт' LIMIT 1), 3596.400, '410 мл', 'Доставка 45 дней', NOW(), NOW()),
    ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 4, 'Бентонит бентонитовый шнур 10х20 мм', 50.0, (SELECT id FROM units WHERE name = 'пог.м' LIMIT 1), 273.600, '10х20 мм', 'Доставка 20 дней', NOW(), NOW());

-- 5. Создаем предложения от поставщиков

-- Поставщик 1: СанТехМаркет
INSERT INTO supplier_proposals (id, tender_id, supplier_id, proposal_number, submission_date, status, total_price, currency, payment_terms, delivery_terms, warranty_terms, is_best_offer, price_difference, created_at, updated_at)
VALUES (
    '11111111-1111-1111-1111-111111111111',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    (SELECT id FROM companies WHERE name LIKE '%СанТехМаркет%' LIMIT 1),
    'PROP-EXCEL-001',
    NOW(),
    'SUBMITTED',
    93060.0,
    'RUB',
    'Оплата по факту',
    'Доставка 30 дней',
    'Гарантия 1 год',
    false,
    0.0,
    NOW(),
    NOW()
);

-- Поставщик 2: СтройМаркет
INSERT INTO supplier_proposals (id, tender_id, supplier_id, proposal_number, submission_date, status, total_price, currency, payment_terms, delivery_terms, warranty_terms, is_best_offer, price_difference, created_at, updated_at)
VALUES (
    '22222222-2222-2222-2222-222222222222',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    (SELECT id FROM companies WHERE name LIKE '%СтройМаркет%' LIMIT 1),
    'PROP-EXCEL-002',
    NOW(),
    'SUBMITTED',
    95000.0,
    'RUB',
    'Оплата по факту',
    'Доставка 25 дней',
    'Гарантия 1 год',
    false,
    0.0,
    NOW(),
    NOW()
);

-- Поставщик 3: ИнструментПро
INSERT INTO supplier_proposals (id, tender_id, supplier_id, proposal_number, submission_date, status, total_price, currency, payment_terms, delivery_terms, warranty_terms, is_best_offer, price_difference, created_at, updated_at)
VALUES (
    '33333333-3333-3333-3333-333333333333',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    (SELECT id FROM companies WHERE name LIKE '%ИнструментПро%' LIMIT 1),
    'PROP-EXCEL-003',
    NOW(),
    'SUBMITTED',
    98000.0,
    'RUB',
    'Оплата по факту',
    'Доставка 35 дней',
    'Гарантия 1 год',
    false,
    0.0,
    NOW(),
    NOW()
);

-- 6. Создаем позиции предложений

-- Позиции для СанТехМаркет
INSERT INTO proposal_items (id, supplier_proposal_id, tender_item_id, item_number, description, quantity, unit_id, unit_price, total_price, specifications, delivery_period, warranty, additional_info, created_at, updated_at)
VALUES 
    ('44444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 1, 'Монтажный дюбель-гвоздь 4.5х60, 1кг (111 шт.) - пакет', 1000.0, (SELECT id FROM units WHERE name = 'шт' LIMIT 1), 6.50, 6500.0, 'PH2 50', '30 дней', '1 год', 'Высокое качество', NOW(), NOW()),
    ('55555555-5555-5555-5555-555555555555', '11111111-1111-1111-1111-111111111111', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 2, 'Перчатки с двойным латексным обливом Gigant', 20.0, (SELECT id FROM units WHERE name = 'пар' LIMIT 1), 45.00, 900.0, 'Размер L', '15 дней', '1 год', 'Надежная защита', NOW(), NOW()),
    ('66666666-6666-6666-6666-666666666666', '11111111-1111-1111-1111-111111111111', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 3, 'SORMAT Комплект для инжекции ITH 410 VE', 24.0, (SELECT id FROM units WHERE name = 'шт' LIMIT 1), 3200.00, 76800.0, '410 мл', '45 дней', '1 год', 'Профессиональное оборудование', NOW(), NOW()),
    ('77777777-7777-7777-7777-777777777777', '11111111-1111-1111-1111-111111111111', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 4, 'Бентонит бентонитовый шнур 10х20 мм', 50.0, (SELECT id FROM units WHERE name = 'пог.м' LIMIT 1), 250.00, 12500.0, '10х20 мм', '20 дней', '1 год', 'Гидроизоляция', NOW(), NOW());

-- Позиции для СтройМаркет
INSERT INTO proposal_items (id, supplier_proposal_id, tender_item_id, item_number, description, quantity, unit_id, unit_price, total_price, specifications, delivery_period, warranty, additional_info, created_at, updated_at)
VALUES 
    ('88888888-8888-8888-8888-888888888888', '22222222-2222-2222-2222-222222222222', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 1, 'Монтажный дюбель-гвоздь 4.5х60, 1кг (111 шт.) - пакет', 1000.0, (SELECT id FROM units WHERE name = 'шт' LIMIT 1), 7.00, 7000.0, 'PH2 50', '25 дней', '1 год', 'Среднее качество', NOW(), NOW()),
    ('99999999-9999-9999-9999-999999999999', '22222222-2222-2222-2222-222222222222', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 2, 'Перчатки с двойным латексным обливом Gigant', 20.0, (SELECT id FROM units WHERE name = 'пар' LIMIT 1), 50.00, 1000.0, 'Размер L', '15 дней', '1 год', 'Хорошая защита', NOW(), NOW()),
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222222', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 3, 'SORMAT Комплект для инжекции ITH 410 VE', 24.0, (SELECT id FROM units WHERE name = 'шт' LIMIT 1), 3300.00, 79200.0, '410 мл', '35 дней', '1 год', 'Качественное оборудование', NOW(), NOW()),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 4, 'Бентонит бентонитовый шнур 10х20 мм', 50.0, (SELECT id FROM units WHERE name = 'пог.м' LIMIT 1), 260.00, 13000.0, '10х20 мм', '20 дней', '1 год', 'Надежная гидроизоляция', NOW(), NOW());

-- Позиции для ИнструментПро
INSERT INTO proposal_items (id, supplier_proposal_id, tender_item_id, item_number, description, quantity, unit_id, unit_price, total_price, specifications, delivery_period, warranty, additional_info, created_at, updated_at)
VALUES 
    ('cccccccc-cccc-cccc-cccc-cccccccccccc', '33333333-3333-3333-3333-333333333333', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 1, 'Монтажный дюбель-гвоздь 4.5х60, 1кг (111 шт.) - пакет', 1000.0, (SELECT id FROM units WHERE name = 'шт' LIMIT 1), 7.50, 7500.0, 'PH2 50', '35 дней', '1 год', 'Премиум качество', NOW(), NOW()),
    ('dddddddd-dddd-dddd-dddd-dddddddddddd', '33333333-3333-3333-3333-333333333333', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 2, 'Перчатки с двойным латексным обливом Gigant', 20.0, (SELECT id FROM units WHERE name = 'пар' LIMIT 1), 55.00, 1100.0, 'Размер L', '15 дней', '1 год', 'Максимальная защита', NOW(), NOW()),
    ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '33333333-3333-3333-3333-333333333333', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 3, 'SORMAT Комплект для инжекции ITH 410 VE', 24.0, (SELECT id FROM units WHERE name = 'шт' LIMIT 1), 3400.00, 81600.0, '410 мл', '45 дней', '1 год', 'Профессиональное оборудование', NOW(), NOW()),
    ('ffffffff-ffff-ffff-ffff-ffffffffffff', '33333333-3333-3333-3333-333333333333', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 4, 'Бентонит бентонитовый шнур 10х20 мм', 50.0, (SELECT id FROM units WHERE name = 'пог.м' LIMIT 1), 270.00, 13500.0, '10х20 мм', '20 дней', '1 год', 'Высококачественная гидроизоляция', NOW(), NOW());

-- Проверочные запросы:

-- 1. Проверим созданный тендер
SELECT 
    t.id,
    t.tender_number,
    t.title,
    r.request_number,
    c.name as customer_name,
    COUNT(ti.id) as items_count,
    COUNT(sp.id) as proposals_count
FROM tenders t
LEFT JOIN requests r ON t.request_id = r.id
LEFT JOIN companies c ON t.customer_id = c.id
LEFT JOIN tender_items ti ON t.id = ti.tender_id
LEFT JOIN supplier_proposals sp ON t.id = sp.tender_id
WHERE t.id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
GROUP BY t.id, t.tender_number, t.title, r.request_number, c.name;

-- 2. Проверим позиции тендера
SELECT 
    ti.item_number,
    ti.description,
    ti.quantity,
    u.name as unit_name,
    ti.estimated_price,
    (ti.quantity * ti.estimated_price) as estimated_total
FROM tender_items ti
LEFT JOIN units u ON ti.unit_id = u.id
WHERE ti.tender_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
ORDER BY ti.item_number;

-- 3. Проверим предложения поставщиков
SELECT 
    sp.id,
    c.name as supplier_name,
    sp.proposal_number,
    sp.total_price,
    COUNT(pi.id) as items_count
FROM supplier_proposals sp
JOIN companies c ON sp.supplier_id = c.id
LEFT JOIN proposal_items pi ON sp.id = pi.supplier_proposal_id
WHERE sp.tender_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
GROUP BY sp.id, c.name, sp.proposal_number, sp.total_price
ORDER BY sp.total_price;

-- 4. Проверим позиции предложений
SELECT 
    sp.proposal_number,
    c.name as supplier_name,
    ti.item_number,
    ti.description,
    pi.unit_price,
    pi.total_price,
    pi.delivery_period
FROM proposal_items pi
JOIN supplier_proposals sp ON pi.supplier_proposal_id = sp.id
JOIN companies c ON sp.supplier_id = c.id
JOIN tender_items ti ON pi.tender_item_id = ti.id
WHERE sp.tender_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
ORDER BY sp.proposal_number, ti.item_number;

-- Ожидаемый результат Excel отчета:
-- Заголовок: "Тендер по заявке №22"
-- Заказчик: ООО "Тестовый заказчик"
-- Проект: Тест экспорта Excel
-- 4 позиции с ценами от 3 поставщиков
-- Лучшая цена: СанТехМаркет (93,060 руб.)
-- Вторая цена: СтройМаркет (95,000 руб.)
-- Третья цена: ИнструментПро (98,000 руб.)
