package ru.perminov.tender.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ru.perminov.tender.dto.dashboard.DashboardDto;
import ru.perminov.tender.service.DashboardService;
import org.springframework.security.access.prepost.PreAuthorize;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {
    
    private final DashboardService dashboardService;
    
    // Основной дашборд
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_ANALYST', 'ROLE_VIEWER', 'ROLE_CUSTOMER')")
    @GetMapping
    public ResponseEntity<DashboardDto> getMainDashboard(@RequestParam String username) {
        log.info("Получен GET-запрос: основной дашборд для пользователя: {}", username);
        return ResponseEntity.ok(dashboardService.getMainDashboard(username));
    }
    
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_ANALYST', 'ROLE_VIEWER')")
    @GetMapping("/period")
    public ResponseEntity<DashboardDto> getDashboardForPeriod(
            @RequestParam String username,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        log.info("Получен GET-запрос: дашборд за период для пользователя: {}, период: {} - {}", username, startDate, endDate);
        return ResponseEntity.ok(dashboardService.getDashboardForPeriod(username, startDate, endDate));
    }
    
    // Специализированные дашборды
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_ANALYST', 'ROLE_VIEWER')")
    @GetMapping("/financial")
    public ResponseEntity<DashboardDto> getFinancialDashboard(@RequestParam String username) {
        log.info("Получен GET-запрос: финансовый дашборд для пользователя: {}", username);
        return ResponseEntity.ok(dashboardService.getFinancialDashboard(username));
    }
    
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_ANALYST', 'ROLE_VIEWER')")
    @GetMapping("/operational")
    public ResponseEntity<DashboardDto> getOperationalDashboard(@RequestParam String username) {
        log.info("Получен GET-запрос: операционный дашборд для пользователя: {}", username);
        return ResponseEntity.ok(dashboardService.getOperationalDashboard(username));
    }
    
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_ANALYST', 'ROLE_VIEWER')")
    @GetMapping("/supplier")
    public ResponseEntity<DashboardDto> getSupplierDashboard(@RequestParam String username) {
        log.info("Получен GET-запрос: дашборд поставщиков для пользователя: {}", username);
        return ResponseEntity.ok(dashboardService.getSupplierDashboard(username));
    }
    
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_ANALYST', 'ROLE_VIEWER')")
    @GetMapping("/quality")
    public ResponseEntity<DashboardDto> getQualityDashboard(@RequestParam String username) {
        log.info("Получен GET-запрос: дашборд качества для пользователя: {}", username);
        return ResponseEntity.ok(dashboardService.getQualityDashboard(username));
    }
    
    // Персонализированные дашборды
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_ANALYST', 'ROLE_VIEWER')")
    @GetMapping("/personalized")
    public ResponseEntity<DashboardDto> getPersonalizedDashboard(
            @RequestParam String username,
            @RequestParam String preferences) {
        log.info("Получен GET-запрос: персонализированный дашборд для пользователя: {}", username);
        return ResponseEntity.ok(dashboardService.getPersonalizedDashboard(username, preferences));
    }
    
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_ANALYST', 'ROLE_VIEWER')")
    @GetMapping("/executive")
    public ResponseEntity<DashboardDto> getExecutiveDashboard(@RequestParam String username) {
        log.info("Получен GET-запрос: исполнительный дашборд для пользователя: {}", username);
        return ResponseEntity.ok(dashboardService.getExecutiveDashboard(username));
    }
    
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_ANALYST', 'ROLE_VIEWER')")
    @GetMapping("/manager")
    public ResponseEntity<DashboardDto> getManagerDashboard(@RequestParam String username) {
        log.info("Получен GET-запрос: дашборд менеджера для пользователя: {}", username);
        return ResponseEntity.ok(dashboardService.getManagerDashboard(username));
    }
    
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_ANALYST', 'ROLE_VIEWER')")
    @GetMapping("/savings-by-month")
    public ResponseEntity<List<Map<String, Object>>> getSavingsByMonth(@RequestParam String username) {
        // Реальная агрегация по месяцам (делегируем в сервис)
        return ResponseEntity.ok(dashboardService.getSavingsByMonth(username));
    }
    
    // Обновление данных в реальном времени
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_ANALYST', 'ROLE_VIEWER')")
    @PostMapping("/refresh")
    public ResponseEntity<DashboardDto> refreshDashboard(@RequestParam String username) {
        log.info("Получен POST-запрос: обновление дашборда для пользователя: {}", username);
        return ResponseEntity.ok(dashboardService.refreshDashboard(username));
    }
    
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_ANALYST', 'ROLE_VIEWER')")
    @GetMapping("/live-metrics")
    public ResponseEntity<DashboardDto> getLiveMetrics(@RequestParam String username) {
        log.info("Получен GET-запрос: живые метрики для пользователя: {}", username);
        return ResponseEntity.ok(dashboardService.getLiveMetrics(username));
    }
    
    // Экспорт дашборда
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_ANALYST', 'ROLE_VIEWER')")
    @GetMapping("/export/pdf")
    public ResponseEntity<byte[]> exportDashboardToPDF(@RequestParam String username) {
        log.info("Получен GET-запрос: экспорт дашборда в PDF для пользователя: {}", username);
        byte[] pdfData = dashboardService.exportDashboardToPDF(username);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=dashboard.pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfData);
    }
    
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_ANALYST', 'ROLE_VIEWER')")
    @GetMapping("/export/excel")
    public ResponseEntity<byte[]> exportDashboardToExcel(@RequestParam String username) {
        log.info("Получен GET-запрос: экспорт дашборда в Excel для пользователя: {}", username);
        byte[] excelData = dashboardService.exportDashboardToExcel(username);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=dashboard.xlsx")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(excelData);
    }
    
    // Настройки дашборда
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_ANALYST', 'ROLE_VIEWER')")
    @PostMapping("/preferences")
    public ResponseEntity<Void> saveDashboardPreferences(
            @RequestParam String username,
            @RequestBody String preferences) {
        log.info("Получен POST-запрос: сохранение настроек дашборда для пользователя: {}", username);
        dashboardService.saveDashboardPreferences(username, preferences);
        return ResponseEntity.ok().build();
    }
    
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_ANALYST', 'ROLE_VIEWER')")
    @GetMapping("/preferences")
    public ResponseEntity<String> getDashboardPreferences(@RequestParam String username) {
        log.info("Получен GET-запрос: настройки дашборда для пользователя: {}", username);
        return ResponseEntity.ok(dashboardService.getDashboardPreferences(username));
    }
    
    // Уведомления дашборда
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_ANALYST', 'ROLE_VIEWER')")
    @PostMapping("/alerts")
    public ResponseEntity<Void> sendDashboardAlerts(@RequestParam String username) {
        log.info("Получен POST-запрос: отправка алертов дашборда для пользователя: {}", username);
        dashboardService.sendDashboardAlerts(username);
        return ResponseEntity.ok().build();
    }
    
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_ANALYST', 'ROLE_VIEWER')")
    @PostMapping("/digest")
    public ResponseEntity<Void> sendDashboardDigest(@RequestParam String username) {
        log.info("Получен POST-запрос: отправка дайджеста дашборда для пользователя: {}", username);
        dashboardService.sendDashboardDigest(username);
        return ResponseEntity.ok().build();
    }
} 