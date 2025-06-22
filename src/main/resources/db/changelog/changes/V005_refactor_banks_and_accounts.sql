-- Удаляем старую таблицу, если она существует
DROP TABLE IF EXISTS bank_details;

-- Создаем таблицу для банков, где БИК является уникальным идентификатором
CREATE TABLE banks (
    bik VARCHAR(9) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    correspondent_account VARCHAR(20) NOT NULL
);

-- Создаем таблицу для счетов контрагентов в банках
CREATE TABLE company_bank_accounts (
    id UUID PRIMARY KEY,
    checking_account VARCHAR(20) NOT NULL,
    company_id UUID NOT NULL,
    bank_bik VARCHAR(9) NOT NULL,
    CONSTRAINT fk_company FOREIGN KEY (company_id) REFERENCES companies (id) ON DELETE CASCADE,
    CONSTRAINT fk_bank FOREIGN KEY (bank_bik) REFERENCES banks (bik) ON DELETE CASCADE
); 