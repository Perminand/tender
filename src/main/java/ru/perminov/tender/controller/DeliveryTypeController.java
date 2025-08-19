package ru.perminov.tender.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ru.perminov.tender.dto.dictionary.DeliveryTypeDto;
import ru.perminov.tender.mapper.DeliveryTypeMapper;
import ru.perminov.tender.model.DeliveryType;
import ru.perminov.tender.repository.DeliveryTypeRepository;

import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/delivery-types")
@RequiredArgsConstructor
public class DeliveryTypeController {

    private final DeliveryTypeRepository repository;
    private final DeliveryTypeMapper mapper;

    @GetMapping
    public ResponseEntity<List<DeliveryTypeDto>> getAll() {
        log.info("Получен GET-запрос: получить все типы доставки");
        List<DeliveryTypeDto> list = repository.findAll().stream().map(mapper::toDto).toList();
        return ResponseEntity.ok(list);
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody DeliveryTypeDto dto) {
        log.info("Получен POST-запрос: создать тип доставки: {}", dto);
        String name = dto.getName() != null ? dto.getName().trim() : null;
        if (name == null || name.isEmpty()) {
            log.info("Отказ в создании типа доставки: пустое имя");
            return ResponseEntity.badRequest().body(java.util.Map.of("name", "Название не может быть пустым"));
        }
        if (repository.existsByName(name)) {
            log.info("Отказ в создании типа доставки: уже существует '{}" + "'", name);
            return ResponseEntity.status(409).body(java.util.Map.of("name", "Тип доставки с таким названием уже существует"));
        }
        DeliveryType entity = mapper.toEntity(dto);
        entity.setName(name);
        DeliveryType saved = repository.save(entity);
        log.info("Создан тип доставки id={} name='{}'", saved.getId(), saved.getName());
        return ResponseEntity.ok(mapper.toDto(saved));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        log.info("Получен DELETE-запрос: удалить тип доставки id={}", id);
        if (!repository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        repository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}


