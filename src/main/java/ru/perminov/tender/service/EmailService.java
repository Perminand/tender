package ru.perminov.tender.service;

import ru.perminov.tender.model.Notification;

public interface EmailService {
    
    /**
     * Отправляет email уведомление
     * @param notification уведомление для отправки
     * @return true если отправка прошла успешно
     */
    boolean sendNotification(Notification notification);
    
    /**
     * Отправляет email с указанными параметрами
     * @param to получатель
     * @param subject тема
     * @param message текст сообщения
     * @return true если отправка прошла успешно
     */
    boolean sendEmail(String to, String subject, String message);
    
    /**
     * Отправляет HTML email
     * @param to получатель
     * @param subject тема
     * @param htmlContent HTML содержимое
     * @return true если отправка прошла успешно
     */
    boolean sendHtmlEmail(String to, String subject, String htmlContent);
    
    /**
     * Проверяет доступность email сервиса
     * @return true если сервис доступен
     */
    boolean isEmailServiceAvailable();
} 