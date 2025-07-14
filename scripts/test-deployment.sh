#!/bin/bash

# Скрипт для локального тестирования деплоя

echo "Тестирование деплоя tender..."

# Проверяем наличие необходимых файлов
echo "Проверка файлов..."
files=("Dockerfile" "docker-compose.yml" ".github/workflows/deploy.yml" "scripts/setup-vds.sh" "scripts/backup.sh")
for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ $file - отсутствует"
        exit 1
    fi
done

# Проверяем Dockerfile
echo "Проверка Dockerfile..."
if grep -q "FROM node:18" Dockerfile && grep -q "FROM maven" Dockerfile; then
    echo "✅ Dockerfile содержит все необходимые этапы"
else
    echo "❌ Dockerfile не содержит все этапы сборки"
    exit 1
fi

# Проверяем docker-compose.yml
echo "Проверка docker-compose.yml..."
if grep -q "version:" docker-compose.yml && grep -q "app:" docker-compose.yml && grep -q "db:" docker-compose.yml; then
    echo "✅ docker-compose.yml корректный"
else
    echo "❌ docker-compose.yml некорректный"
    exit 1
fi

# Проверяем GitHub Actions
echo "Проверка GitHub Actions..."
if [ -f ".github/workflows/deploy.yml" ]; then
    echo "✅ GitHub Actions workflow найден"
else
    echo "❌ GitHub Actions workflow отсутствует"
    exit 1
fi

# Тестируем сборку Docker образа
echo "Тестирование сборки Docker образа..."
if docker build -t tender-test . > /dev/null 2>&1; then
    echo "✅ Docker образ собирается успешно"
    docker rmi tender-test > /dev/null 2>&1
else
    echo "❌ Ошибка сборки Docker образа"
    exit 1
fi

# Проверяем структуру проекта
echo "Проверка структуры проекта..."
if [ -d "frontend" ] && [ -d "src" ]; then
    echo "✅ Структура проекта корректная"
else
    echo "❌ Неправильная структура проекта"
    exit 1
fi

echo "🎉 Все проверки пройдены! Проект готов к деплою."
echo ""
echo "Следующие шаги:"
echo "1. Настройте VDS сервер"
echo "2. Добавьте GitHub Secrets"
echo "3. Запушьте код в main ветку"
echo "4. Проверьте деплой в GitHub Actions" 