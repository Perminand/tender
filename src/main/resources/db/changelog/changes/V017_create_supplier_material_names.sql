CREATE TABLE supplier_material_names (
    id UUID PRIMARY KEY,
    material_id UUID REFERENCES materials(id),
    name VARCHAR(255) NOT NULL
); 