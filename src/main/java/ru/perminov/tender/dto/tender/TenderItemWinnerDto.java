package ru.perminov.tender.dto.tender;

import java.util.List;
import java.util.UUID;

public record TenderItemWinnerDto(
    UUID tenderItemId,
    Integer itemNumber,
    String description,
    Double quantity,
    String unitName,
    Double estimatedPrice,
    SupplierPriceDto winner,
    SupplierPriceDto secondPrice,
    List<SupplierPriceDto> allPrices,
    Double totalSavings,
    Double savingsPercentage,
    Double totalEstimatedPrice,
    Double totalWinnerPrice
) {}
