package ru.perminov.tender.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import ru.perminov.tender.dto.AlertDto;
import ru.perminov.tender.model.Alert;
import ru.perminov.tender.service.AlertService;
import ru.perminov.tender.repository.AlertRepository;
import org.springframework.beans.factory.annotation.Autowired;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AlertServiceImpl implements AlertService {
    @Autowired
    private final AlertRepository alertRepository;
    
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
        alert.setMessage("Поставка просрочена");
        alert.setType(Alert.AlertType.OVERDUE_DELIVERY);
        alert.setSeverity(Alert.AlertSeverity.HIGH);
        alert.setStatus(Alert.AlertStatus.ACTIVE);
        alert.setCreatedAt(LocalDateTime.now());
        // Новые поля для фронта:
        alert.setEntityId(deliveryId);
        alert.setEntityType("DELIVERY");
        alert.setActionUrl("/deliveries/" + deliveryId);
        alert.setMetadata("{\"deliveryId\":\"" + deliveryId + "\",\"companyName\":\"Компания 1\"}");
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
        alert.setMessage("Получено новое предложение");
        alert.setType(Alert.AlertType.NEW_PROPOSAL);
        alert.setSeverity(Alert.AlertSeverity.LOW);
        alert.setStatus(Alert.AlertStatus.ACTIVE);
        alert.setCreatedAt(LocalDateTime.now());
        // Новые поля для фронта:
        alert.setEntityId(proposalId);
        alert.setEntityType("PROPOSAL");
        alert.setActionUrl("/proposals/" + proposalId);
        alert.setMetadata("{\"proposalId\":\"" + proposalId + "\",\"companyName\":\"Компания 1\"}");
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
        alert.setMessage("Платеж просрочен");
        alert.setType(Alert.AlertType.PAYMENT_OVERDUE);
        alert.setSeverity(Alert.AlertSeverity.HIGH);
        alert.setStatus(Alert.AlertStatus.ACTIVE);
        alert.setCreatedAt(LocalDateTime.now());
        // Новые поля для фронта:
        alert.setEntityId(paymentId);
        alert.setEntityType("PAYMENT");
        alert.setActionUrl("/payments/" + paymentId);
        alert.setMetadata("{\"paymentId\":\"" + paymentId + "\",\"companyName\":\"Компания 1\"}");
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
        // Возвращаем только алерты с isRead=false для пользователя
        return alertRepository.findByTargetUserAndIsReadFalse(username)
            .stream()
            .map(this::toDto)
            .toList();
    }
    
    @Override
    public AlertDto markAsRead(UUID id) {
        Alert alert = alertRepository.findById(id).orElseThrow();
        alert.setIsRead(true);
        alertRepository.save(alert);
        return toDto(alert);
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
    public void markAllAsRead(String username) {
        List<Alert> alerts = alertRepository.findByTargetUserAndIsReadFalse(username);
        for (Alert alert : alerts) {
            alert.setIsRead(true);
        }
        alertRepository.saveAll(alerts);
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
        return alertRepository.findByTargetUserAndIsReadFalse(username).size();
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

    // Вспомогательный метод для преобразования Alert -> AlertDto
    private AlertDto toDto(Alert alert) {
        AlertDto dto = new AlertDto();
        dto.setId(alert.getId());
        dto.setTitle(alert.getTitle());
        dto.setMessage(alert.getMessage());
        dto.setDescription(alert.getDescription());
        dto.setType(alert.getType());
        dto.setSeverity(alert.getSeverity());
        dto.setStatus(alert.getStatus());
        dto.setEntityId(alert.getEntityId());
        dto.setEntityType(alert.getEntityType());
        dto.setTargetUser(alert.getTargetUser());
        dto.setTargetRole(alert.getTargetRole());
        dto.setTargetDepartment(alert.getTargetDepartment());
        dto.setCreatedAt(alert.getCreatedAt());
        dto.setExpiresAt(alert.getExpiresAt());
        dto.setAcknowledgedAt(alert.getAcknowledgedAt());
        dto.setResolvedAt(alert.getResolvedAt());
        dto.setActionUrl(alert.getActionUrl());
        dto.setActionText(alert.getActionText());
        dto.setMetadata(alert.getMetadata());
        dto.setViewCount(alert.getViewCount());
        dto.setIsRead(alert.getIsRead());
        dto.setIsAcknowledged(alert.getIsAcknowledged());
        dto.setIsResolved(alert.getIsResolved());
        return dto;
    }
} 