CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

create table IF NOT EXISTS company_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50)
);

create table IF NOT EXISTS companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    inn VARCHAR(12) NOT NULL unique,
    kpp VARCHAR(9),
    ogrn VARCHAR(13) unique,
    name VARCHAR(255) NOT NULL,
    address VARCHAR(255) NOT NULL,
    company_type_id UUID NOT NULL REFERENCES company_types(id) ON DELETE CASCADE,
    director VARCHAR(255),
    phone VARCHAR(12),
    email VARCHAR(50)
);

create table IF NOT EXISTS contact_persons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    position VARCHAR(50) NOT NULL,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE
);

create table IF NOT EXISTS contact_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL UNIQUE
);

create table IF NOT EXISTS contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contact_type_id UUID NOT NULL REFERENCES contact_types(id) ON DELETE CASCADE,
    contact_person_id UUID NOT NULL REFERENCES contact_persons(id) ON DELETE CASCADE,
    value VARCHAR(50) NOT NULL,
    unique(contact_type_id, contact_person_id, value)
);

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

CREATE TABLE characteristics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    material_id UUID REFERENCES materials(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

  CREATE TABLE work_types (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(255) NOT NULL UNIQUE
  );
