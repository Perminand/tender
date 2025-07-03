package ru.perminov.tender.service.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.fasterxml.jackson.databind.ObjectMapper;
import ru.perminov.tender.dto.FnsApiKeyDto;
import ru.perminov.tender.dto.SettingsDto;
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
} 