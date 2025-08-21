-- Добавление связи с условиями доставки в предложениях
-- V079_add_delivery_condition_to_proposals.sql

-- Добавляем внешний ключ на условия доставки
ALTER TABLE supplier_proposals 
ADD COLUMN delivery_condition_id UUID REFERENCES delivery_conditions(id);

-- Создаем индекс для улучшения производительности
CREATE INDEX idx_supplier_proposals_delivery_condition 
ON supplier_proposals(delivery_condition_id);

-- Комментарий к таблице
COMMENT ON COLUMN supplier_proposals.delivery_condition_id IS 'Ссылка на условие доставки из справочника';
