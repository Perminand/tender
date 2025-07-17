package ru.perminov.tender.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ru.perminov.tender.model.Alert;

import java.util.List;
import java.util.UUID;

@Repository
public interface AlertRepository extends JpaRepository<Alert, UUID> {
    
    List<Alert> findByTargetUserAndIsReadFalse(String username);
    
    List<Alert> findBySeverityInAndStatus(List<Alert.AlertSeverity> severities, Alert.AlertStatus status);
    
    List<Alert> findByTypeAndStatus(Alert.AlertType type, Alert.AlertStatus status);
    
    List<Alert> findByStatus(Alert.AlertStatus status);
    
    List<Alert> findByEntityIdAndEntityType(UUID entityId, String entityType);
} 