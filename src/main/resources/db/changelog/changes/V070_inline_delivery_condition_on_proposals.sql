--liquibase formatted sql

--changeset system:inline_delivery_fields_on_supplier_proposals
ALTER TABLE supplier_proposals ADD COLUMN IF NOT EXISTS delivery_type VARCHAR(50);
ALTER TABLE supplier_proposals ADD COLUMN IF NOT EXISTS delivery_cost DECIMAL(10,2);
ALTER TABLE supplier_proposals ADD COLUMN IF NOT EXISTS delivery_address TEXT;
ALTER TABLE supplier_proposals ADD COLUMN IF NOT EXISTS delivery_period VARCHAR(255);
ALTER TABLE supplier_proposals ADD COLUMN IF NOT EXISTS delivery_responsibility VARCHAR(50);
ALTER TABLE supplier_proposals ADD COLUMN IF NOT EXISTS delivery_additional_terms TEXT;
ALTER TABLE supplier_proposals ADD COLUMN IF NOT EXISTS delivery_condition_name VARCHAR(255);
ALTER TABLE supplier_proposals ADD COLUMN IF NOT EXISTS delivery_condition_description TEXT;

-- Миграция данных из связанной таблицы delivery_conditions, если связь существует
UPDATE supplier_proposals sp
SET
    delivery_type = dc.delivery_type,
    delivery_cost = dc.delivery_cost,
    delivery_address = dc.delivery_address,
    delivery_period = dc.delivery_period,
    delivery_responsibility = dc.delivery_responsibility,
    delivery_additional_terms = dc.additional_terms,
    delivery_condition_name = dc.name,
    delivery_condition_description = dc.description
FROM delivery_conditions dc
WHERE sp.delivery_condition_id IS NOT NULL AND dc.id = sp.delivery_condition_id;

-- Удаляем внешний ключ и колонку связи, если они есть
ALTER TABLE supplier_proposals DROP COLUMN IF EXISTS delivery_condition_id;

