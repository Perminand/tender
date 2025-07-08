package ru.perminov.tender.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import ru.perminov.tender.model.company.Company;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "audit_logs")
@Getter
@Setter
@ToString
@NoArgsConstructor
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private Company user;

    private String action;

    private String entityType;

    private String entityId;

    private String oldValue;

    private String newValue;

    private String ipAddress;

    private String userAgent;

    private LocalDateTime timestamp = LocalDateTime.now();

    private String sessionId;

    private String description;

    @Enumerated(EnumType.STRING)
    private AuditLevel level = AuditLevel.INFO;

    public enum AuditLevel {
        DEBUG,      // Отладочная информация
        INFO,       // Информация
        WARNING,    // Предупреждение
        ERROR,      // Ошибка
        CRITICAL    // Критическая ошибка
    }
} 