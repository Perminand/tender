package ru.perminov.tender.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ru.perminov.tender.model.SupplierProposal;

import java.util.List;
import java.util.UUID;

public interface SupplierProposalRepository extends JpaRepository<SupplierProposal, UUID> {
    List<SupplierProposal> findByTenderId(UUID tenderId);
    List<SupplierProposal> findBySupplierId(UUID supplierId);
    List<SupplierProposal> findByStatus(SupplierProposal.ProposalStatus status);
} 