-- SQL скрипт для добавления еще 5 предложений от поставщиков
-- Тендер: 41f5d3f5-cdc3-4e98-a6d8-736a846641db
-- Тендер по заявке 22 - строительные материалы и инструменты

-- Функция для создания предложения от поставщика
CREATE OR REPLACE FUNCTION create_supplier_proposal(
    p_supplier_id UUID,
    p_proposal_number TEXT,
    p_cover_letter TEXT,
    p_payment_terms TEXT,
    p_delivery_terms TEXT,
    p_warranty_terms TEXT
) RETURNS UUID AS $$
DECLARE
    proposal_id UUID;
BEGIN
    -- Создаем предложение поставщика
    INSERT INTO supplier_proposals (
        id,
        tender_id,
        supplier_id,
        proposal_number,
        submission_date,
        valid_until,
        status,
        cover_letter,
        technical_proposal,
        commercial_terms,
        total_price,
        currency,
        payment_terms,
        delivery_terms,
        warranty_terms
    ) VALUES (
        uuid_generate_v4(),
        '41f5d3f5-cdc3-4e98-a6d8-736a846641db',
        p_supplier_id,
        p_proposal_number,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP + INTERVAL '30 days',
        'SUBMITTED',
        p_cover_letter,
        'Все предлагаемые материалы соответствуют техническим требованиям и имеют необходимые сертификаты качества.',
        'Срок действия предложения: 30 дней с даты подачи.',
        0,
        'RUB',
        p_payment_terms,
        p_delivery_terms,
        p_warranty_terms
    ) RETURNING id INTO proposal_id;
    
    RETURN proposal_id;
END;
$$ LANGUAGE plpgsql;

-- Функция для добавления позиции в предложение
CREATE OR REPLACE FUNCTION add_proposal_item(
    p_proposal_id UUID,
    p_tender_item_id UUID,
    p_item_number INTEGER,
    p_description TEXT,
    p_brand TEXT,
    p_model TEXT,
    p_manufacturer TEXT,
    p_country TEXT,
    p_quantity DOUBLE PRECISION,
    p_unit_id UUID,
    p_unit_price DECIMAL(15,2),
    p_specifications TEXT,
    p_delivery_period TEXT,
    p_warranty TEXT,
    p_additional_info TEXT
) RETURNS DECIMAL(15,2) AS $$
DECLARE
    item_total DECIMAL(15,2);
BEGIN
    item_total := p_quantity * p_unit_price;
    
    INSERT INTO proposal_items (
        id,
        supplier_proposal_id,
        tender_item_id,
        item_number,
        description,
        brand,
        model,
        manufacturer,
        country_of_origin,
        quantity,
        unit_id,
        unit_price,
        total_price,
        specifications,
        delivery_period,
        warranty,
        additional_info
    ) VALUES (
        uuid_generate_v4(),
        p_proposal_id,
        p_tender_item_id,
        p_item_number,
        p_description,
        p_brand,
        p_model,
        p_manufacturer,
        p_country,
        p_quantity,
        p_unit_id,
        p_unit_price,
        item_total,
        p_specifications,
        p_delivery_period,
        p_warranty,
        p_additional_info
    );
    
    RETURN item_total;
END;
$$ LANGUAGE plpgsql;

-- Основной блок для создания 5 предложений
DO $$
DECLARE
    supplier_ids UUID[];
    proposal_ids UUID[5];
    total_prices DECIMAL(15,2)[5];
    current_total DECIMAL(15,2);
    i INTEGER;
    j INTEGER;
