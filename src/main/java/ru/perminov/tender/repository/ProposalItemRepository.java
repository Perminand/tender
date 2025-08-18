package ru.perminov.tender.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import ru.perminov.tender.model.ProposalItem;

import java.util.List;
import java.util.UUID;
import java.util.Optional;

public interface ProposalItemRepository extends JpaRepository<ProposalItem, UUID> {

    List<ProposalItem> findBySupplierProposalId(UUID supplierProposalId);

    @Query("SELECT pi FROM ProposalItem pi JOIN pi.supplierProposal sp JOIN sp.supplier s WHERE pi.tenderItem.id = :tenderItemId AND s.id = :supplierId")
    Optional<ProposalItem> findByTenderItemIdAndSupplierId(@Param("tenderItemId") UUID tenderItemId, @Param("supplierId") UUID supplierId);

    @Query("SELECT pi FROM ProposalItem pi LEFT JOIN FETCH pi.unit WHERE pi.supplierProposal.id = :supplierProposalId")
    List<ProposalItem> findBySupplierProposalIdWithUnit(UUID supplierProposalId);

    @Query("SELECT pi FROM ProposalItem pi LEFT JOIN FETCH pi.tenderItem WHERE pi.supplierProposal.id = :supplierProposalId")
    List<ProposalItem> findBySupplierProposalIdWithTenderItem(UUID supplierProposalId);

    List<ProposalItem> findByTenderItemId(UUID tenderItemId);

    boolean existsBySupplierProposalIdAndTenderItemId(UUID supplierProposalId, UUID tenderItemId);

    Optional<ProposalItem> findFirstByTenderItem_IdAndTotalPrice(UUID tenderItemId, Double totalPrice);
    
    List<ProposalItem> findAllByTenderItem_IdAndTotalPriceOrderBySupplierProposal_SubmissionDateAsc(UUID tenderItemId, Double totalPrice);
} 