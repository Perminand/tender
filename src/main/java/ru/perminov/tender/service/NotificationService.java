package ru.perminov.tender.service;

import ru.perminov.tender.dto.NotificationDto;
import ru.perminov.tender.model.Notification;
import ru.perminov.tender.model.Tender;
import ru.perminov.tender.model.SupplierProposal;

import java.util.List;
import java.util.UUID;

public interface NotificationService {
    
    /**
     * Создает и отправляет уведомление о публикации тендера
     */
    void notifyTenderPublished(Tender tender, List<String> supplierEmails);
    
    /**
     * Создает и отправляет напоминание о дедлайне тендера
     */
    void notifyTenderDeadlineReminder(Tender tender, List<String> supplierEmails);
    
    /**
     * Создает и отправляет уведомление о получении предложения
     */
    void notifyProposalSubmitted(SupplierProposal proposal);
    
    /**
     * Создает и отправляет уведомление о присуждении тендера
     */
    void notifyTenderAwarded(Tender tender, String winnerSupplierEmail);
    
    /**
     * Создает и отправляет уведомление об отмене тендера
     */
    void notifyTenderCancelled(Tender tender, List<String> supplierEmails);
    
    /**
     * Создает и отправляет приглашение поставщику к участию в тендере
     */
    void inviteSupplierToTender(Tender tender, String supplierEmail, String supplierName);
    
    /**
     * Отправляет все ожидающие уведомления
     */
    void sendPendingNotifications();
    
    /**
     * Получает уведомления по тендеру
     */
    List<NotificationDto> getNotificationsByTender(UUID tenderId);
    
    /**
     * Получает уведомления по поставщику
     */
    List<NotificationDto> getNotificationsBySupplier(UUID supplierId);
    
    /**
     * Получает уведомления по статусу
     */
    List<NotificationDto> getNotificationsByStatus(Notification.NotificationStatus status);
    
    /**
     * Повторно отправляет неудачное уведомление
     */
    boolean retryFailedNotification(UUID notificationId);
    
    /**
     * Отменяет уведомление
     */
    void cancelNotification(UUID notificationId);
    
    /**
     * Получает email адреса поставщиков для уведомлений
     */
    List<String> getSupplierEmailsForNotification(UUID tenderId);
    
    /**
     * Получает email адреса заказчиков для уведомлений
     */
    List<String> getCustomerEmailsForNotification(UUID tenderId);
    
    /**
     * Создает и отправляет уведомление о публикации тендера поставщикам
     */
    void notifyTenderPublishedToSuppliers(Tender tender);
    
    /**
     * Создает и отправляет уведомление о публикации тендера заказчикам
     */
    void notifyTenderPublishedToCustomers(Tender tender);
    
    /**
     * Получить все уведомления
     */
    List<NotificationDto> getAll();
} 