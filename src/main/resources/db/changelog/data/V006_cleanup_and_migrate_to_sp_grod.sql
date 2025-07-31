--liquibase formatted sql
--changeset ai:cleanup-and-migrate-to-sp-grod

-- Удаляем все данные, связанные со старыми компаниями
-- Сначала удаляем связанные данные в правильном порядке (из-за внешних ключей)

-- Удаляем роли пользователей
DELETE FROM user_roles;

-- Удаляем пользователей
DELETE FROM users;

-- Удаляем контакты
DELETE FROM contacts;

-- Удаляем контактные лица
DELETE FROM contact_persons;

-- Удаляем банковские счета компаний
DELETE FROM company_bank_accounts;

-- Удаляем данные о маппинге поставщиков и материалов
DELETE FROM org_supplier_material_mapping;

-- Удаляем элементы тендеров (tender_items) - сначала удаляем зависимые данные
DELETE FROM tender_items;

-- Удаляем тендеры (tenders) - теперь можно удалить, так как нет зависимых элементов
DELETE FROM tenders;

-- Удаляем материалы заявок (request_materials) - сначала удаляем зависимые данные
DELETE FROM request_materials;

-- Удаляем заявки (requests) - теперь можно удалить, так как нет зависимых данных
DELETE FROM requests;

-- Удаляем связи материалов с единицами измерения
DELETE FROM materials_units;

-- Удаляем названия материалов поставщиков
DELETE FROM supplier_material_names;

-- Удаляем тестовые материалы - теперь можно удалить, так как нет зависимых данных
DELETE FROM materials;

-- Удаляем все компании кроме СП ГОРОД
DELETE FROM companies WHERE inn != '7805298833';

-- Обновляем пользователей, чтобы они принадлежали к компании СП ГОРОД
-- Создаем новых пользователей, привязанных к компании СП ГОРОД

-- Администратор
INSERT INTO users (id, username, password, email, first_name, last_name, status, company_id) 
VALUES (
    gen_random_uuid(),
    'admin',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'admin@sp-grod.ru',
    'Администратор',
    'Системы',
    'ACTIVE',
    (SELECT id FROM companies WHERE inn = '7805298833' LIMIT 1)
);

-- Менеджер
INSERT INTO users (id, username, password, email, first_name, last_name, status, company_id) 
VALUES (
    gen_random_uuid(),
    'manager',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'manager@sp-grod.ru',
    'Менеджер',
    'Отдела снабжения',
    'ACTIVE',
    (SELECT id FROM companies WHERE inn = '7805298833' LIMIT 1)
);

-- Аналитик
INSERT INTO users (id, username, password, email, first_name, last_name, status, company_id) 
VALUES (
    gen_random_uuid(),
    'analyst',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'analyst@sp-grod.ru',
    'Аналитик',
    'Данных',
    'ACTIVE',
    (SELECT id FROM companies WHERE inn = '7805298833' LIMIT 1)
);

-- Поставщик (теперь тоже работает в СП ГОРОД)
INSERT INTO users (id, username, password, email, first_name, last_name, status, company_id) 
VALUES (
    gen_random_uuid(),
    'supplier',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'supplier@sp-grod.ru',
    'Поставщик',
    'СП ГОРОД',
    'ACTIVE',
    (SELECT id FROM companies WHERE inn = '7805298833' LIMIT 1)
);

-- Заказчик (теперь тоже работает в СП ГОРОД)
INSERT INTO users (id, username, password, email, first_name, last_name, status, company_id) 
VALUES (
    gen_random_uuid(),
    'customer',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'customer@sp-grod.ru',
    'Заказчик',
    'Главный',
    'ACTIVE',
    (SELECT id FROM companies WHERE inn = '7805298833' LIMIT 1)
);

-- Пользователь для просмотра
INSERT INTO users (id, username, password, email, first_name, last_name, status, company_id) 
VALUES (
    gen_random_uuid(),
    'viewer',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'viewer@sp-grod.ru',
    'Просмотр',
    'Только',
    'ACTIVE',
    (SELECT id FROM companies WHERE inn = '7805298833' LIMIT 1)
);

-- Добавление ролей для пользователей
-- Администратор
INSERT INTO user_roles (user_id, role)
SELECT u.id, 'ADMIN'
FROM users u
WHERE u.username = 'admin';

-- Менеджер
INSERT INTO user_roles (user_id, role)
SELECT u.id, 'MANAGER'
FROM users u
WHERE u.username = 'manager';

-- Аналитик
INSERT INTO user_roles (user_id, role)
SELECT u.id, 'ANALYST'
FROM users u
WHERE u.username = 'analyst';

-- Поставщик
INSERT INTO user_roles (user_id, role)
SELECT u.id, 'SUPPLIER'
FROM users u
WHERE u.username = 'supplier';

-- Заказчик
INSERT INTO user_roles (user_id, role)
SELECT u.id, 'CUSTOMER'
FROM users u
WHERE u.username = 'customer';

-- Просмотр
INSERT INTO user_roles (user_id, role)
SELECT u.id, 'VIEWER'
FROM users u
WHERE u.username = 'viewer';

-- Создаем контактные лица для компании СП ГОРОД
INSERT INTO contact_persons (id, first_name, last_name, position, company_id) VALUES
  (gen_random_uuid(), 'Аврутин', 'Михаил Эдуардович', 'Генеральный директор', (SELECT id FROM companies WHERE inn = '7805298833' LIMIT 1)),
  (gen_random_uuid(), 'Пономарёва', 'Людмила', 'Менеджер по закупкам', (SELECT id FROM companies WHERE inn = '7805298833' LIMIT 1)),
  (gen_random_uuid(), 'Иванов', 'Иван', 'Инженер', (SELECT id FROM companies WHERE inn = '7805298833' LIMIT 1));

-- Создаем контакты для контактных лиц
INSERT INTO contacts (id, contact_type_id, contact_person_id, value) VALUES
  (gen_random_uuid(), (SELECT id FROM contact_types WHERE name = 'Телефон' LIMIT 1), (SELECT id FROM contact_persons WHERE first_name = 'Аврутин' LIMIT 1), '+78120163604'),
  (gen_random_uuid(), (SELECT id FROM contact_types WHERE name = 'Email' LIMIT 1), (SELECT id FROM contact_persons WHERE first_name = 'Аврутин' LIMIT 1), 'ponomarreva-l@yandex.ru'),
  (gen_random_uuid(), (SELECT id FROM contact_types WHERE name = 'Телефон' LIMIT 1), (SELECT id FROM contact_persons WHERE first_name = 'Пономарёва' LIMIT 1), '+78120163605'),
  (gen_random_uuid(), (SELECT id FROM contact_types WHERE name = 'Email' LIMIT 1), (SELECT id FROM contact_persons WHERE first_name = 'Пономарёва' LIMIT 1), 'ponomarreva@sp-grod.ru');

-- Создаем банковский счет для компании СП ГОРОД
INSERT INTO company_bank_accounts (id, checking_account, company_id, bank_bik) VALUES
  (gen_random_uuid(), '40702810900000000011', (SELECT id FROM companies WHERE inn = '7805298833' LIMIT 1), '044525225'); 