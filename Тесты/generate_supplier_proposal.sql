-- SQL скрипт для генерации предложения от поставщика
-- Тендер: 41f5d3f5-cdc3-4e98-a6d8-736a846641db
-- Тендер по заявке 22 - строительные материалы и инструменты

-- Выбираем поставщика (первый доступный поставщик)
DO $$
DECLARE
    supplier_id UUID;
    proposal_id UUID;
    proposal_total_price DECIMAL(15,2) := 0;
BEGIN
    -- Получаем ID первого поставщика
    SELECT id INTO supplier_id 
    FROM companies 
    WHERE role = 'SUPPLIER' 
    LIMIT 1;
    
    IF supplier_id IS NULL THEN
        RAISE EXCEPTION 'Нет доступных поставщиков в системе';
    END IF;
    
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
        supplier_id,
        'PROP-' || EXTRACT(YEAR FROM CURRENT_DATE) || '-' || LPAD(EXTRACT(DOY FROM CURRENT_DATE)::TEXT, 3, '0') || '-' || LPAD((SELECT COUNT(*) + 1 FROM supplier_proposals)::TEXT, 4, '0'),
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP + INTERVAL '30 days',
        'SUBMITTED',
        'Уважаемые коллеги! Представляем наше коммерческое предложение на поставку строительных материалов и инструментов согласно техническому заданию тендера. Мы гарантируем качество продукции и соблюдение всех сроков поставки.',
        'Все предлагаемые материалы соответствуют техническим требованиям и имеют необходимые сертификаты качества. Инструменты поставляются от проверенных производителей с гарантией.',
        'Оплата: 100% предоплата. Срок действия предложения: 30 дней с даты подачи.',
        0, -- Будет рассчитано после добавления позиций
        'RUB',
        'Оплата производится в течение 5 банковских дней с момента подписания договора. Возможна отсрочка платежа до 30 дней при наличии положительной кредитной истории.',
        'Доставка осуществляется собственным транспортом или транспортными компаниями в течение 3-5 рабочих дней с момента подтверждения заказа. Доставка до склада заказчика.',
        'Гарантия на инструменты: 12 месяцев. Гарантия на материалы: согласно техническим условиям производителя. Возврат товара в течение 14 дней при обнаружении брака.'
    ) RETURNING id INTO proposal_id;
    
    -- Добавляем позиции предложения с конкурентными ценами
    -- Позиция 1: Дюбель-гвоздь 4,5*60
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
        proposal_id,
        '3c5fd092-ebe6-4aa8-b948-304436410dc6',
        1,
        'Дюбель-гвоздь 4,5*60',
        'Fischer',
        'FDU 6x60',
        'Fischer',
        'Германия',
        1000.0,
        'bbb71069-4cde-4850-93ab-ad51362a3311',
        6.50,
        6500.00,
        'Оцинкованный, для бетона и кирпича',
        '3-5 дней',
        'Гарантия производителя',
        'Поставляется в упаковке по 100 шт.'
         );
     proposal_total_price := proposal_total_price + 6500.00;
    
    -- Позиция 2: Патрон для дюбеля 6,8*18 мм
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
        proposal_id,
        '76d540d5-a0cb-4bee-95d8-e29829c5d9b5',
        2,
        'Патрон для дюбеля 6,8*18 мм',
        'Hilti',
        'HUD 6.8x18',
        'Hilti',
        'Лихтенштейн',
        1000.0,
        'bbb71069-4cde-4850-93ab-ad51362a3311',
        6.20,
        6200.00,
        'Пластиковый, для легких конструкций',
        '3-5 дней',
        'Гарантия производителя',
        'Поставляется в упаковке по 200 шт.'
         );
     proposal_total_price := proposal_total_price + 6200.00;
    
    -- Позиция 3: Бита для шуруповерта
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
        proposal_id,
        '715bedbf-eac1-4f0a-8588-555731093404',
        3,
        'Бита для шуруповерта',
        'Bosch',
        'PH2x50',
        'Bosch',
        'Германия',
        20.0,
        'bbb71069-4cde-4850-93ab-ad51362a3311',
        45.00,
        900.00,
        'Хром-ванадиевая сталь, магнитная',
        '3-5 дней',
        '12 месяцев',
        'Поставляется в наборе по 10 шт.'
         );
     proposal_total_price := proposal_total_price + 900.00;
    
    -- Позиция 4: Перчатки с двойным латексным обливом
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
        proposal_id,
        '098bf44b-1fa0-4b96-a64d-ffca72e891a0',
        4,
        'Перчатки с двойным латексным обливом',
        'Ansell',
        'Hyflex 11-800',
        'Ansell',
        'Малайзия',
        200.0,
        'bbb71069-4cde-4850-93ab-ad51362a3311',
        38.00,
        7600.00,
        'Размер L, защита от порезов',
        '3-5 дней',
        'Гарантия производителя',
        'Поставляется в упаковке по 12 пар'
         );
     proposal_total_price := proposal_total_price + 7600.00;
    
    -- Позиция 5: Комплект для инжекции SORMAT ITH 410 мл
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
        proposal_id,
        '41340d98-21e7-4286-88e6-72fa61a09e95',
        5,
        'Комплект для инжекции SORMAT ITH 410 мл',
        'Sormat',
        'ITH 410',
        'Sormat',
        'Финляндия',
        24.0,
        'bbb71069-4cde-4850-93ab-ad51362a3311',
        3200.00,
        76800.00,
        'Эпоксидная смола, отвердитель в комплекте',
        '7-10 дней',
        '24 месяца',
        'Поставляется в картонной упаковке'
         );
     proposal_total_price := proposal_total_price + 76800.00;
    
    -- Позиция 6: Шнур для строительных работ
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
        proposal_id,
        '9bfeaebd-bb06-408b-8fce-8527df0b399f',
        6,
        'Шнур для строительных работ',
        'Kern',
        'Kern Line',
        'Kern',
        'Германия',
        10.0,
        'bbb71069-4cde-4850-93ab-ad51362a3311',
        200.00,
        2000.00,
        'Нейлоновый, длина 50м',
        '3-5 дней',
        'Гарантия производителя',
        'Поставляется в пластиковой катушке'
         );
     proposal_total_price := proposal_total_price + 2000.00;
    
    -- Позиция 7: Добавка гидроизоляционная в бетон Пенетрон Адмикс
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
        proposal_id,
        'df23f559-ed17-481c-977a-d56ca20e5960',
        7,
        'Добавка гидроизоляционная в бетон Пенетрон Адмикс',
        'Пенетрон',
        'Адмикс',
        'Пенетрон',
        'Россия',
        11.0,
        'bbb71069-4cde-4850-93ab-ad51362a3311',
        22.00,
        242.00,
        'Сухая смесь, 25 кг',
        '3-5 дней',
        'Гарантия производителя',
        'Поставляется в мешках по 25 кг'
         );
     proposal_total_price := proposal_total_price + 242.00;
    
    -- Позиция 8: Бентонитовый шнур
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
        proposal_id,
        'f344d460-c2ed-4c55-a3e7-67eb4ba062c5',
        8,
        'Бентонитовый шнур',
        'GSE',
        'GSE Bentonite',
        'GSE',
        'США',
        50.0,
        '1f615d56-53ee-4756-b7fe-4d33184f126b',
        250.00,
        12500.00,
        'Ширина 30мм, толщина 6мм',
        '7-10 дней',
        'Гарантия производителя',
        'Поставляется в рулонах по 30м'
         );
     proposal_total_price := proposal_total_price + 12500.00;
    
    -- Позиция 9: Стеклофибра Арматура композит
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
        proposal_id,
        '6ed62ece-46f6-4916-ae6c-f230c1d5eb40',
        9,
        'Стеклофибра Арматура композит',
        'FibArm',
        'Fiberglass',
        'FibArm',
        'Россия',
        50.0,
        '496341db-5044-4108-8095-d8a8f26c374e',
        220.00,
        11000.00,
        'Длина 6м, диаметр 8мм',
        '3-5 дней',
        'Гарантия производителя',
        'Поставляется в связках по 10 шт.'
         );
     proposal_total_price := proposal_total_price + 11000.00;
    
    -- Позиция 10: Масло моторное 10W40
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
        proposal_id,
        '5e095510-6303-4514-b16e-3b682009f6a0',
        10,
        'Масло моторное 10W40',
        'Shell',
        'Helix HX7',
        'Shell',
        'Нидерланды',
        3.0,
        'ee469b9d-97a9-489a-842d-1fab9fde7f1c',
        480.00,
        1440.00,
        'Синтетическое, 4л',
        '3-5 дней',
        'Гарантия производителя',
        'Поставляется в канистрах по 4л'
    );
    proposal_total_price := proposal_total_price + 1440.00;
    
    -- Позиция 11: Смазка Вездешка
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
        proposal_id,
        'aa409732-3f4f-4f78-ad9a-7b9952eda0c8',
        11,
        'Смазка Вездешка',
        'Лукойл',
        'Литол-24',
        'Лукойл',
        'Россия',
        3.0,
        'bbb71069-4cde-4850-93ab-ad51362a3311',
        280.00,
        840.00,
        'Пластичная смазка, 400г',
        '3-5 дней',
        'Гарантия производителя',
        'Поставляется в тубах по 400г'
    );
    proposal_total_price := proposal_total_price + 840.00;
    
    -- Позиция 12: Грунтовка - эмаль по ржавчине Proflux
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
        proposal_id,
        'e2d3fa96-eb2b-4ee4-8048-d0c0e1b74032',
        12,
        'Грунтовка - эмаль по ржавчине Proflux',
        'Proflux',
        '3 в 1',
        'Proflux',
        'Россия',
        5.0,
        '496341db-5044-4108-8095-d8a8f26c374e',
        580.00,
        2900.00,
        'Антикоррозийная, 2.5кг',
        '3-5 дней',
        'Гарантия производителя',
        'Поставляется в банках по 2.5кг'
    );
    proposal_total_price := proposal_total_price + 2900.00;
    
    -- Позиция 13: Краги сварщика
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
        proposal_id,
        '2e1bd813-a264-403d-bd49-85d49c3950a4',
        13,
        'Краги сварщика',
        'Lincoln Electric',
        'Welding Gloves',
        'Lincoln Electric',
        'США',
        3.0,
        'bbb71069-4cde-4850-93ab-ad51362a3311',
        480.00,
        1440.00,
        'Размер L, кожаные',
        '3-5 дней',
        '6 месяцев',
        'Поставляется в парах'
    );
    proposal_total_price := proposal_total_price + 1440.00;
    
    -- Позиция 14: Респиратор
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
        proposal_id,
        '271f7123-ee4c-47ec-8c83-169996e9aac1',
        14,
        'Респиратор',
        '3M',
        '7502',
        '3M',
        'США',
        3.0,
        'bbb71069-4cde-4850-93ab-ad51362a3311',
        520.00,
        1560.00,
        'Класс защиты FFP2',
        '3-5 дней',
        'Гарантия производителя',
        'Поставляется в упаковке по 1 шт.'
    );
    proposal_total_price := proposal_total_price + 1560.00;
    
    -- Обновляем общую стоимость предложения
    UPDATE supplier_proposals 
    SET total_price = proposal_total_price 
    WHERE id = proposal_id;
    
    RAISE NOTICE 'Предложение поставщика создано успешно. ID: %, Общая стоимость: % руб.', proposal_id, proposal_total_price;
    
END $$;

-- Вывод информации о созданном предложении
SELECT 
    sp.id as proposal_id,
    sp.proposal_number,
    c.name as supplier_name,
    sp.submission_date,
    sp.status,
    sp.total_price,
    sp.currency,
    sp.payment_terms,
    sp.delivery_terms,
    sp.warranty_terms
FROM supplier_proposals sp
JOIN companies c ON c.id = sp.supplier_id
WHERE sp.tender_id = '41f5d3f5-cdc3-4e98-a6d8-736a846641db'
ORDER BY sp.submission_date DESC;

-- Вывод позиций предложения
SELECT 
    pi.item_number,
    pi.description,
    pi.brand,
    pi.manufacturer,
    pi.quantity,
    u.name as unit_name,
    pi.unit_price,
    pi.total_price,
    pi.delivery_period,
    pi.warranty
FROM proposal_items pi
JOIN supplier_proposals sp ON sp.id = pi.supplier_proposal_id
JOIN units u ON u.id = pi.unit_id
WHERE sp.tender_id = '41f5d3f5-cdc3-4e98-a6d8-736a846641db'
ORDER BY pi.item_number;
