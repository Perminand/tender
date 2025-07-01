package ru.perminov.tender.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import ru.perminov.tender.dto.WarehouseDto;
import ru.perminov.tender.service.WarehouseService;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/warehouses")
@RequiredArgsConstructor
public class WarehouseController {
    private final WarehouseService service;

    @GetMapping
    public List<WarehouseDto> getAll() {
        return service.findAll();
    }

    @GetMapping("/by-project/{projectId}")
    public List<WarehouseDto> getByProject(@PathVariable UUID projectId) {
        return service.findByProjectId(projectId);
    }

    @PostMapping
    public WarehouseDto create(@RequestBody WarehouseDto dto) {
        return service.save(dto);
    }

    @PutMapping("/{id}")
    public WarehouseDto update(@PathVariable UUID id, @RequestBody WarehouseDto dto) {
        WarehouseDto updatedDto = new WarehouseDto(id, dto.name(), dto.projectId());
        return service.save(updatedDto);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable UUID id) {
        service.delete(id);
    }
} 