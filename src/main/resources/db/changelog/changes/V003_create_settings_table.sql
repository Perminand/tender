CREATE TABLE settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    setting_key VARCHAR(255) NOT NULL UNIQUE,
    setting_value TEXT,
    description VARCHAR(500)
);

-- Создаем индекс для быстрого поиска по ключу
CREATE INDEX idx_settings_key ON settings(setting_key); 