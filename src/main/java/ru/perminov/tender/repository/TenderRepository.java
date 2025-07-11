package ru.perminov.tender.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import ru.perminov.tender.model.Tender;

import java.util.List;
import java.util.UUID;

public interface TenderRepository extends JpaRepository<Tender, UUID> {
    List<Tender> findByStatus(Tender.TenderStatus status);
    List<Tender> findByCustomerId(UUID customerId);
    long countByStatus(Tender.TenderStatus status);

    @Query("SELECT COUNT(DISTINCT t) FROM Tender t WHERE EXISTS (SELECT 1 FROM SupplierProposal sp WHERE sp.tender = t)")
    long countTendersWithProposals();

    List<Tender> findByParentTenderId(UUID parentTenderId);
    boolean existsByParentTenderId(UUID parentTenderId);
} 