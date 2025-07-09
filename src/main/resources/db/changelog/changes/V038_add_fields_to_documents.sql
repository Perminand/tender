-- Добавление новых полей в таблицу documents
ALTER TABLE documents ADD COLUMN document_number VARCHAR(255);
ALTER TABLE documents ADD COLUMN title VARCHAR(500);
ALTER TABLE documents ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE documents ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE documents ADD COLUMN related_entity_id UUID;
ALTER TABLE documents ADD COLUMN related_entity_type VARCHAR(100); 