# Система уведомлений - Настройка и использование

## Обзор

Система уведомлений позволяет автоматически отправлять email-уведомления участникам тендерного процесса при различных событиях:

- Публикация нового тендера
- Напоминания о дедлайнах
- Получение новых предложений
- Присуждение тендера
- Отмена тендера
- Приглашения поставщиков

## Настройка Email

### 1. Настройка Gmail SMTP

Для использования Gmail в качестве SMTP-сервера:

1. Включите двухфакторную аутентификацию в Google аккаунте
2. Создайте пароль приложения:
   - Перейдите в настройки безопасности Google
   - Выберите "Пароли приложений"
   - Создайте новый пароль для "Почта"

### 2. Настройка переменных окружения

Создайте файл `.env` в корне проекта:

```env
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
```

Или установите переменные окружения в системе:

```bash
export MAIL_USERNAME=your-email@gmail.com
export MAIL_PASSWORD=your-app-password
```

### 3. Конфигурация в application.yml

Email настройки уже добавлены в `application.yml`:

```yaml
spring:
  mail:
    host: smtp.gmail.com
    port: 587
    username: ${MAIL_USERNAME:your-email@gmail.com}
    password: ${MAIL_PASSWORD:your-app-password}
    properties:
      mail:
        smtp:
          auth: true
          starttls:
            enable: true
    default-encoding: UTF-8

notification:
  email:
    enabled: true
    from: ${MAIL_USERNAME:your-email@gmail.com}
```

## Использование

### Автоматические уведомления

Система автоматически отправляет уведомления при следующих событиях:

1. **Публикация тендера** - уведомления всем поставщикам
2. **Подача предложения** - уведомление заказчику
3. **Присуждение тендера** - уведомление победителю
4. **Отмена тендера** - уведомления всем участникам

### Ручное управление уведомлениями

#### Через API

```bash
# Получить уведомления по тендеру
GET /api/notifications/tender/{tenderId}

# Получить уведомления по статусу
GET /api/notifications/status/{status}

# Повторить отправку неудачного уведомления
POST /api/notifications/{notificationId}/retry

# Отменить уведомление
POST /api/notifications/{notificationId}/cancel

# Отправить все ожидающие уведомления
POST /api/notifications/send-pending

# Пригласить поставщика к участию
POST /api/notifications/tender/{tenderId}/invite-supplier?supplierEmail=email&supplierName=name
```

#### Через веб-интерфейс

1. Перейдите в раздел "Уведомления"
2. Просматривайте список всех уведомлений
3. Фильтруйте по статусу
4. Просматривайте детали уведомлений
5. Повторяйте отправку неудачных уведомлений
6. Отменяйте ожидающие уведомления

### Программное использование

```java
@Autowired
private NotificationService notificationService;

// Уведомление о публикации тендера
notificationService.notifyTenderPublished(tender, supplierEmails);

// Уведомление о получении предложения
notificationService.notifyProposalSubmitted(proposal);

// Приглашение поставщика
notificationService.inviteSupplierToTender(tender, email, name);
```

## Мониторинг и отладка

### Просмотр логов

```bash
# Просмотр логов отправки email
tail -f logs/application.log | grep -i email

# Просмотр логов уведомлений
tail -f logs/application.log | grep -i notification
```

### Проверка статуса уведомлений

1. Откройте страницу уведомлений
2. Проверьте статусы:
   - `PENDING` - ожидает отправки
   - `SENT` - отправлено успешно
   - `FAILED` - ошибка отправки
   - `CANCELLED` - отменено

### Тестирование

```bash
# Тест отправки email
curl -X POST http://localhost:8080/api/notifications/send-pending

# Проверка статуса email сервиса
curl -X GET http://localhost:8080/api/settings/email-status
```

## Расширение функциональности

### Добавление новых типов уведомлений

1. Добавьте новый тип в `Notification.NotificationType`
2. Создайте метод в `NotificationService`
3. Добавьте шаблон сообщения
4. Интегрируйте в соответствующий сервис

### Настройка шаблонов сообщений

Шаблоны сообщений находятся в `NotificationServiceImpl`:

- `createTenderPublishedMessage()`
- `createDeadlineReminderMessage()`
- `createProposalSubmittedMessage()`
- `createTenderAwardedMessage()`
- `createTenderCancelledMessage()`
- `createSupplierInvitationMessage()`

### Добавление HTML шаблонов

Для HTML email используйте `EmailService.sendHtmlEmail()`:

```java
String htmlContent = """
    <html>
        <body>
            <h1>Новый тендер</h1>
            <p>Опубликован тендер: %s</p>
        </body>
    </html>
    """.formatted(tender.getTitle());

emailService.sendHtmlEmail(recipientEmail, subject, htmlContent);
```

## Безопасность

### Настройка SMTP безопасности

```yaml
spring:
  mail:
    properties:
      mail:
        smtp:
          ssl:
            trust: smtp.gmail.com
          auth: true
          starttls:
            enable: true
            required: true
```

### Ограничение доступа

Добавьте аутентификацию для API уведомлений:

```java
@PreAuthorize("hasRole('ADMIN')")
@PostMapping("/send-pending")
public ResponseEntity<Void> sendPendingNotifications() {
    // ...
}
```

## Troubleshooting

### Проблемы с отправкой

1. **Ошибка аутентификации**
   - Проверьте правильность email и пароля приложения
   - Убедитесь, что двухфакторная аутентификация включена

2. **Ошибка SSL/TLS**
   - Проверьте настройки SSL в application.yml
   - Убедитесь, что порт 587 открыт

3. **Уведомления не отправляются**
   - Проверьте статус `notification.email.enabled`
   - Проверьте логи на наличие ошибок
   - Убедитесь, что SMTP сервер доступен

### Отладка

```bash
# Включение debug режима для email
logging:
  level:
    org.springframework.mail: DEBUG
    ru.perminov.tender.service: DEBUG
```

## Производительность

### Настройка пула соединений

```yaml
spring:
  mail:
    properties:
      mail:
        smtp:
          connectiontimeout: 5000
          timeout: 5000
          writetimeout: 5000
```

### Асинхронная отправка

Для больших объемов уведомлений используйте асинхронную отправку:

```java
@Async
public void sendNotificationAsync(Notification notification) {
    emailService.sendNotification(notification);
} 