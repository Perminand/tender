package ru.perminov.tender.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ru.perminov.tender.dto.WarehouseDto;
import ru.perminov.tender.service.WarehouseService;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/warehouses")
@RequiredArgsConstructor
public class WarehouseController {
    private final WarehouseService service;

    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'VIEWER', 'CUSTOMER')")
    @GetMapping
    public ResponseEntity<List<WarehouseDto>> getAll() {
        log.info("Получен GET-запрос: получить все склады");
        List<WarehouseDto> warehouses = service.findAll();
        log.info("Возвращено складов: {}", warehouses.size());
        return ResponseEntity.ok(warehouses);
    }

    @GetMapping("/by-project/{projectId}")
    public ResponseEntity<List<WarehouseDto>> getByProject(@PathVariable UUID projectId) {
        log.info("Получен GET-запрос: получить склады по проекту. projectId={}", projectId);
        List<WarehouseDto> warehouses = service.findByProjectId(projectId);
        log.info("Найдено складов для проекта {}: {}", projectId, warehouses.size());
        return ResponseEntity.ok(warehouses);
    }

    @PostMapping
    public ResponseEntity<WarehouseDto> create(@RequestBody WarehouseDto dto) {
        log.info("Получен POST-запрос: создать склад. Данные: {}", dto);
        WarehouseDto created = service.save(dto);
        log.info("Создан склад с id={}", created.id());
        return ResponseEntity.ok(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<WarehouseDto> update(@PathVariable UUID id, @RequestBody WarehouseDto dto) {
        log.info("Получен PUT-запрос: обновить склад. id={}, данные: {}", id, dto);
        WarehouseDto updatedDto = new WarehouseDto(id, dto.name(), dto.projectId());
        WarehouseDto updated = service.save(updatedDto);
        log.info("Обновлен склад с id={}", updated.id());
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        log.info("Получен DELETE-запрос: удалить склад. id={}", id);
        service.delete(id);
        log.info("Удален склад с id={}", id);
        return ResponseEntity.noContent().build();
    }
} 