package ru.perminov.tender.dto;

import lombok.Data;
import ru.perminov.tender.model.Alert;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class AlertDto {
    private UUID id;
    private String title;
    private String message;
    private String description;
    private Alert.AlertType type;
    private Alert.AlertSeverity severity;
    private Alert.AlertStatus status;
    
    // Связи с сущностями
    private UUID entityId;
    private String entityType;
    
    // Целевые пользователи
    private String targetUser;
    private String targetRole;
    private String targetDepartment;
    
    // Временные параметры
    private LocalDateTime createdAt;
    private LocalDateTime expiresAt;
    private LocalDateTime acknowledgedAt;
    private LocalDateTime resolvedAt;
    
    // Дополнительные данные
    private String actionUrl;
    private String actionText;
    private String metadata;
    
    // Статистика
    private Integer viewCount;
    private Boolean isRead;
    private Boolean isAcknowledged;
    private Boolean isResolved;
} 