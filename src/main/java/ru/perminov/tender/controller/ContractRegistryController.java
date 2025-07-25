package ru.perminov.tender.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import ru.perminov.tender.dto.contract.ContractDto;
import ru.perminov.tender.service.ContractRegistryService;

import java.io.ByteArrayInputStream;
import java.util.List;

@RestController
@RequestMapping("/api/contract-registry")
@RequiredArgsConstructor
@Slf4j
public class ContractRegistryController {

    private final ContractRegistryService contractRegistryService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<List<ContractDto>> getAllContracts() {
        log.info("Получение всех контрактов для реестра");
        List<ContractDto> contracts = contractRegistryService.getAllContracts();
        return ResponseEntity.ok(contracts);
    }

    @GetMapping("/export")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<InputStreamResource> exportContractsToExcel() {
        log.info("Экспорт контрактов в Excel");
        
        ByteArrayInputStream bis = contractRegistryService.exportContractsToExcel();
        
        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "attachment; filename=contracts-registry.xlsx");
        headers.add("Cache-Control", "no-cache, no-store, must-revalidate");
        headers.add("Pragma", "no-cache");
        headers.add("Expires", "0");
        
        return ResponseEntity.ok()
                .headers(headers)
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(new InputStreamResource(bis));
    }
} 