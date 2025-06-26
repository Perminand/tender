package ru.perminov.tender.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ru.perminov.tender.dto.section.SectionDto;
import ru.perminov.tender.service.SectionService;
import lombok.extern.slf4j.Slf4j;

import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/sections")
@RequiredArgsConstructor
public class SectionController {
    private final SectionService sectionService;

    @GetMapping("/by-project/{projectId}")
    public List<SectionDto> getSectionsByProject(@PathVariable UUID projectId) {
        log.info("Получен GET-запрос: получить участки по проекту. projectId={}", projectId);
        return sectionService.getSectionsByProject(projectId);
    }

    @PostMapping
    public ResponseEntity<SectionDto> createSection(@RequestBody SectionDto sectionDto) {
        log.info("Получен POST-запрос: создать участок. Данные: {}", sectionDto);
        return ResponseEntity.ok(sectionService.createSection(sectionDto));
    }
} 