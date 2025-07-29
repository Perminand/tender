package ru.perminov.tender.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import ru.perminov.tender.model.Receipt;

import java.util.List;
import java.util.UUID;

@Repository
public interface ReceiptRepository extends JpaRepository<Receipt, UUID> {
    
    List<Receipt> findByDeliveryId(UUID deliveryId);
    
    List<Receipt> findByInvoiceId(UUID invoiceId);
    
    List<Receipt> findBySupplierId(UUID supplierId);
    
    @Query("SELECT r FROM Receipt r WHERE r.delivery.contract.tender.request.id = :requestId ORDER BY r.receiptDate DESC")
    List<Receipt> findReceiptsByRequestOrderByDate(@Param("requestId") UUID requestId);
    
    @Query("SELECT r FROM Receipt r WHERE r.status = 'RECEIVED' AND r.delivery.contract.tender.request.id = :requestId")
    List<Receipt> findReceivedReceiptsByRequest(@Param("requestId") UUID requestId);
} 