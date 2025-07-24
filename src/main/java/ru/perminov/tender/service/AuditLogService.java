package ru.perminov.tender.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import ru.perminov.tender.model.AuditLog;
import ru.perminov.tender.model.User;
import ru.perminov.tender.repository.AuditLogRepository;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuditLogService {
    private final AuditLogRepository auditLogRepository;

    public void log(User user, String action, String entityType, String entityId, String oldValue, String newValue, String description, AuditLog.AuditLevel level, String ipAddress, String userAgent, String sessionId) {
        AuditLog log = new AuditLog();
        log.setUser(user);
        log.setAction(action);
        log.setEntityType(entityType);
        log.setEntityId(entityId);
        log.setOldValue(oldValue);
        log.setNewValue(newValue);
        log.setDescription(description);
        log.setLevel(level != null ? level : AuditLog.AuditLevel.INFO);
        log.setIpAddress(ipAddress);
        log.setUserAgent(userAgent);
        log.setSessionId(sessionId);
        log.setTimestamp(LocalDateTime.now());
        auditLogRepository.save(log);
    }

    // Упрощённая версия для быстрого аудита
    public void logSimple(User user, String action, String entityType, String entityId, String description) {
        log(user, action, entityType, entityId, null, null, description, AuditLog.AuditLevel.INFO, null, null, null);
    }
} 