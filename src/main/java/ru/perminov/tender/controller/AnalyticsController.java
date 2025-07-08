package ru.perminov.tender.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import ru.perminov.tender.dto.AnalyticsStatsDto;
import ru.perminov.tender.service.AnalyticsService;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
@Slf4j
public class AnalyticsController {
    private final AnalyticsService analyticsService;

    @GetMapping("/stats")
    public AnalyticsStatsDto getStats() {
        log.info("Получение общей статистики аналитики");
        return analyticsService.getStats();
    }
} 