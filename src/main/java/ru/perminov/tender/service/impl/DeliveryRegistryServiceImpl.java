package ru.perminov.tender.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import ru.perminov.tender.dto.delivery.DeliveryDto;
import ru.perminov.tender.service.DeliveryRegistryService;
import ru.perminov.tender.service.DeliveryService;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class DeliveryRegistryServiceImpl implements DeliveryRegistryService {

    private final DeliveryService deliveryService;

    @Override
    public List<DeliveryDto> getAllDeliveries() {
        log.info("Получение всех поставок для экспорта");
        return deliveryService.getAllDeliveries();
    }

    @Override
    public ByteArrayInputStream exportDeliveriesToExcel() {
        log.info("Экспорт поставок в Excel");
        List<DeliveryDto> deliveries = getAllDeliveries();
        
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Реестр поставок");
            int rowIdx = 0;
            
            // Заголовки
            Row header = sheet.createRow(rowIdx++);
            String[] headers = {
                "№", "Номер поставки", "Контракт", "Поставщик", "Склад", "Статус",
                "Плановая дата", "Фактическая дата", "Трек-номер", "Примечания",
                "Дата создания"
            };
            
            for (int i = 0; i < headers.length; i++) {
                Cell cell = header.createCell(i);
                cell.setCellValue(headers[i]);
            }
            
            // Данные
            for (DeliveryDto delivery : deliveries) {
                Row row = sheet.createRow(rowIdx++);
                
                row.createCell(0).setCellValue(rowIdx - 1); // №
                row.createCell(1).setCellValue(delivery.getDeliveryNumber() != null ? delivery.getDeliveryNumber() : "");
                row.createCell(2).setCellValue(delivery.getContractTitle() != null ? delivery.getContractTitle() : 
                    (delivery.getContractNumber() != null ? delivery.getContractNumber() : ""));
                row.createCell(3).setCellValue(delivery.getSupplierName() != null ? delivery.getSupplierName() : "");
                row.createCell(4).setCellValue(delivery.getWarehouseName() != null ? delivery.getWarehouseName() : "");
                row.createCell(5).setCellValue(getStatusRu(delivery.getStatus()));
                row.createCell(6).setCellValue(delivery.getPlannedDate() != null ? delivery.getPlannedDate().toString() : "");
                row.createCell(7).setCellValue(delivery.getActualDate() != null ? delivery.getActualDate().toString() : "");
                row.createCell(8).setCellValue(delivery.getTrackingNumber() != null ? delivery.getTrackingNumber() : "");
                row.createCell(9).setCellValue(delivery.getNotes() != null ? delivery.getNotes() : "");
                row.createCell(10).setCellValue(delivery.getCreatedAt() != null ? delivery.getCreatedAt().toString() : "");
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
            log.error("Ошибка при экспорте поставок в Excel", e);
            throw new RuntimeException("Ошибка экспорта в Excel", e);
        }
    }

    private String getStatusRu(String status) {
        if (status == null) return "";
        return switch (status) {
            case "PLANNED" -> "Запланирована";
            case "IN_TRANSIT" -> "В пути";
            case "DELIVERED" -> "Доставлена";
            case "ACCEPTED" -> "Принята";
            case "REJECTED" -> "Отклонена";
            case "CANCELLED" -> "Отменена";
            default -> status;
        };
    }
} 