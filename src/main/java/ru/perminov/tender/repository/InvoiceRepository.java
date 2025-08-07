package ru.perminov.tender.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import ru.perminov.tender.model.Invoice;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, UUID> {
    
    List<Invoice> findByRequestId(UUID requestId);
    
    @Query("SELECT DISTINCT i FROM Invoice i LEFT JOIN FETCH i.invoiceItems ii LEFT JOIN FETCH ii.unit LEFT JOIN FETCH ii.material WHERE i.request.id = :requestId")
    List<Invoice> findByRequestIdWithItemsAndUnits(@Param("requestId") UUID requestId);
    
    List<Invoice> findByContractId(UUID contractId);
    
    @Query("SELECT DISTINCT i FROM Invoice i LEFT JOIN FETCH i.invoiceItems ii LEFT JOIN FETCH ii.unit LEFT JOIN FETCH ii.material WHERE i.contract.id = :contractId")
    List<Invoice> findByContractIdWithItemsAndUnits(@Param("contractId") UUID contractId);
    
    List<Invoice> findBySupplierId(UUID supplierId);
    
    List<Invoice> findByStatus(Invoice.InvoiceStatus status);
    
    @Query("SELECT i FROM Invoice i WHERE i.request.id = :requestId ORDER BY i.invoiceDate DESC")
    List<Invoice> findInvoicesByRequestOrderByDate(@Param("requestId") UUID requestId);
    
    @Query("SELECT i FROM Invoice i WHERE i.status = 'PAID' AND i.request.id = :requestId")
    List<Invoice> findPaidInvoicesByRequest(@Param("requestId") UUID requestId);
    
    @Query("SELECT i FROM Invoice i WHERE i.status IN ('SENT', 'CONFIRMED', 'PARTIALLY_PAID') AND i.request.id = :requestId")
    List<Invoice> findPendingInvoicesByRequest(@Param("requestId") UUID requestId);
    
    @Query("SELECT i FROM Invoice i WHERE i.dueDate < :today AND i.status NOT IN ('PAID', 'CANCELLED')")
    List<Invoice> findOverdueInvoices(@Param("today") LocalDate today);
    
    @Query("SELECT i FROM Invoice i WHERE i.status IN ('SENT', 'CONFIRMED', 'PARTIALLY_PAID')")
    List<Invoice> findPendingPaymentInvoices();
    
    @Query("SELECT DISTINCT i FROM Invoice i LEFT JOIN FETCH i.invoiceItems ii LEFT JOIN FETCH ii.unit LEFT JOIN FETCH ii.material WHERE i.id = :id")
    Optional<Invoice> findByIdWithItemsAndUnits(@Param("id") UUID id);
    
    default List<Invoice> findOverdueInvoices() {
        return findOverdueInvoices(LocalDate.now());
    }
} 