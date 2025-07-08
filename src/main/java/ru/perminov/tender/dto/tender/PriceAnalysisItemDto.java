package ru.perminov.tender.dto.tender;

import java.util.List;
import java.util.UUID;

public record PriceAnalysisItemDto(
    UUID tenderItemId,
    Integer itemNumber,
    String description,
    Double quantity,
    String unitName,
    Double estimatedPrice,
    List<SupplierPriceDto> supplierPrices,
    SupplierPriceDto bestPrice,
    Double priceDeviation,
    Integer proposalsCount
) {} 