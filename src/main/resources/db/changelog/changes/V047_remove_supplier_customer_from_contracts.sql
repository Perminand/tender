-- Удаляем колонки supplier_id и customer_id из таблицы contracts
-- так как теперь заказчик и поставщик получаются через tender.customer и tender.awardedSupplierId

ALTER TABLE contracts DROP COLUMN IF EXISTS supplier_id;
ALTER TABLE contracts DROP COLUMN IF EXISTS customer_id; 