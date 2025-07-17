package ru.perminov.tender.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import ru.perminov.tender.dto.MaterialTypeDtoNew;
import ru.perminov.tender.dto.MaterialTypeDtoUpdate;
import ru.perminov.tender.dto.ImportResultDto;
import ru.perminov.tender.model.MaterialType;
import ru.perminov.tender.service.ExcelService;
import ru.perminov.tender.service.MaterialTypeService;

import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/material-types")
@RequiredArgsConstructor
@Validated
public class MaterialTypeController {

    private final MaterialTypeService materialTypeService;
    private final ExcelService excelService;

    @PostMapping
    public ResponseEntity<MaterialType> create(@RequestBody @Valid MaterialTypeDtoNew materialTypeDtoNew) {
        log.info("Получен POST-запрос: создать тип материала. Данные: {}", materialTypeDtoNew);
        MaterialType created = materialTypeService.create(materialTypeDtoNew);
        log.info("Создан тип материала с id={}", created.getId());
        return ResponseEntity.ok(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<MaterialType> update(@PathVariable UUID id, @RequestBody @Valid MaterialTypeDtoUpdate materialTypeDtoUpdate) {
        log.info("Получен PUT-запрос: обновить тип материала. id={}, данные: {}", id, materialTypeDtoUpdate);
        MaterialType updated = materialTypeService.update(id, materialTypeDtoUpdate);
        log.info("Обновлен тип материала с id={}", updated.getId());
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        log.info("Получен DELETE-запрос: удалить тип материала. id={}", id);
        materialTypeService.delete(id);
        log.info("Удален тип материала с id={}", id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<MaterialType> getById(@PathVariable UUID id) {
        log.info("Получен GET-запрос: получить тип материала по id={}", id);
        MaterialType materialType = materialTypeService.getById(id);
        log.info("Найден тип материала: {}", materialType);
        return ResponseEntity.ok(materialType);
    }

    @GetMapping
    public ResponseEntity<List<MaterialType>> getAll() {
        log.info("Получен GET-запрос: получить все типы материалов");
        List<MaterialType> materialTypes = materialTypeService.getAll();
        log.info("Возвращено типов материалов: {}", materialTypes.size());
        return ResponseEntity.ok(materialTypes);
    }

    @GetMapping("/export")
    public ResponseEntity<Resource> exportMaterialTypes() {
        log.info("Получен GET-запрос: экспортировать типы материалов в Excel");
        String filename = "material_types.xlsx";
        List<MaterialType> materialTypes = materialTypeService.getAll();
        InputStreamResource file = new InputStreamResource(excelService.exportMaterialTypesToExcel(materialTypes));

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(file);
    }

    @PostMapping("/import")
    public ResponseEntity<ImportResultDto> importFromExcel(@RequestParam("file") MultipartFile file) {
        log.info("Получен POST-запрос: импортировать типы материалов из Excel");
        ImportResultDto result = materialTypeService.importFromExcel(file);
        return ResponseEntity.ok(result);
    }
} 