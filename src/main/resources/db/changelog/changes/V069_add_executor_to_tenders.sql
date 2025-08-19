-- Добавление поля исполнителя к таблице тендеров
ALTER TABLE tenders
    ADD COLUMN IF NOT EXISTS executor VARCHAR(255);


