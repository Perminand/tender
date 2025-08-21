package ru.perminov.tender.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ru.perminov.tender.model.TenderItemDeliveryOverride;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TenderItemDeliveryOverrideRepository extends JpaRepository<TenderItemDeliveryOverride, UUID> {
    Optional<TenderItemDeliveryOverride> findByTenderItemIdAndSupplierId(UUID tenderItemId, UUID supplierId);
    List<TenderItemDeliveryOverride> findByTenderItemIdIn(List<UUID> tenderItemIds);
}


