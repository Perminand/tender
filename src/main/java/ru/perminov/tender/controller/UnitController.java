package ru.perminov.tender.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import ru.perminov.tender.dto.ImportResultDto;
import ru.perminov.tender.dto.UnitDto;
import ru.perminov.tender.dto.UnitDtoNew;
import ru.perminov.tender.dto.UnitDtoUpdate;
import ru.perminov.tender.mapper.UnitMapper;
import ru.perminov.tender.model.Unit;
import ru.perminov.tender.service.ExcelService;
import ru.perminov.tender.service.UnitService;
import lombok.extern.slf4j.Slf4j;

import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/units")
@RequiredArgsConstructor
public class UnitController {

    private final UnitService unitService;
    private final UnitMapper unitMapper;
    private final ExcelService excelService;

    @PostMapping
    public ResponseEntity<UnitDto> create(@RequestBody UnitDtoNew unitDtoNew) {
        log.info("Получен POST-запрос: создать единицу измерения. Данные: {}", unitDtoNew);
        Unit unit = unitService.create(unitDtoNew);
        UnitDto unitDto = unitMapper.toUnitDto(unit);
        log.info("Создана единица измерения с id={}", unitDto.id());
        return ResponseEntity.ok(unitDto);
    }

    @PutMapping("/{id}")
    public ResponseEntity<UnitDto> update(@PathVariable UUID id, @RequestBody UnitDtoUpdate unitDtoUpdate) {
        log.info("Получен PUT-запрос: обновить единицу измерения. id={}, данные: {}", id, unitDtoUpdate);
        Unit unit = unitService.update(id, unitDtoUpdate);
        UnitDto unitDto = unitMapper.toUnitDto(unit);
        log.info("Обновлена единица измерения с id={}", unitDto.id());
        return ResponseEntity.ok(unitDto);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        log.info("Получен DELETE-запрос: удалить единицу измерения. id={}", id);
        unitService.delete(id);
        log.info("Удалена единица измерения с id={}", id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<UnitDto> getById(@PathVariable UUID id) {
        log.info("Получен GET-запрос: получить единицу измерения по id={}", id);
        Unit unit = unitService.getById(id);
        UnitDto unitDto = unitMapper.toUnitDto(unit);
        log.info("Найдена единица измерения: {}", unitDto);
        return ResponseEntity.ok(unitDto);
    }

    @GetMapping("/export")
    public ResponseEntity<Resource> exportUnits() {
        log.info("Получен GET-запрос: экспортировать единицы измерения в Excel");
        String filename = "units.xlsx";
        List<Unit> units = unitService.getAll();
        InputStreamResource file = new InputStreamResource(excelService.exportUnitsToExcel(units));

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(file);
    }

    @GetMapping
    public ResponseEntity<List<UnitDto>> getAll() {
        log.info("Получен GET-запрос: получить все единицы измерения");
        List<Unit> units = unitService.getAll();
        List<UnitDto> unitDtos = units.stream()
                .map(unitMapper::toUnitDto)
                .toList();
        return ResponseEntity.ok(unitDtos);
    }

    @PostMapping("/import")
    public ResponseEntity<ImportResultDto> importFromExcel(@RequestParam("file") MultipartFile file) {
        log.info("Получен POST-запрос: импортировать единицы измерения из Excel");
        ImportResultDto result = unitService.importFromExcel(file);
        return ResponseEntity.ok(result);
    }
} 