package ru.perminov.tender.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ru.perminov.tender.dto.NotificationDto;
import ru.perminov.tender.model.Notification;
import ru.perminov.tender.service.NotificationService;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Slf4j
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping("/tender/{tenderId}")
    public ResponseEntity<List<NotificationDto>> getNotificationsByTender(@PathVariable UUID tenderId) {
        log.info("Получен GET-запрос: получить уведомления по тендеру {}", tenderId);
        List<NotificationDto> notifications = notificationService.getNotificationsByTender(tenderId);
        return ResponseEntity.ok(notifications);
    }

    @GetMapping("/supplier/{supplierId}")
    public ResponseEntity<List<NotificationDto>> getNotificationsBySupplier(@PathVariable UUID supplierId) {
        log.info("Получен GET-запрос: получить уведомления по поставщику {}", supplierId);
        List<NotificationDto> notifications = notificationService.getNotificationsBySupplier(supplierId);
        return ResponseEntity.ok(notifications);
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<NotificationDto>> getNotificationsByStatus(@PathVariable Notification.NotificationStatus status) {
        log.info("Получен GET-запрос: получить уведомления по статусу {}", status);
        List<NotificationDto> notifications = notificationService.getNotificationsByStatus(status);
        return ResponseEntity.ok(notifications);
    }

    @PostMapping("/{notificationId}/retry")
    public ResponseEntity<Boolean> retryFailedNotification(@PathVariable UUID notificationId) {
        log.info("Получен POST-запрос: повторить отправку уведомления {}", notificationId);
        boolean success = notificationService.retryFailedNotification(notificationId);
        return ResponseEntity.ok(success);
    }

    @PostMapping("/{notificationId}/cancel")
    public ResponseEntity<Void> cancelNotification(@PathVariable UUID notificationId) {
        log.info("Получен POST-запрос: отменить уведомление {}", notificationId);
        notificationService.cancelNotification(notificationId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/send-pending")
    public ResponseEntity<Void> sendPendingNotifications() {
        log.info("Получен POST-запрос: отправить ожидающие уведомления");
        notificationService.sendPendingNotifications();
        return ResponseEntity.ok().build();
    }

    @PostMapping("/tender/{tenderId}/invite-supplier")
    public ResponseEntity<Void> inviteSupplierToTender(
            @PathVariable UUID tenderId,
            @RequestParam String supplierEmail,
            @RequestParam String supplierName) {
        log.info("Получен POST-запрос: пригласить поставщика {} к участию в тендере {}", supplierEmail, tenderId);
        // Здесь нужно получить тендер по ID и вызвать метод приглашения
        // Пока оставим заглушку
        return ResponseEntity.ok().build();
    }

    @GetMapping
    public List<NotificationDto> getAll() {
        return notificationService.getAll();
    }
} 