package ru.perminov.tender.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import ru.perminov.tender.dto.payment.PaymentDto;
import ru.perminov.tender.service.PaymentRegistryService;

import java.io.ByteArrayInputStream;
import java.util.List;

@RestController
@RequestMapping("/api/payment-registry")
@RequiredArgsConstructor
@Slf4j
public class PaymentRegistryController {

    private final PaymentRegistryService paymentRegistryService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<List<PaymentDto>> getAllPayments() {
        log.info("Получение всех платежей для реестра");
        List<PaymentDto> payments = paymentRegistryService.getAllPayments();
        return ResponseEntity.ok(payments);
    }

    @GetMapping("/export")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<InputStreamResource> exportPaymentsToExcel() {
        log.info("Экспорт платежей в Excel");
        
        ByteArrayInputStream bis = paymentRegistryService.exportPaymentsToExcel();
        
        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "attachment; filename=payments-registry.xlsx");
        headers.add("Cache-Control", "no-cache, no-store, must-revalidate");
        headers.add("Pragma", "no-cache");
        headers.add("Expires", "0");
        
        return ResponseEntity.ok()
                .headers(headers)
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(new InputStreamResource(bis));
    }
} 