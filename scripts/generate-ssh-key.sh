#!/bin/bash

# Скрипт для генерации SSH ключей для деплоя

echo "Генерация SSH ключей для деплоя tender..."

# Проверяем наличие существующих ключей
if [ -f ~/.ssh/id_rsa ]; then
    echo "⚠️  SSH ключ уже существует: ~/.ssh/id_rsa"
    read -p "Хотите создать новый ключ? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Используем существующий ключ"
        exit 0
    fi
fi

# Генерируем новый SSH ключ
echo "Генерация нового SSH ключа..."
ssh-keygen -t rsa -b 4096 -C "tender-deployment@example.com" -f ~/.ssh/tender_deploy_key -N ""

if [ $? -eq 0 ]; then
    echo "✅ SSH ключ создан успешно"
    echo ""
    echo "📋 Информация для GitHub Secrets:"
    echo ""
    echo "VDS_SSH_KEY (приватный ключ):"
    echo "---"
    cat ~/.ssh/tender_deploy_key
    echo "---"
    echo ""
    echo "Публичный ключ (добавьте на сервер):"
    echo "---"
    cat ~/.ssh/tender_deploy_key.pub
    echo "---"
    echo ""
    echo "🔧 Следующие шаги:"
    echo "1. Скопируйте приватный ключ в GitHub Secret VDS_SSH_KEY"
    echo "2. Добавьте публичный ключ на VDS сервер:"
    echo "   ssh-copy-id -i ~/.ssh/tender_deploy_key.pub root@your-server-ip"
    echo "3. Или добавьте ключ вручную в ~/.ssh/authorized_keys на сервере"
else
    echo "❌ Ошибка генерации SSH ключа"
    exit 1
fi 