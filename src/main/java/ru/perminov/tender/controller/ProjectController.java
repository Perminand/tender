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
import org.springframework.web.multipart.MultipartFile;
import ru.perminov.tender.dto.project.ProjectDto;
import ru.perminov.tender.dto.project.ProjectDtoNew;
import ru.perminov.tender.dto.project.ProjectDtoUpdate;
import ru.perminov.tender.service.ExcelService;
import ru.perminov.tender.service.ProjectService;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectController {
    private final ProjectService projectService;
    private final ExcelService excelService;

    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'VIEWER', 'CUSTOMER')")
    @GetMapping
    public ResponseEntity<List<ProjectDto>> getAll() {
        log.info("Получен GET-запрос: получить все проекты");
        List<ProjectDto> projects = projectService.getAll();
        log.info("Возвращено проектов: {}", projects.size());
        return ResponseEntity.ok(projects);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProjectDto> getById(@PathVariable UUID id) {
        log.info("Получен GET-запрос: получить проект по id={}", id);
        return ResponseEntity.ok(projectService.getById(id));
    }

    @PostMapping
    public ResponseEntity<ProjectDto> create(@Valid @RequestBody ProjectDtoNew dto) {
        log.info("Получен POST-запрос: создать проект. Данные: {}", dto);
        ProjectDto created = projectService.create(dto);
        log.info("Создан проект с id={}", created.id());
        return ResponseEntity.ok(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProjectDto> update(@PathVariable UUID id, @Valid @RequestBody ProjectDtoUpdate dto) {
        log.info("Получен PUT-запрос: обновить проект. id={}, данные: {}", id, dto);
        ProjectDto updated = projectService.update(id, dto);
        log.info("Обновлен проект с id={}", updated.id());
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        log.info("Получен DELETE-запрос: удалить проект. id={}", id);
        projectService.delete(id);
        log.info("Удален проект с id={}", id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/export")
    public ResponseEntity<Resource> exportProjects() {
        log.info("Получен GET-запрос: экспортировать проекты в Excel");
        String filename = "projects.xlsx";
        List<ProjectDto> projects = projectService.getAll();
        InputStreamResource file = new InputStreamResource(excelService.exportProjectsToExcel(projects));
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(file);
    }

    @PostMapping("/import")
    public ResponseEntity<String> importProjects(@RequestParam("file") MultipartFile file) {
        log.info("Получен POST-запрос: импортировать проекты из Excel");
        int importedCount = projectService.importFromExcel(file);
        return ResponseEntity.ok("Импортировано объектов: " + importedCount);
    }
} 