-- Добавление связи платежа с поставкой
ALTER TABLE payments ADD COLUMN delivery_id UUID;
ALTER TABLE payments ADD CONSTRAINT fk_payments_delivery FOREIGN KEY (delivery_id) REFERENCES deliveries(id); 