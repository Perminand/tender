package ru.perminov.tender.dto.tender;

import java.util.List;
import java.util.UUID;

public record TenderWinnerDto(
    UUID tenderId,
    String tenderNumber,
    String tenderTitle,
    List<TenderItemWinnerDto> itemWinners,
    TenderWinnerSummaryDto summary
) {}
