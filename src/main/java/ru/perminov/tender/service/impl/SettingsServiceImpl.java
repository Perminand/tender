package ru.perminov.tender.service.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.fasterxml.jackson.databind.ObjectMapper;
import ru.perminov.tender.dto.FnsApiKeyDto;
import ru.perminov.tender.dto.SettingsDto;
import ru.perminov.tender.dto.EmailSettingsDto;
import ru.perminov.tender.dto.fns.FnsApiStatResponse;
import ru.perminov.tender.dto.fns.MethodStat;
import ru.perminov.tender.model.Settings;
import ru.perminov.tender.repository.SettingsRepository;
import ru.perminov.tender.service.SettingsService;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class SettingsServiceImpl implements SettingsService {
    
    private static final Logger logger = LoggerFactory.getLogger(SettingsServiceImpl.class);
    private static final String FNS_API_KEY_SETTING = "fns_api_key";
    private static final String FNS_API_USAGE_SETTING = "fns_api_usage";
    
    @Autowired
    private SettingsRepository settingsRepository;
    
    @Override
    public SettingsDto getSettings() {
        String apiKey = getFnsApiKey();
        String usage = getFnsApiUsage();
        return new SettingsDto(apiKey, usage);
    }
    
    @Override
    public void saveFnsApiKey(FnsApiKeyDto dto) {
        Settings setting = settingsRepository.findByKey(FNS_API_KEY_SETTING)
                .orElse(new Settings(FNS_API_KEY_SETTING, "", "API ключ для ФНС"));
        
        String cleanApiKey = cleanApiKey(dto.apiKey());
        setting.setValue(cleanApiKey);
        settingsRepository.save(setting);
    }
    
    @Override
    public String getFnsApiKey() {
        return Optional.ofNullable(settingsRepository.findValueByKey(FNS_API_KEY_SETTING).orElse(null))
                .map(this::cleanApiKey)
                .orElse(null);
    }
    
    private String cleanApiKey(String apiKey) {
        if (apiKey == null) {
            return null;
        }
        String trimmedKey = apiKey.trim();
        if (trimmedKey.startsWith("\"") && trimmedKey.endsWith("\"")) {
            return trimmedKey.substring(1, trimmedKey.length() - 1);
        }
        return trimmedKey;
    }
    
    @Override
    public String getFnsApiUsage() {
        String apiKey = getFnsApiKey();
        if (apiKey == null || apiKey.trim().isEmpty()) {
            return "API ключ не настроен";
        }
        
        try {
            // Запрос к API ФНС для получения статистики использования
            HttpClient client = HttpClient.newHttpClient();
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://api-fns.ru/api/stat?key=" + apiKey))
                    .GET()
                    .build();
            
            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
            String responseBody = response.body();
            logger.info("FNS API usage response: {}", responseBody);
            
            if (response.statusCode() == 200) {
                // Парсим ответ и извлекаем информацию об остатке запросов
                return parseUsageFromResponse(responseBody);
            } else {
                return "Ошибка получения данных: HTTP " + response.statusCode();
            }
            
        } catch (IOException | InterruptedException e) {
            Thread.currentThread().interrupt();
            return "Ошибка при запросе к API ФНС: " + e.getMessage();
        }
    }
    
    private String parseUsageFromResponse(String responseBody) {
        try {
            ObjectMapper objectMapper = new ObjectMapper();
            FnsApiStatResponse statResponse = objectMapper.readValue(responseBody, FnsApiStatResponse.class);
            
            if (statResponse != null && statResponse.methods() != null) {
                MethodStat searchStat = statResponse.methods().get("search");
                if (searchStat != null) {
                    try {
                        int limit = Integer.parseInt(searchStat.limit());
                        int used = Integer.parseInt(searchStat.used());
                        int remaining = limit - used;
                        return String.format("Использовано:  %d. Осталось: %d (из %d)", used, remaining, limit);
                    } catch (NumberFormatException e) {
                         logger.error("Error parsing numbers from FNS API stat", e);
                         return "Ошибка парсинга числовых значений из ответа ФНС.";
                    }
                }
            }
            
            return "Информация о лимитах недоступна в ответе";
            
        } catch (Exception e) {
            logger.error("Error parsing FNS API response", e);
            return "Ошибка парсинга ответа от ФНС: " + e.getMessage();
        }
    }
    
    @Override
    public EmailSettingsDto getEmailSettings() {
        String smtpHost = getSettingValue("email_smtp_host", "smtp.gmail.com");
        String smtpPort = getSettingValue("email_smtp_port", "587");
        String username = getSettingValue("email_username", "");
        String password = getSettingValue("email_password", "");
        String fromEmail = getSettingValue("email_from", "");
        String fromName = getSettingValue("email_from_name", "");
        String enabled = getSettingValue("email_enabled", "false");
        String useSsl = getSettingValue("email_use_ssl", "false");
        String useTls = getSettingValue("email_use_tls", "true");
        
        return new EmailSettingsDto(
            smtpHost,
            smtpPort,
            username,
            password,
            fromEmail,
            fromName,
            Boolean.parseBoolean(enabled),
            Boolean.parseBoolean(useSsl),
            Boolean.parseBoolean(useTls)
        );
    }
    
    @Override
    public void saveEmailSettings(EmailSettingsDto emailSettings) {
        saveSetting("email_smtp_host", emailSettings.smtpHost(), "SMTP хост");
        saveSetting("email_smtp_port", emailSettings.smtpPort(), "SMTP порт");
        saveSetting("email_username", emailSettings.username(), "Email пользователя");
        saveSetting("email_password", emailSettings.password(), "Email пароль");
        saveSetting("email_from", emailSettings.fromEmail(), "Email отправителя");
        saveSetting("email_from_name", emailSettings.fromName(), "Имя отправителя");
        saveSetting("email_enabled", String.valueOf(emailSettings.enabled()), "Включить email уведомления");
        saveSetting("email_use_ssl", String.valueOf(emailSettings.useSsl()), "Использовать SSL");
        saveSetting("email_use_tls", String.valueOf(emailSettings.useTls()), "Использовать TLS");
    }
    
    @Override
    public boolean testEmailConnection(EmailSettingsDto emailSettings) {
        try {
            // Создаем временную конфигурацию JavaMailSender для тестирования
            org.springframework.mail.javamail.JavaMailSenderImpl mailSender = 
                new org.springframework.mail.javamail.JavaMailSenderImpl();
            
            mailSender.setHost(emailSettings.smtpHost());
            mailSender.setPort(Integer.parseInt(emailSettings.smtpPort()));
            mailSender.setUsername(emailSettings.username());
            mailSender.setPassword(emailSettings.password());
            
            java.util.Properties props = mailSender.getJavaMailProperties();
            props.put("mail.transport.protocol", "smtp");
            props.put("mail.smtp.auth", "true");
            props.put("mail.smtp.starttls.enable", String.valueOf(emailSettings.useTls()));
            props.put("mail.smtp.ssl.enable", String.valueOf(emailSettings.useSsl()));
            
            // Тестируем соединение
            mailSender.testConnection();
            return true;
        } catch (Exception e) {
            logger.error("Email connection test failed", e);
            throw new RuntimeException(getUserFriendlyErrorMessage(e, emailSettings));
        }
    }
    
    private String getUserFriendlyErrorMessage(Exception e, EmailSettingsDto emailSettings) {
        String errorMessage = e.getMessage();
        
        // Gmail specific errors
        if (errorMessage != null && errorMessage.contains("Application-specific password required")) {
            return "Gmail требует пароль приложения. Включите двухфакторную аутентификацию и создайте пароль приложения в настройках безопасности Google.";
        }
        
        if (errorMessage != null && errorMessage.contains("Invalid credentials")) {
            if (emailSettings.smtpHost().contains("gmail.com")) {
                return "Неверные учетные данные Gmail. Используйте пароль приложения вместо обычного пароля.";
            } else if (emailSettings.smtpHost().contains("yandex")) {
                return "Неверные учетные данные Яндекс. Используйте пароль приложения вместо обычного пароля.";
            } else if (emailSettings.smtpHost().contains("mail.ru")) {
                return "Неверные учетные данные Mail.ru. Используйте пароль приложения вместо обычного пароля.";
            }
            return "Неверные учетные данные. Проверьте логин и пароль.";
        }
        
        if (errorMessage != null && errorMessage.contains("Connection refused")) {
            return "Не удалось подключиться к SMTP серверу. Проверьте правильность хоста и порта.";
        }
        
        if (errorMessage != null && errorMessage.contains("timeout")) {
            return "Превышено время ожидания подключения к SMTP серверу. Проверьте настройки сети.";
        }
        
        if (errorMessage != null && errorMessage.contains("SSL")) {
            return "Ошибка SSL/TLS соединения. Проверьте настройки SSL/TLS для вашего провайдера.";
        }
        
        // Generic error
        return "Ошибка подключения к SMTP серверу: " + e.getMessage();
    }
    
    private String getSettingValue(String key, String defaultValue) {
        return settingsRepository.findValueByKey(key).orElse(defaultValue);
    }
    
    private void saveSetting(String key, String value, String description) {
        Settings setting = settingsRepository.findByKey(key)
                .orElse(new Settings(key, "", description));
        setting.setValue(value);
        settingsRepository.save(setting);
    }
} 