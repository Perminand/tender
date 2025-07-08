#!/bin/bash

echo "========================================"
echo "Запуск почтового сервера для системы тендеров"
echo "========================================"

echo
echo "Останавливаем существующие контейнеры..."
docker-compose down

echo
echo "Запускаем все сервисы..."
docker-compose up -d

echo
echo "Ожидаем запуска сервисов..."
sleep 10

echo
echo "========================================"
echo "Сервисы запущены:"
echo
echo "Backend API:     http://localhost:8080"
echo "MailHog UI:     http://localhost:8025"
echo "Frontend:        http://localhost:5173 (запустите отдельно)"
echo
echo "========================================"
echo
echo "Для просмотра логов выполните: docker-compose logs -f"
echo "Для остановки выполните: docker-compose down" 