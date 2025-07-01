-- Создание таблицы складов
CREATE TABLE warehouses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    project_id UUID NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_warehouse_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- Создание индекса для быстрого поиска по проекту
CREATE INDEX idx_warehouses_project_id ON warehouses(project_id);

-- Создание уникального индекса для названия склада в рамках проекта
CREATE UNIQUE INDEX idx_warehouses_name_project ON warehouses(name, project_id); 