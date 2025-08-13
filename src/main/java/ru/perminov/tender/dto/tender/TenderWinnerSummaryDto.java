package ru.perminov.tender.dto.tender;

import java.util.List;
import java.util.UUID;

public record TenderWinnerSummaryDto(
    Double totalEstimatedPrice,
    Double totalWinnerPrice,
    Double totalSavings,
    Double savingsPercentage,
    Integer totalProposals,
    Integer uniqueWinners,
    List<String> winnerSuppliers,
    List<String> secondPriceSuppliers,
    Double averagePriceDeviation,
    Double totalVatAmount,
    Double totalDeliveryCost
) {}
