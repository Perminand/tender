package ru.perminov.tender.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import ru.perminov.tender.dto.tender.SupplierProposalDto;
import ru.perminov.tender.service.ProposalRegistryService;
import ru.perminov.tender.service.SupplierProposalService;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProposalRegistryServiceImpl implements ProposalRegistryService {

    private final SupplierProposalService proposalService;

    @Override
    public List<SupplierProposalDto> getAllProposals() {
        log.info("Получение всех предложений для экспорта");
        return proposalService.getAllProposals();
    }

    @Override
    public ByteArrayInputStream exportProposalsToExcel() {
        log.info("Экспорт предложений в Excel");
        List<SupplierProposalDto> proposals = getAllProposals();
        
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Реестр предложений");
            int rowIdx = 0;
            
            // Заголовки
            Row header = sheet.createRow(rowIdx++);
            String[] headers = {
                "№", "Тендер", "Поставщик", "Номер предложения", 
                "Дата подачи", "Статус", "Сумма", "Валюта", 
                "Срок действия", "Лучшее предложение", "Разница в цене"
            };
            
            for (int i = 0; i < headers.length; i++) {
                Cell cell = header.createCell(i);
                cell.setCellValue(headers[i]);
            }
            
            // Данные
            for (SupplierProposalDto proposal : proposals) {
                Row row = sheet.createRow(rowIdx++);
                
                row.createCell(0).setCellValue(rowIdx - 1); // №
                row.createCell(1).setCellValue(proposal.getTenderTitle() != null ? proposal.getTenderTitle() : proposal.getTenderNumber());
                row.createCell(2).setCellValue(proposal.getSupplierName() != null ? proposal.getSupplierName() : "");
                row.createCell(3).setCellValue(proposal.getProposalNumber() != null ? proposal.getProposalNumber() : "");
                row.createCell(4).setCellValue(proposal.getSubmissionDate() != null ? proposal.getSubmissionDate().toString() : "");
                row.createCell(5).setCellValue(getStatusRu(proposal.getStatus()));
                row.createCell(6).setCellValue(proposal.getTotalPrice() != null ? proposal.getTotalPrice() : 0.0);
                row.createCell(7).setCellValue(proposal.getCurrency() != null ? proposal.getCurrency() : "RUB");
                row.createCell(8).setCellValue(proposal.getValidUntil() != null ? proposal.getValidUntil().toString() : "");
                row.createCell(9).setCellValue(proposal.getIsBestOffer() != null && proposal.getIsBestOffer() ? "Да" : "Нет");
                row.createCell(10).setCellValue(proposal.getPriceDifference() != null ? proposal.getPriceDifference() : 0.0);
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
            log.error("Ошибка при экспорте предложений в Excel", e);
            throw new RuntimeException("Ошибка экспорта в Excel", e);
        }
    }

    private String getStatusRu(ru.perminov.tender.model.SupplierProposal.ProposalStatus status) {
        if (status == null) return "";
        return switch (status) {
            case DRAFT -> "Черновик";
            case SUBMITTED -> "Подано";
            case UNDER_REVIEW -> "На рассмотрении";
            case ACCEPTED -> "Принято";
            case REJECTED -> "Отклонено";
            case WITHDRAWN -> "Отозвано";
            default -> status.toString();
        };
    }
} 