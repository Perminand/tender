package ru.perminov.tender.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ru.perminov.tender.dto.ImportColumnMappingDto;
import ru.perminov.tender.model.ImportColumnMapping;
import ru.perminov.tender.service.ImportColumnMappingService;

import java.util.Optional;

@RestController
@RequestMapping("/api/import-mapping")
public class ImportColumnMappingController {
    @Autowired
    private ImportColumnMappingService service;

    @GetMapping
    public ResponseEntity<ImportColumnMappingDto> getMapping(@RequestParam String userId, @RequestParam String companyId) {
        Optional<ImportColumnMapping> mapping = service.getMapping(userId, companyId);
        if (mapping.isPresent()) {
            ImportColumnMapping m = mapping.get();
            ImportColumnMappingDto dto = new ImportColumnMappingDto();
            dto.setUserId(m.getUserId());
            dto.setCompanyId(m.getCompanyId());
            dto.setMappingJson(m.getMappingJson());
            return ResponseEntity.ok(dto);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    public ResponseEntity<Void> saveMapping(@RequestBody ImportColumnMappingDto dto) {
        service.saveOrUpdateMapping(dto.getUserId(), dto.getCompanyId(), dto.getMappingJson());
        return ResponseEntity.ok().build();
    }
} 