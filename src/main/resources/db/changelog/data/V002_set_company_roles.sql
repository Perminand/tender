-- Установка ролей для компаний в начальных данных
-- Компания 1 - Заказчик
UPDATE companies SET role = 'CUSTOMER' WHERE inn = '7700000001';

-- Компания 2 - Поставщик  
UPDATE companies SET role = 'SUPPLIER' WHERE inn = '7700000002';

-- Компания 3 - Заказчик
UPDATE companies SET role = 'CUSTOMER' WHERE inn = '7700000003';

-- Компания 4 - Поставщик
UPDATE companies SET role = 'SUPPLIER' WHERE inn = '7700000004';

-- Компания 5 - Заказчик
UPDATE companies SET role = 'CUSTOMER' WHERE inn = '7700000005';

-- Компания 6 - Заказчик
UPDATE companies SET role = 'CUSTOMER' WHERE inn = '7700000006';

-- Компания 7 - Поставщик
UPDATE companies SET role = 'SUPPLIER' WHERE inn = '7700000007';

-- Компания 8 - Заказчик
UPDATE companies SET role = 'CUSTOMER' WHERE inn = '7700000008';

-- Компания 9 - Заказчик
UPDATE companies SET role = 'CUSTOMER' WHERE inn = '7700000009';

-- Компания 10 - Заказчик
UPDATE companies SET role = 'CUSTOMER' WHERE inn = '7700000010';

-- Компания ООО "СП "ГОРОД" - Заказчик (уже установлено в V005_insert_test_company_grod.sql)
-- UPDATE companies SET role = 'CUSTOMER' WHERE inn = '7805298833'; 