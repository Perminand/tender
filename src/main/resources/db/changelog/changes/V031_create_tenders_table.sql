-- Создание таблицы тендеров
CREATE TABLE tenders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID REFERENCES requests(id),
    tender_number VARCHAR(100) UNIQUE,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    customer_id UUID REFERENCES companies(id),
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    submission_deadline TIMESTAMP,
    status VARCHAR(32) NOT NULL DEFAULT 'DRAFT',
    requirements TEXT,
    terms_and_conditions TEXT
);

-- Создание таблицы позиций тендера
CREATE TABLE tender_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tender_id UUID REFERENCES tenders(id) ON DELETE CASCADE,
    request_material_id UUID REFERENCES request_materials(id),
    item_number INTEGER,
    description TEXT,
    quantity DOUBLE PRECISION,
    unit_id UUID REFERENCES units(id),
    specifications TEXT,
    delivery_requirements TEXT,
    estimated_price DECIMAL(15,2)
);

-- Создание таблицы предложений поставщиков
CREATE TABLE supplier_proposals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tender_id UUID REFERENCES tenders(id) ON DELETE CASCADE,
    supplier_id UUID REFERENCES companies(id),
    proposal_number VARCHAR(100),
    submission_date TIMESTAMP,
    valid_until TIMESTAMP,
    status VARCHAR(32) NOT NULL DEFAULT 'SUBMITTED',
    cover_letter TEXT,
    technical_proposal TEXT,
    commercial_terms TEXT,
    total_price DECIMAL(15,2),
    currency VARCHAR(10) DEFAULT 'RUB',
    payment_terms TEXT,
    delivery_terms TEXT,
    warranty_terms TEXT
);

-- Создание таблицы позиций предложений поставщиков
CREATE TABLE proposal_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supplier_proposal_id UUID REFERENCES supplier_proposals(id) ON DELETE CASCADE,
    tender_item_id UUID REFERENCES tender_items(id),
    item_number INTEGER,
    description TEXT,
    brand VARCHAR(255),
    model VARCHAR(255),
    manufacturer VARCHAR(255),
    country_of_origin VARCHAR(255),
    quantity DOUBLE PRECISION,
    unit_id UUID REFERENCES units(id),
    unit_price DECIMAL(15,2),
    total_price DECIMAL(15,2),
    specifications TEXT,
    delivery_period VARCHAR(255),
    warranty TEXT,
    additional_info TEXT
);

-- Создание индексов
CREATE INDEX idx_tenders_request_id ON tenders(request_id);
CREATE INDEX idx_tenders_customer_id ON tenders(customer_id);
CREATE INDEX idx_tenders_status ON tenders(status);
CREATE INDEX idx_tender_items_tender_id ON tender_items(tender_id);
CREATE INDEX idx_tender_items_request_material_id ON tender_items(request_material_id);
CREATE INDEX idx_supplier_proposals_tender_id ON supplier_proposals(tender_id);
CREATE INDEX idx_supplier_proposals_supplier_id ON supplier_proposals(supplier_id);
CREATE INDEX idx_supplier_proposals_status ON supplier_proposals(status);
CREATE INDEX idx_proposal_items_supplier_proposal_id ON proposal_items(supplier_proposal_id);
CREATE INDEX idx_proposal_items_tender_item_id ON proposal_items(tender_item_id); 