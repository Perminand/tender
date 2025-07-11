# Устранение проблем с Gmail SMTP

## Ошибка: "Application-specific password required"

Эта ошибка означает, что Gmail требует использования пароля приложения вместо обычного пароля.

### Решение:

1. **Включите двухфакторную аутентификацию**:
   - Перейдите в [настройки безопасности Google](https://myaccount.google.com/security)
   - Включите двухфакторную аутентификацию

2. **Создайте пароль приложения**:
   - В настройках безопасности найдите раздел "Пароли приложений"
   - Выберите "Почта" как приложение
   - Нажмите "Создать"
   - Скопируйте 16-значный пароль

3. **Используйте пароль приложения**:
   - В настройках email введите обычный email
   - В поле "Пароль" вставьте пароль приложения (16 символов)
   - НЕ используйте обычный пароль от Gmail

### Настройки SMTP для Gmail:
- **SMTP хост**: smtp.gmail.com
- **SMTP порт**: 587
- **Безопасность**: TLS (включено)
- **SSL**: выключено
- **Аутентификация**: включена
- **Пароль**: пароль приложения (16 символов)

## Частые проблемы

### Проблема: "Не вижу раздел 'Пароли приложений'"
**Решение:**
- Убедитесь, что двухфакторная аутентификация включена
- Подождите несколько минут после включения 2FA
- Попробуйте обновить страницу

### Проблема: "Неверные учетные данные"
**Решение:**
- Используйте пароль приложения, а не обычный пароль
- Убедитесь, что email введен правильно
- Проверьте, что двухфакторная аутентификация включена

### Проблема: "Соединение не установлено"
**Решение:**
- Проверьте правильность SMTP хоста: smtp.gmail.com
- Проверьте порт: 587
- Убедитесь, что TLS включено
- Проверьте настройки брандмауэра

## Альтернативные настройки Gmail

### Вариант 1: Порт 465 с SSL
- **SMTP хост**: smtp.gmail.com
- **SMTP порт**: 465
- **SSL**: включено
- **TLS**: выключено

### Вариант 2: Порт 587 с TLS (рекомендуется)
- **SMTP хост**: smtp.gmail.com
- **SMTP порт**: 587
- **SSL**: выключено
- **TLS**: включено

## Безопасность

⚠️ **Важно:**
- Никогда не используйте обычный пароль от Gmail для SMTP
- Пароль приложения можно отозвать в любое время
- Используйте разные пароли приложения для разных приложений
- Регулярно обновляйте пароли приложения

## Ссылки

- [Настройки безопасности Google](https://myaccount.google.com/security)
- [Справка Google по паролям приложений](https://support.google.com/accounts/answer/185833)
- [Настройка SMTP для Gmail](https://support.google.com/mail/answer/7126229) 