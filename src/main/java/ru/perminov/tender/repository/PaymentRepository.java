package ru.perminov.tender.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import ru.perminov.tender.model.Payment;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, UUID> {
    
    /**
     * Найти платежи по статусу
     */
    List<Payment> findByStatus(Payment.PaymentStatus status);
    
    /**
     * Найти платежи по контракту
     */
    List<Payment> findByContractId(UUID contractId);
    
    /**
     * Найти платежи по поставщику
     */
    List<Payment> findBySupplierId(UUID supplierId);
    
    /**
     * Найти платежи по типу
     */
    List<Payment> findByType(Payment.PaymentType type);
    
    /**
     * Найти платеж по номеру
     */
    Payment findByPaymentNumber(String paymentNumber);
    
    /**
     * Найти просроченные платежи
     */
    @Query("SELECT p FROM Payment p WHERE p.dueDate < :currentDate AND p.status = 'PENDING'")
    List<Payment> findOverduePayments(@Param("currentDate") LocalDateTime currentDate);
    
    /**
     * Найти платежи с датой оплаты
     */
    List<Payment> findByPaidDateBetween(LocalDateTime startDate, LocalDateTime endDate);
    
    /**
     * Получить общую сумму платежей по контракту
     */
    @Query("SELECT SUM(p.amount) FROM Payment p WHERE p.contract.id = :contractId AND p.status = 'PAID'")
    BigDecimal getTotalPaidAmountByContract(@Param("contractId") UUID contractId);
    
    /**
     * Получить общую сумму задолженности по контракту
     */
    @Query("SELECT SUM(p.amount) FROM Payment p WHERE p.contract.id = :contractId AND p.status = 'PENDING'")
    BigDecimal getTotalPendingAmountByContract(@Param("contractId") UUID contractId);

    long countByStatus(Payment.PaymentStatus status);
} 