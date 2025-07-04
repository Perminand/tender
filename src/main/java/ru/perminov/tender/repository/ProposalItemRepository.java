package ru.perminov.tender.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ru.perminov.tender.model.ProposalItem;

import java.util.List;
import java.util.UUID;

public interface ProposalItemRepository extends JpaRepository<ProposalItem, UUID> {
    List<ProposalItem> findBySupplierProposalId(UUID supplierProposalId);
    List<ProposalItem> findByTenderItemId(UUID tenderItemId);
} 