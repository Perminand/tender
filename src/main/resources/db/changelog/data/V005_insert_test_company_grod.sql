--liquibase formatted sql
--changeset ai:testdata-grod-company

-- Add company type for "Общества с ограниченной ответственностью" if not exists
INSERT INTO company_types (id, name) 
SELECT uuid_generate_v4(), 'Общества с ограниченной ответственностью'
WHERE NOT EXISTS (SELECT 1 FROM company_types WHERE name = 'Общества с ограниченной ответственностью');

-- Add the test company ООО "СП "ГОРОД"
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
) VALUES (
    '27dbb139-751e-4d6f-a024-d91afec82506',
    '7805298833',
    '780501001',
    '1047808018037',
    'ОБЩЕСТВО С ОГРАНИЧЕННОЙ ОТВЕТСТВЕННОСТЬЮ "СТРОИТЕЛЬНОЕ ПРЕДПРИЯТИЕ "ГОРОД"',
    'г. Санкт-Петербург, пр-кт Ленинский, д.140, лит.Е',
    (SELECT id FROM company_types WHERE name = 'Общества с ограниченной ответственностью'),
    'Аврутин Михаил Эдуардович',
    '+78120163604',
    'ponomarreva-l@yandex.ru',
    'ООО "СП "ГОРОД"',
    'ООО "СП "ГОРОД"',
    'CUSTOMER',
    false,
    '2025-07-31 08:36:12.845 +0300',
    '2025-07-31 08:36:12.845 +0300'
); 