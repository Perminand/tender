package ru.perminov.tender.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import ru.perminov.tender.model.AuditLog;
import ru.perminov.tender.repository.AuditLogRepository;
import org.springframework.format.annotation.DateTimeFormat;
import java.time.LocalDateTime;

import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.PageImpl;
import ru.perminov.tender.dto.AuditLogDto;

@RestController
@RequestMapping("/api/audit-logs")
@RequiredArgsConstructor
public class AuditLogController {
    private final AuditLogRepository auditLogRepository;

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<Page<AuditLogDto>> getAll(
            @RequestParam(required = false) String user,
            @RequestParam(required = false) String action,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        PageRequest pageable = PageRequest.of(page, size);
        Page<AuditLog> logs;
        if (user != null && action != null && from != null && to != null) {
            logs = auditLogRepository.findByUser_UsernameContainingIgnoreCaseAndActionContainingIgnoreCaseAndTimestampBetween(user, action, from, to, pageable);
        } else if (user != null && action != null) {
            var pageResult = auditLogRepository.findByUser_UsernameContainingIgnoreCase(user, pageable);
            var filtered = pageResult.getContent().stream()
                .filter(log -> log.getAction() != null && log.getAction().toLowerCase().contains(action.toLowerCase()))
                .toList();
            logs = new PageImpl<>(filtered, pageable, pageResult.getTotalElements());
        } else if (user != null) {
            logs = auditLogRepository.findByUser_UsernameContainingIgnoreCase(user, pageable);
        } else if (action != null) {
            logs = auditLogRepository.findByActionContainingIgnoreCase(action, pageable);
        } else if (from != null && to != null) {
            logs = auditLogRepository.findByTimestampBetween(from, to, pageable);
        } else {
            logs = auditLogRepository.findAll(pageable);
        }
        // Маппинг AuditLog -> AuditLogDto
        Page<AuditLogDto> dtoPage = logs.map(log -> {
            AuditLogDto dto = new AuditLogDto();
            dto.setId(log.getId());
            dto.setUserName(log.getUser() != null ? log.getUser().getUsername() : null);
            dto.setAction(log.getAction());
            dto.setEntityType(log.getEntityType());
            dto.setEntityId(log.getEntityId());
            dto.setOldValue(log.getOldValue());
            dto.setNewValue(log.getNewValue());
            dto.setIpAddress(log.getIpAddress());
            dto.setUserAgent(log.getUserAgent());
            dto.setTimestamp(log.getTimestamp());
            dto.setSessionId(log.getSessionId());
            dto.setDescription(log.getDescription());
            dto.setLevel(log.getLevel() != null ? log.getLevel().name() : null);
            return dto;
        });
        return ResponseEntity.ok(dtoPage);
    }
} 