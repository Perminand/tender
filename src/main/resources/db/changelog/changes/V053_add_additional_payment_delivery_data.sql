--liquibase formatted sql

--changeset author:system:insert_additional_payment_conditions
INSERT INTO payment_conditions (name, description) VALUES 
('60% аванс, 40% по факту поставки', 'Частичная предоплата 60% с оплатой остатка по факту поставки'),
('70% аванс, 30% по факту поставки', 'Частичная предоплата 70% с оплатой остатка по факту поставки'),
('40% аванс, 30% по готовности, 30% по факту поставки', 'Трехэтапная оплата с меньшим авансом'),
('По факту приемки', 'Оплата после приемки товара'),
('60 дней после поставки', 'Отсрочка платежа на 60 дней'),
('90 дней после поставки', 'Отсрочка платежа на 90 дней');

--changeset author:system:insert_additional_payment_parts
INSERT INTO payment_parts (payment_condition_id, name, payment_type, amount, payment_moment, description, order_index) VALUES 
-- 60% аванс, 40% по факту поставки
((SELECT id FROM payment_conditions WHERE name = '60% аванс, 40% по факту поставки'), 'Аванс', 'PERCENTAGE', 60.00, 'ADVANCE', '60% предоплата', 1),
((SELECT id FROM payment_conditions WHERE name = '60% аванс, 40% по факту поставки'), 'Остаток', 'PERCENTAGE', 40.00, 'UPON_DELIVERY', '40% по факту поставки', 2),

-- 70% аванс, 30% по факту поставки
((SELECT id FROM payment_conditions WHERE name = '70% аванс, 30% по факту поставки'), 'Аванс', 'PERCENTAGE', 70.00, 'ADVANCE', '70% предоплата', 1),
((SELECT id FROM payment_conditions WHERE name = '70% аванс, 30% по факту поставки'), 'Остаток', 'PERCENTAGE', 30.00, 'UPON_DELIVERY', '30% по факту поставки', 2),

-- 40% аванс, 30% по готовности, 30% по факту поставки
((SELECT id FROM payment_conditions WHERE name = '40% аванс, 30% по готовности, 30% по факту поставки'), 'Аванс', 'PERCENTAGE', 40.00, 'ADVANCE', '40% предоплата', 1),
((SELECT id FROM payment_conditions WHERE name = '40% аванс, 30% по готовности, 30% по факту поставки'), 'По готовности', 'PERCENTAGE', 30.00, 'READY_TO_SHIP', '30% по готовности к отправке', 2),
((SELECT id FROM payment_conditions WHERE name = '40% аванс, 30% по готовности, 30% по факту поставки'), 'Остаток', 'PERCENTAGE', 30.00, 'UPON_DELIVERY', '30% по факту поставки', 3),

-- По факту приемки
((SELECT id FROM payment_conditions WHERE name = 'По факту приемки'), 'Полная оплата', 'PERCENTAGE', 100.00, 'AFTER_ACCEPTANCE', '100% по факту приемки', 1),

-- 60 дней после поставки
((SELECT id FROM payment_conditions WHERE name = '60 дней после поставки'), 'Полная оплата', 'PERCENTAGE', 100.00, 'AFTER_ACCEPTANCE', '100% через 60 дней после поставки', 1),

-- 90 дней после поставки
((SELECT id FROM payment_conditions WHERE name = '90 дней после поставки'), 'Полная оплата', 'PERCENTAGE', 100.00, 'AFTER_ACCEPTANCE', '100% через 90 дней после поставки', 1);

--changeset author:system:insert_additional_delivery_conditions
INSERT INTO delivery_conditions (name, description, delivery_type, delivery_responsibility, delivery_period) VALUES 
('CPT - Фрахт оплачен до', 'Поставка с оплатой фрахта до указанного пункта', 'CPT', 'SUPPLIER', '60 дней'),
('CIP - Фрахт и страхование оплачены до', 'Поставка с оплатой фрахта и страхования до указанного пункта', 'CIP', 'SUPPLIER', '60 дней'),
('DPU - Поставка в месте назначения разгружено', 'Поставка в месте назначения с разгрузкой', 'DPU', 'SUPPLIER', '45 дней'),
('DDP - Поставка с оплатой пошлин', 'Поставка с оплатой всех пошлин и налогов', 'DDP', 'SUPPLIER', '60 дней'),
('Доставка на склад заказчика', 'Доставка на склад заказчика', 'DELIVERY_TO_WAREHOUSE', 'SUPPLIER', '30 дней'),
('Доставка на строительную площадку', 'Доставка на строительную площадку заказчика', 'DELIVERY_TO_SITE', 'SUPPLIER', '45 дней');

--changeset author:system:create_payment_conditions_view
CREATE OR REPLACE VIEW payment_conditions_view AS
SELECT 
    pc.id,
    pc.name,
    pc.description,
    pc.created_at,
    pc.updated_at,
    COUNT(pp.id) as parts_count,
    STRING_AGG(
        CONCAT(pp.name, ': ', pp.amount, 
               CASE WHEN pp.payment_type = 'PERCENTAGE' THEN '%' ELSE ' ₽' END,
               ' (', pp.payment_moment, ')'
        ), 
        '; ' ORDER BY pp.order_index
    ) as payment_schedule
FROM payment_conditions pc
LEFT JOIN payment_parts pp ON pc.id = pp.payment_condition_id
GROUP BY pc.id, pc.name, pc.description, pc.created_at, pc.updated_at;

--changeset author:system:create_delivery_conditions_view
CREATE OR REPLACE VIEW delivery_conditions_view AS
SELECT 
    dc.id,
    dc.name,
    dc.description,
    dc.delivery_type,
    dc.delivery_cost,
    dc.delivery_address,
    dc.delivery_period,
    dc.delivery_responsibility,
    dc.additional_terms,
    dc.created_at,
    dc.updated_at,
    CASE 
        WHEN dc.delivery_cost IS NOT NULL AND dc.delivery_cost > 0 
        THEN CONCAT(dc.delivery_cost, ' ₽')
        ELSE 'Не указана'
    END as delivery_cost_formatted
FROM delivery_conditions dc;
