-- Добавление поля parent_tender_id в tenders для отслеживания связи между разделенными тендерами
ALTER TABLE tenders ADD COLUMN parent_tender_id UUID REFERENCES tenders(id);

-- Создание индекса для быстрого поиска дочерних тендеров
CREATE INDEX idx_tenders_parent_tender_id ON tenders(parent_tender_id); 