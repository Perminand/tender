#!/bin/bash

# Скрипт настройки VDS сервера для деплоя tender

echo "Настройка VDS сервера для tender..."

# Обновляем систему
sudo apt update && sudo apt upgrade -y

# Устанавливаем Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Устанавливаем Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Создаем директорию для приложения
sudo mkdir -p /opt/tender
sudo chown $USER:$USER /opt/tender

# Настраиваем firewall
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 8080
sudo ufw --force enable

# Устанавливаем nginx для проксирования
sudo apt install nginx -y

# Настраиваем nginx
sudo tee /etc/nginx/sites-available/tender << EOF
server {
    listen 80;
    server_name your-domain.com;  # Замените на ваш домен
    
    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

sudo ln -s /etc/nginx/sites-available/tender /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl restart nginx

echo "Настройка завершена!"
echo "Не забудьте:"
echo "1. Настроить домен в nginx конфигурации"
echo "2. Добавить SSL сертификат (Let's Encrypt)"
echo "3. Настроить GitHub Secrets" 