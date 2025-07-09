-- Добавление новых полей в таблицу contracts
ALTER TABLE contracts ADD COLUMN title VARCHAR(500);
ALTER TABLE contracts ADD COLUMN terms TEXT;
ALTER TABLE contracts ADD COLUMN description TEXT; 