package ru.perminov.tender.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;
import ru.perminov.tender.dto.OrgSupplierMaterialMappingDto;
import ru.perminov.tender.mapper.OrgSupplierMaterialMappingMapper;
import ru.perminov.tender.model.OrgSupplierMaterialMapping;
import ru.perminov.tender.service.OrgSupplierMaterialMappingService;

import java.util.List;
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
            @RequestParam(required = false) UUID characteristicId) {
        log.info("Получен GET-запрос: найти маппинг поставщика. organizationId={}, supplierName={}, characteristicId={}", organizationId, supplierName, characteristicId);
        return service.find(organizationId, supplierName, characteristicId);
    }

    @GetMapping("/all")
    public List<OrgSupplierMaterialMappingDto> getAll() {
        log.info("Получен GET-запрос: получить все маппинги поставщиков");
        return service.findAll();
    }

    @GetMapping("/by-organization/{organizationId}")
    public List<OrgSupplierMaterialMappingDto> getByOrganization(@PathVariable UUID organizationId) {
        log.info("Получен GET-запрос: получить маппинги по организации. organizationId={}", organizationId);
        return service.findByOrganization(organizationId);
    }

    @PostMapping
    public OrgSupplierMaterialMappingDto save(
            @RequestParam UUID organizationId,
            @RequestParam String supplierName,
            @RequestParam UUID materialId,
            @RequestParam(required = false) UUID characteristicId
    ) {
        log.info("Получен POST-запрос: сохранить маппинг поставщика. organizationId={}, supplierName={}, materialId={}, " +
                "characteristicId={}", organizationId, supplierName, materialId, characteristicId);
        return service.save(organizationId, supplierName, materialId, characteristicId);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable UUID id) {
        log.info("Получен DELETE-запрос: удалить маппинг поставщика. id={}", id);
        service.delete(id);
    }
} 