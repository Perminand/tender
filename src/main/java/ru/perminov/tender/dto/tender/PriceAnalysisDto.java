package ru.perminov.tender.dto.tender;

import java.util.List;
import java.util.UUID;

public record PriceAnalysisDto(
    UUID tenderId,
    String tenderNumber,
    String tenderTitle,
    List<PriceAnalysisItemDto> items,
    PriceSummaryDto summary
) {}

