-- Добавление полей actualDate и trackingNumber в таблицу deliveries
ALTER TABLE deliveries ADD COLUMN actual_date DATE;
ALTER TABLE deliveries ADD COLUMN tracking_number VARCHAR(255); 