package ru.perminov.tender.dto;

public record AnalyticsStatsDto(
    long totalTenders,
    long tendersWithProposals,
    long tendersWithoutProposals,
    long totalProposals,
    double averageProposalsPerTender,
    long activeTenders,
    long completedTenders,
    long cancelledTenders
) {} 