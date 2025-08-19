-- Добавление поля executor в таблицу requests
ALTER TABLE requests ADD COLUMN executor VARCHAR(255);
