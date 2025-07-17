-- Создание таблицы рейтингов поставщиков
CREATE TABLE supplier_ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supplier_id UUID REFERENCES companies(id),
    contract_id UUID REFERENCES contracts(id),
    delivery_id UUID REFERENCES deliveries(id),
    quality_rating INTEGER CHECK (quality_rating >= 1 AND quality_rating <= 5),
    delivery_time_rating INTEGER CHECK (delivery_time_rating >= 1 AND delivery_time_rating <= 5),
    price_rating INTEGER CHECK (price_rating >= 1 AND price_rating <= 5),
    communication_rating INTEGER CHECK (communication_rating >= 1 AND communication_rating <= 5),
    reliability_rating INTEGER CHECK (reliability_rating >= 1 AND reliability_rating <= 5),
    overall_rating DECIMAL(3,2),
    quality_comments TEXT,
    delivery_comments TEXT,
    price_comments TEXT,
    communication_comments TEXT,
    reliability_comments TEXT,
    general_comments TEXT,
    total_contracts INTEGER DEFAULT 0,
    completed_contracts INTEGER DEFAULT 0,
    delayed_deliveries INTEGER DEFAULT 0,
    quality_issues INTEGER DEFAULT 0,
    total_amount DECIMAL(15,2),
    average_savings DECIMAL(15,2),
    rating_date TIMESTAMP,
    rated_by VARCHAR(100),
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы планов закупок
CREATE TABLE procurement_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_number VARCHAR(100) UNIQUE,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    plan_year DATE,
    start_date DATE,
    end_date DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    total_budget DECIMAL(15,2),
    allocated_budget DECIMAL(15,2),
    spent_budget DECIMAL(15,2),
    remaining_budget DECIMAL(15,2),
    planned_tenders INTEGER DEFAULT 0,
    completed_tenders INTEGER DEFAULT 0,
    active_tenders INTEGER DEFAULT 0,
    expected_savings DECIMAL(15,2),
    average_tender_value DECIMAL(15,2),
    expected_suppliers INTEGER DEFAULT 0,
    priority_categories TEXT,
    critical_items TEXT,
    seasonal_items TEXT,
    created_by VARCHAR(100),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы KPI закупок
CREATE TABLE procurement_kpis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kpi_name VARCHAR(200) NOT NULL,
    description TEXT,
    measurement_date DATE,
    period_start DATE,
    period_end DATE,
    total_savings DECIMAL(15,2),
    savings_percentage DECIMAL(5,2),
    average_savings_per_tender DECIMAL(15,2),
    budget_utilization DECIMAL(5,2),
    average_tender_duration INTEGER,
    average_request_processing_time INTEGER,
    average_delivery_time INTEGER,
    on_time_delivery_percentage INTEGER,
    total_deliveries INTEGER DEFAULT 0,
    accepted_deliveries INTEGER DEFAULT 0,
    rejected_deliveries INTEGER DEFAULT 0,
    quality_acceptance_rate DECIMAL(5,2),
    active_suppliers INTEGER DEFAULT 0,
    new_suppliers INTEGER DEFAULT 0,
    average_supplier_rating DECIMAL(3,2),
    supplier_retention_rate INTEGER,
    total_tenders INTEGER DEFAULT 0,
    successful_tenders INTEGER DEFAULT 0,
    cancelled_tenders INTEGER DEFAULT 0,
    tender_success_rate DECIMAL(5,2),
    average_proposals_per_tender INTEGER DEFAULT 0,
    total_contracts INTEGER DEFAULT 0,
    active_contracts INTEGER DEFAULT 0,
    completed_contracts INTEGER DEFAULT 0,
    contract_value DECIMAL(15,2),
    average_contract_value DECIMAL(15,2),
    total_payments DECIMAL(15,2),
    pending_payments DECIMAL(15,2),
    overdue_payments DECIMAL(15,2),
    payment_efficiency DECIMAL(5,2),
    target_savings DECIMAL(15,2),
    target_tender_duration INTEGER,
    target_quality_rate DECIMAL(5,2),
    target_supplier_count INTEGER,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы прогнозов цен
CREATE TABLE price_forecasts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    material_id UUID REFERENCES materials(id),
    category_id UUID REFERENCES categories(id),
    forecast_date DATE,
    valid_from DATE,
    valid_to DATE,
    current_price DECIMAL(15,2),
    average_market_price DECIMAL(15,2),
    min_price DECIMAL(15,2),
    max_price DECIMAL(15,2),
    forecasted_price DECIMAL(15,2),
    optimistic_price DECIMAL(15,2),
    pessimistic_price DECIMAL(15,2),
    price_change DECIMAL(15,2),
    price_change_percentage DECIMAL(5,2),
    trend_direction VARCHAR(10),
    market_factors TEXT,
    seasonal_factors TEXT,
    supply_demand_factors TEXT,
    external_factors TEXT,
    confidence_level DECIMAL(5,2),
    confidence_factors TEXT,
    data_sources TEXT,
    methodology TEXT,
    assumptions TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    created_by VARCHAR(100),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Создание индексов для быстрого поиска
CREATE INDEX idx_supplier_ratings_supplier_id ON supplier_ratings(supplier_id);
CREATE INDEX idx_supplier_ratings_contract_id ON supplier_ratings(contract_id);
CREATE INDEX idx_supplier_ratings_overall_rating ON supplier_ratings(overall_rating);
CREATE INDEX idx_supplier_ratings_status ON supplier_ratings(status);

CREATE INDEX idx_procurement_plans_plan_year ON procurement_plans(plan_year);
CREATE INDEX idx_procurement_plans_status ON procurement_plans(status);
CREATE INDEX idx_procurement_plans_created_by ON procurement_plans(created_by);

CREATE INDEX idx_procurement_kpis_measurement_date ON procurement_kpis(measurement_date);
CREATE INDEX idx_procurement_kpis_status ON procurement_kpis(status);

CREATE INDEX idx_price_forecasts_material_id ON price_forecasts(material_id);
CREATE INDEX idx_price_forecasts_category_id ON price_forecasts(category_id);
CREATE INDEX idx_price_forecasts_forecast_date ON price_forecasts(forecast_date);
CREATE INDEX idx_price_forecasts_status ON price_forecasts(status); 