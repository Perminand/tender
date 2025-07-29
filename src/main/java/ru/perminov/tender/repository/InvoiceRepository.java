package ru.perminov.tender.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import ru.perminov.tender.model.Invoice;

import java.util.List;
import java.util.UUID;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, UUID> {
    
    List<Invoice> findByRequestId(UUID requestId);
    
    List<Invoice> findByContractId(UUID contractId);
    
    List<Invoice> findBySupplierId(UUID supplierId);
    
    @Query("SELECT i FROM Invoice i WHERE i.request.id = :requestId ORDER BY i.invoiceDate DESC")
    List<Invoice> findInvoicesByRequestOrderByDate(@Param("requestId") UUID requestId);
    
    @Query("SELECT i FROM Invoice i WHERE i.status = 'PAID' AND i.request.id = :requestId")
    List<Invoice> findPaidInvoicesByRequest(@Param("requestId") UUID requestId);
    
    @Query("SELECT i FROM Invoice i WHERE i.status IN ('SENT', 'CONFIRMED', 'PARTIALLY_PAID') AND i.request.id = :requestId")
    List<Invoice> findPendingInvoicesByRequest(@Param("requestId") UUID requestId);
} 