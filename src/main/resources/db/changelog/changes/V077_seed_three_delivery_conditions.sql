-- Оставляем только 3 условия доставки и выставляем признак расчета доставки

-- Удаляем все прочие условия
DELETE FROM delivery_conditions 
WHERE name NOT IN (
  'За счет поставщика',
  'За счет заказчика',
  'Сторонняя компания за счет заказчика'
);

-- Создаем недостающие условия, если их нет
INSERT INTO delivery_conditions (name, description, delivery_type, delivery_responsibility, delivery_period)
SELECT 'За счет поставщика', 'Доставка осуществляется за счет поставщика', 'DELIVERY_TO_SITE', 'SUPPLIER', 'По согласованию'
WHERE NOT EXISTS (SELECT 1 FROM delivery_conditions WHERE name = 'За счет поставщика');

INSERT INTO delivery_conditions (name, description, delivery_type, delivery_responsibility, delivery_period)
SELECT 'За счет заказчика', 'Доставка оплачивается заказчиком', 'DELIVERY_TO_SITE', 'CUSTOMER', 'По согласованию'
WHERE NOT EXISTS (SELECT 1 FROM delivery_conditions WHERE name = 'За счет заказчика');

INSERT INTO delivery_conditions (name, description, delivery_type, delivery_responsibility, delivery_period)
SELECT 'Сторонняя компания за счет заказчика', 'Доставка выполняется сторонней ТК, оплата за счет заказчика', 'DELIVERY_TO_SITE', 'CUSTOMER', 'По согласованию'
WHERE NOT EXISTS (SELECT 1 FROM delivery_conditions WHERE name = 'Сторонняя компания за счет заказчика');

-- Устанавливаем флаги расчета доставки
UPDATE delivery_conditions SET calculate_delivery = FALSE WHERE name = 'За счет поставщика';
UPDATE delivery_conditions SET calculate_delivery = TRUE  WHERE name IN (
  'За счет заказчика',
  'Сторонняя компания за счет заказчика'
);

