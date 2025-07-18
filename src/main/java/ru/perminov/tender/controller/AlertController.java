package ru.perminov.tender.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ru.perminov.tender.dto.AlertDto;
import ru.perminov.tender.model.Alert;
import ru.perminov.tender.service.AlertService;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/alerts")
@RequiredArgsConstructor
public class AlertController {
    
    private final AlertService alertService;
    
    // Получение алертов
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'VIEWER')")
    @GetMapping
    public ResponseEntity<List<AlertDto>> getAllAlerts() {
        log.info("Получен GET-запрос: все алерты");
        return ResponseEntity.ok(alertService.getAllAlerts());
    }
    
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'VIEWER')")
    @GetMapping("/active")
    public ResponseEntity<List<AlertDto>> getActiveAlerts() {
        log.info("Получен GET-запрос: активные алерты");
        return ResponseEntity.ok(alertService.getActiveAlerts());
    }
    
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'VIEWER', 'CUSTOMER')")
    @GetMapping("/unread")
    public ResponseEntity<List<AlertDto>> getUnreadAlerts(@RequestParam String username) {
        log.info("Получен GET-запрос: непрочитанные алерты для пользователя: {}", username);
        return ResponseEntity.ok(alertService.getUnreadAlerts(username));
    }
    
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'VIEWER')")
    @GetMapping("/urgent")
    public ResponseEntity<List<AlertDto>> getUrgentAlerts() {
        log.info("Получен GET-запрос: срочные алерты");
        return ResponseEntity.ok(alertService.getUrgentAlerts());
    }
    
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'VIEWER')")
    @GetMapping("/type/{type}")
    public ResponseEntity<List<AlertDto>> getAlertsByType(@PathVariable Alert.AlertType type) {
        log.info("Получен GET-запрос: алерты по типу: {}", type);
        return ResponseEntity.ok(alertService.getAlertsByType(type));
    }
    
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'VIEWER')")
    @GetMapping("/severity/{severity}")
    public ResponseEntity<List<AlertDto>> getAlertsBySeverity(@PathVariable Alert.AlertSeverity severity) {
        log.info("Получен GET-запрос: алерты по важности: {}", severity);
        return ResponseEntity.ok(alertService.getAlertsBySeverity(severity));
    }
    
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'VIEWER')")
    @GetMapping("/user/{username}")
    public ResponseEntity<List<AlertDto>> getAlertsByUser(@PathVariable String username) {
        log.info("Получен GET-запрос: алерты пользователя: {}", username);
        return ResponseEntity.ok(alertService.getAlertsByUser(username));
    }
    
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'VIEWER')")
    @GetMapping("/{id}")
    public ResponseEntity<AlertDto> getAlertById(@PathVariable UUID id) {
        log.info("Получен GET-запрос: алерт по id: {}", id);
        return ResponseEntity.ok(alertService.getAlertById(id));
    }
    
    // Управление статусом
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'VIEWER')")
    @PostMapping("/{id}/acknowledge")
    public ResponseEntity<AlertDto> acknowledgeAlert(@PathVariable UUID id) {
        log.info("Получен POST-запрос: подтверждение алерта id={}", id);
        return ResponseEntity.ok(alertService.acknowledgeAlert(id));
    }
    
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'VIEWER')")
    @PostMapping("/{id}/resolve")
    public ResponseEntity<AlertDto> resolveAlert(@PathVariable UUID id) {
        log.info("Получен POST-запрос: решение алерта id={}", id);
        return ResponseEntity.ok(alertService.resolveAlert(id));
    }
    
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'VIEWER', 'CUSTOMER')")
    @PostMapping("/{id}/read")
    public ResponseEntity<AlertDto> markAsRead(@PathVariable UUID id) {
        log.info("Получен POST-запрос: отметить как прочитанный алерт id={}", id);
        return ResponseEntity.ok(alertService.markAsRead(id));
    }
    
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'VIEWER', 'CUSTOMER')")
    @PostMapping("/mark-all-read")
    public ResponseEntity<Void> markAllAsRead(@RequestParam String username) {
        log.info("Получен POST-запрос: отметить все как прочитанные для пользователя: {}", username);
        alertService.markAllAsRead(username);
        return ResponseEntity.ok().build();
    }
    
    // Статистика
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'VIEWER', 'CUSTOMER')")
    @GetMapping("/stats/unread-count")
    public ResponseEntity<Integer> getUnreadCount(@RequestParam String username) {
        log.info("Получен GET-запрос: количество непрочитанных алертов для пользователя: {}", username);
        return ResponseEntity.ok(alertService.getUnreadCount(username));
    }
    
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'VIEWER')")
    @GetMapping("/stats/urgent-count")
    public ResponseEntity<Integer> getUrgentCount(@RequestParam String username) {
        log.info("Получен GET-запрос: количество срочных алертов для пользователя: {}", username);
        return ResponseEntity.ok(alertService.getUrgentCount(username));
    }
    
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'VIEWER')")
    @GetMapping("/stats/total-count")
    public ResponseEntity<Integer> getTotalCount(@RequestParam String username) {
        log.info("Получен GET-запрос: общее количество алертов для пользователя: {}", username);
        return ResponseEntity.ok(alertService.getTotalCount(username));
    }
    
    // Автоматические проверки
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'VIEWER')")
    @PostMapping("/check/overdue-deliveries")
    public ResponseEntity<Void> checkOverdueDeliveries() {
        log.info("Получен POST-запрос: проверка просроченных поставок");
        alertService.checkOverdueDeliveries();
        return ResponseEntity.ok().build();
    }
    
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'VIEWER')")
    @PostMapping("/check/budget-limits")
    public ResponseEntity<Void> checkBudgetLimits() {
        log.info("Получен POST-запрос: проверка лимитов бюджета");
        alertService.checkBudgetLimits();
        return ResponseEntity.ok().build();
    }
    
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'VIEWER')")
    @PostMapping("/check/tender-deadlines")
    public ResponseEntity<Void> checkTenderDeadlines() {
        log.info("Получен POST-запрос: проверка дедлайнов тендеров");
        alertService.checkTenderDeadlines();
        return ResponseEntity.ok().build();
    }
    
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'VIEWER')")
    @PostMapping("/check/payment-deadlines")
    public ResponseEntity<Void> checkPaymentDeadlines() {
        log.info("Получен POST-запрос: проверка дедлайнов платежей");
        alertService.checkPaymentDeadlines();
        return ResponseEntity.ok().build();
    }
    
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'VIEWER')")
    @PostMapping("/check/contract-expiration")
    public ResponseEntity<Void> checkContractExpiration() {
        log.info("Получен POST-запрос: проверка истечения контрактов");
        alertService.checkContractExpiration();
        return ResponseEntity.ok().build();
    }
    
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'VIEWER')")
    @PostMapping("/check/supplier-ratings")
    public ResponseEntity<Void> checkSupplierRatings() {
        log.info("Получен POST-запрос: проверка рейтингов поставщиков");
        alertService.checkSupplierRatings();
        return ResponseEntity.ok().build();
    }
} 