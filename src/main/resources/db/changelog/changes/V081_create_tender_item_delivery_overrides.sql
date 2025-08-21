-- Создаем таблицу переопределений доставки по позициям тендера/поставщику
CREATE TABLE IF NOT EXISTS tender_item_delivery_overrides (
    id UUID PRIMARY KEY,
    tender_item_id UUID NOT NULL,
    supplier_id UUID NOT NULL,
    amount NUMERIC(12,2) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_tido_tender_item ON tender_item_delivery_overrides(tender_item_id);
CREATE INDEX IF NOT EXISTS idx_tido_supplier ON tender_item_delivery_overrides(supplier_id);


