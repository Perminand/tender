-- Добавление новых полей в таблицу proposal_items
ALTER TABLE proposal_items ADD COLUMN unit_price_with_vat DECIMAL(15,2);
ALTER TABLE proposal_items ADD COLUMN weight DECIMAL(10,3);
ALTER TABLE proposal_items ADD COLUMN delivery_cost DECIMAL(15,2); 