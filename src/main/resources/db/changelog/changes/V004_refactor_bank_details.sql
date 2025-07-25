-- Создаем таблицу для банковских реквизитов
CREATE TABLE bank_details (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bank_name VARCHAR(255),
    bik VARCHAR(9),
    checking_account VARCHAR(20),
    correspondent_account VARCHAR(20),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE
);
