ALTER TABLE requests ADD COLUMN warehouse_id UUID;
ALTER TABLE requests ADD CONSTRAINT fk_requests_warehouse FOREIGN KEY (warehouse_id) REFERENCES warehouse(id); 