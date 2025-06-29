package ru.perminov.tender.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;
import ru.perminov.tender.dto.OrgSupplierMaterialMappingDto;
import ru.perminov.tender.mapper.OrgSupplierMaterialMappingMapper;
import ru.perminov.tender.model.OrgSupplierMaterialMapping;
import ru.perminov.tender.service.OrgSupplierMaterialMappingService;

import java.util.Optional;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/org-supplier-material-mapping")
@RequiredArgsConstructor
public class OrgSupplierMaterialMappingController {
    private final OrgSupplierMaterialMappingService service;
    private final OrgSupplierMaterialMappingMapper mapper;

    @GetMapping
    public Optional<OrgSupplierMaterialMappingDto> get(@RequestParam UUID organizationId, @RequestParam String supplierName) {
        log.info("Получен GET-запрос: найти маппинг поставщика. organizationId={}, supplierName={}", organizationId, supplierName);
        return service.find(organizationId, supplierName).map(mapper::toDto);
    }

    @PostMapping
    public OrgSupplierMaterialMappingDto save(@RequestParam UUID organizationId, @RequestParam String supplierName, @RequestParam UUID materialId) {
        log.info("Получен POST-запрос: сохранить маппинг поставщика. organizationId={}, supplierName={}, materialId={}", organizationId, supplierName, materialId);
        OrgSupplierMaterialMapping entity = service.save(organizationId, supplierName, materialId);
        return mapper.toDto(entity);
    }
} 