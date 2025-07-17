package ru.perminov.tender.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ru.perminov.tender.dto.CharacteristicDto;
import ru.perminov.tender.service.CharacteristicService;

import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/characteristics")
@RequiredArgsConstructor
public class CharacteristicController {
    private final CharacteristicService service;

    @GetMapping
    public ResponseEntity<List<CharacteristicDto>> getAll() {
        log.info("Получен GET-запрос: получить все характеристики");
        List<CharacteristicDto> characteristics = service.findAll();
        log.info("Возвращено характеристик: {}", characteristics.size());
        return ResponseEntity.ok(characteristics);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CharacteristicDto> getById(@PathVariable UUID id) {
        log.info("Получен GET-запрос: получить характеристику по id={}", id);
        // Метод findById не реализован в сервисе, возвращаем список всех и ищем по id
        List<CharacteristicDto> characteristics = service.findAll();
        CharacteristicDto characteristic = characteristics.stream()
                .filter(c -> c.id().equals(id))
                .findFirst()
                .orElse(null);
        if (characteristic == null) {
            log.warn("Характеристика с id={} не найдена", id);
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(characteristic); 
    }

    @PostMapping
    public ResponseEntity<CharacteristicDto> create(@RequestBody CharacteristicDto dto) {
        log.info("Получен POST-запрос: создать характеристику. Данные: {}", dto);
        CharacteristicDto created = service.save(dto);
        log.info("Создана характеристика с id={}", created.id());
        return ResponseEntity.ok(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CharacteristicDto> update(@PathVariable UUID id, @RequestBody CharacteristicDto dto) {
        log.info("Получен PUT-запрос: обновить характеристику. id={}, данные: {}", id, dto);
        CharacteristicDto updatedDto = new CharacteristicDto(id, dto.name(), dto.description(), dto.createdAt(), dto.updatedAt());
        CharacteristicDto updated = service.save(updatedDto);
        log.info("Обновлена характеристика с id={}", updated.id());
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        log.info("Получен DELETE-запрос: удалить характеристику. id={}", id);
        service.delete(id);
        log.info("Удалена характеристика с id={}", id);
        return ResponseEntity.noContent().build();
    }
} 