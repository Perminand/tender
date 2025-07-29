-- Исправление значений статуса заявок
-- Заменяем старые значения на новые из enum RequestStatus

-- Сначала обрабатываем все известные старые значения
UPDATE requests SET status = 'DRAFT' WHERE status = 'TENDER';
UPDATE requests SET status = 'DRAFT' WHERE status = 'SAVED';
UPDATE requests SET status = 'DRAFT' WHERE status = 'DRAFT';
UPDATE requests SET status = 'SUBMITTED' WHERE status = 'SUBMITTED';
UPDATE requests SET status = 'APPROVED' WHERE status = 'APPROVED';
UPDATE requests SET status = 'IN_PROGRESS' WHERE status = 'IN_PROGRESS';
UPDATE requests SET status = 'COMPLETED' WHERE status = 'COMPLETED';
UPDATE requests SET status = 'CANCELLED' WHERE status = 'CANCELLED';

-- Устанавливаем значение по умолчанию для всех остальных записей
UPDATE requests SET status = 'DRAFT' WHERE status IS NULL OR status = '' OR status NOT IN ('DRAFT', 'SUBMITTED', 'APPROVED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'); 