package ru.perminov.tender.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ru.perminov.tender.model.SupplierMaterialName;
import ru.perminov.tender.service.SupplierMaterialNameService;

import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/supplier-material-names")
@RequiredArgsConstructor
public class SupplierMaterialNameController {
    private final SupplierMaterialNameService service;

    @GetMapping("/by-material/{materialId}")
    public List<SupplierMaterialName> getByMaterial(@PathVariable UUID materialId) {
        log.info("Получен GET-запрос: получить названия материалов поставщика по материалу. materialId={}", materialId);
        return service.findByMaterial(materialId);
    }

    @GetMapping("/by-supplier/{supplierId}")
    public List<SupplierMaterialName> getBySupplier(@PathVariable UUID supplierId) {
        log.info("Получен GET-запрос: получить названия материалов по поставщику. supplierId={}", supplierId);
        return service.findBySupplier(supplierId);
    }

    @GetMapping("/by-material-and-supplier")
    public List<SupplierMaterialName> getByMaterialAndSupplier(
            @RequestParam UUID materialId, 
            @RequestParam UUID supplierId) {

        log.info("Получен GET-запрос: получить названия материалов по материалу и поставщику. materialId={}, supplierId={}", materialId, supplierId);
        return service.findByMaterialAndSupplier(materialId, supplierId);
    }

    @GetMapping
    public List<SupplierMaterialName> getAll() {
        log.info("Получен GET-запрос: получить все названия материалов поставщиков");
        return service.findAll();
    }

    @PostMapping
    public SupplierMaterialName create(
            @RequestParam UUID materialId, 
            @RequestParam UUID supplierId, 
            @RequestParam String name) {
        log.info("Получен POST-запрос: создать название материала поставщика. materialId={}, supplierId={}, name={}", materialId, supplierId, name);
        return service.create(materialId, supplierId, name);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        log.info("Получен DELETE-запрос: удалить название материала поставщика. id={}", id);
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
} 