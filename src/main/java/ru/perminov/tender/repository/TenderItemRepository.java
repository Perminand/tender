package ru.perminov.tender.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ru.perminov.tender.model.TenderItem;

import java.util.List;
import java.util.UUID;

public interface TenderItemRepository extends JpaRepository<TenderItem, UUID> {
    List<TenderItem> findByTenderId(UUID tenderId);
} 