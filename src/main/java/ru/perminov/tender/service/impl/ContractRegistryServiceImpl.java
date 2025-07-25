package ru.perminov.tender.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import ru.perminov.tender.dto.contract.ContractDto;
import ru.perminov.tender.service.ContractRegistryService;
import ru.perminov.tender.service.ContractService;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ContractRegistryServiceImpl implements ContractRegistryService {

    private final ContractService contractService;

    @Override
    public List<ContractDto> getAllContracts() {
        log.info("Получение всех контрактов для экспорта");
        return contractService.getAllContracts();
    }

    @Override
    public ByteArrayInputStream exportContractsToExcel() {
        log.info("Экспорт контрактов в Excel");
        List<ContractDto> contracts = getAllContracts();
        
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Реестр контрактов");
            int rowIdx = 0;
            
            // Заголовки
            Row header = sheet.createRow(rowIdx++);
            String[] headers = {
                "№", "Номер контракта", "Название", "Статус", "Сумма", "Валюта",
                "Дата начала", "Дата окончания", "Условия оплаты", "Условия поставки",
                "Склад", "Дата создания"
            };
            
            for (int i = 0; i < headers.length; i++) {
                Cell cell = header.createCell(i);
                cell.setCellValue(headers[i]);
            }
            
            // Данные
            for (ContractDto contract : contracts) {
                Row row = sheet.createRow(rowIdx++);
                
                row.createCell(0).setCellValue(rowIdx - 1); // №
                row.createCell(1).setCellValue(contract.getContractNumber() != null ? contract.getContractNumber() : "");
                row.createCell(2).setCellValue(contract.getTitle() != null ? contract.getTitle() : "");
                row.createCell(3).setCellValue(getStatusRu(contract.getStatus()));
                row.createCell(4).setCellValue(contract.getTotalAmount() != null ? contract.getTotalAmount().doubleValue() : 0.0);
                row.createCell(5).setCellValue(contract.getCurrency() != null ? contract.getCurrency() : "RUB");
                row.createCell(6).setCellValue(contract.getStartDate() != null ? contract.getStartDate().toString() : "");
                row.createCell(7).setCellValue(contract.getEndDate() != null ? contract.getEndDate().toString() : "");
                row.createCell(8).setCellValue(contract.getPaymentTerms() != null ? contract.getPaymentTerms() : "");
                row.createCell(9).setCellValue(contract.getDeliveryTerms() != null ? contract.getDeliveryTerms() : "");
                row.createCell(10).setCellValue(contract.getWarehouseName() != null ? contract.getWarehouseName() : "");
                row.createCell(11).setCellValue(contract.getCreatedAt() != null ? contract.getCreatedAt().toString() : "");
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
            log.error("Ошибка при экспорте контрактов в Excel", e);
            throw new RuntimeException("Ошибка экспорта в Excel", e);
        }
    }

    private String getStatusRu(String status) {
        if (status == null) return "";
        return switch (status) {
            case "DRAFT" -> "Черновик";
            case "ACTIVE" -> "Активный";
            case "COMPLETED" -> "Завершен";
            case "TERMINATED" -> "Расторгнут";
            case "SUSPENDED" -> "Приостановлен";
            default -> status;
        };
    }
} 