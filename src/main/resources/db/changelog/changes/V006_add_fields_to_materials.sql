--liquibase formatted sql
--changeset author:system:V006_add_fields_to_materials

-- Включение расширения для генерации UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Создание таблицы materials
CREATE TABLE materials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(255),
    link VARCHAR(500),
    unit VARCHAR(50),
    code VARCHAR(100),
    category VARCHAR(100)
);
