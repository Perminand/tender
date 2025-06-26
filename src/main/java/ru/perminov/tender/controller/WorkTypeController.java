package ru.perminov.tender.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ru.perminov.tender.dto.worktype.WorkTypeDto;
import ru.perminov.tender.service.WorkTypeService;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/work-types")
@RequiredArgsConstructor
public class WorkTypeController {
    private final WorkTypeService workTypeService;

    @GetMapping
    public List<WorkTypeDto> getAllWorkTypes() {
        log.info("Получен GET-запрос: получить все виды работ");
        return workTypeService.getAllWorkTypes();
    }

    @PostMapping
    public ResponseEntity<WorkTypeDto> createWorkType(@RequestBody WorkTypeDto workTypeDto) {
        log.info("Получен POST-запрос: создать вид работ. Данные: {}", workTypeDto);
        return ResponseEntity.ok(workTypeService.createWorkType(workTypeDto));
    }
} 