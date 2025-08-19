--liquibase formatted sql

--changeset author:system:create_payment_conditions_table
CREATE TABLE IF NOT EXISTS payment_conditions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

--changeset author:system:create_payment_parts_table
CREATE TABLE IF NOT EXISTS payment_parts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_condition_id UUID NOT NULL REFERENCES payment_conditions(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    payment_type VARCHAR(50) NOT NULL CHECK (payment_type IN ('PERCENTAGE', 'FIXED_AMOUNT')),
    amount DECIMAL(10,2) NOT NULL,
    payment_moment VARCHAR(50) NOT NULL CHECK (payment_moment IN ('ADVANCE', 'READY_TO_SHIP', 'UPON_DELIVERY', 'AFTER_ACCEPTANCE', 'AFTER_WARRANTY', 'CUSTOM')),
    description TEXT,
    order_index INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

--changeset author:system:create_delivery_conditions_table
CREATE TABLE IF NOT EXISTS delivery_conditions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    delivery_type VARCHAR(50) NOT NULL CHECK (delivery_type IN ('PICKUP', 'DELIVERY_TO_WAREHOUSE', 'DELIVERY_TO_SITE', 'EX_WORKS', 'FCA', 'CPT', 'CIP', 'DAP', 'DPU', 'DDP')),
    delivery_cost DECIMAL(10,2),
    delivery_address TEXT,
    delivery_period VARCHAR(255),
    delivery_responsibility VARCHAR(50) NOT NULL CHECK (delivery_responsibility IN ('SUPPLIER', 'CUSTOMER', 'SHARED')),
    additional_terms TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

--changeset author:system:add_payment_delivery_columns_to_supplier_proposals
ALTER TABLE supplier_proposals ADD COLUMN IF NOT EXISTS payment_condition_id UUID REFERENCES payment_conditions(id);
ALTER TABLE supplier_proposals ADD COLUMN IF NOT EXISTS delivery_condition_id UUID REFERENCES delivery_conditions(id);

--changeset author:system:create_indexes_for_payment_delivery
CREATE INDEX IF NOT EXISTS idx_payment_parts_condition_id ON payment_parts(payment_condition_id);
CREATE INDEX IF NOT EXISTS idx_payment_parts_order_index ON payment_parts(order_index);
CREATE INDEX IF NOT EXISTS idx_supplier_proposals_payment_condition ON supplier_proposals(payment_condition_id);
CREATE INDEX IF NOT EXISTS idx_supplier_proposals_delivery_condition ON supplier_proposals(delivery_condition_id);

--changeset author:system:create_triggers_for_payment_delivery
CREATE TRIGGER update_payment_conditions_updated_at BEFORE UPDATE ON payment_conditions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_parts_updated_at BEFORE UPDATE ON payment_parts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_delivery_conditions_updated_at BEFORE UPDATE ON delivery_conditions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

--changeset author:system:insert_standard_payment_conditions
INSERT INTO payment_conditions (name, description) VALUES 
('100% аванс', 'Полная предоплата'),
('50% аванс, 50% по факту поставки', 'Частичная предоплата с оплатой остатка по факту поставки'),
('50% аванс, 30% по готовности, 20% по факту поставки', 'Трехэтапная оплата'),
('По факту поставки', 'Оплата после поставки товара'),
('30 дней после поставки', 'Отсрочка платежа на 30 дней');

--changeset author:system:insert_standard_payment_parts
INSERT INTO payment_parts (payment_condition_id, name, payment_type, amount, payment_moment, description, order_index) VALUES 
-- 100% аванс
((SELECT id FROM payment_conditions WHERE name = '100% аванс'), 'Аванс', 'PERCENTAGE', 100.00, 'ADVANCE', '100% предоплата', 1),

-- 50% аванс, 50% по факту поставки
((SELECT id FROM payment_conditions WHERE name = '50% аванс, 50% по факту поставки'), 'Аванс', 'PERCENTAGE', 50.00, 'ADVANCE', '50% предоплата', 1),
((SELECT id FROM payment_conditions WHERE name = '50% аванс, 50% по факту поставки'), 'Остаток', 'PERCENTAGE', 50.00, 'UPON_DELIVERY', '50% по факту поставки', 2),

-- 50% аванс, 30% по готовности, 20% по факту поставки
((SELECT id FROM payment_conditions WHERE name = '50% аванс, 30% по готовности, 20% по факту поставки'), 'Аванс', 'PERCENTAGE', 50.00, 'ADVANCE', '50% предоплата', 1),
((SELECT id FROM payment_conditions WHERE name = '50% аванс, 30% по готовности, 20% по факту поставки'), 'По готовности', 'PERCENTAGE', 30.00, 'READY_TO_SHIP', '30% по готовности к отправке', 2),
((SELECT id FROM payment_conditions WHERE name = '50% аванс, 30% по готовности, 20% по факту поставки'), 'Остаток', 'PERCENTAGE', 20.00, 'UPON_DELIVERY', '20% по факту поставки', 3),

-- По факту поставки
((SELECT id FROM payment_conditions WHERE name = 'По факту поставки'), 'Полная оплата', 'PERCENTAGE', 100.00, 'UPON_DELIVERY', '100% по факту поставки', 1),

-- 30 дней после поставки
((SELECT id FROM payment_conditions WHERE name = '30 дней после поставки'), 'Полная оплата', 'PERCENTAGE', 100.00, 'AFTER_ACCEPTANCE', '100% через 30 дней после поставки', 1);

--changeset author:system:insert_standard_delivery_conditions
-- Оставляем только 3 предустановленных условия доставки
INSERT INTO delivery_conditions (name, description, delivery_type, delivery_responsibility, delivery_period)
VALUES
('За счет поставщика', 'Доставка осуществляется за счет поставщика', 'DELIVERY_TO_SITE', 'SUPPLIER', 'По согласованию'),
('За счет заказчика', 'Доставка оплачивается заказчиком', 'DELIVERY_TO_SITE', 'CUSTOMER', 'По согласованию'),
('Сторонняя компания за счет заказчика', 'Доставка выполняется сторонней ТК, оплата за счет заказчика', 'DELIVERY_TO_SITE', 'CUSTOMER', 'По согласованию');
