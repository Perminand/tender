--liquibase formatted sql
--changeset author:system:V008_create_material_types_and_update_materials

-- Включение расширения для генерации UUID (если еще не включено)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Создание таблицы типов материалов
CREATE TABLE material_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL
);

-- Добавление внешнего ключа material_type_id в таблицу materials
ALTER TABLE materials ADD COLUMN material_type_id UUID;
ALTER TABLE materials ADD CONSTRAINT fk_materials_material_type FOREIGN KEY (material_type_id) REFERENCES material_types(id);

-- Удаление старого поля type (если оно существует)
ALTER TABLE materials DROP COLUMN IF EXISTS type; 