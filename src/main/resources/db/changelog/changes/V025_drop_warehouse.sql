--liquibase formatted sql
--changeset ai:drop-warehouse

-- Удалить внешние ключи и столбцы, связанные со складом
ALTER TABLE requests DROP CONSTRAINT IF EXISTS fk_requests_warehouse;
ALTER TABLE requests DROP COLUMN IF EXISTS warehouse_id;

-- Удалить таблицу warehouse
DROP TABLE IF EXISTS warehouse; 