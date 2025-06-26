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
import ru.perminov.tender.dto.material.MaterialDto;
import ru.perminov.tender.dto.material.MaterialDtoNew;
import ru.perminov.tender.dto.material.MaterialDtoUpdate;
import ru.perminov.tender.service.ExcelService;
import ru.perminov.tender.service.MaterialService;
import ru.perminov.tender.dto.ImportResultDto;

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
    private final ExcelService excelService;

    @PostMapping
    public ResponseEntity<MaterialDto> create(@RequestBody @Valid MaterialDtoNew materialDtoNew) {
        log.info("Получен POST-запрос: создать материал. Данные: {}", materialDtoNew);
        return ResponseEntity.ok(materialService.create(materialDtoNew));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MaterialDto> update(@PathVariable UUID id, @RequestBody @Valid MaterialDtoUpdate materialDtoUpdate) {
        log.info("Получен PUT-запрос: обновить материал. id={}, данные: {}", id, materialDtoUpdate);
        return ResponseEntity.ok(materialService.update(id, materialDtoUpdate));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        log.info("Получен DELETE-запрос: удалить материал. id={}", id);
        materialService.delete(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<MaterialDto> getById(@PathVariable UUID id) {
        log.info("Получен GET-запрос: получить материал по id={}", id);
        return ResponseEntity.ok(materialService.getById(id));
    }

    @GetMapping
    public ResponseEntity<List<MaterialDto>> getAll() {
        log.info("Получен GET-запрос: получить все материалы");
        return ResponseEntity.ok(materialService.getAll());
    }

    @GetMapping("/export")
    public ResponseEntity<Resource> exportMaterials() {
        log.info("Получен GET-запрос: экспортировать материалы в Excel");
        String filename = "materials.xlsx";
        List<MaterialDto> materials = materialService.getAll();
        InputStreamResource file = new InputStreamResource(excelService.exportMaterialsToExcel(materials));

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(file);
    }

    @PostMapping("/import")
    public ResponseEntity<ImportResultDto> importFromExcel(@RequestParam("file") MultipartFile file) {
        log.info("Получен POST-запрос: импортировать материалы из Excel");
        ImportResultDto result = materialService.importFromExcel(file);
        return ResponseEntity.ok(result);
    }
} 