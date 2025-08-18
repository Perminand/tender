package ru.perminov.tender.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import ru.perminov.tender.model.Contract;
import java.util.Optional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface ContractRepository extends JpaRepository<Contract, UUID> {
    
    /**
     * Найти контракты по статусу
     */
    List<Contract> findByStatus(Contract.ContractStatus status);
    
    /**
     * Найти контракты по тендеру
     */
    List<Contract> findByTenderId(UUID tenderId);

    @Query("SELECT c FROM Contract c WHERE c.tender.id = :tenderId AND c.supplierProposal.supplier.id = :supplierId AND c.status IN ('DRAFT','ACTIVE','IN_PROGRESS')")
    Optional<Contract> findExistingByTenderAndSupplier(@Param("tenderId") UUID tenderId, @Param("supplierId") UUID supplierId);
    
    /**
     * Найти контракты по заявке (через тендер)
     */
    @Query("SELECT c FROM Contract c JOIN c.tender t WHERE t.request.id = :requestId")
    List<Contract> findByTenderRequestId(@Param("requestId") UUID requestId);
    
    /**
     * Найти контракт по номеру
     */
    Contract findByContractNumber(String contractNumber);
    
    /**
     * Найти активные контракты
     */
    @Query("SELECT c FROM Contract c WHERE c.status IN ('ACTIVE', 'IN_PROGRESS')")
    List<Contract> findActiveContracts();
    
    /**
     * Найти контракты с истекающим сроком
     */
    @Query("SELECT c FROM Contract c WHERE c.endDate <= :endDate AND c.status = 'ACTIVE'")
    List<Contract> findContractsExpiringBy(@Param("endDate") LocalDate endDate);

    long countByStatus(Contract.ContractStatus status);
} 