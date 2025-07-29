CREATE TABLE import_column_mapping (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    company_id VARCHAR(64) NOT NULL,
    mapping_json TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);
CREATE UNIQUE INDEX idx_import_column_mapping_user_company ON import_column_mapping(user_id, company_id); 