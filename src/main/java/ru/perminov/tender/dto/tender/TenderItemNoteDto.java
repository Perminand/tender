package ru.perminov.tender.dto.tender;

import java.util.UUID;

public record TenderItemNoteDto(
        UUID id,
        UUID tenderItemId,
        UUID supplierId,
        String note
) {}


