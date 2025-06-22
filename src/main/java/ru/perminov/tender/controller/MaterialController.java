package ru.perminov.tender.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import ru.perminov.tender.dto.material.MaterialDtoNew;
import ru.perminov.tender.dto.material.MaterialDtoUpdate;
import ru.perminov.tender.model.Material;
import ru.perminov.tender.service.MaterialService;

import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/materials")
@RequiredArgsConstructor
@Validated
@CrossOrigin(origins = {"http://127.0.0.1:5173", "http://localhost:5173", "http://localhost:3000"})
public class MaterialController {

    private final MaterialService materialService;

    @PostMapping
    public ResponseEntity<Material> create(@RequestBody @Valid MaterialDtoNew materialDtoNew) {
        log.info("Пришел POST запрос на создание материала: {}", materialDtoNew);
        return ResponseEntity.ok(materialService.create(materialDtoNew));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Material> update(@PathVariable UUID id, @RequestBody @Valid MaterialDtoUpdate materialDtoUpdate) {
        log.info("Пришел PUT запрос на изменение материала uuid: {} содержимое: {}", id, materialDtoUpdate);
        return ResponseEntity.ok(materialService.update(id, materialDtoUpdate));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        log.info("Пришел DELETE запрос на удаление материала uuid: {}", id);
        materialService.delete(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Material> getById(@PathVariable UUID id) {
        log.info("Пришел GET запрос на получение материала uuid: {}", id);
        return ResponseEntity.ok(materialService.getById(id));
    }

    @GetMapping
    public ResponseEntity<List<Material>> getAll() {
        log.info("Пришел GET запрос на получение всех материалов");
        return ResponseEntity.ok(materialService.getAll());
    }
} 