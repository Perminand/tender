package ru.perminov.tender.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import ru.perminov.tender.dto.document.DocumentDto;
import ru.perminov.tender.service.DocumentRegistryService;
import ru.perminov.tender.service.DocumentService;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class DocumentRegistryServiceImpl implements DocumentRegistryService {

    private final DocumentService documentService;

    @Override
    public List<DocumentDto> getAllDocuments() {
        log.info("Получение всех документов для экспорта");
        return documentService.getAllDocuments();
    }

    @Override
    public ByteArrayInputStream exportDocumentsToExcel() {
        log.info("Экспорт документов в Excel");
        List<DocumentDto> documents = getAllDocuments();
        
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Реестр документов");
            int rowIdx = 0;
            
            // Заголовки
            Row header = sheet.createRow(rowIdx++);
            String[] headers = {
                "№", "Номер документа", "Название", "Тип документа", "Статус",
                "Размер файла", "MIME-тип", "Дата загрузки", "Дата подписания",
                "Примечания"
            };
            
            for (int i = 0; i < headers.length; i++) {
                Cell cell = header.createCell(i);
                cell.setCellValue(headers[i]);
            }
            
            // Данные
            for (DocumentDto document : documents) {
                Row row = sheet.createRow(rowIdx++);
                
                row.createCell(0).setCellValue(rowIdx - 1); // №
                row.createCell(1).setCellValue(document.getDocumentNumber() != null ? document.getDocumentNumber() : "");
                row.createCell(2).setCellValue(document.getTitle() != null ? document.getTitle() : "");
                row.createCell(3).setCellValue(getDocumentTypeRu(document.getDocumentType()));
                row.createCell(4).setCellValue(getStatusRu(document.getStatus()));
                row.createCell(5).setCellValue(document.getFileSize() != null ? formatFileSize(document.getFileSize()) : "");
                row.createCell(6).setCellValue(document.getMimeType() != null ? document.getMimeType() : "");
                row.createCell(7).setCellValue(document.getUploadedAt() != null ? document.getUploadedAt().toString() : "");
                row.createCell(8).setCellValue(document.getCreatedAt() != null ? document.getCreatedAt().toString() : "");
                row.createCell(9).setCellValue(document.getVersion() != null ? document.getVersion() : "");
            }
            
            // Автоподбор ширины столбцов
            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }
            
            try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
                workbook.write(out);
                return new ByteArrayInputStream(out.toByteArray());
            }
        } catch (IOException e) {
            log.error("Ошибка при экспорте документов в Excel", e);
            throw new RuntimeException("Ошибка экспорта в Excel", e);
        }
    }

    private String getStatusRu(String status) {
        if (status == null) return "";
        return switch (status) {
            case "DRAFT" -> "Черновик";
            case "UPLOADED" -> "Загружен";
            case "SIGNED" -> "Подписан";
            case "EXPIRED" -> "Истек";
            case "ACTIVE" -> "Активный";
            default -> status;
        };
    }

    private String getDocumentTypeRu(String documentType) {
        if (documentType == null) return "";
        return switch (documentType) {
            case "CONTRACT" -> "Контракт";
            case "INVOICE" -> "Счет";
            case "ACT" -> "Акт";
            case "SPECIFICATION" -> "Спецификация";
            case "CERTIFICATE" -> "Сертификат";
            case "COMMERCIAL_OFFER" -> "Коммерческое предложение";
            case "TECHNICAL_SPECIFICATION" -> "Техническое задание";
            case "PROTOCOL" -> "Протокол";
            default -> documentType;
        };
    }

    private String formatFileSize(Long bytes) {
        if (bytes == null || bytes == 0) return "0 Bytes";
        final String[] units = new String[] { "Bytes", "KB", "MB", "GB", "TB" };
        int digitGroups = (int) (Math.log10(bytes) / Math.log10(1024));
        return String.format("%.1f %s", bytes / Math.pow(1024, digitGroups), units[digitGroups]);
    }
} 