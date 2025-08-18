package ru.perminov.tender.service;

import java.util.UUID;

public interface TenderWinnersExportService {
    byte[] exportWinnersToExcel(UUID tenderId);
}


