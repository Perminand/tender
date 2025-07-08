package ru.perminov.tender.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import ru.perminov.tender.model.Notification;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, UUID> {
    
    List<Notification> findByStatus(Notification.NotificationStatus status);
    
    List<Notification> findByType(Notification.NotificationType type);
    
    List<Notification> findByRecipientEmail(String recipientEmail);
    
    List<Notification> findByTenderId(UUID tenderId);
    
    List<Notification> findByRecipientCompanyId(UUID companyId);
    
    @Query("SELECT n FROM Notification n WHERE n.status = 'PENDING' AND n.createdAt < :before")
    List<Notification> findPendingNotificationsBefore(@Param("before") LocalDateTime before);
    
    @Query("SELECT n FROM Notification n WHERE n.tender.id = :tenderId AND n.type = :type")
    List<Notification> findByTenderIdAndType(@Param("tenderId") UUID tenderId, 
                                           @Param("type") Notification.NotificationType type);
    
    @Query("SELECT COUNT(n) FROM Notification n WHERE n.tender.id = :tenderId AND n.status = 'SENT'")
    long countSentNotificationsByTenderId(@Param("tenderId") UUID tenderId);
    
    @Query("SELECT DISTINCT c.email FROM Company c WHERE c.role IN ('SUPPLIER', 'BOTH') AND c.email IS NOT NULL")
    List<String> findSupplierEmailsByRole();
    
    @Query("SELECT DISTINCT c.email FROM Company c WHERE c.role IN ('CUSTOMER', 'BOTH') AND c.email IS NOT NULL")
    List<String> findCustomerEmailsByRole();

    List<Notification> findAllByOrderByCreatedAtDesc();
} 