-- Добавление поля awarded_supplier_id в tender_items
ALTER TABLE tender_items ADD COLUMN awarded_supplier_id UUID; 