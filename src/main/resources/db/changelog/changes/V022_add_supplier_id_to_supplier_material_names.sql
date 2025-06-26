-- Добавление поля supplier_id в таблицу supplier_material_names
ALTER TABLE supplier_material_names ADD COLUMN supplier_id UUID;

-- Добавление внешнего ключа
ALTER TABLE supplier_material_names 
ADD CONSTRAINT fk_supplier_material_names_supplier 
FOREIGN KEY (supplier_id) REFERENCES companies(id);

-- Добавление индекса для улучшения производительности
CREATE INDEX idx_supplier_material_names_supplier_id ON supplier_material_names(supplier_id); 