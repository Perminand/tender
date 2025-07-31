package ru.perminov.tender.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ru.perminov.tender.dto.RequestProcessDto;
import ru.perminov.tender.service.RequestProcessService;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/requests/process")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Slf4j
public class RequestProcessController {

    private final RequestProcessService requestProcessService;

    @GetMapping("/{requestId}")
    public ResponseEntity<RequestProcessDto> getRequestProcess(@PathVariable UUID requestId) {
        log.info("Получение процесса заявки с ID: {}", requestId);
        try {
            RequestProcessDto process = requestProcessService.getRequestProcess(requestId);
            log.info("Процесс заявки {} загружен успешно. Найдено тендеров: {}", requestId, process.getTendersCount());
            return ResponseEntity.ok(process);
        } catch (Exception e) {
            log.error("Ошибка при получении процесса заявки {}: {}", requestId, e.getMessage(), e);
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/list")
    public ResponseEntity<List<RequestProcessDto>> getRequestProcessList() {
        log.info("Получение списка процессов заявок");
        try {
            List<RequestProcessDto> processes = requestProcessService.getRequestProcessList();
            log.info("Список процессов заявок загружен успешно. Количество заявок: {}", processes.size());
            return ResponseEntity.ok(processes);
        } catch (Exception e) {
            log.error("Ошибка при получении списка процессов заявок: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/brief/{requestId}")
    public ResponseEntity<RequestProcessDto> getRequestProcessBrief(@PathVariable UUID requestId) {
        try {
            RequestProcessDto process = requestProcessService.getRequestProcess(requestId);
            // Для краткого представления очищаем детальные списки
            process.setTenders(null);
            process.setInvoices(null);
            process.setDeliveries(null);
            return ResponseEntity.ok(process);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/brief/list")
    public ResponseEntity<List<RequestProcessDto>> getRequestProcessBriefList() {
        try {
            List<RequestProcessDto> processes = requestProcessService.getRequestProcessList();
            // Для краткого представления очищаем детальные списки
            processes.forEach(process -> {
                process.setTenders(null);
                process.setInvoices(null);
                process.setDeliveries(null);
            });
            return ResponseEntity.ok(processes);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
} 