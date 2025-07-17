package ru.perminov.tender.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "alerts")
@Getter
@Setter
@ToString
@NoArgsConstructor
public class Alert {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private String title;

    private String message;

    private String description;

    @Enumerated(EnumType.STRING)
    private AlertType type;

    @Enumerated(EnumType.STRING)
    private AlertSeverity severity;

    @Enumerated(EnumType.STRING)
    private AlertStatus status = AlertStatus.ACTIVE;

    // Связи с сущностями
    private UUID entityId;
    private String entityType; // TENDER, CONTRACT, DELIVERY, PAYMENT, SUPPLIER

    // Целевые пользователи
    private String targetUser;
    private String targetRole;
    private String targetDepartment;

    // Временные параметры
    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime expiresAt;
    private LocalDateTime acknowledgedAt;
    private LocalDateTime resolvedAt;

    // Дополнительные данные
    private String actionUrl;
    private String actionText;
    private String metadata; // JSON с дополнительными данными

    // Статистика
    private Integer viewCount = 0;
    private Boolean isRead = false;
    private Boolean isAcknowledged = false;
    private Boolean isResolved = false;

    public enum AlertType {
        OVERDUE_DELIVERY,      // Просроченная поставка
        BUDGET_EXCEEDED,       // Превышение бюджета
        TENDER_DEADLINE,       // Дедлайн тендера
        NEW_PROPOSAL,          // Новое предложение
        QUALITY_ISSUE,         // Проблема с качеством
        PAYMENT_OVERDUE,       // Просроченный платеж
        SUPPLIER_RATING_LOW,   // Низкий рейтинг поставщика
        CONTRACT_EXPIRING,     // Истекающий контракт
        SYSTEM_ERROR,          // Ошибка системы
        REMINDER,              // Напоминание
        WARNING,               // Предупреждение
        INFO                   // Информация
    }

    public enum AlertSeverity {
        LOW,        // Низкая важность
        MEDIUM,     // Средняя важность
        HIGH,       // Высокая важность
        CRITICAL    // Критическая важность
    }

    public enum AlertStatus {
        ACTIVE,         // Активный
        ACKNOWLEDGED,   // Подтвержден
        RESOLVED,       // Решен
        EXPIRED,        // Истек
        ARCHIVED        // Архивирован
    }

    // Методы для управления статусом
    public void acknowledge() {
        this.isAcknowledged = true;
        this.acknowledgedAt = LocalDateTime.now();
        this.status = AlertStatus.ACKNOWLEDGED;
    }

    public void resolve() {
        this.isResolved = true;
        this.resolvedAt = LocalDateTime.now();
        this.status = AlertStatus.RESOLVED;
    }

    public void markAsRead() {
        this.isRead = true;
        this.viewCount++;
    }

    public boolean isExpired() {
        return expiresAt != null && LocalDateTime.now().isAfter(expiresAt);
    }

    public boolean isUrgent() {
        return severity == AlertSeverity.CRITICAL || severity == AlertSeverity.HIGH;
    }
} 