BEGIN
    -- Получаем 5 поставщиков
    SELECT array_agg(id) INTO supplier_ids
    FROM companies 
    WHERE role = 'SUPPLIER' 
    LIMIT 5;
    
    IF array_length(supplier_ids, 1) < 5 THEN
        RAISE EXCEPTION 'Недостаточно поставщиков в системе. Требуется минимум 5.';
    END IF;
    
    -- Создаем 5 предложений
    FOR i IN 1..5 LOOP
        -- Создаем предложение
        proposal_ids[i] := create_supplier_proposal(
            supplier_ids[i],
            'PROP-' || EXTRACT(YEAR FROM CURRENT_DATE) || '-' || LPAD(EXTRACT(DOY FROM CURRENT_DATE)::TEXT, 3, '0') || '-' || LPAD((SELECT COUNT(*) + i FROM supplier_proposals)::TEXT, 4, '0'),
            CASE i
                WHEN 1 THEN 'Уважаемые коллеги! Представляем конкурентоспособное предложение на поставку строительных материалов. Гарантируем качество и соблюдение сроков.'
                WHEN 2 THEN 'Добрый день! Наша компания готова предложить оптимальные цены на строительные материалы и инструменты. Работаем напрямую с производителями.'
                WHEN 3 THEN 'Здравствуйте! Предлагаем выгодные условия поставки строительных материалов. Большой опыт работы в сфере строительства.'
                WHEN 4 THEN 'Приветствуем! Наше предложение включает качественные материалы от проверенных поставщиков по привлекательным ценам.'
                WHEN 5 THEN 'Добро пожаловать! Представляем комплексное решение для ваших строительных нужд. Индивидуальный подход к каждому клиенту.'
            END,
            CASE i
                WHEN 1 THEN 'Оплата: 100% предоплата. Возможна отсрочка до 15 дней.'
                WHEN 2 THEN 'Оплата: 50% предоплата, 50% после поставки. Отсрочка до 30 дней.'
                WHEN 3 THEN 'Оплата: 30% предоплата, 70% после поставки. Отсрочка до 45 дней.'
                WHEN 4 THEN 'Оплата: 100% предоплата. Скидка 5% при оплате в течение 3 дней.'
                WHEN 5 THEN 'Оплата: 70% предоплата, 30% после поставки. Отсрочка до 60 дней.'
            END,
            CASE i
                WHEN 1 THEN 'Доставка: 2-3 рабочих дня. Собственный транспорт.'
                WHEN 2 THEN 'Доставка: 3-5 рабочих дней. Транспортные компании.'
                WHEN 3 THEN 'Доставка: 5-7 рабочих дней. До склада заказчика.'
                WHEN 4 THEN 'Доставка: 1-2 рабочих дня. Экспресс-доставка.'
                WHEN 5 THEN 'Доставка: 7-10 рабочих дней. Железнодорожный транспорт.'
            END,
            CASE i
                WHEN 1 THEN 'Гарантия: 18 месяцев на инструменты, 24 месяца на материалы.'
                WHEN 2 THEN 'Гарантия: 12 месяцев на все позиции. Расширенная гарантия за доплату.'
                WHEN 3 THEN 'Гарантия: 24 месяца на инструменты, 36 месяцев на материалы.'
                WHEN 4 THEN 'Гарантия: 6 месяцев на инструменты, 12 месяцев на материалы.'
                WHEN 5 THEN 'Гарантия: 36 месяцев на все позиции. Пожизненная гарантия на премиум-инструменты.'
            END
        );
        
        total_prices[i] := 0;
        
        -- Добавляем позиции с разными ценами для каждого поставщика
        -- Позиция 1: Дюбель-гвоздь 4,5*60
        current_total := add_proposal_item(
            proposal_ids[i],
            '3c5fd092-ebe6-4aa8-b948-304436410dc6',
            1,
            'Дюбель-гвоздь 4,5*60',
            CASE i
                WHEN 1 THEN 'Fischer'
                WHEN 2 THEN 'Hilti'
                WHEN 3 THEN 'Bosch'
                WHEN 4 THEN 'Mungo'
                WHEN 5 THEN 'Würth'
            END,
            CASE i
                WHEN 1 THEN 'FDU 6x60'
                WHEN 2 THEN 'HUD 6x60'
                WHEN 3 THEN 'UAX 6x60'
                WHEN 4 THEN 'MDU 6x60'
                WHEN 5 THEN 'WDU 6x60'
            END,
            CASE i
                WHEN 1 THEN 'Fischer'
                WHEN 2 THEN 'Hilti'
                WHEN 3 THEN 'Bosch'
                WHEN 4 THEN 'Mungo'
                WHEN 5 THEN 'Würth'
            END,
            CASE i
                WHEN 1 THEN 'Германия'
                WHEN 2 THEN 'Лихтенштейн'
                WHEN 3 THEN 'Германия'
                WHEN 4 THEN 'Швейцария'
                WHEN 5 THEN 'Германия'
            END,
            1000.0,
            'bbb71069-4cde-4850-93ab-ad51362a3311',
            CASE i
                WHEN 1 THEN 6.50
                WHEN 2 THEN 7.20
                WHEN 3 THEN 5.80
                WHEN 4 THEN 8.10
                WHEN 5 THEN 6.90
            END,
            'Оцинкованный, для бетона и кирпича',
            '3-5 дней',
            'Гарантия производителя',
            'Поставляется в упаковке по 100 шт.'
        );
        total_prices[i] := total_prices[i] + current_total;
        
        -- Позиция 2: Патрон для дюбеля 6,8*18 мм
        current_total := add_proposal_item(
            proposal_ids[i],
            '76d540d5-a0cb-4bee-95d8-e29829c5d9b5',
            2,
            'Патрон для дюбеля 6,8*18 мм',
            CASE i
                WHEN 1 THEN 'Hilti'
                WHEN 2 THEN 'Fischer'
                WHEN 3 THEN 'Mungo'
                WHEN 4 THEN 'Bosch'
                WHEN 5 THEN 'Würth'
            END,
            CASE i
                WHEN 1 THEN 'HUD 6.8x18'
                WHEN 2 THEN 'FDU 6.8x18'
                WHEN 3 THEN 'MDU 6.8x18'
                WHEN 4 THEN 'UAX 6.8x18'
                WHEN 5 THEN 'WDU 6.8x18'
            END,
            CASE i
                WHEN 1 THEN 'Hilti'
                WHEN 2 THEN 'Fischer'
                WHEN 3 THEN 'Mungo'
                WHEN 4 THEN 'Bosch'
                WHEN 5 THEN 'Würth'
            END,
            CASE i
                WHEN 1 THEN 'Лихтенштейн'
                WHEN 2 THEN 'Германия'
                WHEN 3 THEN 'Швейцария'
                WHEN 4 THEN 'Германия'
                WHEN 5 THEN 'Германия'
            END,
            1000.0,
            'bbb71069-4cde-4850-93ab-ad51362a3311',
            CASE i
                WHEN 1 THEN 6.20
                WHEN 2 THEN 5.90
                WHEN 3 THEN 7.50
                WHEN 4 THEN 6.40
                WHEN 5 THEN 6.80
            END,
            'Пластиковый, для легких конструкций',
            '3-5 дней',
            'Гарантия производителя',
            'Поставляется в упаковке по 200 шт.'
        );
        total_prices[i] := total_prices[i] + current_total;
        
        -- Позиция 3: Бита для шуруповерта
        current_total := add_proposal_item(
            proposal_ids[i],
            '715bedbf-eac1-4f0a-8588-555731093404',
            3,
            'Бита для шуруповерта',
            CASE i
                WHEN 1 THEN 'Bosch'
                WHEN 2 THEN 'Makita'
                WHEN 3 THEN 'DeWalt'
                WHEN 4 THEN 'Milwaukee'
                WHEN 5 THEN 'Hilti'
            END,
            CASE i
                WHEN 1 THEN 'PH2x50'
                WHEN 2 THEN 'PH2x50'
                WHEN 3 THEN 'PH2x50'
                WHEN 4 THEN 'PH2x50'
                WHEN 5 THEN 'PH2x50'
            END,
            CASE i
                WHEN 1 THEN 'Bosch'
                WHEN 2 THEN 'Makita'
                WHEN 3 THEN 'DeWalt'
                WHEN 4 THEN 'Milwaukee'
                WHEN 5 THEN 'Hilti'
            END,
            CASE i
                WHEN 1 THEN 'Германия'
                WHEN 2 THEN 'Япония'
                WHEN 3 THEN 'США'
                WHEN 4 THEN 'США'
                WHEN 5 THEN 'Лихтенштейн'
            END,
            20.0,
            'bbb71069-4cde-4850-93ab-ad51362a3311',
            CASE i
                WHEN 1 THEN 45.00
                WHEN 2 THEN 52.00
                WHEN 3 THEN 48.00
                WHEN 4 THEN 55.00
                WHEN 5 THEN 65.00
            END,
            'Хром-ванадиевая сталь, магнитная',
            '3-5 дней',
            '12 месяцев',
            'Поставляется в наборе по 10 шт.'
        );
        total_prices[i] := total_prices[i] + current_total;
        
        -- Позиция 4: Перчатки с двойным латексным обливом
        current_total := add_proposal_item(
            proposal_ids[i],
            '098bf44b-1fa0-4b96-a64d-ffca72e891a0',
            4,
            'Перчатки с двойным латексным обливом',
            CASE i
                WHEN 1 THEN 'Ansell'
                WHEN 2 THEN 'Showa'
                WHEN 3 THEN 'MAPA'
                WHEN 4 THEN 'KCL'
                WHEN 5 THEN 'Towa'
            END,
            CASE i
                WHEN 1 THEN 'Hyflex 11-800'
                WHEN 2 THEN 'Showa 310'
                WHEN 3 THEN 'MAPA Professional'
                WHEN 4 THEN 'KCL Safety'
                WHEN 5 THEN 'Towa Gloves'
            END,
            CASE i
                WHEN 1 THEN 'Ansell'
                WHEN 2 THEN 'Showa'
                WHEN 3 THEN 'MAPA'
                WHEN 4 THEN 'KCL'
                WHEN 5 THEN 'Towa'
            END,
            CASE i
                WHEN 1 THEN 'Малайзия'
                WHEN 2 THEN 'Япония'
                WHEN 3 THEN 'Германия'
                WHEN 4 THEN 'Южная Корея'
                WHEN 5 THEN 'Япония'
            END,
            200.0,
            'bbb71069-4cde-4850-93ab-ad51362a3311',
            CASE i
                WHEN 1 THEN 38.00
                WHEN 2 THEN 42.00
                WHEN 3 THEN 35.00
                WHEN 4 THEN 45.00
                WHEN 5 THEN 40.00
            END,
            'Размер L, защита от порезов',
            '3-5 дней',
            'Гарантия производителя',
            'Поставляется в упаковке по 12 пар'
        );
        total_prices[i] := total_prices[i] + current_total;
        
        -- Позиция 5: Комплект для инжекции SORMAT ITH 410 мл
        current_total := add_proposal_item(
            proposal_ids[i],
            '41340d98-21e7-4286-88e6-72fa61a09e95',
            5,
            'Комплект для инжекции SORMAT ITH 410 мл',
            CASE i
                WHEN 1 THEN 'Sormat'
                WHEN 2 THEN 'Hilti'
                WHEN 3 THEN 'Fischer'
                WHEN 4 THEN 'Mungo'
                WHEN 5 THEN 'Würth'
            END,
            CASE i
                WHEN 1 THEN 'ITH 410'
                WHEN 2 THEN 'HIT-RE 500'
                WHEN 3 THEN 'FIS V 360'
                WHEN 4 THEN 'Mungo ITH'
                WHEN 5 THEN 'Würth ITH'
            END,
            CASE i
                WHEN 1 THEN 'Sormat'
                WHEN 2 THEN 'Hilti'
                WHEN 3 THEN 'Fischer'
                WHEN 4 THEN 'Mungo'
                WHEN 5 THEN 'Würth'
            END,
            CASE i
                WHEN 1 THEN 'Финляндия'
                WHEN 2 THEN 'Лихтенштейн'
                WHEN 3 THEN 'Германия'
                WHEN 4 THEN 'Швейцария'
                WHEN 5 THEN 'Германия'
            END,
            24.0,
            'bbb71069-4cde-4850-93ab-ad51362a3311',
            CASE i
                WHEN 1 THEN 3200.00
                WHEN 2 THEN 3800.00
                WHEN 3 THEN 2900.00
                WHEN 4 THEN 4200.00
                WHEN 5 THEN 3500.00
            END,
            'Эпоксидная смола, отвердитель в комплекте',
            '7-10 дней',
            '24 месяца',
            'Поставляется в картонной упаковке'
        );
        total_prices[i] := total_prices[i] + current_total;
        
        -- Добавляем остальные позиции (6-14) с аналогичными вариациями цен
        -- Для краткости добавляем только ключевые позиции
        
        -- Позиция 6: Шнур для строительных работ
        current_total := add_proposal_item(
            proposal_ids[i],
            '9bfeaebd-bb06-408b-8fce-8527df0b399f',
            6,
            'Шнур для строительных работ',
            CASE i
                WHEN 1 THEN 'Kern'
                WHEN 2 THEN 'Stanley'
                WHEN 3 THEN 'Hultafors'
                WHEN 4 THEN 'Komelon'
                WHEN 5 THEN 'Lufkin'
            END,
            CASE i
                WHEN 1 THEN 'Kern Line'
                WHEN 2 THEN 'Stanley FatMax'
                WHEN 3 THEN 'Hultafors Talmeter'
                WHEN 4 THEN 'Komelon Pro'
                WHEN 5 THEN 'Lufkin Pro'
            END,
            CASE i
                WHEN 1 THEN 'Kern'
                WHEN 2 THEN 'Stanley'
                WHEN 3 THEN 'Hultafors'
                WHEN 4 THEN 'Komelon'
                WHEN 5 THEN 'Lufkin'
            END,
            CASE i
                WHEN 1 THEN 'Германия'
                WHEN 2 THEN 'США'
                WHEN 3 THEN 'Швеция'
                WHEN 4 THEN 'Южная Корея'
                WHEN 5 THEN 'США'
            END,
            10.0,
            'bbb71069-4cde-4850-93ab-ad51362a3311',
            CASE i
                WHEN 1 THEN 200.00
                WHEN 2 THEN 180.00
                WHEN 3 THEN 220.00
                WHEN 4 THEN 160.00
                WHEN 5 THEN 190.00
            END,
            'Нейлоновый, длина 50м',
            '3-5 дней',
            'Гарантия производителя',
            'Поставляется в пластиковой катушке'
        );
        total_prices[i] := total_prices[i] + current_total;
        
        -- Обновляем общую стоимость предложения
        UPDATE supplier_proposals 
        SET total_price = total_prices[i] 
        WHERE id = proposal_ids[i];
        
        RAISE NOTICE 'Предложение % создано. ID: %, Общая стоимость: % руб.', i, proposal_ids[i], total_prices[i];
    END LOOP;
    
