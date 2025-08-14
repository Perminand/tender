-- SQL скрипт для добавления еще 5 предложений от поставщиков
-- Тендер: 1ba2d32a-fe5a-4ce5-95bd-369f097a73e7
-- Тендер по заявке - строительные материалы и инструменты

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
        '1ba2d32a-fe5a-4ce5-95bd-369f097a73e7',
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
            '51abe35e-92a4-428a-8155-e638794aa052',
            1,
            'Дюбель-гвоздь 4,5*60',
            CASE i
                WHEN 1 THEN 'Tech-Krep'
                WHEN 2 THEN 'Fischer'
                WHEN 3 THEN 'Hilti'
                WHEN 4 THEN 'Bosch'
                WHEN 5 THEN 'Mungo'
            END,
            CASE i
                WHEN 1 THEN '104760'
                WHEN 2 THEN 'FDU 6x60'
                WHEN 3 THEN 'HUD 6x60'
                WHEN 4 THEN 'UAX 6x60'
                WHEN 5 THEN 'MDU 6x60'
            END,
            CASE i
                WHEN 1 THEN 'Tech-Krep'
                WHEN 2 THEN 'Fischer'
                WHEN 3 THEN 'Hilti'
                WHEN 4 THEN 'Bosch'
                WHEN 5 THEN 'Mungo'
            END,
            CASE i
                WHEN 1 THEN 'Россия'
                WHEN 2 THEN 'Германия'
                WHEN 3 THEN 'Лихтенштейн'
                WHEN 4 THEN 'Германия'
                WHEN 5 THEN 'Швейцария'
            END,
            1000.0,
            'b057ebf7-8075-42dd-b72e-c329c86fe9c6',
            CASE i
                WHEN 1 THEN 7.32
                WHEN 2 THEN 8.50
                WHEN 3 THEN 9.20
                WHEN 4 THEN 7.80
                WHEN 5 THEN 8.10
            END,
            'Оцинкованный, для бетона и кирпича',
            '3-5 дней',
            'Гарантия производителя',
            'Поставляется в упаковке по 111 шт.'
        );
        total_prices[i] := total_prices[i] + current_total;
        
        -- Позиция 2: Патрон для дюбеля 6,8*18 мм
        current_total := add_proposal_item(
            proposal_ids[i],
            'aa643d86-e0ff-429d-80dc-aec1f1568be9',
            2,
            'Патрон для дюбеля 6,8*18 мм',
            CASE i
                WHEN 1 THEN 'Gefest'
                WHEN 2 THEN 'Hilti'
                WHEN 3 THEN 'Fischer'
                WHEN 4 THEN 'Mungo'
                WHEN 5 THEN 'Bosch'
            END,
            CASE i
                WHEN 1 THEN '6,8x18 красный'
                WHEN 2 THEN 'HUD 6.8x18'
                WHEN 3 THEN 'FDU 6.8x18'
                WHEN 4 THEN 'MDU 6.8x18'
                WHEN 5 THEN 'UAX 6.8x18'
            END,
            CASE i
                WHEN 1 THEN 'Gefest'
                WHEN 2 THEN 'Hilti'
                WHEN 3 THEN 'Fischer'
                WHEN 4 THEN 'Mungo'
                WHEN 5 THEN 'Bosch'
            END,
            CASE i
                WHEN 1 THEN 'Россия'
                WHEN 2 THEN 'Лихтенштейн'
                WHEN 3 THEN 'Германия'
                WHEN 4 THEN 'Швейцария'
                WHEN 5 THEN 'Германия'
            END,
            1000.0,
            'b057ebf7-8075-42dd-b72e-c329c86fe9c6',
            CASE i
                WHEN 1 THEN 6.96
                WHEN 2 THEN 8.20
                WHEN 3 THEN 7.90
                WHEN 4 THEN 9.50
                WHEN 5 THEN 8.40
            END,
            'Пластиковый, для легких конструкций',
            '3-5 дней',
            'Гарантия производителя',
            'Поставляется в упаковке по 100 шт.'
        );
        total_prices[i] := total_prices[i] + current_total;
        
        -- Позиция 3: Бита для шуруповерта
        current_total := add_proposal_item(
            proposal_ids[i],
            '1031610b-a7e9-4805-9ae7-bc1b36920c18',
            3,
            'Бита для шуруповерта',
            CASE i
                WHEN 1 THEN 'Gigant'
                WHEN 2 THEN 'Bosch'
                WHEN 3 THEN 'Makita'
                WHEN 4 THEN 'DeWalt'
                WHEN 5 THEN 'Milwaukee'
            END,
            CASE i
                WHEN 1 THEN 'GBS 11030'
                WHEN 2 THEN 'PH2x50'
                WHEN 3 THEN 'PH2x50'
                WHEN 4 THEN 'PH2x50'
                WHEN 5 THEN 'PH2x50'
            END,
            CASE i
                WHEN 1 THEN 'Gigant'
                WHEN 2 THEN 'Bosch'
                WHEN 3 THEN 'Makita'
                WHEN 4 THEN 'DeWalt'
                WHEN 5 THEN 'Milwaukee'
            END,
            CASE i
                WHEN 1 THEN 'Россия'
                WHEN 2 THEN 'Германия'
                WHEN 3 THEN 'Япония'
                WHEN 4 THEN 'США'
                WHEN 5 THEN 'США'
            END,
            20.0,
            'b057ebf7-8075-42dd-b72e-c329c86fe9c6',
            CASE i
                WHEN 1 THEN 53.04
                WHEN 2 THEN 65.00
                WHEN 3 THEN 72.00
                WHEN 4 THEN 68.00
                WHEN 5 THEN 75.00
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
            '3ee3c75c-4e37-4954-a304-e74b9744db9c',
            4,
            'Перчатки с двойным латексным обливом',
            CASE i
                WHEN 1 THEN 'Gigant'
                WHEN 2 THEN 'Ansell'
                WHEN 3 THEN 'Showa'
                WHEN 4 THEN 'MAPA'
                WHEN 5 THEN 'KCL'
            END,
            CASE i
                WHEN 1 THEN 'GGL-16'
                WHEN 2 THEN 'Hyflex 11-800'
                WHEN 3 THEN 'Showa 310'
                WHEN 4 THEN 'MAPA Professional'
                WHEN 5 THEN 'KCL Safety'
            END,
            CASE i
                WHEN 1 THEN 'Gigant'
                WHEN 2 THEN 'Ansell'
                WHEN 3 THEN 'Showa'
                WHEN 4 THEN 'MAPA'
                WHEN 5 THEN 'KCL'
            END,
            CASE i
                WHEN 1 THEN 'Россия'
                WHEN 2 THEN 'Малайзия'
                WHEN 3 THEN 'Япония'
                WHEN 4 THEN 'Германия'
                WHEN 5 THEN 'Южная Корея'
            END,
            200.0,
            'b057ebf7-8075-42dd-b72e-c329c86fe9c6',
            CASE i
                WHEN 1 THEN 44.40
                WHEN 2 THEN 58.00
                WHEN 3 THEN 62.00
                WHEN 4 THEN 55.00
                WHEN 5 THEN 65.00
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
            'eb4bc7af-8683-40dd-8564-f8382a27abd5',
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
                WHEN 1 THEN 'ITH 410 VE'
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
            'b057ebf7-8075-42dd-b72e-c329c86fe9c6',
            CASE i
                WHEN 1 THEN 3596.40
                WHEN 2 THEN 4200.00
                WHEN 3 THEN 3800.00
                WHEN 4 THEN 4600.00
                WHEN 5 THEN 3900.00
            END,
            'Эпоксидная смола, отвердитель в комплекте',
            '7-10 дней',
            '24 месяца',
            'Поставляется в картонной упаковке'
        );
        total_prices[i] := total_prices[i] + current_total;
        
        -- Позиция 6: Шнур для строительных работ
        current_total := add_proposal_item(
            proposal_ids[i],
            '7d12a52b-d98d-4a2a-b944-031af34bf8a8',
            6,
            'Шнур для строительных работ',
            CASE i
                WHEN 1 THEN 'STAYER'
                WHEN 2 THEN 'Kern'
                WHEN 3 THEN 'Stanley'
                WHEN 4 THEN 'Hultafors'
                WHEN 5 THEN 'Komelon'
            END,
            CASE i
                WHEN 1 THEN '2-06411-050'
                WHEN 2 THEN 'Kern Line'
                WHEN 3 THEN 'Stanley FatMax'
                WHEN 4 THEN 'Hultafors Talmeter'
                WHEN 5 THEN 'Komelon Pro'
            END,
            CASE i
                WHEN 1 THEN 'STAYER'
                WHEN 2 THEN 'Kern'
                WHEN 3 THEN 'Stanley'
                WHEN 4 THEN 'Hultafors'
                WHEN 5 THEN 'Komelon'
            END,
            CASE i
                WHEN 1 THEN 'Россия'
                WHEN 2 THEN 'Германия'
                WHEN 3 THEN 'США'
                WHEN 4 THEN 'Швеция'
                WHEN 5 THEN 'Южная Корея'
            END,
            10.0,
            '21882124-edd2-429e-b201-e7dd5502c18d',
            CASE i
                WHEN 1 THEN 224.40
                WHEN 2 THEN 280.00
                WHEN 3 THEN 260.00
                WHEN 4 THEN 300.00
                WHEN 5 THEN 240.00
            END,
            'Нейлоновый, длина 50м',
            '3-5 дней',
            'Гарантия производителя',
            'Поставляется в пластиковой катушке'
        );
        total_prices[i] := total_prices[i] + current_total;
        
        -- Позиция 7: Добавка гидроизоляционная в бетон Пенетрон Адмикс
        current_total := add_proposal_item(
            proposal_ids[i],
            'ae317958-db29-41da-986a-8bc7e86e8d3f',
            7,
            'Добавка гидроизоляционная в бетон Пенетрон Адмикс',
            CASE i
                WHEN 1 THEN 'Пенетрон'
                WHEN 2 THEN 'Sika'
                WHEN 3 THEN 'BASF'
                WHEN 4 THEN 'Mapei'
                WHEN 5 THEN 'Weber'
            END,
            CASE i
                WHEN 1 THEN 'Адмикс'
                WHEN 2 THEN 'SikaTop Seal-107'
                WHEN 3 THEN 'MasterSeal 501'
                WHEN 4 THEN 'Mapelastic'
                WHEN 5 THEN 'Weber.tec 824'
            END,
            CASE i
                WHEN 1 THEN 'Пенетрон'
                WHEN 2 THEN 'Sika'
                WHEN 3 THEN 'BASF'
                WHEN 4 THEN 'Mapei'
                WHEN 5 THEN 'Weber'
            END,
            CASE i
                WHEN 1 THEN 'Россия'
                WHEN 2 THEN 'Швейцария'
                WHEN 3 THEN 'Германия'
                WHEN 4 THEN 'Италия'
                WHEN 5 THEN 'Франция'
            END,
            11.0,
            '245feede-6d17-402e-87b8-02cac9a54a75',
            CASE i
                WHEN 1 THEN 26.03
                WHEN 2 THEN 35.00
                WHEN 3 THEN 32.00
                WHEN 4 THEN 38.00
                WHEN 5 THEN 30.00
            END,
            'Гидроизоляционная добавка в бетон',
            '5-7 дней',
            'Гарантия производителя',
            'Поставляется в крафт-мешке 20 кг'
        );
        total_prices[i] := total_prices[i] + current_total;
        
        -- Позиция 8: Бентонитовый шнур
        current_total := add_proposal_item(
            proposal_ids[i],
            '4626e71c-5a74-41a6-9451-6200ab202e44',
            8,
            'Бентонитовый шнур',
            CASE i
                WHEN 1 THEN 'Бентонит'
                WHEN 2 THEN 'Volclay'
                WHEN 3 THEN 'Bentomat'
                WHEN 4 THEN 'GCL'
                WHEN 5 THEN 'Claymax'
            END,
            CASE i
                WHEN 1 THEN '10х20 мм'
                WHEN 2 THEN 'Volclay GCL'
                WHEN 3 THEN 'Bentomat ST'
                WHEN 4 THEN 'GCL 2000'
                WHEN 5 THEN 'Claymax 200'
            END,
            CASE i
                WHEN 1 THEN 'Бентонит'
                WHEN 2 THEN 'Volclay'
                WHEN 3 THEN 'Bentomat'
                WHEN 4 THEN 'GCL'
                WHEN 5 THEN 'Claymax'
            END,
            CASE i
                WHEN 1 THEN 'Россия'
                WHEN 2 THEN 'США'
                WHEN 3 THEN 'Канада'
                WHEN 4 THEN 'Германия'
                WHEN 5 THEN 'США'
            END,
            50.0,
            '4dcf9ec8-3a86-4011-bef1-c796f1d9f57a',
            CASE i
                WHEN 1 THEN 273.60
                WHEN 2 THEN 320.00
                WHEN 3 THEN 290.00
                WHEN 4 THEN 350.00
                WHEN 5 THEN 280.00
            END,
            'Гидроизоляционный бентонитовый шнур',
            '5-7 дней',
            'Гарантия производителя',
            'Поставляется в рулонах'
        );
        total_prices[i] := total_prices[i] + current_total;
        
        -- Позиция 9: Стеклофибра Арматура композит
        current_total := add_proposal_item(
            proposal_ids[i],
            'a591cb38-2468-4930-8137-65d71bd7856b',
            9,
            'Стеклофибра Арматура композит',
            CASE i
                WHEN 1 THEN 'Арматура Композит'
                WHEN 2 THEN 'Basalt Fiber'
                WHEN 3 THEN 'Glass Fiber'
                WHEN 4 THEN 'Carbon Fiber'
                WHEN 5 THEN 'Aramid Fiber'
            END,
            CASE i
                WHEN 1 THEN '10 кг'
                WHEN 2 THEN 'Basalt Rebar'
                WHEN 3 THEN 'Glass Rebar'
                WHEN 4 THEN 'Carbon Rebar'
                WHEN 5 THEN 'Aramid Rebar'
            END,
            CASE i
                WHEN 1 THEN 'Арматура Композит'
                WHEN 2 THEN 'Basalt Fiber'
                WHEN 3 THEN 'Glass Fiber'
                WHEN 4 THEN 'Carbon Fiber'
                WHEN 5 THEN 'Aramid Fiber'
            END,
            CASE i
                WHEN 1 THEN 'Россия'
                WHEN 2 THEN 'Украина'
                WHEN 3 THEN 'Китай'
                WHEN 4 THEN 'Япония'
                WHEN 5 THEN 'США'
            END,
            50.0,
            '245feede-6d17-402e-87b8-02cac9a54a75',
            CASE i
                WHEN 1 THEN 249.00
                WHEN 2 THEN 280.00
                WHEN 3 THEN 220.00
                WHEN 4 THEN 450.00
                WHEN 5 THEN 380.00
            END,
            'Композитная арматура из стекловолокна',
            '7-10 дней',
            'Гарантия производителя',
            'Поставляется в упаковке 10 кг'
        );
        total_prices[i] := total_prices[i] + current_total;
        
        -- Позиция 10: Масло моторное 10W40
        current_total := add_proposal_item(
            proposal_ids[i],
            '63765735-1d43-421c-a2b9-edcc62de2620',
            10,
            'Масло моторное 10W40',
            CASE i
                WHEN 1 THEN 'Huter'
                WHEN 2 THEN 'Castrol'
                WHEN 3 THEN 'Mobil'
                WHEN 4 THEN 'Shell'
                WHEN 5 THEN 'Total'
            END,
            CASE i
                WHEN 1 THEN '73/8/1/1'
                WHEN 2 THEN 'Magnatec 10W-40'
                WHEN 3 THEN 'Super 2000 10W-40'
                WHEN 4 THEN 'Helix HX7 10W-40'
                WHEN 5 THEN 'Quartz 7000 10W-40'
            END,
            CASE i
                WHEN 1 THEN 'Huter'
                WHEN 2 THEN 'Castrol'
                WHEN 3 THEN 'Mobil'
                WHEN 4 THEN 'Shell'
                WHEN 5 THEN 'Total'
            END,
            CASE i
                WHEN 1 THEN 'Россия'
                WHEN 2 THEN 'Великобритания'
                WHEN 3 THEN 'США'
                WHEN 4 THEN 'Нидерланды'
                WHEN 5 THEN 'Франция'
            END,
            3.0,
            '68465ee5-b8e1-4130-b406-09f3822033cb',
            CASE i
                WHEN 1 THEN 528.00
                WHEN 2 THEN 650.00
                WHEN 3 THEN 580.00
                WHEN 4 THEN 720.00
                WHEN 5 THEN 600.00
            END,
            'Полусинтетическое моторное масло',
            '3-5 дней',
            'Гарантия производителя',
            'Поставляется в канистрах 1 л'
        );
        total_prices[i] := total_prices[i] + current_total;
        
        -- Позиция 11: Смазка Вездешка
        current_total := add_proposal_item(
            proposal_ids[i],
            '9cf15c8d-b3e2-418d-9c27-cb7522a8915d',
            11,
            'Смазка Вездешка',
            CASE i
                WHEN 1 THEN 'Spray'
                WHEN 2 THEN 'WD-40'
                WHEN 3 THEN 'CRC'
                WHEN 4 THEN 'Liqui Moly'
                WHEN 5 THEN '3M'
            END,
            CASE i
                WHEN 1 THEN '300 мл'
                WHEN 2 THEN 'WD-40 Multi-Use'
                WHEN 3 THEN 'CRC 5-56'
                WHEN 4 THEN 'Liqui Moly LM40'
                WHEN 5 THEN '3M Silicone Spray'
            END,
            CASE i
                WHEN 1 THEN 'Spray'
                WHEN 2 THEN 'WD-40'
                WHEN 3 THEN 'CRC'
                WHEN 4 THEN 'Liqui Moly'
                WHEN 5 THEN '3M'
            END,
            CASE i
                WHEN 1 THEN 'Россия'
                WHEN 2 THEN 'США'
                WHEN 3 THEN 'США'
                WHEN 4 THEN 'Германия'
                WHEN 5 THEN 'США'
            END,
            3.0,
            'b057ebf7-8075-42dd-b72e-c329c86fe9c6',
            CASE i
                WHEN 1 THEN 318.00
                WHEN 2 THEN 450.00
                WHEN 3 THEN 380.00
                WHEN 4 THEN 520.00
                WHEN 5 THEN 480.00
            END,
            'Универсальная смазка-растворитель',
            '3-5 дней',
            'Гарантия производителя',
            'Поставляется в баллончиках 300 мл'
        );
        total_prices[i] := total_prices[i] + current_total;
        
        -- Позиция 12: Грунтовка - эмаль по ржавчине Proflux
        current_total := add_proposal_item(
            proposal_ids[i],
            '94dee6c2-be2e-4aa9-bf71-74d2873fcc47',
            12,
            'Грунтовка - эмаль по ржавчине Proflux',
            CASE i
                WHEN 1 THEN 'Profilux'
                WHEN 2 THEN 'Hammerite'
                WHEN 3 THEN 'Rust-Oleum'
                WHEN 4 THEN 'Tikkurila'
                WHEN 5 THEN 'Beckers'
            END,
            CASE i
                WHEN 1 THEN '3в1 серая'
                WHEN 2 THEN 'Hammerite Direct'
                WHEN 3 THEN 'Rust-Oleum 2X'
                WHEN 4 THEN 'Tikkurila Temadur'
                WHEN 5 THEN 'Beckers Rust Stop'
            END,
            CASE i
                WHEN 1 THEN 'Profilux'
                WHEN 2 THEN 'Hammerite'
                WHEN 3 THEN 'Rust-Oleum'
                WHEN 4 THEN 'Tikkurila'
                WHEN 5 THEN 'Beckers'
            END,
            CASE i
                WHEN 1 THEN 'Россия'
                WHEN 2 THEN 'Великобритания'
                WHEN 3 THEN 'США'
                WHEN 4 THEN 'Финляндия'
                WHEN 5 THEN 'Швеция'
            END,
            5.0,
            '245feede-6d17-402e-87b8-02cac9a54a75',
            CASE i
                WHEN 1 THEN 638.40
                WHEN 2 THEN 850.00
                WHEN 3 THEN 780.00
                WHEN 4 THEN 920.00
                WHEN 5 THEN 750.00
            END,
            'Грунт-эмаль 3 в 1 по ржавчине',
            '5-7 дней',
            'Гарантия производителя',
            'Поставляется в ведрах 5 кг'
        );
        total_prices[i] := total_prices[i] + current_total;
        
        -- Позиция 13: Краги сварщика
        current_total := add_proposal_item(
            proposal_ids[i],
            'd46a8970-17c6-41e6-ab28-5e21d0d45f77',
            13,
            'Краги сварщика',
            CASE i
                WHEN 1 THEN 'Ресанта'
                WHEN 2 THEN 'Lincoln Electric'
                WHEN 3 THEN 'Miller'
                WHEN 4 THEN 'ESAB'
                WHEN 5 THEN 'Fronius'
            END,
            CASE i
                WHEN 1 THEN 'СК-1'
                WHEN 2 THEN 'Lincoln Gloves'
                WHEN 3 THEN 'Miller Gloves'
                WHEN 4 THEN 'ESAB Gloves'
                WHEN 5 THEN 'Fronius Gloves'
            END,
            CASE i
                WHEN 1 THEN 'Ресанта'
                WHEN 2 THEN 'Lincoln Electric'
                WHEN 3 THEN 'Miller'
                WHEN 4 THEN 'ESAB'
                WHEN 5 THEN 'Fronius'
            END,
            CASE i
                WHEN 1 THEN 'Россия'
                WHEN 2 THEN 'США'
                WHEN 3 THEN 'США'
                WHEN 4 THEN 'Швеция'
                WHEN 5 THEN 'Австрия'
            END,
            3.0,
            'fee1a4f0-da55-4461-8d97-a23e48450547',
            CASE i
                WHEN 1 THEN 552.00
                WHEN 2 THEN 750.00
                WHEN 3 THEN 680.00
                WHEN 4 THEN 820.00
                WHEN 5 THEN 720.00
            END,
            'Сварочные краги для защиты рук',
            '3-5 дней',
            'Гарантия производителя',
            'Поставляется в упаковке по 1 паре'
        );
        total_prices[i] := total_prices[i] + current_total;
        
        -- Позиция 14: Респиратор
        current_total := add_proposal_item(
            proposal_ids[i],
            'b75f39ef-740d-4fb0-9dd2-57e11e1bdc69',
            14,
            'Респиратор',
            CASE i
                WHEN 1 THEN 'ИСТОК'
                WHEN 2 THEN '3M'
                WHEN 3 THEN 'Honeywell'
                WHEN 4 THEN 'Moldex'
                WHEN 5 THEN 'Delta Plus'
            END,
            CASE i
                WHEN 1 THEN '400 РУ-60'
                WHEN 2 THEN '3M 7500'
                WHEN 3 THEN 'Honeywell 5500'
                WHEN 4 THEN 'Moldex 7000'
                WHEN 5 THEN 'Delta Plus 2000'
            END,
            CASE i
                WHEN 1 THEN 'ИСТОК'
                WHEN 2 THEN '3M'
                WHEN 3 THEN 'Honeywell'
                WHEN 4 THEN 'Moldex'
                WHEN 5 THEN 'Delta Plus'
            END,
            CASE i
                WHEN 1 THEN 'Россия'
                WHEN 2 THEN 'США'
                WHEN 3 THEN 'США'
                WHEN 4 THEN 'Германия'
                WHEN 5 THEN 'Франция'
            END,
            3.0,
            '3858d72c-f817-4d64-b6d5-101ee80def6b',
            CASE i
                WHEN 1 THEN 589.23
                WHEN 2 THEN 850.00
                WHEN 3 THEN 780.00
                WHEN 4 THEN 920.00
                WHEN 5 THEN 750.00
            END,
            'Респиратор с фильтрами А1В1Р1',
            '3-5 дней',
            'Гарантия производителя',
            'Поставляется в упаковке по 1 шт.'
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
WHERE sp.tender_id = '1ba2d32a-fe5a-4ce5-95bd-369f097a73e7'
ORDER BY sp.total_price;

-- Статистика по предложениям
SELECT 
    COUNT(*) as total_proposals,
    MIN(total_price) as min_price,
    MAX(total_price) as max_price,
    AVG(total_price) as avg_price,
    STDDEV(total_price) as price_stddev
FROM supplier_proposals 
WHERE tender_id = '1ba2d32a-fe5a-4ce5-95bd-369f097a73e7';
