package ru.perminov.tender.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import ru.perminov.tender.dto.WarehouseDto;
import ru.perminov.tender.model.Warehouse;
import ru.perminov.tender.service.ExcelService;
import ru.perminov.tender.service.WarehouseService;
import ru.perminov.tender.repository.WarehouseRepository;
import java.io.ByteArrayInputStream;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/warehouses")
@RequiredArgsConstructor
public class WarehouseController {
    private final WarehouseService service;
    private final ExcelService excelService;
    private final WarehouseRepository warehouseRepository;

    @GetMapping
    public List<WarehouseDto> getAll() {
        return service.findAll();
    }

    @PostMapping
    public WarehouseDto create(@RequestBody WarehouseDto dto) {
        return service.save(dto);
    }

    @PutMapping("/{id}")
    public WarehouseDto update(@PathVariable UUID id, @RequestBody WarehouseDto dto) {
        dto.setId(id);
        return service.save(dto);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable UUID id) {
        service.delete(id);
    }

    @GetMapping("/export")
    public ResponseEntity<byte[]> exportWarehouses(@RequestParam(required = false) String name) throws java.io.IOException {
        List<Warehouse> warehouses;
        if (name != null && !name.isEmpty()) {
            warehouses = warehouseRepository.findByNameContainingIgnoreCase(name);
        } else {
            warehouses = warehouseRepository.findAll();
        }
        ByteArrayInputStream in = excelService.exportWarehousesToExcel(warehouses);
        byte[] file = in.readAllBytes();
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=warehouses.xlsx")
            .contentType(MediaType.APPLICATION_OCTET_STREAM)
            .body(file);
    }

    @PostMapping("/import")
    public ResponseEntity<Void> importWarehouses(@RequestParam("file") MultipartFile file) {
        excelService.importWarehouses(file);
        return ResponseEntity.ok().build();
    }
} 