END $$;

-- Очистка функций
DROP FUNCTION IF EXISTS create_supplier_proposal(UUID, TEXT, TEXT, TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS add_proposal_item(UUID, UUID, INTEGER, TEXT, TEXT, TEXT, TEXT, TEXT, DOUBLE PRECISION, UUID, DECIMAL, TEXT, TEXT, TEXT, TEXT);

-- Вывод информации о всех предложениях
SELECT 
    sp.id as proposal_id,
    sp.proposal_number,
    c.name as supplier_name,
    sp.submission_date,
    sp.status,
    sp.total_price,
    sp.currency,
    ROW_NUMBER() OVER (ORDER BY sp.total_price) as price_rank
FROM supplier_proposals sp
JOIN companies c ON c.id = sp.supplier_id
WHERE sp.tender_id = '41f5d3f5-cdc3-4e98-a6d8-736a846641db'
ORDER BY sp.total_price;

-- Статистика по предложениям
SELECT 
    COUNT(*) as total_proposals,
    MIN(total_price) as min_price,
    MAX(total_price) as max_price,
    AVG(total_price) as avg_price,
    STDDEV(total_price) as price_stddev
FROM supplier_proposals 
WHERE tender_id = '41f5d3f5-cdc3-4e98-a6d8-736a846641db';
