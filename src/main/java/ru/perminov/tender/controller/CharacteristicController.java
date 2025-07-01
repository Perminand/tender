package ru.perminov.tender.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import ru.perminov.tender.dto.CharacteristicDto;
import ru.perminov.tender.service.CharacteristicService;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/characteristics")
@RequiredArgsConstructor
public class CharacteristicController {
    private final CharacteristicService service;

    @GetMapping
    public List<CharacteristicDto> getAll() {
        return service.findAll();
    }

    @PostMapping
    public CharacteristicDto create(@RequestBody CharacteristicDto dto) {
        return service.save(dto);
    }

    @PutMapping("/{id}")
    public CharacteristicDto update(@PathVariable UUID id, @RequestBody CharacteristicDto dto) {
        CharacteristicDto updatedDto = new CharacteristicDto(id, dto.name(), dto.description(), dto.createdAt(), dto.updatedAt());
        return service.save(updatedDto);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable UUID id) {
        service.delete(id);
    }
} 