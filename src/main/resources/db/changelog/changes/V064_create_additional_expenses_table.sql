--liquibase formatted sql

--changeset author:system:create_additional_expenses_table
CREATE TABLE IF NOT EXISTS additional_expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supplier_proposal_id UUID NOT NULL REFERENCES supplier_proposals(id) ON DELETE CASCADE,
    expense_provider_id UUID REFERENCES companies(id),
    expense_type VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'RUB',
    invoice_number VARCHAR(100),
    invoice_date DATE,
    document_path TEXT,
    notes TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'PAID')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

--changeset author:system:create_indexes_for_additional_expenses
CREATE INDEX IF NOT EXISTS idx_additional_expenses_supplier_proposal ON additional_expenses(supplier_proposal_id);
CREATE INDEX IF NOT EXISTS idx_additional_expenses_provider ON additional_expenses(expense_provider_id);
CREATE INDEX IF NOT EXISTS idx_additional_expenses_status ON additional_expenses(status);
CREATE INDEX IF NOT EXISTS idx_additional_expenses_type ON additional_expenses(expense_type);

--changeset author:system:create_triggers_for_additional_expenses
CREATE TRIGGER update_additional_expenses_updated_at BEFORE UPDATE ON additional_expenses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

--changeset author:system:insert_standard_expense_types
--preconditions onFail:MARK_RAN onError:MARK_RAN
--precondition-sql-check expectedResult:1 SELECT COUNT(1) FROM supplier_proposals WHERE id = '00000000-0000-0000-0000-000000000000';
INSERT INTO additional_expenses (supplier_proposal_id, expense_type, description, amount, status) VALUES 
-- Примеры дополнительных расходов (будут удалены после создания реальных данных)
('00000000-0000-0000-0000-000000000000', 'DELIVERY', 'Пример доставки', 1000.00, 'PENDING'),
('00000000-0000-0000-0000-000000000000', 'CUSTOMS', 'Пример таможенных расходов', 500.00, 'PENDING'),
('00000000-0000-0000-0000-000000000000', 'INSURANCE', 'Пример страховки', 200.00, 'PENDING')
ON CONFLICT DO NOTHING;
