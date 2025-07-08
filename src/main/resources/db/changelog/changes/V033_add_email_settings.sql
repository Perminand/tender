-- Добавление email настроек
INSERT INTO settings (setting_key, setting_value, description) VALUES
('email_smtp_host', 'smtp.gmail.com', 'SMTP хост'),
('email_smtp_port', '587', 'SMTP порт'),
('email_username', '', 'Email пользователя'),
('email_password', '', 'Email пароль'),
('email_from', '', 'Email отправителя'),
('email_from_name', '', 'Имя отправителя'),
('email_enabled', 'false', 'Включить email уведомления'),
('email_use_ssl', 'false', 'Использовать SSL'),
('email_use_tls', 'true', 'Использовать TLS'); 