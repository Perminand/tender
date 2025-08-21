package ru.perminov.tender.service;

import ru.perminov.tender.model.TenderItemDeliveryOverride;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public interface TenderItemDeliveryOverrideService {
    TenderItemDeliveryOverride upsert(UUID tenderItemId, UUID supplierId, BigDecimal amount);
    List<TenderItemDeliveryOverride> getByTenderItemIds(List<UUID> tenderItemIds);
}


