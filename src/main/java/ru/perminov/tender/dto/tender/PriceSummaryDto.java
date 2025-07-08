package ru.perminov.tender.dto.tender;

import java.util.List;

public record PriceSummaryDto(
    Double totalEstimatedPrice,
    Double totalBestPrice,
    Double totalSavings,
    Double savingsPercentage,
    Integer totalProposals,
    Integer activeSuppliers,
    Double averagePriceDeviation,
    List<String> suppliersWithBestPrices
) {} 