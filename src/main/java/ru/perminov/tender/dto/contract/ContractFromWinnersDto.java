package ru.perminov.tender.dto.contract;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record ContractFromWinnersDto(
    UUID tenderId,
    String title,
    LocalDate startDate,
    LocalDate endDate,
    String description,
    List<SelectedWinnerItemDto> selectedItems
) {
    public record SelectedWinnerItemDto(
        UUID tenderItemId,
        UUID supplierId
    ) {}
}
