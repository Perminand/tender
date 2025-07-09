-- Добавление триггеров для автоматического обновления updated_at

-- Функция для обновления updated_at (уже существует в V009, но пересоздаем для надежности)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Триггер для таблицы documents
CREATE TRIGGER update_documents_updated_at 
    BEFORE UPDATE ON documents 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Триггер для таблицы contracts
CREATE TRIGGER update_contracts_updated_at 
    BEFORE UPDATE ON contracts 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Триггер для таблицы deliveries
CREATE TRIGGER update_deliveries_updated_at 
    BEFORE UPDATE ON deliveries 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Триггер для таблицы payments
CREATE TRIGGER update_payments_updated_at 
    BEFORE UPDATE ON payments 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Триггер для таблицы companies
CREATE TRIGGER update_companies_updated_at 
    BEFORE UPDATE ON companies 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Триггер для таблицы materials
CREATE TRIGGER update_materials_updated_at 
    BEFORE UPDATE ON materials 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Триггер для таблицы requests
CREATE TRIGGER update_requests_updated_at 
    BEFORE UPDATE ON requests 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Триггер для таблицы tenders
CREATE TRIGGER update_tenders_updated_at 
    BEFORE UPDATE ON tenders 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Триггер для таблицы warehouses
CREATE TRIGGER update_warehouses_updated_at 
    BEFORE UPDATE ON warehouses 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Триггер для таблицы contract_items
CREATE TRIGGER update_contract_items_updated_at 
    BEFORE UPDATE ON contract_items 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Триггер для таблицы delivery_items
CREATE TRIGGER update_delivery_items_updated_at 
    BEFORE UPDATE ON delivery_items 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Триггер для таблицы categories
CREATE TRIGGER update_categories_updated_at 
    BEFORE UPDATE ON categories 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Триггер для таблицы material_types
CREATE TRIGGER update_material_types_updated_at 
    BEFORE UPDATE ON material_types 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Триггер для таблицы projects
CREATE TRIGGER update_projects_updated_at 
    BEFORE UPDATE ON projects 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Триггер для таблицы notifications
CREATE TRIGGER update_notifications_updated_at 
    BEFORE UPDATE ON notifications 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column(); 