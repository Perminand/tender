--liquibase formatted sql
--changeset ai:testdata

-- company_types
INSERT INTO company_types (id, name) VALUES
  (uuid_generate_v4(), 'ООО'),
  (uuid_generate_v4(), 'ЗАО'),
  (uuid_generate_v4(), 'ОАО'),
  (uuid_generate_v4(), 'ИП'),
  (uuid_generate_v4(), 'ПАО'),
  (uuid_generate_v4(), 'ГК'),
  (uuid_generate_v4(), 'АО'),
  (uuid_generate_v4(), 'ТОО'),
  (uuid_generate_v4(), 'ФГУП'),
  (uuid_generate_v4(), 'МУП');

-- companies
INSERT INTO companies (id, inn, kpp, ogrn, name, address, company_type_id, director, phone, email, legal_name, short_name) VALUES
  (uuid_generate_v4(), '7700000001', '770101001', '1027700000001', 'Компания 1', 'г. Москва, ул. Ленина, 1', (SELECT id FROM company_types LIMIT 1), 'Иванов И.И.', '9000000001', 'test1@mail.ru', 'ООО Компания 1', 'К1'),
  (uuid_generate_v4(), '7700000002', '770101002', '1027700000002', 'Компания 2', 'г. Москва, ул. Ленина, 2', (SELECT id FROM company_types LIMIT 1 OFFSET 1), 'Петров П.П.', '9000000002', 'test2@mail.ru', 'ЗАО Компания 2', 'К2'),
  (uuid_generate_v4(), '7700000003', '770101003', '1027700000003', 'Компания 3', 'г. Москва, ул. Ленина, 3', (SELECT id FROM company_types LIMIT 1 OFFSET 2), 'Сидоров С.С.', '9000000003', 'test3@mail.ru', 'ОАО Компания 3', 'К3'),
  (uuid_generate_v4(), '7700000004', '770101004', '1027700000004', 'Компания 4', 'г. Москва, ул. Ленина, 4', (SELECT id FROM company_types LIMIT 1 OFFSET 3), 'Кузнецов К.К.', '9000000004', 'test4@mail.ru', 'ИП Компания 4', 'К4'),
  (uuid_generate_v4(), '7700000005', '770101005', '1027700000005', 'Компания 5', 'г. Москва, ул. Ленина, 5', (SELECT id FROM company_types LIMIT 1 OFFSET 4), 'Смирнов С.С.', '9000000005', 'test5@mail.ru', 'ПАО Компания 5', 'К5'),
  (uuid_generate_v4(), '7700000006', '770101006', '1027700000006', 'Компания 6', 'г. Москва, ул. Ленина, 6', (SELECT id FROM company_types LIMIT 1 OFFSET 5), 'Попов П.П.', '9000000006', 'test6@mail.ru', 'ГК Компания 6', 'К6'),
  (uuid_generate_v4(), '7700000007', '770101007', '1027700000007', 'Компания 7', 'г. Москва, ул. Ленина, 7', (SELECT id FROM company_types LIMIT 1 OFFSET 6), 'Васильев В.В.', '9000000007', 'test7@mail.ru', 'АО Компания 7', 'К7'),
  (uuid_generate_v4(), '7700000008', '770101008', '1027700000008', 'Компания 8', 'г. Москва, ул. Ленина, 8', (SELECT id FROM company_types LIMIT 1 OFFSET 7), 'Михайлов М.М.', '9000000008', 'test8@mail.ru', 'ТОО Компания 8', 'К8'),
  (uuid_generate_v4(), '7700000009', '770101009', '1027700000009', 'Компания 9', 'г. Москва, ул. Ленина, 9', (SELECT id FROM company_types LIMIT 1 OFFSET 8), 'Новиков Н.Н.', '9000000009', 'test9@mail.ru', 'ФГУП Компания 9', 'К9'),
  (uuid_generate_v4(), '7700000010', '770101010', '1027700000010', 'Компания 10', 'г. Москва, ул. Ленина, 10', (SELECT id FROM company_types LIMIT 1 OFFSET 9), 'Федоров Ф.Ф.', '9000000010', 'test10@mail.ru', 'МУП Компания 10', 'К10');

