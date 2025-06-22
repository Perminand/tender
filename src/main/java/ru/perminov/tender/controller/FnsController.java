package ru.perminov.tender.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ru.perminov.tender.service.FnsService;

import java.util.Map;

@RestController
@RequestMapping("/api/fns")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://127.0.0.1:5173", "http://localhost:5173", "http://localhost:3000"})
public class FnsController {

    private final FnsService fnsService;

    @GetMapping("/search")
    public ResponseEntity<Map<String, Object>> searchCompany(@RequestParam String inn) {
        try {
            Map<String, Object> companyData = fnsService.searchCompany(inn);
            return ResponseEntity.ok(companyData);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
} 