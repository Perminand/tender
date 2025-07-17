-- Создание таблицы алертов
CREATE TABLE alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    message TEXT,
    description TEXT,
    type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    entity_id UUID,
    entity_type VARCHAR(50),
    target_user VARCHAR(100),
    target_role VARCHAR(50),
    target_department VARCHAR(100),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    acknowledged_at TIMESTAMP,
    resolved_at TIMESTAMP,
    action_url VARCHAR(500),
    action_text VARCHAR(200),
    metadata TEXT,
    view_count INTEGER DEFAULT 0,
    is_read BOOLEAN DEFAULT FALSE,
    is_acknowledged BOOLEAN DEFAULT FALSE,
    is_resolved BOOLEAN DEFAULT FALSE
);

-- Создание таблицы настроек дашборда
CREATE TABLE dashboard_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(100) NOT NULL,
    preferences JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(username)
);

-- Создание таблицы отчетов
CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_type VARCHAR(50) NOT NULL,
    report_name VARCHAR(200) NOT NULL,
    generated_by VARCHAR(100),
    generated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    period_start DATE,
    period_end DATE,
    parameters JSONB,
    file_path VARCHAR(500),
    file_size BIGINT,
    status VARCHAR(20) NOT NULL DEFAULT 'GENERATED',
    download_count INTEGER DEFAULT 0
);

-- Создание таблицы метрик дашборда
CREATE TABLE dashboard_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL(15,2),
    metric_unit VARCHAR(20),
    metric_date DATE NOT NULL,
    category VARCHAR(50),
    subcategory VARCHAR(50),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Создание индексов для быстрого поиска
CREATE INDEX idx_alerts_type ON alerts(type);
CREATE INDEX idx_alerts_severity ON alerts(severity);
CREATE INDEX idx_alerts_status ON alerts(status);
CREATE INDEX idx_alerts_target_user ON alerts(target_user);
CREATE INDEX idx_alerts_created_at ON alerts(created_at);
CREATE INDEX idx_alerts_entity_id ON alerts(entity_id);
CREATE INDEX idx_alerts_is_read ON alerts(is_read);
CREATE INDEX idx_alerts_is_acknowledged ON alerts(is_acknowledged);

CREATE INDEX idx_dashboard_preferences_username ON dashboard_preferences(username);

CREATE INDEX idx_reports_type ON reports(report_type);
CREATE INDEX idx_reports_generated_by ON reports(generated_by);
CREATE INDEX idx_reports_generated_at ON reports(generated_at);
CREATE INDEX idx_reports_status ON reports(status);

CREATE INDEX idx_dashboard_metrics_name ON dashboard_metrics(metric_name);
CREATE INDEX idx_dashboard_metrics_date ON dashboard_metrics(metric_date);
CREATE INDEX idx_dashboard_metrics_category ON dashboard_metrics(category);

-- Создание представлений для удобства
CREATE VIEW active_alerts AS
SELECT * FROM alerts 
WHERE status = 'ACTIVE' AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP);

CREATE VIEW urgent_alerts AS
SELECT * FROM alerts 
WHERE severity IN ('HIGH', 'CRITICAL') AND status = 'ACTIVE';

CREATE VIEW unread_alerts AS
SELECT * FROM alerts 
WHERE is_read = FALSE AND status = 'ACTIVE';

CREATE VIEW dashboard_summary AS
SELECT 
    COUNT(*) as total_alerts,
    COUNT(CASE WHEN severity = 'CRITICAL' THEN 1 END) as critical_alerts,
    COUNT(CASE WHEN severity = 'HIGH' THEN 1 END) as high_alerts,
    COUNT(CASE WHEN is_read = FALSE THEN 1 END) as unread_alerts,
    COUNT(CASE WHEN is_acknowledged = FALSE THEN 1 END) as unacknowledged_alerts
FROM alerts 
WHERE status = 'ACTIVE'; 