-- contact_types
INSERT INTO contact_types (id, name) VALUES
  (uuid_generate_v4(), 'Телефон'),
  (uuid_generate_v4(), 'Email'),
  (uuid_generate_v4(), 'Факс'),
  (uuid_generate_v4(), 'Сайт'),
  (uuid_generate_v4(), 'Telegram'),
  (uuid_generate_v4(), 'WhatsApp'),
  (uuid_generate_v4(), 'Viber'),
  (uuid_generate_v4(), 'VK'),
  (uuid_generate_v4(), 'Skype'),
  (uuid_generate_v4(), 'Другое');

-- contact_persons
INSERT INTO contact_persons (id, first_name, last_name, position, company_id) VALUES
  (uuid_generate_v4(), 'Иван', 'Иванов', 'Директор', (SELECT id FROM companies LIMIT 1)),
  (uuid_generate_v4(), 'Петр', 'Петров', 'Менеджер', (SELECT id FROM companies LIMIT 1 OFFSET 1)),
  (uuid_generate_v4(), 'Сидор', 'Сидоров', 'Бухгалтер', (SELECT id FROM companies LIMIT 1 OFFSET 2)),
  (uuid_generate_v4(), 'Кирилл', 'Кузнецов', 'Инженер', (SELECT id FROM companies LIMIT 1 OFFSET 3)),
  (uuid_generate_v4(), 'Сергей', 'Смирнов', 'Юрист', (SELECT id FROM companies LIMIT 1 OFFSET 4)),
  (uuid_generate_v4(), 'Павел', 'Попов', 'HR', (SELECT id FROM companies LIMIT 1 OFFSET 5)),
  (uuid_generate_v4(), 'Владимир', 'Васильев', 'Директор', (SELECT id FROM companies LIMIT 1 OFFSET 6)),
  (uuid_generate_v4(), 'Михаил', 'Михайлов', 'Менеджер', (SELECT id FROM companies LIMIT 1 OFFSET 7)),
  (uuid_generate_v4(), 'Николай', 'Новиков', 'Бухгалтер', (SELECT id FROM companies LIMIT 1 OFFSET 8)),
  (uuid_generate_v4(), 'Федор', 'Федоров', 'Инженер', (SELECT id FROM companies LIMIT 1 OFFSET 9));

-- contacts
INSERT INTO contacts (id, contact_type_id, contact_person_id, value) VALUES
  (uuid_generate_v4(), (SELECT id FROM contact_types LIMIT 1), (SELECT id FROM contact_persons LIMIT 1), '9000000001'),
  (uuid_generate_v4(), (SELECT id FROM contact_types LIMIT 1 OFFSET 1), (SELECT id FROM contact_persons LIMIT 1 OFFSET 1), 'test2@mail.ru'),
  (uuid_generate_v4(), (SELECT id FROM contact_types LIMIT 1 OFFSET 2), (SELECT id FROM contact_persons LIMIT 1 OFFSET 2), '1234567'),
  (uuid_generate_v4(), (SELECT id FROM contact_types LIMIT 1 OFFSET 3), (SELECT id FROM contact_persons LIMIT 1 OFFSET 3), 'site.ru'),
  (uuid_generate_v4(), (SELECT id FROM contact_types LIMIT 1 OFFSET 4), (SELECT id FROM contact_persons LIMIT 1 OFFSET 4), '@telegram'),
  (uuid_generate_v4(), (SELECT id FROM contact_types LIMIT 1 OFFSET 5), (SELECT id FROM contact_persons LIMIT 1 OFFSET 5), '@whatsapp'),
  (uuid_generate_v4(), (SELECT id FROM contact_types LIMIT 1 OFFSET 6), (SELECT id FROM contact_persons LIMIT 1 OFFSET 6), '@viber'),
  (uuid_generate_v4(), (SELECT id FROM contact_types LIMIT 1 OFFSET 7), (SELECT id FROM contact_persons LIMIT 1 OFFSET 7), '@vk'),
  (uuid_generate_v4(), (SELECT id FROM contact_types LIMIT 1 OFFSET 8), (SELECT id FROM contact_persons LIMIT 1 OFFSET 8), '@skype'),
  (uuid_generate_v4(), (SELECT id FROM contact_types LIMIT 1 OFFSET 9), (SELECT id FROM contact_persons LIMIT 1 OFFSET 9), 'other');

