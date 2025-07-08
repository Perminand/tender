package ru.perminov.tender.service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.UUID;

public interface PriceAnalysisExportService {
    /**
     * Генерирует Excel-отчет по анализу цен для тендера
     * @param tenderId ID тендера
     * @return ByteArrayOutputStream с Excel-файлом
     */
    ByteArrayOutputStream exportPriceAnalysisToExcel(UUID tenderId) throws IOException;
} 