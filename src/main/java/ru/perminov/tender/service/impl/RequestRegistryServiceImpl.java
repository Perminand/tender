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

import lombok.extern.slf4j.Slf4j;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class RequestRegistryServiceImpl implements RequestRegistryService {
    private final RequestRepository requestRepository;

    @Override
    public List<RequestRegistryRowDto> getRegistry(String organization, String project, LocalDate fromDate, LocalDate toDate, String materialName, String companyId) {
        List<Request> requests = requestRepository.findAll();
        if (companyId != null) {
            requests = requests.stream()
                    .filter(r -> r.getOrganization().getId().toString().equals(companyId))
                    .toList();
        }
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

            // Подсчет количества материалов
            int materialsCount = request.getRequestMaterials().size();

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
                    note,
                    request.getStatus() != null ? request.getStatus() : "DRAFT"
            ));

            // Логируем статус для отладки
            log.info("Заявка {}: статус = {}", request.getId(), request.getStatus());
        }

        return result;
    }

    private String getStatusRu(String status) {
        if (status == null) return "";
        return switch (status) {
            case "DRAFT" -> "Черновик";
            case "TENDER" -> "Тендер";
            case "PUBLISHED" -> "Опубликован";
            case "BIDDING" -> "Приём предложений";
            case "EVALUATION" -> "Оценка";
            case "AWARDED" -> "Выбран";
            case "CANCELLED" -> "Отменён";
            default -> status;
        };
    }

    @Override
    public ByteArrayInputStream exportRegistryToExcel(String organization, String project, LocalDate fromDate, LocalDate toDate, String materialName) {
        List<RequestRegistryRowDto> rows = getRegistry(organization, project, fromDate, toDate, materialName, null);
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Реестр заявок");
            int rowIdx = 0;
            Row header = sheet.createRow(rowIdx++);
            String[] headers = {"ID заявки", "Номер заявки", "Дата заявки", "Организация", "Проект", "Статус", "Кол-во материалов", "Примечание"};
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
                row.createCell(5).setCellValue(getStatusRu(dto.status() != null ? dto.status() : "DRAFT"));
                row.createCell(6).setCellValue(dto.materialsCount() != null ? dto.materialsCount() : 0);
                row.createCell(7).setCellValue(dto.note() != null ? dto.note() : "");
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