#!/bin/bash

# Главный скрипт настройки деплоя tender

echo "🚀 Настройка деплоя системы Tender"
echo "=================================="
echo ""

# Проверяем наличие необходимых файлов
echo "📋 Проверка файлов проекта..."
files=("Dockerfile" "docker-compose.yml" ".github/workflows/deploy.yml" "scripts/setup-vds.sh" "scripts/backup.sh")
missing_files=()

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ $file - отсутствует"
        missing_files+=("$file")
    fi
done

if [ ${#missing_files[@]} -gt 0 ]; then
    echo ""
    echo "❌ Отсутствуют необходимые файлы. Создайте их перед продолжением."
    exit 1
fi

echo ""
echo "✅ Все файлы на месте!"
echo ""

# Меню выбора действия
echo "Выберите действие:"
echo "1. Тестировать локальную сборку"
echo "2. Генерировать SSH ключи"
echo "3. Подготовить GitHub Secrets"
echo "4. Полная настройка (все шаги)"
echo "5. Выход"
echo ""

read -p "Введите номер (1-5): " choice

case $choice in
    1)
        echo ""
        echo "🧪 Тестирование локальной сборки..."
        chmod +x scripts/test-deployment.sh
        ./scripts/test-deployment.sh
        ;;
    2)
        echo ""
        echo "🔑 Генерация SSH ключей..."
        chmod +x scripts/generate-ssh-key.sh
        ./scripts/generate-ssh-key.sh
        ;;
    3)
        echo ""
        echo "🔐 Подготовка GitHub Secrets..."
        chmod +x scripts/prepare-github-secrets.sh
        ./scripts/prepare-github-secrets.sh
        ;;
    4)
        echo ""
        echo "🔄 Полная настройка..."
        
        # Тестирование
        echo "1/4 - Тестирование сборки..."
        chmod +x scripts/test-deployment.sh
        ./scripts/test-deployment.sh
        
        if [ $? -eq 0 ]; then
            echo ""
            echo "2/4 - Генерация SSH ключей..."
            chmod +x scripts/generate-ssh-key.sh
            ./scripts/generate-ssh-key.sh
            
            echo ""
            echo "3/4 - Подготовка GitHub Secrets..."
            chmod +x scripts/prepare-github-secrets.sh
            ./scripts/prepare-github-secrets.sh
            
            echo ""
            echo "4/4 - Финальные инструкции..."
            echo ""
            echo "🎉 Настройка завершена!"
            echo ""
            echo "📋 Следующие шаги:"
            echo "1. Добавьте GitHub Secrets в репозиторий"
            echo "2. Настройте VDS сервер:"
            echo "   ssh root@your-server-ip"
            echo "   wget https://raw.githubusercontent.com/your-username/tender/main/scripts/setup-vds.sh"
            echo "   chmod +x setup-vds.sh"
            echo "   ./setup-vds.sh"
            echo "3. Запушьте код в main ветку"
            echo "4. Проверьте деплой в GitHub Actions"
            echo ""
            echo "📖 Подробная документация: DEPLOYMENT.md"
        else
            echo "❌ Тестирование не прошло. Исправьте ошибки и повторите."
        fi
        ;;
    5)
        echo "Выход..."
        exit 0
        ;;
    *)
        echo "❌ Неверный выбор"
        exit 1
        ;;
esac 