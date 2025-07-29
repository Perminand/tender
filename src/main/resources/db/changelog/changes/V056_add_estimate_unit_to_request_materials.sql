-- Добавление поля estimate_unit_id в таблицу request_materials
ALTER TABLE request_materials ADD COLUMN estimate_unit_id UUID REFERENCES units(id); 