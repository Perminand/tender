-- Добавить applicant в requests
ALTER TABLE requests ADD COLUMN applicant VARCHAR(255);

-- Добавить material_characteristics и estimate_price в request_materials
ALTER TABLE request_materials ADD COLUMN material_characteristics VARCHAR(1024);
ALTER TABLE request_materials ADD COLUMN estimate_price DECIMAL(15,2);
ALTER TABLE request_materials ADD COLUMN material_link VARCHAR(500);
