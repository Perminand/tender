package ru.perminov.tender.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import ru.perminov.tender.dto.tender.SupplierProposalDto;
import ru.perminov.tender.service.ProposalRegistryService;

import java.io.ByteArrayInputStream;
import java.util.List;

@RestController
@RequestMapping("/api/proposal-registry")
@RequiredArgsConstructor
@Slf4j
public class ProposalRegistryController {

    private final ProposalRegistryService proposalRegistryService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<List<SupplierProposalDto>> getAllProposals() {
        log.info("Получение всех предложений для реестра");
        List<SupplierProposalDto> proposals = proposalRegistryService.getAllProposals();
        return ResponseEntity.ok(proposals);
    }

    @GetMapping("/export")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<InputStreamResource> exportProposalsToExcel() {
        log.info("Экспорт предложений в Excel");
        
        ByteArrayInputStream bis = proposalRegistryService.exportProposalsToExcel();
        
        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "attachment; filename=proposals-registry.xlsx");
        headers.add("Cache-Control", "no-cache, no-store, must-revalidate");
        headers.add("Pragma", "no-cache");
        headers.add("Expires", "0");
        
        return ResponseEntity.ok()
                .headers(headers)
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(new InputStreamResource(bis));
    }
} 