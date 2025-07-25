package ru.perminov.tender.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import ru.perminov.tender.dto.payment.PaymentDto;
import ru.perminov.tender.service.PaymentRegistryService;
import ru.perminov.tender.service.PaymentService;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentRegistryServiceImpl implements PaymentRegistryService {

    private final PaymentService paymentService;

    @Override
    public List<PaymentDto> getAllPayments() {
        log.info("Получение всех платежей для экспорта");
        return paymentService.getAllPayments();
    }

    @Override
    public ByteArrayInputStream exportPaymentsToExcel() {
        log.info("Экспорт платежей в Excel");
        List<PaymentDto> payments = getAllPayments();
        
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Реестр платежей");
            int rowIdx = 0;
            
            // Заголовки
            Row header = sheet.createRow(rowIdx++);
            String[] headers = {
                "№", "Номер платежа", "Контракт", "Поставщик", "Тип платежа", "Статус",
                "Сумма", "Дата платежа", "Дата оплаты", "Номер счета", "Примечания",
                "Дата создания"
            };
            
            for (int i = 0; i < headers.length; i++) {
                Cell cell = header.createCell(i);
                cell.setCellValue(headers[i]);
            }
            
            // Данные
            for (PaymentDto payment : payments) {
                Row row = sheet.createRow(rowIdx++);
                
                row.createCell(0).setCellValue(rowIdx - 1); // №
                row.createCell(1).setCellValue(payment.getPaymentNumber() != null ? payment.getPaymentNumber() : "");
                row.createCell(2).setCellValue(payment.getContractNumber() != null ? payment.getContractNumber() : "");
                row.createCell(3).setCellValue(payment.getSupplierName() != null ? payment.getSupplierName() : "");
                row.createCell(4).setCellValue(getPaymentTypeRu(payment.getPaymentType()));
                row.createCell(5).setCellValue(getStatusRu(payment.getStatus()));
                row.createCell(6).setCellValue(payment.getAmount() != null ? payment.getAmount().doubleValue() : 0.0);
                row.createCell(7).setCellValue(payment.getDueDate() != null ? payment.getDueDate().toString() : "");
                row.createCell(8).setCellValue(payment.getPaidDate() != null ? payment.getPaidDate().toString() : "");
                row.createCell(9).setCellValue(payment.getInvoiceNumber() != null ? payment.getInvoiceNumber() : "");
                row.createCell(10).setCellValue(payment.getNotes() != null ? payment.getNotes() : "");
                row.createCell(11).setCellValue(payment.getCreatedAt() != null ? payment.getCreatedAt().toString() : "");
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
            log.error("Ошибка при экспорте платежей в Excel", e);
            throw new RuntimeException("Ошибка экспорта в Excel", e);
        }
    }

    private String getStatusRu(String status) {
        if (status == null) return "";
        return switch (status) {
            case "PENDING" -> "Ожидает оплаты";
            case "PAID" -> "Оплачен";
            case "OVERDUE" -> "Просрочен";
            case "CANCELLED" -> "Отменен";
            case "PARTIAL" -> "Частично оплачен";
            default -> status;
        };
    }

    private String getPaymentTypeRu(String paymentType) {
        if (paymentType == null) return "";
        return switch (paymentType) {
            case "ADVANCE" -> "Аванс";
            case "FINAL" -> "Финальный";
            case "INSTALLMENT" -> "Рассрочка";
            case "RETENTION" -> "Удержание";
            default -> paymentType;
        };
    }
} 