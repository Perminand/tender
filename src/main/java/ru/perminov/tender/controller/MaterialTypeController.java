package ru.perminov.tender.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import ru.perminov.tender.dto.MaterialTypeDtoNew;
import ru.perminov.tender.dto.MaterialTypeDtoUpdate;
import ru.perminov.tender.model.MaterialType;
import ru.perminov.tender.service.MaterialTypeService;

import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/material-types")
@RequiredArgsConstructor
@Validated
@CrossOrigin(origins = {"http://127.0.0.1:5173", "http://localhost:5173", "http://localhost:3000"})
public class MaterialTypeController {

    private final MaterialTypeService materialTypeService;

    @PostMapping
    public ResponseEntity<MaterialType> create(@RequestBody @Valid MaterialTypeDtoNew materialTypeDtoNew) {
        log.info("Пришел POST запрос на создание типа материала: {}", materialTypeDtoNew);
        return ResponseEntity.ok(materialTypeService.create(materialTypeDtoNew));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MaterialType> update(@PathVariable UUID id, @RequestBody @Valid MaterialTypeDtoUpdate materialTypeDtoUpdate) {
        log.info("Пришел PUT запрос на изменение типа материала uuid: {} содержимое: {}", id, materialTypeDtoUpdate);
        return ResponseEntity.ok(materialTypeService.update(id, materialTypeDtoUpdate));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        log.info("Пришел DELETE запрос на удаление типа материала uuid: {}", id);
        materialTypeService.delete(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<MaterialType> getById(@PathVariable UUID id) {
        log.info("Пришел GET запрос на получение типа материала uuid: {}", id);
        return ResponseEntity.ok(materialTypeService.getById(id));
    }

    @GetMapping
    public ResponseEntity<List<MaterialType>> getAll() {
        log.info("Пришел GET запрос на получение всех типов материалов");
        return ResponseEntity.ok(materialTypeService.getAll());
    }
} 