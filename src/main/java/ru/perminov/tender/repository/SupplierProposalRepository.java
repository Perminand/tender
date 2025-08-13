package ru.perminov.tender.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
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
} 