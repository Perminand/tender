-- Создание таблицы документов
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tender_id UUID REFERENCES tenders(id),
    supplier_proposal_id UUID REFERENCES supplier_proposals(id),
    request_id UUID REFERENCES requests(id),
    uploaded_by UUID REFERENCES companies(id),
    file_name VARCHAR(255) NOT NULL,
    original_file_name VARCHAR(255),
    file_path TEXT,
    file_size BIGINT,
    mime_type VARCHAR(100),
    type VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    uploaded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    description TEXT,
    version VARCHAR(50)
);

-- Создание таблицы контрактов
CREATE TABLE contracts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tender_id UUID REFERENCES tenders(id),
    supplier_proposal_id UUID REFERENCES supplier_proposals(id),
    customer_id UUID REFERENCES companies(id),
    supplier_id UUID REFERENCES companies(id),
    contract_number VARCHAR(100) UNIQUE,
    contract_date DATE,
    start_date DATE,
    end_date DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    total_amount DECIMAL(15,2),
    currency VARCHAR(10) DEFAULT 'RUB',
    payment_terms TEXT,
    delivery_terms TEXT,
    warranty_terms TEXT,
    special_conditions TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы позиций контракта
CREATE TABLE contract_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id UUID REFERENCES contracts(id) ON DELETE CASCADE,
    tender_item_id UUID REFERENCES tender_items(id),
    material_id UUID REFERENCES materials(id),
    item_number INTEGER,
    description TEXT,
    quantity DECIMAL(15,2),
    unit_id UUID REFERENCES units(id),
    unit_price DECIMAL(15,2),
    total_price DECIMAL(15,2),
    specifications TEXT,
    delivery_period VARCHAR(255),
    warranty TEXT,
    additional_info TEXT
);

-- Создание таблицы поставок
CREATE TABLE deliveries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id UUID REFERENCES contracts(id),
    supplier_id UUID REFERENCES companies(id),
    warehouse_id UUID REFERENCES warehouses(id),
    delivery_number VARCHAR(100) UNIQUE,
    delivery_date DATE,
    planned_delivery_date DATE,
    status VARCHAR(30) NOT NULL DEFAULT 'PLANNED',
    transport_info TEXT,
    driver_info TEXT,
    vehicle_number VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы позиций поставки
CREATE TABLE delivery_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    delivery_id UUID REFERENCES deliveries(id) ON DELETE CASCADE,
    contract_item_id UUID REFERENCES contract_items(id),
    material_id UUID REFERENCES materials(id),
    item_number INTEGER,
    description TEXT,
    ordered_quantity DECIMAL(15,2),
    delivered_quantity DECIMAL(15,2),
    accepted_quantity DECIMAL(15,2),
    rejected_quantity DECIMAL(15,2),
    unit_id UUID REFERENCES units(id),
    unit_price DECIMAL(15,2),
    total_price DECIMAL(15,2),
    quality_notes TEXT,
    rejection_reason TEXT,
    acceptance_status VARCHAR(30) NOT NULL DEFAULT 'PENDING'
);

-- Создание таблицы платежей
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id UUID REFERENCES contracts(id),
    supplier_id UUID REFERENCES companies(id),
    customer_id UUID REFERENCES companies(id),
    payment_number VARCHAR(100) UNIQUE,
    payment_date DATE,
    due_date DATE,
    type VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    amount DECIMAL(15,2),
    currency VARCHAR(10) DEFAULT 'RUB',
    vat_amount DECIMAL(15,2),
    total_amount DECIMAL(15,2),
    payment_method VARCHAR(100),
    bank_account VARCHAR(100),
    invoice_number VARCHAR(100),
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы бюджетов
CREATE TABLE budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id),
    company_id UUID REFERENCES companies(id),
    budget_number VARCHAR(100) UNIQUE,
    budget_year DATE,
    start_date DATE,
    end_date DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    total_budget DECIMAL(15,2),
    allocated_budget DECIMAL(15,2),
    spent_budget DECIMAL(15,2),
    remaining_budget DECIMAL(15,2),
    currency VARCHAR(10) DEFAULT 'RUB',
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы аудита
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES companies(id),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id VARCHAR(50),
    old_value TEXT,
    new_value TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    session_id VARCHAR(100),
    description TEXT,
    level VARCHAR(20) NOT NULL DEFAULT 'INFO'
);

-- Создание индексов для быстрого поиска
CREATE INDEX idx_documents_tender_id ON documents(tender_id);
CREATE INDEX idx_documents_supplier_proposal_id ON documents(supplier_proposal_id);
CREATE INDEX idx_documents_type ON documents(type);
CREATE INDEX idx_documents_status ON documents(status);

CREATE INDEX idx_contracts_tender_id ON contracts(tender_id);
CREATE INDEX idx_contracts_supplier_id ON contracts(supplier_id);
CREATE INDEX idx_contracts_customer_id ON contracts(customer_id);
CREATE INDEX idx_contracts_status ON contracts(status);
CREATE INDEX idx_contracts_contract_number ON contracts(contract_number);

CREATE INDEX idx_contract_items_contract_id ON contract_items(contract_id);
CREATE INDEX idx_contract_items_material_id ON contract_items(material_id);

CREATE INDEX idx_deliveries_contract_id ON deliveries(contract_id);
CREATE INDEX idx_deliveries_supplier_id ON deliveries(supplier_id);
CREATE INDEX idx_deliveries_status ON deliveries(status);
CREATE INDEX idx_deliveries_delivery_date ON deliveries(delivery_date);

CREATE INDEX idx_delivery_items_delivery_id ON delivery_items(delivery_id);
CREATE INDEX idx_delivery_items_contract_item_id ON delivery_items(contract_item_id);
CREATE INDEX idx_delivery_items_acceptance_status ON delivery_items(acceptance_status);

CREATE INDEX idx_payments_contract_id ON payments(contract_id);
CREATE INDEX idx_payments_supplier_id ON payments(supplier_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_payment_date ON payments(payment_date);

CREATE INDEX idx_budgets_project_id ON budgets(project_id);
CREATE INDEX idx_budgets_company_id ON budgets(company_id);
CREATE INDEX idx_budgets_status ON budgets(status);
CREATE INDEX idx_budgets_budget_year ON budgets(budget_year);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_entity_type ON audit_logs(entity_type);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp);
CREATE INDEX idx_audit_logs_level ON audit_logs(level); 