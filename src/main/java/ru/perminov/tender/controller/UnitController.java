package ru.perminov.tender.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ru.perminov.tender.dto.UnitDto;
import ru.perminov.tender.dto.UnitDtoNew;
import ru.perminov.tender.dto.UnitDtoUpdate;
import ru.perminov.tender.mapper.UnitMapper;
import ru.perminov.tender.model.Unit;
import ru.perminov.tender.service.UnitService;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/units")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://127.0.0.1:5173", "http://localhost:5173", "http://localhost:3000"})
public class UnitController {

    private final UnitService unitService;
    private final UnitMapper unitMapper;

    @PostMapping
    public ResponseEntity<UnitDto> create(@RequestBody UnitDtoNew unitDtoNew) {
        Unit unit = unitService.create(unitDtoNew);
        return ResponseEntity.ok(unitMapper.toUnitDto(unit));
    }

    @PutMapping("/{id}")
    public ResponseEntity<UnitDto> update(@PathVariable UUID id, @RequestBody UnitDtoUpdate unitDtoUpdate) {
        Unit unit = unitService.update(id, unitDtoUpdate);
        return ResponseEntity.ok(unitMapper.toUnitDto(unit));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        unitService.delete(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<UnitDto> getById(@PathVariable UUID id) {
        Unit unit = unitService.getById(id);
        return ResponseEntity.ok(unitMapper.toUnitDto(unit));
    }

    @GetMapping
    public ResponseEntity<List<UnitDto>> getAll() {
        List<Unit> units = unitService.getAll();
        List<UnitDto> unitDtos = units.stream()
                .map(unitMapper::toUnitDto)
                .toList();
        return ResponseEntity.ok(unitDtos);
    }
} 