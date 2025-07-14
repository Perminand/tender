#!/bin/bash

# Скрипт резервного копирования базы данных

BACKUP_DIR="/opt/tender/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="tender_backup_$DATE.sql"

mkdir -p $BACKUP_DIR

# Создаем резервную копию
docker exec tender-db-1 pg_dump -U tender_user tender > $BACKUP_DIR/$BACKUP_FILE

# Сжимаем файл
gzip $BACKUP_DIR/$BACKUP_FILE

# Удаляем старые резервные копии (оставляем последние 7)
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete

echo "Резервная копия создана: $BACKUP_DIR/$BACKUP_FILE.gz" 