-- Добавление поля role в таблицу companies
ALTER TABLE companies ADD COLUMN role VARCHAR(20) DEFAULT 'CUSTOMER';

-- Обновление существующих записей
-- По умолчанию все компании считаются заказчиками
UPDATE companies SET role = 'CUSTOMER' WHERE role IS NULL;

-- Добавление ограничения для поля role
ALTER TABLE companies ADD CONSTRAINT chk_company_role CHECK (role IN ('SUPPLIER', 'CUSTOMER', 'BOTH')); 