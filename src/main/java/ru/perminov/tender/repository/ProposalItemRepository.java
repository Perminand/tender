package ru.perminov.tender.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ru.perminov.tender.model.ProposalItem;

import java.util.List;
import java.util.UUID;
import java.util.Optional;

public interface ProposalItemRepository extends JpaRepository<ProposalItem, UUID> {

    List<ProposalItem> findBySupplierProposalId(UUID supplierProposalId);

    List<ProposalItem> findByTenderItemId(UUID tenderItemId);

    boolean existsBySupplierProposalIdAndTenderItemId(UUID supplierProposalId, UUID tenderItemId);

    Optional<ProposalItem> findFirstByTenderItem_IdAndTotalPrice(UUID tenderItemId, Double totalPrice);
    
    List<ProposalItem> findAllByTenderItem_IdAndTotalPriceOrderBySupplierProposal_SubmissionDateAsc(UUID tenderItemId, Double totalPrice);
} 