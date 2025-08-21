-- Оставляем в справочнике типов доставки только три значения

-- Удаляем все прочие типы
DELETE FROM delivery_types 
WHERE name NOT IN (
  'Самовывоз',
  'Доставка на склад',
  'Доставка на объект'
);

-- Создаем недостающие записи, если их нет
INSERT INTO delivery_types (name)
SELECT 'Самовывоз'
WHERE NOT EXISTS (SELECT 1 FROM delivery_types WHERE name = 'Самовывоз');

INSERT INTO delivery_types (name)
SELECT 'Доставка на склад'
WHERE NOT EXISTS (SELECT 1 FROM delivery_types WHERE name = 'Доставка на склад');

INSERT INTO delivery_types (name)
SELECT 'Доставка на объект'
WHERE NOT EXISTS (SELECT 1 FROM delivery_types WHERE name = 'Доставка на объект');



