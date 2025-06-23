package ru.perminov.tender.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ru.perminov.tender.dto.ProjectObjectDto;
import ru.perminov.tender.dto.ProjectObjectDtoNew;
import ru.perminov.tender.dto.ProjectObjectDtoUpdate;
import ru.perminov.tender.service.ExcelService;
import ru.perminov.tender.service.ProjectObjectService;

import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/project-objects")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://127.0.0.1:5173", "http://localhost:5173", "http://localhost:3000"})
public class ProjectObjectController {

    private final ProjectObjectService projectObjectService;
    private final ExcelService excelService;

    @GetMapping
    public ResponseEntity<List<ProjectObjectDto>> getAll() {
        log.info("Получен запрос на получение всех объектов проекта");
        return ResponseEntity.ok(projectObjectService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProjectObjectDto> getById(@PathVariable UUID id) {
        log.info("Получен запрос на получение объекта проекта с id {}", id);
        return ResponseEntity.ok(projectObjectService.getById(id));
    }

    @PostMapping
    public ResponseEntity<ProjectObjectDto> create(@Valid @RequestBody ProjectObjectDtoNew projectObjectDtoNew) {
        log.info("Получен запрос на создание объекта проекта: {}", projectObjectDtoNew);
        return ResponseEntity.ok(projectObjectService.create(projectObjectDtoNew));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProjectObjectDto> update(@PathVariable UUID id, @Valid @RequestBody ProjectObjectDtoUpdate projectObjectDtoUpdate) {
        log.info("Получен запрос на обновление объекта проекта с id {}: {}", id, projectObjectDtoUpdate);
        return ResponseEntity.ok(projectObjectService.update(id, projectObjectDtoUpdate));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        log.info("Получен запрос на удаление объекта проекта с id {}", id);
        projectObjectService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/export")
    public ResponseEntity<Resource> exportProjectObjects() {
        String filename = "project_objects.xlsx";
        List<ProjectObjectDto> projectObjects = projectObjectService.getAll();
        InputStreamResource file = new InputStreamResource(excelService.exportProjectObjectsToExcel(projectObjects));

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(file);
    }
} 