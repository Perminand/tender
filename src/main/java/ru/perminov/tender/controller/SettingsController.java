package ru.perminov.tender.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ru.perminov.tender.dto.FnsApiKeyDto;
import ru.perminov.tender.dto.SettingsDto;
import ru.perminov.tender.dto.EmailSettingsDto;
import ru.perminov.tender.service.SettingsService;

@Slf4j
@RestController
@RequestMapping("/api/settings")
public class SettingsController {
    
    @Autowired
    private SettingsService settingsService;
    
    @GetMapping
    public ResponseEntity<SettingsDto> getSettings() {
        log.info("Получен GET-запрос: получить настройки");
        SettingsDto settings = settingsService.getSettings();
        return ResponseEntity.ok(settings);
    }
    
    @PostMapping("/fns-api-key")
    public ResponseEntity<String> saveFnsApiKey(@RequestBody FnsApiKeyDto dto) {
        log.info("Получен POST-запрос: сохранить API ключ ФНС");
        try {
            settingsService.saveFnsApiKey(dto);
            return ResponseEntity.ok("API ключ успешно сохранен");
        } catch (Exception e) {
            log.error("Ошибка при сохранении API ключа ФНС", e);
            return ResponseEntity.badRequest().body("Ошибка при сохранении API ключа: " + e.getMessage());
        }
    }
    
    @GetMapping("/fns-api-usage")
    public ResponseEntity<String> getFnsApiUsage() {
        log.info("Получен GET-запрос: получить информацию об использовании API ФНС");
        try {
            String usage = settingsService.getFnsApiUsage();
            return ResponseEntity.ok(usage);
        } catch (Exception e) {
            log.error("Ошибка при получении информации об использовании API ФНС", e);
            return ResponseEntity.badRequest().body("Ошибка при получении информации об использовании: " + e.getMessage());
        }
    }
    
    @GetMapping("/email")
    public ResponseEntity<EmailSettingsDto> getEmailSettings() {
        log.info("Получен GET-запрос: получить настройки email");
        try {
            EmailSettingsDto emailSettings = settingsService.getEmailSettings();
            return ResponseEntity.ok(emailSettings);
        } catch (Exception e) {
            log.error("Ошибка при получении настроек email", e);
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PostMapping("/email")
    public ResponseEntity<String> saveEmailSettings(@RequestBody EmailSettingsDto emailSettings) {
        log.info("Получен POST-запрос: сохранить настройки email");
        try {
            settingsService.saveEmailSettings(emailSettings);
            return ResponseEntity.ok("Настройки email успешно сохранены");
        } catch (Exception e) {
            log.error("Ошибка при сохранении настроек email", e);
            return ResponseEntity.badRequest().body("Ошибка при сохранении настроек email: " + e.getMessage());
        }
    }
    
    @PostMapping("/email/test")
    public ResponseEntity<String> testEmailConnection(@RequestBody EmailSettingsDto emailSettings) {
        log.info("Получен POST-запрос: протестировать соединение email");
        try {
            boolean success = settingsService.testEmailConnection(emailSettings);
            if (success) {
                return ResponseEntity.ok("Соединение с SMTP сервером успешно установлено");
            } else {
                return ResponseEntity.badRequest().body("Не удалось установить соединение с SMTP сервером");
            }
        } catch (RuntimeException e) {
            log.error("Ошибка при тестировании соединения email", e);
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            log.error("Ошибка при тестировании соединения email", e);
            return ResponseEntity.badRequest().body("Ошибка при тестировании соединения: " + e.getMessage());
        }
    }
} 