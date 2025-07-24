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

@RestController
@RequestMapping("/api/audit-logs")
@RequiredArgsConstructor
public class AuditLogController {
    private final AuditLogRepository auditLogRepository;

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<Page<AuditLog>> getAll(
            @RequestParam(required = false) String user,
            @RequestParam(required = false) String action,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        PageRequest pageable = PageRequest.of(page, size);
        if (user != null && action != null && from != null && to != null) {
            return ResponseEntity.ok(auditLogRepository.findByUser_NameContainingIgnoreCaseAndActionContainingIgnoreCaseAndTimestampBetween(user, action, from, to, pageable));
        } else if (user != null && action != null) {
            // Фильтр по пользователю и действию
            var pageResult = auditLogRepository.findByUser_NameContainingIgnoreCase(user, pageable);
            var filtered = pageResult.getContent().stream()
                .filter(log -> log.getAction() != null && log.getAction().toLowerCase().contains(action.toLowerCase()))
                .toList();
            return ResponseEntity.ok(new PageImpl<>(filtered, pageable, pageResult.getTotalElements()));
        } else if (user != null) {
            return ResponseEntity.ok(auditLogRepository.findByUser_NameContainingIgnoreCase(user, pageable));
        } else if (action != null) {
            return ResponseEntity.ok(auditLogRepository.findByActionContainingIgnoreCase(action, pageable));
        } else if (from != null && to != null) {
            return ResponseEntity.ok(auditLogRepository.findByTimestampBetween(from, to, pageable));
        } else {
            return ResponseEntity.ok(auditLogRepository.findAll(pageable));
        }
    }
} 