-- banks
INSERT INTO banks (bik, name, correspondent_account) VALUES
  ('044525225', 'Сбербанк', '30101810400000000225'),
  ('044525593', 'ВТБ', '30101810700000000593'),
  ('044525974', 'Газпромбанк', '30101810200000000974'),
  ('044525823', 'Альфа-Банк', '30101810200000000823'),
  ('044525000', 'Росбанк', '30101810200000000000'),
  ('044525222', 'Тинькофф', '30101810400000000222'),
  ('044525111', 'Открытие', '30101810400000000111'),
  ('044525333', 'Промсвязьбанк', '30101810400000000333'),
  ('044525444', 'Московский Кредитный Банк', '30101810400000000444'),
  ('044525555', 'Юникредит', '30101810400000000555');

-- company_bank_accounts
INSERT INTO company_bank_accounts (id, checking_account, company_id, bank_bik) VALUES
  (uuid_generate_v4(), '40702810900000000001', (SELECT id FROM companies LIMIT 1), '044525225'),
  (uuid_generate_v4(), '40702810900000000002', (SELECT id FROM companies LIMIT 1 OFFSET 1), '044525593'),
  (uuid_generate_v4(), '40702810900000000003', (SELECT id FROM companies LIMIT 1 OFFSET 2), '044525974'),
  (uuid_generate_v4(), '40702810900000000004', (SELECT id FROM companies LIMIT 1 OFFSET 3), '044525823'),
  (uuid_generate_v4(), '40702810900000000005', (SELECT id FROM companies LIMIT 1 OFFSET 4), '044525000'),
  (uuid_generate_v4(), '40702810900000000006', (SELECT id FROM companies LIMIT 1 OFFSET 5), '044525222'),
  (uuid_generate_v4(), '40702810900000000007', (SELECT id FROM companies LIMIT 1 OFFSET 6), '044525111'),
  (uuid_generate_v4(), '40702810900000000008', (SELECT id FROM companies LIMIT 1 OFFSET 7), '044525333'),
  (uuid_generate_v4(), '40702810900000000009', (SELECT id FROM companies LIMIT 1 OFFSET 8), '044525444'),
  (uuid_generate_v4(), '40702810900000000010', (SELECT id FROM companies LIMIT 1 OFFSET 9), '044525555');

-- categories
INSERT INTO categories (id, name) VALUES
  (uuid_generate_v4(), 'Стройматериалы'),
  (uuid_generate_v4(), 'Электрика'),
  (uuid_generate_v4(), 'Сантехника'),
  (uuid_generate_v4(), 'Отделочные материалы'),
  (uuid_generate_v4(), 'Инструменты'),
  (uuid_generate_v4(), 'Крепеж'),
  (uuid_generate_v4(), 'Окна и двери'),
  (uuid_generate_v4(), 'Лакокрасочные материалы'),
  (uuid_generate_v4(), 'Изоляция'),
  (uuid_generate_v4(), 'Прочее');

-- material_types
INSERT INTO material_types (id, name) VALUES
  (uuid_generate_v4(), 'Брус'),
  (uuid_generate_v4(), 'Кирпич'),
  (uuid_generate_v4(), 'Плита'),
  (uuid_generate_v4(), 'Профиль'),
  (uuid_generate_v4(), 'Провод'),
  (uuid_generate_v4(), 'Труба'),
  (uuid_generate_v4(), 'Кабель'),
  (uuid_generate_v4(), 'Лист'),
  (uuid_generate_v4(), 'Панель'),
  (uuid_generate_v4(), 'Сетка');

