--liquibase formatted sql

--changeset author:system:create_delivery_types_table
CREATE TABLE IF NOT EXISTS delivery_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE
);



