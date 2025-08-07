package ru.perminov.tender.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ru.perminov.tender.dto.RequestProcessDto;
import ru.perminov.tender.service.ExcelReportService;
import ru.perminov.tender.service.RequestProcessService;

import java.util.UUID;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Slf4j
public class ExcelReportController {

    private final ExcelReportService excelReportService;
    private final RequestProcessService requestProcessService;

    @GetMapping("/tender/{requestId}")
    public ResponseEntity<byte[]> generateTenderReport(@PathVariable UUID requestId) {
        log.info("Генерация Excel-отчета для заявки: {}", requestId);
        
        try {
            // Получаем данные процесса заявки
            RequestProcessDto requestProcess = requestProcessService.getRequestProcess(requestId);
            
            // Генерируем Excel-отчет
            byte[] reportBytes = excelReportService.generateTenderReport(requestProcess);
            
            // Формируем имя файла
            String fileName = String.format("Тендерная_таблица_заявка_%s_%s.xlsx", 
                requestProcess.getRequestNumber(), 
                requestProcess.getProject() != null ? requestProcess.getProject().replaceAll("[^a-zA-Zа-яА-Я0-9]", "_") : "без_проекта");
            
            log.info("Excel-отчет успешно сгенерирован для заявки: {}. Размер файла: {} байт", 
                requestId, reportBytes.length);
            
            return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(reportBytes);
                
        } catch (Exception e) {
            log.error("Ошибка при генерации Excel-отчета для заявки {}: {}", requestId, e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }
}
