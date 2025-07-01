-- Удаление старого внешнего ключа и колонки
ALTER TABLE materials DROP CONSTRAINT IF EXISTS fk_materials_on_unit;
ALTER TABLE materials DROP COLUMN IF EXISTS unit_id;

-- Создание связующей таблицы для materials и units
CREATE TABLE materials_units (
    material_id UUID NOT NULL ,
    unit_id UUID NOT NULL,
    PRIMARY KEY (material_id, unit_id),
    CONSTRAINT fk_material_units_on_material FOREIGN KEY (material_id) REFERENCES materials (id),
    CONSTRAINT fk_material_units_on_unit FOREIGN KEY (unit_id) REFERENCES units (id)
); 