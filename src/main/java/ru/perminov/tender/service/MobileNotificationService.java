package ru.perminov.tender.service;

import ru.perminov.tender.model.Tender;
import ru.perminov.tender.model.SupplierProposal;
import ru.perminov.tender.model.Delivery;

import java.util.List;
import java.util.UUID;

public interface MobileNotificationService {
    
    /**
     * Отправка push-уведомления о новом тендере
     */
    void sendTenderNotification(Tender tender, List<String> deviceTokens);
    
    /**
     * Отправка push-уведомления о получении предложения
     */
    void sendProposalNotification(SupplierProposal proposal, String deviceToken);
    
    /**
     * Отправка push-уведомления о статусе поставки
     */
    void sendDeliveryStatusNotification(Delivery delivery, String deviceToken);
    
    /**
     * Отправка push-уведомления о дедлайне
     */
    void sendDeadlineReminder(String tenderId, String deviceToken);
    
    /**
     * Отправка push-уведомления о платеже
     */
    void sendPaymentNotification(String paymentId, String deviceToken);
    
    /**
     * Регистрация устройства для уведомлений
     */
    void registerDevice(String userId, String deviceToken, String platform);
    
    /**
     * Отмена регистрации устройства
     */
    void unregisterDevice(String userId, String deviceToken);
    
    /**
     * Получение токенов устройств пользователя
     */
    List<String> getUserDeviceTokens(String userId);
    
    /**
     * Отправка массового уведомления
     */
    void sendBulkNotification(String title, String message, List<String> deviceTokens);
    
    /**
     * Проверка статуса доставки уведомления
     */
    boolean checkNotificationDelivery(String notificationId);
} 