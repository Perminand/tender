-- Добавление полей created_at и updated_at в таблицу tenders
ALTER TABLE tenders
ADD COLUMN created_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE; 