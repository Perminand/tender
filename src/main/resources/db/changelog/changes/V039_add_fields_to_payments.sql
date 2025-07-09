-- Добавление новых полей в таблицу payments
ALTER TABLE payments ADD COLUMN paid_date DATE;
ALTER TABLE payments ADD COLUMN notes TEXT; 