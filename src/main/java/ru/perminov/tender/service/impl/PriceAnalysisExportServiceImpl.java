package ru.perminov.tender.service.impl;

import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import ru.perminov.tender.dto.tender.PriceAnalysisDto;
import ru.perminov.tender.dto.tender.PriceAnalysisItemDto;
import ru.perminov.tender.dto.tender.SupplierPriceDto;
import ru.perminov.tender.dto.tender.PriceSummaryDto;
import ru.perminov.tender.service.PriceAnalysisExportService;
import ru.perminov.tender.service.PriceAnalysisService;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PriceAnalysisExportServiceImpl implements PriceAnalysisExportService {

    private final PriceAnalysisService priceAnalysisService;

    @Override
    public ByteArrayOutputStream exportPriceAnalysisToExcel(UUID tenderId) throws IOException {
        PriceAnalysisDto analysis = priceAnalysisService.getPriceAnalysis(tenderId);
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            // Сводка
            Sheet summarySheet = workbook.createSheet("Сводка");
            createSummarySheet(summarySheet, analysis.summary(), analysis);

            // Анализ по позициям
            Sheet itemsSheet = workbook.createSheet("Позиции");
            createItemsSheet(itemsSheet, analysis.items());

            // Детальная таблица цен
            Sheet detailsSheet = workbook.createSheet("Детализация");
            createDetailsSheet(detailsSheet, analysis.items());

            // Рекомендации
            Sheet recSheet = workbook.createSheet("Рекомендации");
            createRecommendationsSheet(recSheet, tenderId);

            workbook.write(out);
            return out;
        }
    }

    private void createSummarySheet(Sheet sheet, PriceSummaryDto summary, PriceAnalysisDto analysis) {
        int rowIdx = 0;
        Row row = sheet.createRow(rowIdx++);
        row.createCell(0).setCellValue("Тендер");
        row.createCell(1).setCellValue(analysis.tenderNumber() + " - " + analysis.tenderTitle());

        row = sheet.createRow(rowIdx++);
        row.createCell(0).setCellValue("Экономия");
        row.createCell(1).setCellValue(summary.totalSavings());

        row = sheet.createRow(rowIdx++);
        row.createCell(0).setCellValue("Сметная стоимость");
        row.createCell(1).setCellValue(summary.totalEstimatedPrice());

        row = sheet.createRow(rowIdx++);
        row.createCell(0).setCellValue("Лучшая цена");
        row.createCell(1).setCellValue(summary.totalBestPrice());

        row = sheet.createRow(rowIdx++);
        row.createCell(0).setCellValue("Отклонение цен");
        row.createCell(1).setCellValue(summary.averagePriceDeviation());

        row = sheet.createRow(rowIdx++);
        row.createCell(0).setCellValue("Поставщиков");
        row.createCell(1).setCellValue(summary.activeSuppliers());

        row = sheet.createRow(rowIdx++);
        row.createCell(0).setCellValue("Предложений");
        row.createCell(1).setCellValue(summary.totalProposals());
    }

    private void createItemsSheet(Sheet sheet, List<PriceAnalysisItemDto> items) {
        int rowIdx = 0;
        Row header = sheet.createRow(rowIdx++);
        header.createCell(0).setCellValue("№");
        header.createCell(1).setCellValue("Описание");
        header.createCell(2).setCellValue("Кол-во");
        header.createCell(3).setCellValue("Ед. изм.");
        header.createCell(4).setCellValue("Сметная цена");
        header.createCell(5).setCellValue("Лучшая цена");
        header.createCell(6).setCellValue("Отклонение");
        header.createCell(7).setCellValue("Предложений");
        header.createCell(8).setCellValue("Лучший поставщик");

        for (PriceAnalysisItemDto item : items) {
            Row row = sheet.createRow(rowIdx++);
            row.createCell(0).setCellValue(item.itemNumber());
            row.createCell(1).setCellValue(item.description());
            row.createCell(2).setCellValue(item.quantity());
            row.createCell(3).setCellValue(item.unitName());
            row.createCell(4).setCellValue(item.estimatedPrice());
            row.createCell(5).setCellValue(item.bestPrice() != null ? item.bestPrice().unitPrice() : null);
            row.createCell(6).setCellValue(item.priceDeviation());
            row.createCell(7).setCellValue(item.proposalsCount());
            row.createCell(8).setCellValue(item.bestPrice() != null ? item.bestPrice().supplierName() : "");
        }
    }

    private void createDetailsSheet(Sheet sheet, List<PriceAnalysisItemDto> items) {
        int rowIdx = 0;
        Row header = sheet.createRow(rowIdx++);
        header.createCell(0).setCellValue("Позиция");
        header.createCell(1).setCellValue("Поставщик");
        header.createCell(2).setCellValue("Цена за ед.");
        header.createCell(3).setCellValue("Общая цена");
        header.createCell(4).setCellValue("Срок поставки");
        header.createCell(5).setCellValue("Гарантия");
        header.createCell(6).setCellValue("Статус");

        for (PriceAnalysisItemDto item : items) {
            for (SupplierPriceDto price : item.supplierPrices()) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(item.itemNumber());
                row.createCell(1).setCellValue(price.supplierName());
                row.createCell(2).setCellValue(price.unitPrice());
                row.createCell(3).setCellValue(price.totalPrice());
                row.createCell(4).setCellValue(price.deliveryPeriod());
                row.createCell(5).setCellValue(price.warranty());
                row.createCell(6).setCellValue(price.isBestPrice() ? "Лучшая" : "Обычная");
            }
        }
    }

    private void createRecommendationsSheet(Sheet sheet, UUID tenderId) {
        List<String> recs = priceAnalysisService.getSupplierRecommendations(tenderId);
        int rowIdx = 0;
        Row header = sheet.createRow(rowIdx++);
        header.createCell(0).setCellValue("Рекомендации");
        for (String rec : recs) {
            Row row = sheet.createRow(rowIdx++);
            row.createCell(0).setCellValue(rec);
        }
    }
} 