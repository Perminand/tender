-- Исправление внешнего ключа user_id в audit_logs: теперь он ссылается на users(id), а не companies(id)
ALTER TABLE audit_logs DROP CONSTRAINT IF EXISTS audit_logs_user_id_fkey;
ALTER TABLE audit_logs DROP CONSTRAINT IF EXISTS fk_audit_logs_user_id;
-- Если столбец user_id уже есть, не трогаем, иначе добавляем
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='audit_logs' AND column_name='user_id') THEN
        ALTER TABLE audit_logs ADD COLUMN user_id UUID;
    END IF;
END$$;
-- Создаём правильный внешний ключ
ALTER TABLE audit_logs ADD CONSTRAINT audit_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id);
-- Примечание: старые записи останутся без пользователя (user_id = null) 