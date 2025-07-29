-- Создание таблицы счетов
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id UUID REFERENCES contracts(id),
    supplier_id UUID REFERENCES companies(id),
    request_id UUID REFERENCES requests(id),
    invoice_number VARCHAR(255),
    invoice_date DATE,
    due_date DATE,
    payment_date DATE,
    status VARCHAR(50) DEFAULT 'DRAFT',
    total_amount DECIMAL(15,2),
    paid_amount DECIMAL(15,2) DEFAULT 0,
    vat_amount DECIMAL(15,2),
    currency VARCHAR(10) DEFAULT 'RUB',
    payment_terms TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы элементов счета
CREATE TABLE IF NOT EXISTS invoice_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
    material_id UUID REFERENCES materials(id),
    description TEXT,
    quantity DECIMAL(15,2),
    unit_id UUID REFERENCES units(id),
    unit_price DECIMAL(15,2),
    total_price DECIMAL(15,2),
    vat_rate DECIMAL(5,2),
    vat_amount DECIMAL(15,2),
    notes TEXT
);

-- Создание таблицы поступлений
CREATE TABLE IF NOT EXISTS receipts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    delivery_id UUID REFERENCES deliveries(id),
    invoice_id UUID REFERENCES invoices(id),
    supplier_id UUID REFERENCES companies(id),
    warehouse_id UUID REFERENCES warehouses(id),
    receipt_number VARCHAR(255),
    receipt_date DATE,
    status VARCHAR(50) DEFAULT 'DRAFT',
    total_amount DECIMAL(15,2),
    currency VARCHAR(10) DEFAULT 'RUB',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы элементов поступления
CREATE TABLE IF NOT EXISTS receipt_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    receipt_id UUID REFERENCES receipts(id) ON DELETE CASCADE,
    material_id UUID REFERENCES materials(id),
    description TEXT,
    quantity DECIMAL(15,2),
    unit_id UUID REFERENCES units(id),
    unit_price DECIMAL(15,2),
    total_price DECIMAL(15,2),
    notes TEXT
);

-- Обновление таблицы заявок для добавления новых полей
ALTER TABLE requests ADD COLUMN IF NOT EXISTS approver VARCHAR(255);
ALTER TABLE requests ADD COLUMN IF NOT EXISTS performer VARCHAR(255);
ALTER TABLE requests ADD COLUMN IF NOT EXISTS delivery_deadline DATE;
ALTER TABLE requests ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'DRAFT';
ALTER TABLE requests ADD COLUMN IF NOT EXISTS location VARCHAR(255);
ALTER TABLE requests ADD COLUMN IF NOT EXISTS notes TEXT;

-- Создание индексов для оптимизации запросов
CREATE INDEX IF NOT EXISTS idx_invoices_request_id ON invoices(request_id);
CREATE INDEX IF NOT EXISTS idx_invoices_contract_id ON invoices(contract_id);
CREATE INDEX IF NOT EXISTS idx_invoices_supplier_id ON invoices(supplier_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);

CREATE INDEX IF NOT EXISTS idx_receipts_delivery_id ON receipts(delivery_id);
CREATE INDEX IF NOT EXISTS idx_receipts_invoice_id ON receipts(invoice_id);
CREATE INDEX IF NOT EXISTS idx_receipts_supplier_id ON receipts(supplier_id);
CREATE INDEX IF NOT EXISTS idx_receipts_status ON receipts(status);

CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id ON invoice_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_receipt_items_receipt_id ON receipt_items(receipt_id);

-- Создание триггеров для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_receipts_updated_at BEFORE UPDATE ON receipts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 