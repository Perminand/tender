package ru.perminov.tender.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ru.perminov.tender.service.FnsService;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/fns")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://127.0.0.1:5173", "http://localhost:5173", "http://localhost:3000"})
public class FnsController {

    private final FnsService fnsService;

    @GetMapping("/search")
    public ResponseEntity<Map<String, Object>> searchCompany(@RequestParam String inn) {
        log.info("Получен GET-запрос: поиск компании в ФНС по ИНН. inn={}", inn);
        try {
            Map<String, Object> companyData = fnsService.searchCompany(inn);
            return ResponseEntity.ok(companyData);
        } catch (Exception e) {
            log.error("Ошибка при поиске компании в ФНС по ИНН: {}", inn, e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
} 