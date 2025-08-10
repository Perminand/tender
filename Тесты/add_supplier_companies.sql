-- SQL скрипт для добавления 10 компаний-поставщиков
-- Выполнить после создания основных таблиц и типов компаний

-- Добавление компаний-поставщиков
INSERT INTO companies (
    id, 
    inn, 
    kpp, 
    ogrn, 
    name, 
    address, 
    company_type_id, 
    director, 
    phone, 
    email, 
    legal_name, 
    short_name,
    role,
    send_notifications,
    created_at,
    updated_at
) VALUES
-- Поставщик 1: Строительные материалы
(
    uuid_generate_v4(),
    '7701234567',
    '770101001',
    '1027701234567',
    'ООО "СтройМаркет"',
    'г. Москва, ул. Строителей, д. 15, оф. 201',
    (SELECT id FROM company_types WHERE name = 'ООО' LIMIT 1),
    'Козлов Александр Петрович',
    '+74951234567',
    'info@stroymarket.ru',
    'ОБЩЕСТВО С ОГРАНИЧЕННОЙ ОТВЕТСТВЕННОСТЬЮ "СТРОЙМАРКЕТ"',
    'СтройМаркет',
    'SUPPLIER',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
-- Поставщик 2: Электрооборудование
(
    uuid_generate_v4(),
    '7702345678',
    '770101002',
    '1027702345678',
    'ООО "ЭлектроСнаб"',
    'г. Москва, ул. Электриков, д. 8, стр. 1',
    (SELECT id FROM company_types WHERE name = 'ООО' LIMIT 1),
    'Петров Сергей Владимирович',
    '+74952345678',
    'sales@electrosnab.ru',
    'ОБЩЕСТВО С ОГРАНИЧЕННОЙ ОТВЕТСТВЕННОСТЬЮ "ЭЛЕКТРОСНАБ"',
    'ЭлектроСнаб',
    'SUPPLIER',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
-- Поставщик 3: Сантехника
(
    uuid_generate_v4(),
    '7703456789',
    '770101003',
    '1027703456789',
    'ООО "СанТехМаркет"',
    'г. Москва, ул. Водопроводная, д. 25',
    (SELECT id FROM company_types WHERE name = 'ООО' LIMIT 1),
    'Сидоров Михаил Иванович',
    '+74953456789',
    'info@santechmarket.ru',
    'ОБЩЕСТВО С ОГРАНИЧЕННОЙ ОТВЕТСТВЕННОСТЬЮ "САНТЕХМАРКЕТ"',
    'СанТехМаркет',
    'SUPPLIER',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
-- Поставщик 4: Отделочные материалы
(
    uuid_generate_v4(),
    '7704567890',
    '770101004',
    '1027704567890',
    'ООО "ОтделкаПро"',
    'г. Москва, ул. Отделочная, д. 12, оф. 305',
    (SELECT id FROM company_types WHERE name = 'ООО' LIMIT 1),
    'Иванова Елена Александровна',
    '+74954567890',
    'sales@otdelkapro.ru',
    'ОБЩЕСТВО С ОГРАНИЧЕННОЙ ОТВЕТСТВЕННОСТЬЮ "ОТДЕЛКАПРО"',
    'ОтделкаПро',
    'SUPPLIER',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
-- Поставщик 5: Инструменты и оборудование
(
    uuid_generate_v4(),
    '7705678901',
    '770101005',
    '1027705678901',
    'ООО "ИнструментСтрой"',
    'г. Москва, ул. Инструментальная, д. 33',
    (SELECT id FROM company_types WHERE name = 'ООО' LIMIT 1),
    'Николаев Дмитрий Сергеевич',
    '+74955678901',
    'info@instrumentstroy.ru',
    'ОБЩЕСТВО С ОГРАНИЧЕННОЙ ОТВЕТСТВЕННОСТЬЮ "ИНСТРУМЕНТСТРОЙ"',
    'ИнструментСтрой',
    'SUPPLIER',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
-- Поставщик 6: Металлоконструкции
(
    uuid_generate_v4(),
    '7706789012',
    '770101006',
    '1027706789012',
    'ООО "МеталлСтрой"',
    'г. Москва, ул. Металлургов, д. 45, стр. 2',
    (SELECT id FROM company_types WHERE name = 'ООО' LIMIT 1),
    'Волков Андрей Николаевич',
    '+74956789012',
    'sales@metallstroy.ru',
    'ОБЩЕСТВО С ОГРАНИЧЕННОЙ ОТВЕТСТВЕННОСТЬЮ "МЕТАЛЛСТРОЙ"',
    'МеталлСтрой',
    'SUPPLIER',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
-- Поставщик 7: Кровельные материалы
(
    uuid_generate_v4(),
    '7707890123',
    '770101007',
    '1027707890123',
    'ООО "КровляМаркет"',
    'г. Москва, ул. Кровельная, д. 18, оф. 401',
    (SELECT id FROM company_types WHERE name = 'ООО' LIMIT 1),
    'Соколов Павел Викторович',
    '+74957890123',
    'info@krovlyamarket.ru',
    'ОБЩЕСТВО С ОГРАНИЧЕННОЙ ОТВЕТСТВЕННОСТЬЮ "КРОВЛЯМАРКЕТ"',
    'КровляМаркет',
    'SUPPLIER',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
-- Поставщик 8: Окна и двери
(
    uuid_generate_v4(),
    '7708901234',
    '770101008',
    '1027708901234',
    'ООО "ОкнаДвери"',
    'г. Москва, ул. Оконная, д. 7, стр. 3',
    (SELECT id FROM company_types WHERE name = 'ООО' LIMIT 1),
    'Морозов Игорь Петрович',
    '+74958901234',
    'sales@oknadveri.ru',
    'ОБЩЕСТВО С ОГРАНИЧЕННОЙ ОТВЕТСТВЕННОСТЬЮ "ОКНАДВЕРИ"',
    'ОкнаДвери',
    'SUPPLIER',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
-- Поставщик 9: Лакокрасочные материалы
(
    uuid_generate_v4(),
    '7709012345',
    '770101009',
    '1027709012345',
    'ООО "КраскаМаркет"',
    'г. Москва, ул. Красильная, д. 22, оф. 205',
    (SELECT id FROM company_types WHERE name = 'ООО' LIMIT 1),
    'Зайцева Анна Михайловна',
    '+74959012345',
    'info@kraskamarket.ru',
    'ОБЩЕСТВО С ОГРАНИЧЕННОЙ ОТВЕТСТВЕННОСТЬЮ "КРАСКАМАРКЕТ"',
    'КраскаМаркет',
    'SUPPLIER',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
-- Поставщик 10: Бетон и ЖБИ
(
    uuid_generate_v4(),
    '7700123456',
    '770101010',
    '1027700123456',
    'ООО "БетонСтрой"',
    'г. Москва, ул. Бетонная, д. 55, стр. 1',
    (SELECT id FROM company_types WHERE name = 'ООО' LIMIT 1),
    'Романов Виктор Александрович',
    '+74950123456',
    'sales@betonstroy.ru',
    'ОБЩЕСТВО С ОГРАНИЧЕННОЙ ОТВЕТСТВЕННОСТЬЮ "БЕТОНСТРОЙ"',
    'БетонСтрой',
    'SUPPLIER',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Добавление контактных лиц для поставщиков
INSERT INTO contact_persons (id, first_name, last_name, position, company_id) VALUES
(uuid_generate_v4(), 'Александр', 'Козлов', 'Генеральный директор', (SELECT id FROM companies WHERE name = 'ООО "СтройМаркет"' LIMIT 1)),
(uuid_generate_v4(), 'Сергей', 'Петров', 'Коммерческий директор', (SELECT id FROM companies WHERE name = 'ООО "ЭлектроСнаб"' LIMIT 1)),
(uuid_generate_v4(), 'Михаил', 'Сидоров', 'Директор по продажам', (SELECT id FROM companies WHERE name = 'ООО "СанТехМаркет"' LIMIT 1)),
(uuid_generate_v4(), 'Елена', 'Иванова', 'Руководитель отдела продаж', (SELECT id FROM companies WHERE name = 'ООО "ОтделкаПро"' LIMIT 1)),
(uuid_generate_v4(), 'Дмитрий', 'Николаев', 'Технический директор', (SELECT id FROM companies WHERE name = 'ООО "ИнструментСтрой"' LIMIT 1)),
(uuid_generate_v4(), 'Андрей', 'Волков', 'Директор по развитию', (SELECT id FROM companies WHERE name = 'ООО "МеталлСтрой"' LIMIT 1)),
(uuid_generate_v4(), 'Павел', 'Соколов', 'Коммерческий директор', (SELECT id FROM companies WHERE name = 'ООО "КровляМаркет"' LIMIT 1)),
(uuid_generate_v4(), 'Игорь', 'Морозов', 'Руководитель проектов', (SELECT id FROM companies WHERE name = 'ООО "ОкнаДвери"' LIMIT 1)),
(uuid_generate_v4(), 'Анна', 'Зайцева', 'Менеджер по работе с клиентами', (SELECT id FROM companies WHERE name = 'ООО "КраскаМаркет"' LIMIT 1)),
(uuid_generate_v4(), 'Виктор', 'Романов', 'Технический директор', (SELECT id FROM companies WHERE name = 'ООО "БетонСтрой"' LIMIT 1));

-- Добавление контактов для поставщиков
INSERT INTO contacts (id, contact_type_id, contact_person_id, value) VALUES
-- Телефоны
(uuid_generate_v4(), (SELECT id FROM contact_types WHERE name = 'Телефон' LIMIT 1), (SELECT id FROM contact_persons WHERE first_name = 'Александр' AND last_name = 'Козлов' LIMIT 1), '+74951234567'),
(uuid_generate_v4(), (SELECT id FROM contact_types WHERE name = 'Телефон' LIMIT 1), (SELECT id FROM contact_persons WHERE first_name = 'Сергей' AND last_name = 'Петров' LIMIT 1), '+74952345678'),
(uuid_generate_v4(), (SELECT id FROM contact_types WHERE name = 'Телефон' LIMIT 1), (SELECT id FROM contact_persons WHERE first_name = 'Михаил' AND last_name = 'Сидоров' LIMIT 1), '+74953456789'),
(uuid_generate_v4(), (SELECT id FROM contact_types WHERE name = 'Телефон' LIMIT 1), (SELECT id FROM contact_persons WHERE first_name = 'Елена' AND last_name = 'Иванова' LIMIT 1), '+74954567890'),
(uuid_generate_v4(), (SELECT id FROM contact_types WHERE name = 'Телефон' LIMIT 1), (SELECT id FROM contact_persons WHERE first_name = 'Дмитрий' AND last_name = 'Николаев' LIMIT 1), '+74955678901'),
(uuid_generate_v4(), (SELECT id FROM contact_types WHERE name = 'Телефон' LIMIT 1), (SELECT id FROM contact_persons WHERE first_name = 'Андрей' AND last_name = 'Волков' LIMIT 1), '+74956789012'),
(uuid_generate_v4(), (SELECT id FROM contact_types WHERE name = 'Телефон' LIMIT 1), (SELECT id FROM contact_persons WHERE first_name = 'Павел' AND last_name = 'Соколов' LIMIT 1), '+74957890123'),
(uuid_generate_v4(), (SELECT id FROM contact_types WHERE name = 'Телефон' LIMIT 1), (SELECT id FROM contact_persons WHERE first_name = 'Игорь' AND last_name = 'Морозов' LIMIT 1), '+74958901234'),
(uuid_generate_v4(), (SELECT id FROM contact_types WHERE name = 'Телефон' LIMIT 1), (SELECT id FROM contact_persons WHERE first_name = 'Анна' AND last_name = 'Зайцева' LIMIT 1), '+74959012345'),
(uuid_generate_v4(), (SELECT id FROM contact_types WHERE name = 'Телефон' LIMIT 1), (SELECT id FROM contact_persons WHERE first_name = 'Виктор' AND last_name = 'Романов' LIMIT 1), '+74950123456'),
-- Email адреса
(uuid_generate_v4(), (SELECT id FROM contact_types WHERE name = 'Email' LIMIT 1), (SELECT id FROM contact_persons WHERE first_name = 'Александр' AND last_name = 'Козлов' LIMIT 1), 'kozlov@stroymarket.ru'),
(uuid_generate_v4(), (SELECT id FROM contact_types WHERE name = 'Email' LIMIT 1), (SELECT id FROM contact_persons WHERE first_name = 'Сергей' AND last_name = 'Петров' LIMIT 1), 'petrov@electrosnab.ru'),
(uuid_generate_v4(), (SELECT id FROM contact_types WHERE name = 'Email' LIMIT 1), (SELECT id FROM contact_persons WHERE first_name = 'Михаил' AND last_name = 'Сидоров' LIMIT 1), 'sidorov@santechmarket.ru'),
(uuid_generate_v4(), (SELECT id FROM contact_types WHERE name = 'Email' LIMIT 1), (SELECT id FROM contact_persons WHERE first_name = 'Елена' AND last_name = 'Иванова' LIMIT 1), 'ivanova@otdelkapro.ru'),
(uuid_generate_v4(), (SELECT id FROM contact_types WHERE name = 'Email' LIMIT 1), (SELECT id FROM contact_persons WHERE first_name = 'Дмитрий' AND last_name = 'Николаев' LIMIT 1), 'nikolaev@instrumentstroy.ru'),
(uuid_generate_v4(), (SELECT id FROM contact_types WHERE name = 'Email' LIMIT 1), (SELECT id FROM contact_persons WHERE first_name = 'Андрей' AND last_name = 'Волков' LIMIT 1), 'volkov@metallstroy.ru'),
(uuid_generate_v4(), (SELECT id FROM contact_types WHERE name = 'Email' LIMIT 1), (SELECT id FROM contact_persons WHERE first_name = 'Павел' AND last_name = 'Соколов' LIMIT 1), 'sokolov@krovlyamarket.ru'),
(uuid_generate_v4(), (SELECT id FROM contact_types WHERE name = 'Email' LIMIT 1), (SELECT id FROM contact_persons WHERE first_name = 'Игорь' AND last_name = 'Морозов' LIMIT 1), 'morozov@oknadveri.ru'),
(uuid_generate_v4(), (SELECT id FROM contact_types WHERE name = 'Email' LIMIT 1), (SELECT id FROM contact_persons WHERE first_name = 'Анна' AND last_name = 'Зайцева' LIMIT 1), 'zaytseva@kraskamarket.ru'),
(uuid_generate_v4(), (SELECT id FROM contact_types WHERE name = 'Email' LIMIT 1), (SELECT id FROM contact_persons WHERE first_name = 'Виктор' AND last_name = 'Романов' LIMIT 1), 'romanov@betonstroy.ru');

-- Добавление банковских счетов для поставщиков
INSERT INTO company_bank_accounts (id, checking_account, company_id, bank_bik) VALUES
(uuid_generate_v4(), '40702810912345678901', (SELECT id FROM companies WHERE name = 'ООО "СтройМаркет"' LIMIT 1), '044525225'),
(uuid_generate_v4(), '40702810923456789012', (SELECT id FROM companies WHERE name = 'ООО "ЭлектроСнаб"' LIMIT 1), '044525593'),
(uuid_generate_v4(), '40702810934567890123', (SELECT id FROM companies WHERE name = 'ООО "СанТехМаркет"' LIMIT 1), '044525974'),
(uuid_generate_v4(), '40702810945678901234', (SELECT id FROM companies WHERE name = 'ООО "ОтделкаПро"' LIMIT 1), '044525823'),
(uuid_generate_v4(), '40702810956789012345', (SELECT id FROM companies WHERE name = 'ООО "ИнструментСтрой"' LIMIT 1), '044525000'),
(uuid_generate_v4(), '40702810967890123456', (SELECT id FROM companies WHERE name = 'ООО "МеталлСтрой"' LIMIT 1), '044525222'),
(uuid_generate_v4(), '40702810978901234567', (SELECT id FROM companies WHERE name = 'ООО "КровляМаркет"' LIMIT 1), '044525111'),
(uuid_generate_v4(), '40702810989012345678', (SELECT id FROM companies WHERE name = 'ООО "ОкнаДвери"' LIMIT 1), '044525333'),
(uuid_generate_v4(), '40702810990123456789', (SELECT id FROM companies WHERE name = 'ООО "КраскаМаркет"' LIMIT 1), '044525444'),
(uuid_generate_v4(), '40702810901234567890', (SELECT id FROM companies WHERE name = 'ООО "БетонСтрой"' LIMIT 1), '044525555');

-- Вывод информации о добавленных поставщиках
SELECT 
    c.name as company_name,
    c.inn,
    c.phone,
    c.email,
    c.role,
    ct.name as contact_person,
    cp.position,
    co.value as contact_value,
    cba.checking_account,
    b.name as bank_name
FROM companies c
LEFT JOIN contact_persons cp ON cp.company_id = c.id
LEFT JOIN contacts co ON co.contact_person_id = cp.id
LEFT JOIN contact_types ct ON ct.id = co.contact_type_id
LEFT JOIN company_bank_accounts cba ON cba.company_id = c.id
LEFT JOIN banks b ON b.bik = cba.bank_bik
WHERE c.role = 'SUPPLIER'
ORDER BY c.name;
