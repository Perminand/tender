CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(50) NOT NULL,
    title VARCHAR(500) NOT NULL,
    message TEXT,
    recipient_email VARCHAR(255),
    recipient_company_id UUID REFERENCES companies(id),
    tender_id UUID REFERENCES tenders(id),
    supplier_proposal_id UUID REFERENCES supplier_proposals(id),
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    sent_at TIMESTAMP,
    error_message TEXT
);

-- Индексы для быстрого поиска
CREATE INDEX idx_notifications_status ON notifications(status);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_tender_id ON notifications(tender_id);
CREATE INDEX idx_notifications_recipient_email ON notifications(recipient_email);
CREATE INDEX idx_notifications_created_at ON notifications(created_at); 