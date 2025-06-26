package ru.perminov.tender.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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

@Slf4j
@RestController
@RequestMapping("/api/warehouses")
@RequiredArgsConstructor
public class WarehouseController {
    private final WarehouseService service;
    private final ExcelService excelService;
    private final WarehouseRepository warehouseRepository;

    @GetMapping
    public List<WarehouseDto> getAll() {
        log.info("Получен GET-запрос: получить все склады");
        return service.findAll();
    }

    @PostMapping
    public WarehouseDto create(@RequestBody WarehouseDto dto) {
        log.info("Получен POST-запрос: создать склад. Данные: {}", dto);
        return service.save(dto);
    }

    @PutMapping("/{id}")
    public WarehouseDto update(@PathVariable UUID id, @RequestBody WarehouseDto dto) {
        log.info("Получен PUT-запрос: обновить склад. id={}, данные: {}", id, dto);
        dto.setId(id);
        return service.save(dto);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable UUID id) {
        log.info("Получен DELETE-запрос: удалить склад. id={}", id);
        service.delete(id);
    }

    @GetMapping("/export")
    public ResponseEntity<byte[]> exportWarehouses(@RequestParam(required = false) String name) throws java.io.IOException {
        log.info("Получен GET-запрос: экспортировать склады в Excel. Фильтр по имени: {}", name);
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
        log.info("Получен POST-запрос: импортировать склады из Excel");
        excelService.importWarehouses(file);
        return ResponseEntity.ok().build();
    }
} 