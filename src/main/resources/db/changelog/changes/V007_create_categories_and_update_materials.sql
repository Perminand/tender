--liquibase formatted sql
--changeset author:system:V007_create_categories_and_update_materials

-- Включение расширения для генерации UUID (если еще не включено)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Создание таблицы категорий
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL
);

-- Добавление внешнего ключа category_id в таблицу materials
ALTER TABLE materials ADD COLUMN category_id UUID;
ALTER TABLE materials ADD CONSTRAINT fk_materials_category FOREIGN KEY (category_id) REFERENCES categories(id);

-- Удаление старого поля category (если оно существует)
ALTER TABLE materials DROP COLUMN IF EXISTS category; 