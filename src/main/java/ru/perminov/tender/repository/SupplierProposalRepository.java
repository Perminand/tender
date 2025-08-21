package ru.perminov.tender.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import ru.perminov.tender.model.SupplierProposal;

import java.util.List;
import java.util.UUID;

public interface SupplierProposalRepository extends JpaRepository<SupplierProposal, UUID> {
    List<SupplierProposal> findByTenderId(UUID tenderId);
    
    @Query("SELECT sp FROM SupplierProposal sp LEFT JOIN FETCH sp.supplier WHERE sp.tender.id = :tenderId")
    List<SupplierProposal> findByTenderIdWithSupplier(UUID tenderId);
    
    List<SupplierProposal> findBySupplierId(UUID supplierId);
    List<SupplierProposal> findByStatus(SupplierProposal.ProposalStatus status);
    List<SupplierProposal> findByTenderIdAndSupplierId(UUID tenderId, UUID supplierId);
    
    /**
     * Найти предложения по тендеру и поставщику с загрузкой связанных данных
     */
    @Query("SELECT sp FROM SupplierProposal sp " +
           "LEFT JOIN FETCH sp.supplier " +
           "LEFT JOIN FETCH sp.tender " +
           "WHERE sp.tender.id = :tenderId AND sp.supplier.id = :supplierId")
    List<SupplierProposal> findByTenderIdAndSupplierIdWithRelations(@Param("tenderId") UUID tenderId, @Param("supplierId") UUID supplierId);
    
    /**
     * Найти предложение по ID с загрузкой условия доставки
     */
    @Query("SELECT sp FROM SupplierProposal sp " +
           "LEFT JOIN FETCH sp.deliveryCondition " +
           "WHERE sp.id = :id")
    SupplierProposal findByIdWithDeliveryCondition(@Param("id") UUID id);
    
    /**
     * Найти предложение по ID с загрузкой условия оплаты
     */
    @Query("SELECT sp FROM SupplierProposal sp " +
           "LEFT JOIN FETCH sp.paymentCondition " +
           "WHERE sp.id = :id")
    SupplierProposal findByIdWithPaymentCondition(@Param("id") UUID id);
    
    /**
     * Найти предложение по ID с загрузкой условий доставки и оплаты
     */
    @Query("SELECT sp FROM SupplierProposal sp " +
           "LEFT JOIN FETCH sp.deliveryCondition " +
           "LEFT JOIN FETCH sp.paymentCondition " +
           "WHERE sp.id = :id")
    SupplierProposal findByIdWithConditions(@Param("id") UUID id);
} 