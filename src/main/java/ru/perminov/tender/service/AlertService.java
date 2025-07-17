package ru.perminov.tender.service;

import ru.perminov.tender.model.Alert;
import ru.perminov.tender.dto.AlertDto;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface AlertService {
    
    // Создание алертов
    AlertDto createAlert(AlertDto alertDto);
    AlertDto createOverdueDeliveryAlert(UUID deliveryId);
    AlertDto createBudgetExceededAlert(UUID contractId, String details);
    AlertDto createTenderDeadlineAlert(UUID tenderId);
    AlertDto createNewProposalAlert(UUID proposalId);
    AlertDto createQualityIssueAlert(UUID deliveryId, String issue);
    AlertDto createPaymentOverdueAlert(UUID paymentId);
    AlertDto createSupplierRatingAlert(UUID supplierId, Double rating);
    AlertDto createContractExpiringAlert(UUID contractId);
    
    // Получение алертов
    AlertDto getAlertById(UUID id);
    List<AlertDto> getAllAlerts();
    List<AlertDto> getActiveAlerts();
    List<AlertDto> getAlertsByType(Alert.AlertType type);
    List<AlertDto> getAlertsBySeverity(Alert.AlertSeverity severity);
    List<AlertDto> getAlertsByUser(String username);
    List<AlertDto> getUnreadAlerts(String username);
    List<AlertDto> getUrgentAlerts();
    
    // Управление статусом
    AlertDto acknowledgeAlert(UUID id);
    AlertDto resolveAlert(UUID id);
    AlertDto markAsRead(UUID id);
    void markAllAsRead(String username);
    
    // Автоматические проверки
    void checkOverdueDeliveries();
    void checkBudgetLimits();
    void checkTenderDeadlines();
    void checkPaymentDeadlines();
    void checkContractExpiration();
    void checkSupplierRatings();
    
    // Уведомления
    void sendEmailAlert(AlertDto alert);
    void sendPushNotification(AlertDto alert);
    void sendSMSAlert(AlertDto alert);
    
    // Статистика
    Integer getUnreadCount(String username);
    Integer getUrgentCount(String username);
    Integer getTotalCount(String username);
    
    // Очистка
    void archiveOldAlerts(LocalDateTime before);
    void deleteExpiredAlerts();
} 