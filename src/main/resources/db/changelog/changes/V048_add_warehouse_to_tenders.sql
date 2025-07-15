-- Добавление поля warehouse_id в таблицу tenders
ALTER TABLE tenders ADD COLUMN warehouse_id UUID;

-- Добавление внешнего ключа для связи с таблицей warehouses
ALTER TABLE tenders ADD CONSTRAINT fk_tenders_warehouse 
    FOREIGN KEY (warehouse_id) REFERENCES warehouses(id) ON DELETE SET NULL;

-- Создание индекса для быстрого поиска по складу
CREATE INDEX idx_tenders_warehouse_id ON tenders(warehouse_id); 