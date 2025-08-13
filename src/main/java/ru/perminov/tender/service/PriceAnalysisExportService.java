package ru.perminov.tender.service;

import java.io.ByteArrayOutputStream;
import java.util.UUID;

public interface PriceAnalysisExportService {
    
    /**
     * Экспортирует анализ цен тендера в Excel файл
     * 
     * @param tenderId ID тендера
     * @return ByteArrayOutputStream с Excel файлом
     */
    ByteArrayOutputStream exportPriceAnalysisToExcel(UUID tenderId);

    /**
     * Экспорт объединенного отчета по всем тендерам указанной заявки
     * в формате Excel (одна таблица, строки — позиции всех тендеров заявки,
     * колонки поставщиков — объединенные по всем тендерам).
     */
    ByteArrayOutputStream exportRequestTendersToExcel(UUID requestId);
} 