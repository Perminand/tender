-- Добавление поля warehouse_id в таблицу requests
ALTER TABLE requests ADD COLUMN warehouse_id UUID;

-- Добавление внешнего ключа для связи с таблицей warehouses
ALTER TABLE requests ADD CONSTRAINT fk_requests_warehouse 
    FOREIGN KEY (warehouse_id) REFERENCES warehouses(id) ON DELETE SET NULL;

-- Создание индекса для быстрого поиска по складу
CREATE INDEX idx_requests_warehouse_id ON requests(warehouse_id); 