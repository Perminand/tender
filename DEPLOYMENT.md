# Деплой системы Tender на VDS

## Подготовка к деплою

### 1. Требования к VDS серверу
- Ubuntu 20.04+ или CentOS 8+
- Минимум 2GB RAM
- 20GB свободного места
- Открытые порты: 22, 80, 443, 8080

### 2. Подготовка репозитория

Убедитесь, что в репозитории есть все необходимые файлы:
- `Dockerfile` - для сборки образа
- `docker-compose.yml` - для запуска контейнеров
- `.github/workflows/deploy.yml` - для автоматического деплоя
- `scripts/setup-vds.sh` - для настройки сервера

## Настройка VDS сервера

### Шаг 1: Подключение к серверу
```bash
ssh root@your-server-ip
```

### Шаг 2: Запуск скрипта настройки
```bash
# Скачиваем скрипт
wget https://raw.githubusercontent.com/your-username/tender/main/scripts/setup-vds.sh
chmod +x setup-vds.sh
./setup-vds.sh
```

### Шаг 3: Настройка домена
1. Обновите nginx конфигурацию:
```bash
sudo nano /etc/nginx/sites-available/tender
```
Замените `your-domain.com` на ваш домен.

2. Добавьте SSL сертификат:
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## Настройка GitHub Actions

### Шаг 1: Добавление Secrets

В репозитории GitHub перейдите в **Settings → Secrets and variables → Actions** и добавьте:

| Secret | Описание | Пример |
|--------|----------|--------|
| `VDS_HOST` | IP адрес сервера | `192.168.1.100` |
| `VDS_USERNAME` | Имя пользователя | `root` |
| `VDS_SSH_KEY` | Приватный SSH ключ | `-----BEGIN OPENSSH PRIVATE KEY-----` |
| `VDS_PORT` | Порт SSH | `22` |
| `DOCKER_COMPOSE` | Содержимое docker-compose.yml | `version: '3.8'...` |

### Шаг 2: Генерация SSH ключа

Если у вас нет SSH ключа:
```bash
ssh-keygen -t rsa -b 4096 -C "your-email@example.com"
```

Добавьте публичный ключ на сервер:
```bash
ssh-copy-id root@your-server-ip
```

## Первый деплой

### Шаг 1: Пуш в main ветку
```bash
git add .
git commit -m "Add deployment configuration"
git push origin main
```

### Шаг 2: Проверка деплоя
1. Перейдите в **Actions** в GitHub репозитории
2. Проверьте статус workflow "Deploy to VDS"
3. При успехе приложение будет доступно по адресу: `http://your-domain.com`

## Мониторинг и управление

### Проверка статуса
```bash
cd /opt/tender
docker-compose ps
```

### Просмотр логов
```bash
docker-compose logs -f app
docker-compose logs -f db
```

### Перезапуск приложения
```bash
docker-compose restart
```

### Резервное копирование
```bash
chmod +x scripts/backup.sh
./scripts/backup.sh
```

## Устранение неполадок

### Проблема: Приложение не запускается
```bash
# Проверьте логи
docker-compose logs app

# Проверьте статус контейнеров
docker-compose ps

# Перезапустите с пересборкой
docker-compose up -d --build
```

### Проблема: База данных не подключается
```bash
# Проверьте статус PostgreSQL
docker-compose logs db

# Проверьте переменные окружения
docker-compose exec app env | grep SPRING_DATASOURCE
```

### Проблема: Nginx не проксирует запросы
```bash
# Проверьте конфигурацию nginx
sudo nginx -t

# Перезапустите nginx
sudo systemctl restart nginx

# Проверьте статус
sudo systemctl status nginx
```

## Структура файлов на сервере

```
/opt/tender/
├── docker-compose.yml
├── backups/
│   └── tender_backup_*.sql.gz
└── logs/
    ├── app.log
    └── db.log
```

## Переменные окружения

Основные переменные в `docker-compose.yml`:
- `SPRING_PROFILES_ACTIVE=prod` - профиль Spring Boot
- `SPRING_DATASOURCE_URL` - URL базы данных
- `SPRING_DATASOURCE_USERNAME` - пользователь БД
- `SPRING_DATASOURCE_PASSWORD` - пароль БД

## Безопасность

1. **Firewall**: Настроен через ufw
2. **SSL**: Автоматически через Let's Encrypt
3. **Резервные копии**: Ежедневно через cron
4. **Логи**: Ротация через logrotate

## Масштабирование

Для увеличения производительности:
1. Добавьте больше RAM на VDS
2. Настройте кэширование в nginx
3. Добавьте CDN для статических файлов
4. Настройте мониторинг через Prometheus/Grafana 