package ru.perminov.tender.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import ru.perminov.tender.dto.delivery.DeliveryDto;
import ru.perminov.tender.service.DeliveryRegistryService;

import java.io.ByteArrayInputStream;
import java.util.List;

@RestController
@RequestMapping("/api/delivery-registry")
@RequiredArgsConstructor
@Slf4j
public class DeliveryRegistryController {

    private final DeliveryRegistryService deliveryRegistryService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<List<DeliveryDto>> getAllDeliveries() {
        log.info("Получение всех поставок для реестра");
        List<DeliveryDto> deliveries = deliveryRegistryService.getAllDeliveries();
        return ResponseEntity.ok(deliveries);
    }

    @GetMapping("/export")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<InputStreamResource> exportDeliveriesToExcel() {
        log.info("Экспорт поставок в Excel");
        
        ByteArrayInputStream bis = deliveryRegistryService.exportDeliveriesToExcel();
        
        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "attachment; filename=deliveries-registry.xlsx");
        headers.add("Cache-Control", "no-cache, no-store, must-revalidate");
        headers.add("Pragma", "no-cache");
        headers.add("Expires", "0");
        
        return ResponseEntity.ok()
                .headers(headers)
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(new InputStreamResource(bis));
    }
} 