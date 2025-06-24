package ru.perminov.tender.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ru.perminov.tender.dto.worktype.WorkTypeDto;
import ru.perminov.tender.service.WorkTypeService;

import java.util.List;

@RestController
@RequestMapping("/api/work-types")
@RequiredArgsConstructor
public class WorkTypeController {
    private final WorkTypeService workTypeService;

    @GetMapping
    public List<WorkTypeDto> getAllWorkTypes() {
        return workTypeService.getAllWorkTypes();
    }

    @PostMapping
    public ResponseEntity<WorkTypeDto> createWorkType(@RequestBody WorkTypeDto workTypeDto) {
        return ResponseEntity.ok(workTypeService.createWorkType(workTypeDto));
    }
} 