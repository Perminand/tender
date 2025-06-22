-- Создаем таблицу для банков, где БИК является уникальным идентификатором
CREATE TABLE banks (
    bik VARCHAR(9) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    correspondent_account VARCHAR(20) NOT NULL
);

-- Создаем таблицу для счетов контрагентов в банках
CREATE TABLE company_bank_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    checking_account VARCHAR(20) NOT NULL,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    bank_bik VARCHAR(9) NOT NULL REFERENCES banks(bik) ON DELETE CASCADE
); 