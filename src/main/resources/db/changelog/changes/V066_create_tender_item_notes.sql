--liquibase formatted sql

--changeset author:system:create_tender_item_notes
CREATE TABLE IF NOT EXISTS tender_item_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tender_item_id UUID NOT NULL REFERENCES tender_items(id) ON DELETE CASCADE,
    supplier_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    note TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_tender_item_notes UNIQUE (tender_item_id, supplier_id)
);

--changeset author:system:create_tender_item_notes_indexes
CREATE INDEX IF NOT EXISTS idx_tender_item_notes_item ON tender_item_notes(tender_item_id);
CREATE INDEX IF NOT EXISTS idx_tender_item_notes_supplier ON tender_item_notes(supplier_id);

--changeset author:system:update_triggers_tender_item_notes
CREATE TRIGGER update_tender_item_notes_updated_at BEFORE UPDATE ON tender_item_notes
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


