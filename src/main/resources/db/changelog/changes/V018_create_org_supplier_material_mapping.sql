CREATE TABLE org_supplier_material_mapping (
    id UUID PRIMARY KEY,
    organization_id UUID REFERENCES companies(id),
    supplier_name VARCHAR(255) NOT NULL,
    material_id UUID REFERENCES materials(id),
    characteristic_id UUID REFERENCES characteristics(id)
); 