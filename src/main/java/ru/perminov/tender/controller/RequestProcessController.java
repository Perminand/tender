package ru.perminov.tender.controller;

import lombok.RequiredArgsConstructor;
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
public class RequestProcessController {

    private final RequestProcessService requestProcessService;

    @GetMapping("/{requestId}")
    public ResponseEntity<RequestProcessDto> getRequestProcess(@PathVariable UUID requestId) {
        try {
            RequestProcessDto process = requestProcessService.getRequestProcess(requestId);
            return ResponseEntity.ok(process);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/list")
    public ResponseEntity<List<RequestProcessDto>> getRequestProcessList() {
        try {
            List<RequestProcessDto> processes = requestProcessService.getRequestProcessList();
            return ResponseEntity.ok(processes);
        } catch (Exception e) {
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