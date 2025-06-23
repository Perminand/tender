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
import ru.perminov.tender.dto.CategoryDtoNew;
import ru.perminov.tender.dto.CategoryDtoUpdate;
import ru.perminov.tender.model.Category;
import ru.perminov.tender.service.CategoryService;
import ru.perminov.tender.service.ExcelService;

import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
@Validated
@CrossOrigin(origins = {"http://127.0.0.1:5173", "http://localhost:5173", "http://localhost:3000"})
public class CategoryController {

    private final CategoryService categoryService;
    private final ExcelService excelService;

    @PostMapping
    public ResponseEntity<Category> create(@RequestBody @Valid CategoryDtoNew categoryDtoNew) {
        log.info("Пришел POST запрос на создание категории: {}", categoryDtoNew);
        return ResponseEntity.ok(categoryService.create(categoryDtoNew));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Category> update(@PathVariable UUID id, @RequestBody @Valid CategoryDtoUpdate categoryDtoUpdate) {
        log.info("Пришел PUT запрос на изменение категории uuid: {} содержимое: {}", id, categoryDtoUpdate);
        return ResponseEntity.ok(categoryService.update(id, categoryDtoUpdate));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        log.info("Пришел DELETE запрос на удаление категории uuid: {}", id);
        categoryService.delete(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Category> getById(@PathVariable UUID id) {
        log.info("Пришел GET запрос на получение категории uuid: {}", id);
        return ResponseEntity.ok(categoryService.getById(id));
    }

    @GetMapping
    public ResponseEntity<List<Category>> getAll() {
        log.info("Пришел GET запрос на получение всех категорий");
        return ResponseEntity.ok(categoryService.getAll());
    }

    @GetMapping("/export")
    public ResponseEntity<Resource> exportCategories() {
        String filename = "categories.xlsx";
        List<Category> categories = categoryService.getAll();
        InputStreamResource file = new InputStreamResource(excelService.exportCategoriesToExcel(categories));

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(file);
    }

    @PostMapping("/import")
    public ResponseEntity<String> importFromExcel(@RequestParam("file") MultipartFile file) {
        int importedCount = categoryService.importFromExcel(file);
        return ResponseEntity.ok("Импортировано: " + importedCount);
    }
} 