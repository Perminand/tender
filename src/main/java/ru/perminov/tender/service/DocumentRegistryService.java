package ru.perminov.tender.service;

import java.io.ByteArrayInputStream;
import java.util.List;

public interface DocumentRegistryService {
    
    /**
     * Получить все документы для экспорта
     */
    List<ru.perminov.tender.dto.document.DocumentDto> getAllDocuments();
    
    /**
     * Экспортировать все документы в Excel
     */
    ByteArrayInputStream exportDocumentsToExcel();
} 