-- Create units table
CREATE TABLE units (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    short_name VARCHAR(50) NOT NULL
);

-- Create trigger for updated_at on units table
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at column to units table
ALTER TABLE units ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Create trigger for units table
CREATE TRIGGER update_units_updated_at BEFORE UPDATE ON units
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert some default units
INSERT INTO units (name, short_name) VALUES 
    ('Штука', 'шт.'),
    ('Килограмм', 'кг'),
    ('Метр', 'м'),
    ('Литр', 'л'),
    ('Квадратный метр', 'м²'),
    ('Кубический метр', 'м³'),
    ('Тонна', 'т'),
    ('Грамм', 'г'),
    ('Сантиметр', 'см'),
    ('Миллиметр', 'мм');

-- Add unit_id column to materials table
ALTER TABLE materials ADD COLUMN unit_id UUID;

-- Add foreign key constraint
ALTER TABLE materials ADD CONSTRAINT fk_materials_unit_id 
    FOREIGN KEY (unit_id) REFERENCES units(id);

-- Update existing materials to use default unit (штука)
UPDATE materials SET unit_id = (SELECT id FROM units WHERE short_name = 'шт.') WHERE unit_id IS NULL; 