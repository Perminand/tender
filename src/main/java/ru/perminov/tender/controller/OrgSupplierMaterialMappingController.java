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

    @GetMapping
    public Optional<OrgSupplierMaterialMappingDto> get(
            @RequestParam UUID organizationId,
            @RequestParam String supplierName,
            @RequestParam UUID characteristicId) {
        log.info("Получен GET-запрос: найти маппинг поставщика. organizationId={}, supplierName={}, characteristicId={}", organizationId, supplierName, characteristicId);
        return service.find(organizationId, supplierName, characteristicId);
    }

    @PostMapping
    public OrgSupplierMaterialMappingDto save(
            @RequestParam UUID organizationId,
            @RequestParam String supplierName,
            @RequestParam UUID materialId,
            @RequestParam UUID characteristicId
    ) {
        log.info("Получен POST-запрос: сохранить маппинг поставщика. organizationId={}, supplierName={}, materialId={}, " +
                "characteristicId={}", organizationId, supplierName, materialId, characteristicId);
        return service.save(organizationId, supplierName, materialId, characteristicId);
    }
} 