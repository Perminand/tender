package ru.perminov.tender.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import ru.perminov.tender.dto.project.ProjectDtoNew;
import ru.perminov.tender.dto.project.ProjectDtoUpdate;
import ru.perminov.tender.model.Project;
import ru.perminov.tender.service.ProjectService;

import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
@Validated
@CrossOrigin(origins = {"http://127.0.0.1:5173", "http://localhost:5173", "http://localhost:3000"})
public class ProjectController {

    private final ProjectService projectService;

    @PostMapping
    public ResponseEntity<Project> create(@RequestBody @Valid ProjectDtoNew projectDtoNew) {
        log.info("Пришел POST запрос на создание проекта: {}", projectDtoNew);
        return ResponseEntity.ok(projectService.create(projectDtoNew));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Project> update(@PathVariable UUID id, @RequestBody @Valid ProjectDtoUpdate projectDtoUpdate) {
        log.info("Пришел PUT запрос на изменение проекта uuid: {} содержимое: {}", id, projectDtoUpdate);
        return ResponseEntity.ok(projectService.update(id, projectDtoUpdate));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        log.info("Пришел DELETE запрос на удаление проекта uuid: {}", id);
        projectService.delete(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Project> getById(@PathVariable UUID id) {
        log.info("Пришел GET запрос на получение проекта uuid: {}", id);
        return ResponseEntity.ok(projectService.getById(id));
    }

    @GetMapping
    public ResponseEntity<List<Project>> getAll() {
        log.info("Пришел GET запрос на получение всех проектов");
        return ResponseEntity.ok(projectService.getAll());
    }
} 