-- units
INSERT INTO units (id, name, short_name) VALUES
  (uuid_generate_v4(), 'Штука', 'шт.'),
  (uuid_generate_v4(), 'Килограмм', 'кг'),
  (uuid_generate_v4(), 'Метр', 'м'),
  (uuid_generate_v4(), 'Литр', 'л'),
  (uuid_generate_v4(), 'Квадратный метр', 'м²'),
  (uuid_generate_v4(), 'Кубический метр', 'м³'),
  (uuid_generate_v4(), 'Тонна', 'т'),
  (uuid_generate_v4(), 'Грамм', 'г'),
  (uuid_generate_v4(), 'Сантиметр', 'см'),
  (uuid_generate_v4(), 'Миллиметр', 'мм');

-- materials
INSERT INTO materials (id, name, description, link, code, category_id, material_type_id, created_at, updated_at) VALUES
  (uuid_generate_v4(), 'Материал 1', 'Описание 1', 'http://example.com/1', 'M001', (SELECT id FROM categories LIMIT 1), (SELECT id FROM material_types LIMIT 1), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (uuid_generate_v4(), 'Материал 2', 'Описание 2', 'http://example.com/2', 'M002', (SELECT id FROM categories LIMIT 1 OFFSET 1), (SELECT id FROM material_types LIMIT 1 OFFSET 1), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (uuid_generate_v4(), 'Материал 3', 'Описание 3', 'http://example.com/3', 'M003', (SELECT id FROM categories LIMIT 1 OFFSET 2), (SELECT id FROM material_types LIMIT 1 OFFSET 2), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (uuid_generate_v4(), 'Материал 4', 'Описание 4', 'http://example.com/4', 'M004', (SELECT id FROM categories LIMIT 1 OFFSET 3), (SELECT id FROM material_types LIMIT 1 OFFSET 3), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (uuid_generate_v4(), 'Материал 5', 'Описание 5', 'http://example.com/5', 'M005', (SELECT id FROM categories LIMIT 1 OFFSET 4), (SELECT id FROM material_types LIMIT 1 OFFSET 4), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (uuid_generate_v4(), 'Материал 6', 'Описание 6', 'http://example.com/6', 'M006', (SELECT id FROM categories LIMIT 1 OFFSET 5), (SELECT id FROM material_types LIMIT 1 OFFSET 5), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (uuid_generate_v4(), 'Материал 7', 'Описание 7', 'http://example.com/7', 'M007', (SELECT id FROM categories LIMIT 1 OFFSET 6), (SELECT id FROM material_types LIMIT 1 OFFSET 6), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (uuid_generate_v4(), 'Материал 8', 'Описание 8', 'http://example.com/8', 'M008', (SELECT id FROM categories LIMIT 1 OFFSET 7), (SELECT id FROM material_types LIMIT 1 OFFSET 7), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (uuid_generate_v4(), 'Материал 9', 'Описание 9', 'http://example.com/9', 'M009', (SELECT id FROM categories LIMIT 1 OFFSET 8), (SELECT id FROM material_types LIMIT 1 OFFSET 8), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (uuid_generate_v4(), 'Материал 10', 'Описание 10', 'http://example.com/10', 'M010', (SELECT id FROM categories LIMIT 1 OFFSET 9), (SELECT id FROM material_types LIMIT 1 OFFSET 9), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- projects
INSERT INTO projects (id, name, description) VALUES
  (uuid_generate_v4(), 'Проект 1', 'Описание проекта 1'),
  (uuid_generate_v4(), 'Проект 2', 'Описание проекта 2'),
  (uuid_generate_v4(), 'Проект 3', 'Описание проекта 3'),
  (uuid_generate_v4(), 'Проект 4', 'Описание проекта 4'),
  (uuid_generate_v4(), 'Проект 5', 'Описание проекта 5'),
  (uuid_generate_v4(), 'Проект 6', 'Описание проекта 6'),
  (uuid_generate_v4(), 'Проект 7', 'Описание проекта 7'),
  (uuid_generate_v4(), 'Проект 8', 'Описание проекта 8'),
  (uuid_generate_v4(), 'Проект 9', 'Описание проекта 9'),
  (uuid_generate_v4(), 'Проект 10', 'Описание проекта 10');

-- work_types
INSERT INTO work_types (id, name) VALUES
  (uuid_generate_v4(), 'Монтаж'),
  (uuid_generate_v4(), 'Демонтаж'),
  (uuid_generate_v4(), 'Отделка'),
  (uuid_generate_v4(), 'Электромонтаж'),
  (uuid_generate_v4(), 'Сантехнические работы'),
  (uuid_generate_v4(), 'Кровельные работы'),
  (uuid_generate_v4(), 'Фасадные работы'),
  (uuid_generate_v4(), 'Земляные работы'),
  (uuid_generate_v4(), 'Бетонные работы'),
  (uuid_generate_v4(), 'Прочее');

-- warehouses
INSERT INTO warehouses (id, name, project_id) VALUES
  (uuid_generate_v4(), 'Склад 1', (SELECT id FROM projects LIMIT 1)),
  (uuid_generate_v4(), 'Склад 2', (SELECT id FROM projects LIMIT 1 OFFSET 1)),
  (uuid_generate_v4(), 'Склад 3', (SELECT id FROM projects LIMIT 1 OFFSET 2)),
  (uuid_generate_v4(), 'Склад 4', (SELECT id FROM projects LIMIT 1 OFFSET 3)),
  (uuid_generate_v4(), 'Склад 5', (SELECT id FROM projects LIMIT 1 OFFSET 4)),
  (uuid_generate_v4(), 'Склад 6', (SELECT id FROM projects LIMIT 1 OFFSET 5)),
  (uuid_generate_v4(), 'Склад 7', (SELECT id FROM projects LIMIT 1 OFFSET 6)),
  (uuid_generate_v4(), 'Склад 8', (SELECT id FROM projects LIMIT 1 OFFSET 7)),
  (uuid_generate_v4(), 'Склад 9', (SELECT id FROM projects LIMIT 1 OFFSET 8)),
  (uuid_generate_v4(), 'Склад 10', (SELECT id FROM projects LIMIT 1 OFFSET 9));

-- requests
INSERT INTO requests (id, company_id, project_id, date, request_number, warehouse_id) VALUES
  (uuid_generate_v4(), (SELECT id FROM companies LIMIT 1), (SELECT id FROM projects LIMIT 1), CURRENT_DATE, 'REQ-001', (SELECT id FROM warehouses LIMIT 1)),
  (uuid_generate_v4(), (SELECT id FROM companies LIMIT 1 OFFSET 1), (SELECT id FROM projects LIMIT 1 OFFSET 1), CURRENT_DATE, 'REQ-002', (SELECT id FROM warehouses LIMIT 1 OFFSET 1)),
  (uuid_generate_v4(), (SELECT id FROM companies LIMIT 1 OFFSET 2), (SELECT id FROM projects LIMIT 1 OFFSET 2), CURRENT_DATE, 'REQ-003', (SELECT id FROM warehouses LIMIT 1 OFFSET 2)),
  (uuid_generate_v4(), (SELECT id FROM companies LIMIT 1 OFFSET 3), (SELECT id FROM projects LIMIT 1 OFFSET 3), CURRENT_DATE, 'REQ-004', (SELECT id FROM warehouses LIMIT 1 OFFSET 3)),
  (uuid_generate_v4(), (SELECT id FROM companies LIMIT 1 OFFSET 4), (SELECT id FROM projects LIMIT 1 OFFSET 4), CURRENT_DATE, 'REQ-005', (SELECT id FROM warehouses LIMIT 1 OFFSET 4)),
  (uuid_generate_v4(), (SELECT id FROM companies LIMIT 1 OFFSET 5), (SELECT id FROM projects LIMIT 1 OFFSET 5), CURRENT_DATE, 'REQ-006', (SELECT id FROM warehouses LIMIT 1 OFFSET 5)),
  (uuid_generate_v4(), (SELECT id FROM companies LIMIT 1 OFFSET 6), (SELECT id FROM projects LIMIT 1 OFFSET 6), CURRENT_DATE, 'REQ-007', (SELECT id FROM warehouses LIMIT 1 OFFSET 6)),
  (uuid_generate_v4(), (SELECT id FROM companies LIMIT 1 OFFSET 7), (SELECT id FROM projects LIMIT 1 OFFSET 7), CURRENT_DATE, 'REQ-008', (SELECT id FROM warehouses LIMIT 1 OFFSET 7)),
  (uuid_generate_v4(), (SELECT id FROM companies LIMIT 1 OFFSET 8), (SELECT id FROM projects LIMIT 1 OFFSET 8), CURRENT_DATE, 'REQ-009', (SELECT id FROM warehouses LIMIT 1 OFFSET 8)),
  (uuid_generate_v4(), (SELECT id FROM companies LIMIT 1 OFFSET 9), (SELECT id FROM projects LIMIT 1 OFFSET 9), CURRENT_DATE, 'REQ-010', (SELECT id FROM warehouses LIMIT 1 OFFSET 9));

-- request_materials
INSERT INTO request_materials (id, request_id, number, work_type_id, material_id, size, quantity, unit_id, note, delivery_date, supplier_material_name) VALUES
  (uuid_generate_v4(), (SELECT id FROM requests LIMIT 1), 1, (SELECT id FROM work_types LIMIT 1), (SELECT id FROM materials LIMIT 1), '10x10', 100, (SELECT id FROM units LIMIT 1), 'Примечание 1', '2024-07-01', 'ПоставщикМат1'),
  (uuid_generate_v4(), (SELECT id FROM requests LIMIT 1 OFFSET 1), 2, (SELECT id FROM work_types LIMIT 1 OFFSET 1), (SELECT id FROM materials LIMIT 1 OFFSET 1), '20x20', 200, (SELECT id FROM units LIMIT 1 OFFSET 1), 'Примечание 2', '2024-07-02', 'ПоставщикМат2'),
  (uuid_generate_v4(), (SELECT id FROM requests LIMIT 1 OFFSET 2), 3, (SELECT id FROM work_types LIMIT 1 OFFSET 2), (SELECT id FROM materials LIMIT 1 OFFSET 2), '30x30', 300, (SELECT id FROM units LIMIT 1 OFFSET 2), 'Примечание 3', '2024-07-03', 'ПоставщикМат3'),
  (uuid_generate_v4(), (SELECT id FROM requests LIMIT 1 OFFSET 3), 4, (SELECT id FROM work_types LIMIT 1 OFFSET 3), (SELECT id FROM materials LIMIT 1 OFFSET 3), '40x40', 400, (SELECT id FROM units LIMIT 1 OFFSET 3), 'Примечание 4', '2024-07-04', 'ПоставщикМат4'),
  (uuid_generate_v4(), (SELECT id FROM requests LIMIT 1 OFFSET 4), 5, (SELECT id FROM work_types LIMIT 1 OFFSET 4), (SELECT id FROM materials LIMIT 1 OFFSET 4), '50x50', 500, (SELECT id FROM units LIMIT 1 OFFSET 4), 'Примечание 5', '2024-07-05', 'ПоставщикМат5'),
  (uuid_generate_v4(), (SELECT id FROM requests LIMIT 1 OFFSET 5), 6, (SELECT id FROM work_types LIMIT 1 OFFSET 5), (SELECT id FROM materials LIMIT 1 OFFSET 5), '60x60', 600, (SELECT id FROM units LIMIT 1 OFFSET 5), 'Примечание 6', '2024-07-06', 'ПоставщикМат6'),
  (uuid_generate_v4(), (SELECT id FROM requests LIMIT 1 OFFSET 6), 7, (SELECT id FROM work_types LIMIT 1 OFFSET 6), (SELECT id FROM materials LIMIT 1 OFFSET 6), '70x70', 700, (SELECT id FROM units LIMIT 1 OFFSET 6), 'Примечание 7', '2024-07-07', 'ПоставщикМат7'),
  (uuid_generate_v4(), (SELECT id FROM requests LIMIT 1 OFFSET 7), 8, (SELECT id FROM work_types LIMIT 1 OFFSET 7), (SELECT id FROM materials LIMIT 1 OFFSET 7), '80x80', 800, (SELECT id FROM units LIMIT 1 OFFSET 7), 'Примечание 8', '2024-07-08', 'ПоставщикМат8'),
  (uuid_generate_v4(), (SELECT id FROM requests LIMIT 1 OFFSET 8), 9, (SELECT id FROM work_types LIMIT 1 OFFSET 8), (SELECT id FROM materials LIMIT 1 OFFSET 8), '90x90', 900, (SELECT id FROM units LIMIT 1 OFFSET 8), 'Примечание 9', '2024-07-09', 'ПоставщикМат9'),
  (uuid_generate_v4(), (SELECT id FROM requests LIMIT 1 OFFSET 9), 10, (SELECT id FROM work_types LIMIT 1 OFFSET 9), (SELECT id FROM materials LIMIT 1 OFFSET 9), '100x100', 1000, (SELECT id FROM units LIMIT 1 OFFSET 9), 'Примечание 10', '2024-07-10', 'ПоставщикМат10');

-- supplier_material_names
INSERT INTO supplier_material_names (id, material_id, name) VALUES
  (uuid_generate_v4(), (SELECT id FROM materials LIMIT 1), 'ПоставщикМат1'),
  (uuid_generate_v4(), (SELECT id FROM materials LIMIT 1 OFFSET 1), 'ПоставщикМат2'),
  (uuid_generate_v4(), (SELECT id FROM materials LIMIT 1 OFFSET 2), 'ПоставщикМат3'),
  (uuid_generate_v4(), (SELECT id FROM materials LIMIT 1 OFFSET 3), 'ПоставщикМат4'),
  (uuid_generate_v4(), (SELECT id FROM materials LIMIT 1 OFFSET 4), 'ПоставщикМат5'),
  (uuid_generate_v4(), (SELECT id FROM materials LIMIT 1 OFFSET 5), 'ПоставщикМат6'),
  (uuid_generate_v4(), (SELECT id FROM materials LIMIT 1 OFFSET 6), 'ПоставщикМат7'),
  (uuid_generate_v4(), (SELECT id FROM materials LIMIT 1 OFFSET 7), 'ПоставщикМат8'),
  (uuid_generate_v4(), (SELECT id FROM materials LIMIT 1 OFFSET 8), 'ПоставщикМат9'),
  (uuid_generate_v4(), (SELECT id FROM materials LIMIT 1 OFFSET 9), 'ПоставщикМат10');

-- org_supplier_material_mapping
INSERT INTO org_supplier_material_mapping (id, organization_id, supplier_name, material_id) VALUES
  (uuid_generate_v4(), (SELECT id FROM companies LIMIT 1), 'Поставщик 1', (SELECT id FROM materials LIMIT 1)),
  (uuid_generate_v4(), (SELECT id FROM companies LIMIT 1 OFFSET 1), 'Поставщик 2', (SELECT id FROM materials LIMIT 1 OFFSET 1)),
  (uuid_generate_v4(), (SELECT id FROM companies LIMIT 1 OFFSET 2), 'Поставщик 3', (SELECT id FROM materials LIMIT 1 OFFSET 2)),
  (uuid_generate_v4(), (SELECT id FROM companies LIMIT 1 OFFSET 3), 'Поставщик 4', (SELECT id FROM materials LIMIT 1 OFFSET 3)),
  (uuid_generate_v4(), (SELECT id FROM companies LIMIT 1 OFFSET 4), 'Поставщик 5', (SELECT id FROM materials LIMIT 1 OFFSET 4)),
  (uuid_generate_v4(), (SELECT id FROM companies LIMIT 1 OFFSET 5), 'Поставщик 6', (SELECT id FROM materials LIMIT 1 OFFSET 5)),
  (uuid_generate_v4(), (SELECT id FROM companies LIMIT 1 OFFSET 6), 'Поставщик 7', (SELECT id FROM materials LIMIT 1 OFFSET 6)),
  (uuid_generate_v4(), (SELECT id FROM companies LIMIT 1 OFFSET 7), 'Поставщик 8', (SELECT id FROM materials LIMIT 1 OFFSET 7)),
  (uuid_generate_v4(), (SELECT id FROM companies LIMIT 1 OFFSET 8), 'Поставщик 9', (SELECT id FROM materials LIMIT 1 OFFSET 8)),
  (uuid_generate_v4(), (SELECT id FROM companies LIMIT 1 OFFSET 9), 'Поставщик 10', (SELECT id FROM materials LIMIT 1 OFFSET 9));

-- settings
INSERT INTO settings (id, setting_key, setting_value, description) VALUES
  (uuid_generate_v4(), 'fns-api-key', 'test-key-1', 'Тестовый FNS API KEY 1'),
  (uuid_generate_v4(), 'fns-api-key-2', 'test-key-2', 'Тестовый FNS API KEY 2'),
  (uuid_generate_v4(), 'fns-api-key-3', 'test-key-3', 'Тестовый FNS API KEY 3'),
  (uuid_generate_v4(), 'fns-api-key-4', 'test-key-4', 'Тестовый FNS API KEY 4'),
  (uuid_generate_v4(), 'fns-api-key-5', 'test-key-5', 'Тестовый FNS API KEY 5'),
  (uuid_generate_v4(), 'fns-api-key-6', 'test-key-6', 'Тестовый FNS API KEY 6'),
  (uuid_generate_v4(), 'fns-api-key-7', 'test-key-7', 'Тестовый FNS API KEY 7'),
  (uuid_generate_v4(), 'fns-api-key-8', 'test-key-8', 'Тестовый FNS API KEY 8'),
  (uuid_generate_v4(), 'fns-api-key-9', 'test-key-9', 'Тестовый FNS API KEY 9'),
  (uuid_generate_v4(), 'fns-api-key-10', 'test-key-10', 'Тестовый FNS API KEY 10');

-- material_units (уникальные пары материал-единица)
INSERT INTO materials_units (material_id, unit_id) VALUES
  ((SELECT id FROM materials LIMIT 1), (SELECT id FROM units LIMIT 1)),
  ((SELECT id FROM materials LIMIT 1 OFFSET 1), (SELECT id FROM units LIMIT 1 OFFSET 1)),
  ((SELECT id FROM materials LIMIT 1 OFFSET 2), (SELECT id FROM units LIMIT 1 OFFSET 2)),
  ((SELECT id FROM materials LIMIT 1 OFFSET 3), (SELECT id FROM units LIMIT 1 OFFSET 3)),
  ((SELECT id FROM materials LIMIT 1 OFFSET 4), (SELECT id FROM units LIMIT 1 OFFSET 4)),
  ((SELECT id FROM materials LIMIT 1 OFFSET 5), (SELECT id FROM units LIMIT 1 OFFSET 5)),
  ((SELECT id FROM materials LIMIT 1 OFFSET 6), (SELECT id FROM units LIMIT 1 OFFSET 6)),
  ((SELECT id FROM materials LIMIT 1 OFFSET 7), (SELECT id FROM units LIMIT 1 OFFSET 7)),
  ((SELECT id FROM materials LIMIT 1 OFFSET 8), (SELECT id FROM units LIMIT 1 OFFSET 8)),
  ((SELECT id FROM materials LIMIT 1 OFFSET 9), (SELECT id FROM units LIMIT 1 OFFSET 9)); 