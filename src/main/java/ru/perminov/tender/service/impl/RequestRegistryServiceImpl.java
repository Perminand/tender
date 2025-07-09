package ru.perminov.tender.service.impl;

import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import ru.perminov.tender.dto.RequestRegistryRowDto;
import ru.perminov.tender.model.Request;
import ru.perminov.tender.model.RequestMaterial;
import ru.perminov.tender.repository.RequestRepository;
import ru.perminov.tender.service.RequestRegistryService;

import java.io.ByteArrayInputStream;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class RequestRegistryServiceImpl implements RequestRegistryService {
    private final RequestRepository requestRepository;

    @Override
    public List<RequestRegistryRowDto> getRegistry(String organization, String project, LocalDate fromDate, LocalDate toDate, String materialName) {
        List<Request> requests = requestRepository.findAll();
        List<RequestRegistryRowDto> result = new ArrayList<>();
        
        for (Request request : requests) {
            // Фильтрация по организации
            if (organization != null && !request.getOrganization().getName().toLowerCase().contains(organization.toLowerCase())) {
                continue;
            }
            
            // Фильтрация по проекту
            if (project != null && !request.getProject().getName().toLowerCase().contains(project.toLowerCase())) {
                continue;
            }
            
            // Фильтрация по датам
            if (fromDate != null && request.getDate().isBefore(fromDate)) {
                continue;
            }
            if (toDate != null && request.getDate().isAfter(toDate)) {
                continue;
            }
            
            // Фильтрация по материалу (если указан)
            if (materialName != null) {
                boolean hasMatchingMaterial = request.getRequestMaterials().stream()
                    .anyMatch(material -> material.getMaterial().getName().toLowerCase().contains(materialName.toLowerCase()));
                if (!hasMatchingMaterial) {
                    continue;
                }
            }
            
            // Подсчет количества материалов и общей суммы
            int materialsCount = request.getRequestMaterials().size();
            double totalQuantity = request.getRequestMaterials().stream()
                .mapToDouble(material -> material.getQuantity() != null ? material.getQuantity() : 0.0)
                .sum();
            
            // Получение примечания (берем первое непустое примечание из материалов)
            String note = request.getRequestMaterials().stream()
                .map(RequestMaterial::getNote)
                .filter(n -> n != null && !n.trim().isEmpty())
                .findFirst()
                .orElse("");
            
            result.add(new RequestRegistryRowDto(
                request.getId(),
                request.getRequestNumber() != null ? request.getRequestNumber() : request.getId().toString(),
                request.getDate(),
                request.getOrganization().getLegalName() != null && !request.getOrganization().getLegalName().isBlank()
                    ? request.getOrganization().getLegalName()
                    : (request.getOrganization().getShortName() != null && !request.getOrganization().getShortName().isBlank()
                        ? request.getOrganization().getShortName()
                        : request.getOrganization().getName()),
                request.getProject().getName(),
                materialsCount,
                totalQuantity,
                note,
                request.getStatus() != null ? request.getStatus() : "DRAFT"
            ));
            
            // Логируем статус для отладки
            log.info("Заявка {}: статус = {}", request.getId(), request.getStatus());
        }
        
        return result;
    }

    @Override
    public ByteArrayInputStream exportRegistryToExcel(String organization, String project, LocalDate fromDate, LocalDate toDate, String materialName) {
        List<RequestRegistryRowDto> rows = getRegistry(organization, project, fromDate, toDate, materialName);
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Реестр заявок");
            int rowIdx = 0;
            Row header = sheet.createRow(rowIdx++);
            String[] headers = {"ID заявки", "Номер заявки", "Дата заявки", "Организация", "Проект", "Статус", "Кол-во материалов", "Общее кол-во", "Примечание"};
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
                row.createCell(5).setCellValue(dto.status() != null ? dto.status() : "DRAFT");
                row.createCell(6).setCellValue(dto.materialsCount() != null ? dto.materialsCount() : 0);
                row.createCell(7).setCellValue(dto.totalQuantity() != null ? dto.totalQuantity() : 0.0);
                row.createCell(8).setCellValue(dto.note() != null ? dto.note() : "");
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