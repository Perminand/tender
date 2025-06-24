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
} 