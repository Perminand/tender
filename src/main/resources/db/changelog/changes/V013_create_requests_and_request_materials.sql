-- Создание таблицы заявок
CREATE TABLE requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id),
    project_id UUID REFERENCES projects(id),
    date DATE NOT NULL,
    status VARCHAR(32) NOT NULL
);

-- Создание таблицы позиций заявки
CREATE TABLE request_materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID REFERENCES requests(id) ON DELETE CASCADE,
    number INTEGER,
    section VARCHAR(255),
    work_type VARCHAR(255),
    material_id UUID REFERENCES materials(id),
    size VARCHAR(255),
    quantity DOUBLE PRECISION,
    unit_id UUID REFERENCES units(id),
    note VARCHAR(1024),
    delivery_date VARCHAR(255)
);

CREATE INDEX idx_request_materials_request_id ON request_materials(request_id);
CREATE INDEX idx_request_materials_material_id ON request_materials(material_id);
CREATE INDEX idx_request_materials_unit_id ON request_materials(unit_id); 