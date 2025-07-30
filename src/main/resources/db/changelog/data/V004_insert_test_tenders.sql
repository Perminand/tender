-- Вставка тестовых данных для тендеров
INSERT INTO tenders (id, request_id, tender_number, title, description, customer_id, start_date, end_date, submission_deadline, status, requirements, terms_and_conditions) VALUES
  (uuid_generate_v4(), (SELECT id FROM requests LIMIT 1), 'TENDER-001', 'Тендер на поставку стройматериалов', 'Поставка стройматериалов для проекта 1', (SELECT id FROM companies WHERE role = 'CUSTOMER' LIMIT 1), CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', CURRENT_DATE + INTERVAL '15 days', 'PUBLISHED', 'Требования к качеству материалов', 'Условия поставки и оплаты'),
  (uuid_generate_v4(), (SELECT id FROM requests LIMIT 1 OFFSET 1), 'TENDER-002', 'Тендер на поставку электрики', 'Поставка электрических материалов для проекта 2', (SELECT id FROM companies WHERE role = 'CUSTOMER' LIMIT 1 OFFSET 1), CURRENT_DATE, CURRENT_DATE + INTERVAL '45 days', CURRENT_DATE + INTERVAL '20 days', 'PUBLISHED', 'Требования к сертификации', 'Условия поставки и оплаты'),
  (uuid_generate_v4(), (SELECT id FROM requests LIMIT 1 OFFSET 2), 'TENDER-003', 'Тендер на поставку сантехники', 'Поставка сантехнических материалов для проекта 3', (SELECT id FROM companies WHERE role = 'CUSTOMER' LIMIT 1 OFFSET 2), CURRENT_DATE, CURRENT_DATE + INTERVAL '60 days', CURRENT_DATE + INTERVAL '25 days', 'PUBLISHED', 'Требования к качеству', 'Условия поставки и оплаты');

-- Вставка элементов тендера для первого тендера
INSERT INTO tender_items (id, tender_id, request_material_id, item_number, description, quantity, unit_id, specifications, delivery_requirements, estimated_price) VALUES
  (uuid_generate_v4(), (SELECT id FROM tenders LIMIT 1), (SELECT id FROM request_materials LIMIT 1), 1, 'Материал 1', 100.0, (SELECT id FROM units LIMIT 1), 'Спецификации для материала 1', 'Доставка на склад', 10000.00),
  (uuid_generate_v4(), (SELECT id FROM tenders LIMIT 1), (SELECT id FROM request_materials LIMIT 1 OFFSET 1), 2, 'Материал 2', 200.0, (SELECT id FROM units LIMIT 1 OFFSET 1), 'Спецификации для материала 2', 'Доставка на склад', 20000.00),
  (uuid_generate_v4(), (SELECT id FROM tenders LIMIT 1), (SELECT id FROM request_materials LIMIT 1 OFFSET 2), 3, 'Материал 3', 300.0, (SELECT id FROM units LIMIT 1 OFFSET 2), 'Спецификации для материала 3', 'Доставка на склад', 30000.00);

-- Вставка элементов тендера для второго тендера
INSERT INTO tender_items (id, tender_id, request_material_id, item_number, description, quantity, unit_id, specifications, delivery_requirements, estimated_price) VALUES
  (uuid_generate_v4(), (SELECT id FROM tenders LIMIT 1 OFFSET 1), (SELECT id FROM request_materials LIMIT 1 OFFSET 3), 1, 'Электрический кабель', 500.0, (SELECT id FROM units LIMIT 1), 'Кабель ВВГнг 3x2.5', 'Доставка на объект', 25000.00),
  (uuid_generate_v4(), (SELECT id FROM tenders LIMIT 1 OFFSET 1), (SELECT id FROM request_materials LIMIT 1 OFFSET 4), 2, 'Автоматический выключатель', 50.0, (SELECT id FROM units LIMIT 1 OFFSET 1), 'Автомат 16А 1P', 'Доставка на объект', 15000.00);

-- Вставка элементов тендера для третьего тендера
INSERT INTO tender_items (id, tender_id, request_material_id, item_number, description, quantity, unit_id, specifications, delivery_requirements, estimated_price) VALUES
  (uuid_generate_v4(), (SELECT id FROM tenders LIMIT 1 OFFSET 2), (SELECT id FROM request_materials LIMIT 1 OFFSET 5), 1, 'Труба ПВХ', 100.0, (SELECT id FROM units LIMIT 1), 'Труба ПВХ 110мм', 'Доставка на объект', 50000.00),
  (uuid_generate_v4(), (SELECT id FROM tenders LIMIT 1 OFFSET 2), (SELECT id FROM request_materials LIMIT 1 OFFSET 6), 2, 'Смеситель', 20.0, (SELECT id FROM units LIMIT 1 OFFSET 1), 'Смеситель для ванной', 'Доставка на объект', 40000.00),
  (uuid_generate_v4(), (SELECT id FROM tenders LIMIT 1 OFFSET 2), (SELECT id FROM request_materials LIMIT 1 OFFSET 7), 3, 'Унитаз', 10.0, (SELECT id FROM units LIMIT 1), 'Унитаз подвесной', 'Доставка на объект', 30000.00); 