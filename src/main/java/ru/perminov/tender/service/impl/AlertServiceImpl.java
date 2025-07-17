package ru.perminov.tender.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import ru.perminov.tender.dto.AlertDto;
import ru.perminov.tender.model.Alert;
import ru.perminov.tender.service.AlertService;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AlertServiceImpl implements AlertService {
    
    @Override
    public AlertDto createAlert(AlertDto alertDto) {
        // Простая заглушка - возвращаем переданный DTO
        return alertDto;
    }
    
    @Override
    public AlertDto createOverdueDeliveryAlert(UUID deliveryId) {
        AlertDto alert = new AlertDto();
        alert.setId(UUID.randomUUID());
        alert.setTitle("Просроченная поставка");
        alert.setMessage("Поставка с ID " + deliveryId + " просрочена");
        alert.setType(Alert.AlertType.OVERDUE_DELIVERY);
        alert.setSeverity(Alert.AlertSeverity.HIGH);
        alert.setStatus(Alert.AlertStatus.ACTIVE);
        alert.setCreatedAt(LocalDateTime.now());
        return alert;
    }
    
    @Override
    public AlertDto createBudgetExceededAlert(UUID contractId, String details) {
        AlertDto alert = new AlertDto();
        alert.setId(UUID.randomUUID());
        alert.setTitle("Превышение бюджета");
        alert.setMessage("Контракт " + contractId + ": " + details);
        alert.setType(Alert.AlertType.BUDGET_EXCEEDED);
        alert.setSeverity(Alert.AlertSeverity.CRITICAL);
        alert.setStatus(Alert.AlertStatus.ACTIVE);
        alert.setCreatedAt(LocalDateTime.now());
        return alert;
    }
    
    @Override
    public AlertDto createTenderDeadlineAlert(UUID tenderId) {
        AlertDto alert = new AlertDto();
        alert.setId(UUID.randomUUID());
        alert.setTitle("Дедлайн тендера");
        alert.setMessage("Тендер " + tenderId + " заканчивается");
        alert.setType(Alert.AlertType.TENDER_DEADLINE);
        alert.setSeverity(Alert.AlertSeverity.MEDIUM);
        alert.setStatus(Alert.AlertStatus.ACTIVE);
        alert.setCreatedAt(LocalDateTime.now());
        return alert;
    }
    
    @Override
    public AlertDto createNewProposalAlert(UUID proposalId) {
        AlertDto alert = new AlertDto();
        alert.setId(UUID.randomUUID());
        alert.setTitle("Новое предложение");
        alert.setMessage("Получено новое предложение " + proposalId);
        alert.setType(Alert.AlertType.NEW_PROPOSAL);
        alert.setSeverity(Alert.AlertSeverity.LOW);
        alert.setStatus(Alert.AlertStatus.ACTIVE);
        alert.setCreatedAt(LocalDateTime.now());
        return alert;
    }
    
    @Override
    public AlertDto createQualityIssueAlert(UUID deliveryId, String issue) {
        AlertDto alert = new AlertDto();
        alert.setId(UUID.randomUUID());
        alert.setTitle("Проблема с качеством");
        alert.setMessage("Поставка " + deliveryId + ": " + issue);
        alert.setType(Alert.AlertType.QUALITY_ISSUE);
        alert.setSeverity(Alert.AlertSeverity.HIGH);
        alert.setStatus(Alert.AlertStatus.ACTIVE);
        alert.setCreatedAt(LocalDateTime.now());
        return alert;
    }
    
    @Override
    public AlertDto createPaymentOverdueAlert(UUID paymentId) {
        AlertDto alert = new AlertDto();
        alert.setId(UUID.randomUUID());
        alert.setTitle("Просроченный платеж");
        alert.setMessage("Платеж " + paymentId + " просрочен");
        alert.setType(Alert.AlertType.PAYMENT_OVERDUE);
        alert.setSeverity(Alert.AlertSeverity.HIGH);
        alert.setStatus(Alert.AlertStatus.ACTIVE);
        alert.setCreatedAt(LocalDateTime.now());
        return alert;
    }
    
    @Override
    public AlertDto createSupplierRatingAlert(UUID supplierId, Double rating) {
        AlertDto alert = new AlertDto();
        alert.setId(UUID.randomUUID());
        alert.setTitle("Низкий рейтинг поставщика");
        alert.setMessage("Поставщик " + supplierId + " имеет рейтинг " + rating);
        alert.setType(Alert.AlertType.SUPPLIER_RATING_LOW);
        alert.setSeverity(Alert.AlertSeverity.MEDIUM);
        alert.setStatus(Alert.AlertStatus.ACTIVE);
        alert.setCreatedAt(LocalDateTime.now());
        return alert;
    }
    
    @Override
    public AlertDto createContractExpiringAlert(UUID contractId) {
        AlertDto alert = new AlertDto();
        alert.setId(UUID.randomUUID());
        alert.setTitle("Истекающий контракт");
        alert.setMessage("Контракт " + contractId + " скоро истекает");
        alert.setType(Alert.AlertType.CONTRACT_EXPIRING);
        alert.setSeverity(Alert.AlertSeverity.MEDIUM);
        alert.setStatus(Alert.AlertStatus.ACTIVE);
        alert.setCreatedAt(LocalDateTime.now());
        return alert;
    }
    
    @Override
    public AlertDto getAlertById(UUID id) {
        return null;
    }
    
    @Override
    public List<AlertDto> getAllAlerts() {
        return Collections.emptyList();
    }
    
    @Override
    public List<AlertDto> getActiveAlerts() {
        return Collections.emptyList();
    }
    
    @Override
    public List<AlertDto> getAlertsByType(Alert.AlertType type) {
        return Collections.emptyList();
    }
    
    @Override
    public List<AlertDto> getAlertsBySeverity(Alert.AlertSeverity severity) {
        return Collections.emptyList();
    }
    
    @Override
    public List<AlertDto> getAlertsByUser(String username) {
        return Collections.emptyList();
    }
    
    @Override
    public List<AlertDto> getUnreadAlerts(String username) {
        // Возвращаем тестовые алерты
        return List.of(
            createOverdueDeliveryAlert(UUID.randomUUID()),
            createPaymentOverdueAlert(UUID.randomUUID()),
            createNewProposalAlert(UUID.randomUUID())
        );
    }
    
    @Override
    public List<AlertDto> getUrgentAlerts() {
        return List.of(
            createOverdueDeliveryAlert(UUID.randomUUID()),
            createPaymentOverdueAlert(UUID.randomUUID())
        );
    }
    
    @Override
    public AlertDto acknowledgeAlert(UUID id) {
        return null;
    }
    
    @Override
    public AlertDto resolveAlert(UUID id) {
        return null;
    }
    
    @Override
    public AlertDto markAsRead(UUID id) {
        return null;
    }
    
    @Override
    public void markAllAsRead(String username) {
        // Заглушка
    }
    
    @Override
    public void checkOverdueDeliveries() {
        // Заглушка
    }
    
    @Override
    public void checkBudgetLimits() {
        // Заглушка
    }
    
    @Override
    public void checkTenderDeadlines() {
        // Заглушка
    }
    
    @Override
    public void checkPaymentDeadlines() {
        // Заглушка
    }
    
    @Override
    public void checkContractExpiration() {
        // Заглушка
    }
    
    @Override
    public void checkSupplierRatings() {
        // Заглушка
    }
    
    @Override
    public void sendEmailAlert(AlertDto alert) {
        // Заглушка
    }
    
    @Override
    public void sendPushNotification(AlertDto alert) {
        // Заглушка
    }
    
    @Override
    public void sendSMSAlert(AlertDto alert) {
        // Заглушка
    }
    
    @Override
    public Integer getUnreadCount(String username) {
        return 3; // Тестовое значение
    }
    
    @Override
    public Integer getUrgentCount(String username) {
        return 2; // Тестовое значение
    }
    
    @Override
    public Integer getTotalCount(String username) {
        return 5; // Тестовое значение
    }
    
    @Override
    public void archiveOldAlerts(LocalDateTime before) {
        // Заглушка
    }
    
    @Override
    public void deleteExpiredAlerts() {
        // Заглушка
    }
} 