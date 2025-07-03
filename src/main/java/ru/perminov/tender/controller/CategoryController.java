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
import ru.perminov.tender.dto.ImportResultDto;
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
        log.info("Получен POST-запрос: создать категорию. Данные: {}", categoryDtoNew);
        Category created = categoryService.create(categoryDtoNew);
        log.info("Создана категория с id={}", created.getId());
        return ResponseEntity.ok(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Category> update(@PathVariable UUID id, @RequestBody @Valid CategoryDtoUpdate categoryDtoUpdate) {
        log.info("Получен PUT-запрос: обновить категорию. id={}, данные: {}", id, categoryDtoUpdate);
        Category updated = categoryService.update(id, categoryDtoUpdate);
        log.info("Обновлена категория с id={}", updated.getId());
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        log.info("Получен DELETE-запрос: удалить категорию. id={}", id);
        categoryService.delete(id);
        log.info("Удалена категория с id={}", id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Category> getById(@PathVariable UUID id) {
        log.info("Получен GET-запрос: получить категорию по id={}", id);
        Category category = categoryService.getById(id);
        log.info("Найдена категория: {}", category);
        return ResponseEntity.ok(category);
    }

    @GetMapping
    public ResponseEntity<List<Category>> getAll() {
        log.info("Получен GET-запрос: получить все категории");
        List<Category> categories = categoryService.getAll();
        log.info("Возвращено категорий: {}", categories.size());
        return ResponseEntity.ok(categories);
    }

    @GetMapping("/export")
    public ResponseEntity<Resource> exportCategories() {
        log.info("Получен GET-запрос: экспортировать категории в Excel");
        String filename = "categories.xlsx";
        List<Category> categories = categoryService.getAll();
        InputStreamResource file = new InputStreamResource(excelService.exportCategoriesToExcel(categories));

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(file);
    }

    @PostMapping("/import")
    public ResponseEntity<ImportResultDto> importFromExcel(@RequestParam("file") MultipartFile file) {
        log.info("Получен POST-запрос: импортировать категории из Excel");
        ImportResultDto result = categoryService.importFromExcel(file);
        return ResponseEntity.ok(result);
    }
} 