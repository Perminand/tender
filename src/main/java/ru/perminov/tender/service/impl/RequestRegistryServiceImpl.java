package ru.perminov.tender.service.impl;

import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import ru.perminov.tender.dto.RequestRegistryRowDto;
import ru.perminov.tender.model.Request;
import ru.perminov.tender.repository.RequestRepository;
import ru.perminov.tender.service.RequestRegistryService;

import java.io.ByteArrayInputStream;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RequestRegistryServiceImpl implements RequestRegistryService {
    private final RequestRepository requestRepository;

    @Override
    public List<RequestRegistryRowDto> getRegistry(String organization, String project, String status, LocalDate fromDate, LocalDate toDate, String materialName) {
        List<Request> requests = requestRepository.findAll();
        List<RequestRegistryRowDto> result = new ArrayList<>();
        for (Request request : requests) {
            if (organization != null && !request.getOrganization().getName().contains(organization)) continue;
            if (project != null && !request.getProject().getName().contains(project)) continue;
            if (status != null && !request.getStatus().name().equalsIgnoreCase(status)) continue;
            if (fromDate != null && request.getDate().isBefore(fromDate)) continue;
            if (toDate != null && request.getDate().isAfter(toDate)) continue;
            for (var material : request.getMaterials()) {
                if (materialName != null && !material.getMaterial().getName().contains(materialName)) continue;
                result.add(new RequestRegistryRowDto(
                        request.getId(),
                        request.getId().toString(), // requestNumber (можно заменить на отдельное поле)
                        request.getDate(),
                        request.getOrganization().getName(),
                        request.getProject().getName(),
                        request.getStatus().name(),
                        material.getMaterial().getName(),
                        material.getSection(),
                        material.getWorkType(),
                        material.getSize(),
                        material.getQuantity(),
                        material.getUnit() != null ? material.getUnit().getShortName() : null,
                        material.getNote(),
                        material.getDeliveryDate()
                ));
            }
        }
        return result;
    }

    @Override
    public ByteArrayInputStream exportRegistryToExcel(String organization, String project, String status, LocalDate fromDate, LocalDate toDate, String materialName) {
        List<RequestRegistryRowDto> rows = getRegistry(organization, project, status, fromDate, toDate, materialName);
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Реестр заявок");
            int rowIdx = 0;
            Row header = sheet.createRow(rowIdx++);
            String[] headers = {"ID заявки", "Номер заявки", "Дата заявки", "Организация", "Проект", "Статус", "Материал", "Участок", "Вид работ", "Размер", "Кол-во", "Ед. изм.", "Примечание", "Поставить к дате"};
            for (int i = 0; i < headers.length; i++) {
                header.createCell(i).setCellValue(headers[i]);
            }
            for (RequestRegistryRowDto dto : rows) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(dto.requestId() != null ? dto.requestId().toString() : "");
                row.createCell(1).setCellValue(dto.requestNumber() != null ? dto.requestNumber() : "");
                row.createCell(2).setCellValue(dto.requestDate() != null ? dto.requestDate().toString() : "");
                row.createCell(3).setCellValue(dto.organization() != null ? dto.organization() : "");
                row.createCell(4).setCellValue(dto.project() != null ? dto.project() : "");
                row.createCell(5).setCellValue(dto.status() != null ? dto.status() : "");
                row.createCell(6).setCellValue(dto.materialName() != null ? dto.materialName() : "");
                row.createCell(7).setCellValue(dto.section() != null ? dto.section() : "");
                row.createCell(8).setCellValue(dto.workType() != null ? dto.workType() : "");
                row.createCell(9).setCellValue(dto.size() != null ? dto.size() : "");
                row.createCell(10).setCellValue(dto.quantity() != null ? dto.quantity() : 0);
                row.createCell(11).setCellValue(dto.unit() != null ? dto.unit() : "");
                row.createCell(12).setCellValue(dto.note() != null ? dto.note() : "");
                row.createCell(13).setCellValue(dto.deliveryDate() != null ? dto.deliveryDate() : "");
            }
            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }
            try (java.io.ByteArrayOutputStream out = new java.io.ByteArrayOutputStream()) {
                workbook.write(out);
                return new ByteArrayInputStream(out.toByteArray());
            }
        } catch (Exception e) {
            throw new RuntimeException("Ошибка экспорта в Excel", e);
        }
    }
} 