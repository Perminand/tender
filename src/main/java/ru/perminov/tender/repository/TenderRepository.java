package ru.perminov.tender.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ru.perminov.tender.model.Tender;

import java.util.List;
import java.util.UUID;

public interface TenderRepository extends JpaRepository<Tender, UUID> {
    List<Tender> findByStatus(Tender.TenderStatus status);
    List<Tender> findByCustomerId(UUID customerId);
} 