package ru.perminov.tender.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.stereotype.Repository;
import ru.perminov.tender.model.AuditLog;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, UUID> {
    @Override
    @EntityGraph(attributePaths = {"user"})
    Page<AuditLog> findAll(Pageable pageable);

    @EntityGraph(attributePaths = {"user"})
    Page<AuditLog> findByUser_UsernameContainingIgnoreCase(String username, Pageable pageable);
    @EntityGraph(attributePaths = {"user"})
    Page<AuditLog> findByActionContainingIgnoreCase(String action, Pageable pageable);
    @EntityGraph(attributePaths = {"user"})
    Page<AuditLog> findByTimestampBetween(LocalDateTime from, LocalDateTime to, Pageable pageable);
    @EntityGraph(attributePaths = {"user"})
    Page<AuditLog> findByUser_UsernameContainingIgnoreCaseAndActionContainingIgnoreCaseAndTimestampBetween(
        String username, String action, LocalDateTime from, LocalDateTime to, Pageable pageable);
} 