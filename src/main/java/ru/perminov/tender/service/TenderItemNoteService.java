package ru.perminov.tender.service;

import ru.perminov.tender.dto.tender.TenderItemNoteDto;

import java.util.UUID;

public interface TenderItemNoteService {
    TenderItemNoteDto get(UUID tenderItemId, UUID supplierId);
    TenderItemNoteDto upsert(UUID tenderItemId, UUID supplierId, String note);
}


