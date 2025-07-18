-- Вставка тестовых пользователей
-- Пароли закодированы с помощью BCrypt (password = "password")

-- Администратор
INSERT INTO users (id, username, password, email, first_name, last_name, status, company_id) 
VALUES (
    gen_random_uuid(),
    'admin',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'admin@tender.ru',
    'Администратор',
    'Системы',
    'ACTIVE',
    (SELECT id FROM companies WHERE inn = '7700000001' LIMIT 1)
);

-- Менеджер
INSERT INTO users (id, username, password, email, first_name, last_name, status, company_id) 
VALUES (
    gen_random_uuid(),
    'manager',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'manager@tender.ru',
    'Менеджер',
    'Отдела снабжения',
    'ACTIVE',
    (SELECT id FROM companies WHERE inn = '7700000001' LIMIT 1)
);

-- Аналитик
INSERT INTO users (id, username, password, email, first_name, last_name, status, company_id) 
VALUES (
    gen_random_uuid(),
    'analyst',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'analyst@tender.ru',
    'Аналитик',
    'Данных',
    'ACTIVE',
    (SELECT id FROM companies WHERE inn = '7700000001' LIMIT 1)
);

-- Поставщик
INSERT INTO users (id, username, password, email, first_name, last_name, status, company_id) 
VALUES (
    gen_random_uuid(),
    'supplier',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'supplier@tender.ru',
    'Поставщик',
    'ООО Рога и Копыта',
    'ACTIVE',
    (SELECT id FROM companies WHERE inn = '7700000002' LIMIT 1)
);

-- Заказчик
INSERT INTO users (id, username, password, email, first_name, last_name, status, company_id) 
VALUES (
    gen_random_uuid(),
    'customer',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'customer@tender.ru',
    'Заказчик',
    'Главный',
    'ACTIVE',
    (SELECT id FROM companies WHERE inn = '7700000003' LIMIT 1)
);

-- Пользователь для просмотра
INSERT INTO users (id, username, password, email, first_name, last_name, status, company_id) 
VALUES (
    gen_random_uuid(),
    'viewer',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'viewer@tender.ru',
    'Просмотр',
    'Только',
    'ACTIVE',
    (SELECT id FROM companies WHERE inn = '7700000001' LIMIT 1)
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