package ru.perminov.tender.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ru.perminov.tender.dto.FnsApiKeyDto;
import ru.perminov.tender.dto.SettingsDto;
import ru.perminov.tender.service.SettingsService;

@Slf4j
@RestController
@RequestMapping("/api/settings")
@CrossOrigin(origins = {"http://127.0.0.1:5173", "http://localhost:5173", "http://localhost:3000"})
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
} 