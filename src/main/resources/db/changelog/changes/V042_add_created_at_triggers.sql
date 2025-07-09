-- Добавление триггеров для автоматического заполнения created_at

-- Функция для заполнения created_at
CREATE OR REPLACE FUNCTION set_created_at_column()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.created_at IS NULL THEN
        NEW.created_at = CURRENT_TIMESTAMP;
    END IF;
    IF NEW.updated_at IS NULL THEN
        NEW.updated_at = CURRENT_TIMESTAMP;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Триггеры для автоматического заполнения created_at и updated_at при INSERT

-- Триггер для таблицы documents
CREATE TRIGGER set_documents_timestamps 
    BEFORE INSERT ON documents 
    FOR EACH ROW 
    EXECUTE FUNCTION set_created_at_column();

-- Триггер для таблицы contracts
CREATE TRIGGER set_contracts_timestamps 
    BEFORE INSERT ON contracts 
    FOR EACH ROW 
    EXECUTE FUNCTION set_created_at_column();

-- Триггер для таблицы deliveries
CREATE TRIGGER set_deliveries_timestamps 
    BEFORE INSERT ON deliveries 
    FOR EACH ROW 
    EXECUTE FUNCTION set_created_at_column();

-- Триггер для таблицы payments
CREATE TRIGGER set_payments_timestamps 
    BEFORE INSERT ON payments 
    FOR EACH ROW 
    EXECUTE FUNCTION set_created_at_column();

-- Триггер для таблицы companies
CREATE TRIGGER set_companies_timestamps 
    BEFORE INSERT ON companies 
    FOR EACH ROW 
    EXECUTE FUNCTION set_created_at_column();

-- Триггер для таблицы materials
CREATE TRIGGER set_materials_timestamps 
    BEFORE INSERT ON materials 
    FOR EACH ROW 
    EXECUTE FUNCTION set_created_at_column();

-- Триггер для таблицы requests
CREATE TRIGGER set_requests_timestamps 
    BEFORE INSERT ON requests 
    FOR EACH ROW 
    EXECUTE FUNCTION set_created_at_column();

-- Триггер для таблицы tenders
CREATE TRIGGER set_tenders_timestamps 
    BEFORE INSERT ON tenders 
    FOR EACH ROW 
    EXECUTE FUNCTION set_created_at_column();

-- Триггер для таблицы warehouses
CREATE TRIGGER set_warehouses_timestamps 
    BEFORE INSERT ON warehouses 
    FOR EACH ROW 
    EXECUTE FUNCTION set_created_at_column();

-- Триггер для таблицы contract_items
CREATE TRIGGER set_contract_items_timestamps 
    BEFORE INSERT ON contract_items 
    FOR EACH ROW 
    EXECUTE FUNCTION set_created_at_column();

-- Триггер для таблицы delivery_items
CREATE TRIGGER set_delivery_items_timestamps 
    BEFORE INSERT ON delivery_items 
    FOR EACH ROW 
    EXECUTE FUNCTION set_created_at_column();

-- Триггер для таблицы categories
CREATE TRIGGER set_categories_timestamps 
    BEFORE INSERT ON categories 
    FOR EACH ROW 
    EXECUTE FUNCTION set_created_at_column();

-- Триггер для таблицы material_types
CREATE TRIGGER set_material_types_timestamps 
    BEFORE INSERT ON material_types 
    FOR EACH ROW 
    EXECUTE FUNCTION set_created_at_column();

-- Триггер для таблицы projects
CREATE TRIGGER set_projects_timestamps 
    BEFORE INSERT ON projects 
    FOR EACH ROW 
    EXECUTE FUNCTION set_created_at_column();

-- Триггер для таблицы notifications
CREATE TRIGGER set_notifications_timestamps 
    BEFORE INSERT ON notifications 
    FOR EACH ROW 
    EXECUTE FUNCTION set_created_at_column(); 