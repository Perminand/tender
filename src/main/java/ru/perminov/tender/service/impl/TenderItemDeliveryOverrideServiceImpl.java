package ru.perminov.tender.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.perminov.tender.model.TenderItemDeliveryOverride;
import ru.perminov.tender.repository.TenderItemDeliveryOverrideRepository;
import ru.perminov.tender.service.TenderItemDeliveryOverrideService;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TenderItemDeliveryOverrideServiceImpl implements TenderItemDeliveryOverrideService {

    private final TenderItemDeliveryOverrideRepository repository;

    @Override
    @Transactional
    public TenderItemDeliveryOverride upsert(UUID tenderItemId, UUID supplierId, BigDecimal amount) {
        TenderItemDeliveryOverride entity = repository
                .findByTenderItemIdAndSupplierId(tenderItemId, supplierId)
                .orElseGet(TenderItemDeliveryOverride::new);
        entity.setTenderItemId(tenderItemId);
        entity.setSupplierId(supplierId);
        entity.setAmount(amount);
        return repository.save(entity);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TenderItemDeliveryOverride> getByTenderItemIds(List<UUID> tenderItemIds) {
        return repository.findByTenderItemIdIn(tenderItemIds);
    }
}


