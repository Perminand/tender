#!/bin/bash

# Скрипт для подготовки GitHub Secrets

echo "Подготовка GitHub Secrets для деплоя tender..."

# Проверяем наличие docker-compose.yml
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ Файл docker-compose.yml не найден"
    exit 1
fi

# Получаем содержимое docker-compose.yml
DOCKER_COMPOSE_CONTENT=$(cat docker-compose.yml)

echo "📋 GitHub Secrets для добавления:"
echo ""
echo "1. VDS_HOST"
echo "   Описание: IP адрес вашего VDS сервера"
echo "   Пример: 192.168.1.100"
echo ""
echo "2. VDS_USERNAME"
echo "   Описание: Имя пользователя на сервере"
echo "   Значение: root"
echo ""
echo "3. VDS_SSH_KEY"
echo "   Описание: Приватный SSH ключ"
echo "   Содержимое:"
echo "---"
if [ -f ~/.ssh/tender_deploy_key ]; then
    cat ~/.ssh/tender_deploy_key
else
    echo "Сначала запустите: ./scripts/generate-ssh-key.sh"
fi
echo "---"
echo ""
echo "4. VDS_PORT"
echo "   Описание: Порт SSH"
echo "   Значение: 22"
echo ""
echo "5. DOCKER_COMPOSE"
echo "   Описание: Содержимое docker-compose.yml"
echo "   Содержимое:"
echo "---"
echo "$DOCKER_COMPOSE_CONTENT"
echo "---"
echo ""
echo "🔧 Инструкция по добавлению:"
echo "1. Перейдите в GitHub репозиторий"
echo "2. Settings → Secrets and variables → Actions"
echo "3. Нажмите 'New repository secret'"
echo "4. Добавьте каждый секрет по очереди"
echo ""
echo "⚠️  Важно:"
echo "- Не добавляйте кавычки вокруг значений"
echo "- Для DOCKER_COMPOSE скопируйте содержимое точно как есть"
echo "- Убедитесь, что SSH ключ добавлен на сервер" 