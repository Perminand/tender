-- Добавляем поля для НДС к таблице companies
ALTER TABLE companies ADD COLUMN vat_applicable BOOLEAN DEFAULT TRUE NOT NULL;
ALTER TABLE companies ADD COLUMN vat_rate DECIMAL(5,2) DEFAULT 20.00 NOT NULL;
