-- Удалить старое ограничение уникальности по name (если оно есть)
ALTER TABLE sections DROP CONSTRAINT IF EXISTS sections_name_key;

-- Удалить уникальность с поля name (если задано на уровне поля)
-- (В PostgreSQL это делается через DROP INDEX, если ограничение было создано как индекс)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'sections' AND indexname = 'sections_name_key') THEN
    EXECUTE 'DROP INDEX sections_name_key';
  END IF;
END$$;

-- Добавить новое уникальное ограничение на (name, project_id)
CREATE UNIQUE INDEX IF NOT EXISTS sections_project_name_unique ON sections (name, project_id); 