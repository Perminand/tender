-- Создание справочников для предложений

-- Справочник брендов
CREATE TABLE brands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Справочник производителей
CREATE TABLE manufacturers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    country VARCHAR(100),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Справочник стран
CREATE TABLE countries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    code VARCHAR(3),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Справочник гарантий
CREATE TABLE warranties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Добавление начальных данных
INSERT INTO countries (name, code) VALUES 
('Россия', 'RUS'),
('Китай', 'CHN'),
('Германия', 'DEU'),
('США', 'USA'),
('Япония', 'JPN'),
('Южная Корея', 'KOR'),
('Италия', 'ITA'),
('Франция', 'FRA'),
('Великобритания', 'GBR'),
('Канада', 'CAN');

INSERT INTO warranties (name) VALUES 
('12 месяцев'),
('24 месяца'),
('36 месяцев'),
('60 месяцев'),
('Гарантия производителя'),
('Расширенная гарантия'),
('Без гарантии'); 