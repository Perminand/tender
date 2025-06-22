package ru.perminov.tender.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ru.perminov.tender.dto.FnsApiKeyDto;
import ru.perminov.tender.dto.SettingsDto;
import ru.perminov.tender.service.SettingsService;

@RestController
@RequestMapping("/api/settings")
@CrossOrigin(origins = {"http://127.0.0.1:5173", "http://localhost:5173", "http://localhost:3000"})
public class SettingsController {
    
    @Autowired
    private SettingsService settingsService;
    
    @GetMapping
    public ResponseEntity<SettingsDto> getSettings() {
        SettingsDto settings = settingsService.getSettings();
        return ResponseEntity.ok(settings);
    }
    
    @PostMapping("/fns-api-key")
    public ResponseEntity<String> saveFnsApiKey(@RequestBody FnsApiKeyDto dto) {
        try {
            settingsService.saveFnsApiKey(dto);
            return ResponseEntity.ok("API ключ успешно сохранен");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Ошибка при сохранении API ключа: " + e.getMessage());
        }
    }
    
    @GetMapping("/fns-api-usage")
    public ResponseEntity<String> getFnsApiUsage() {
        try {
            String usage = settingsService.getFnsApiUsage();
            return ResponseEntity.ok(usage);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Ошибка при получении информации об использовании: " + e.getMessage());
        }
    }
} 