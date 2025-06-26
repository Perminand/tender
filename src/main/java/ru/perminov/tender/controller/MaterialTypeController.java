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
@CrossOrigin(origins = {"http://127.0.0.1:5173", "http://localhost:5173", "http://localhost:3000"})
public class MaterialTypeController {

    private final MaterialTypeService materialTypeService;
    private final ExcelService excelService;

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