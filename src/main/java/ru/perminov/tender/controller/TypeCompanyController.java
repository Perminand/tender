package ru.perminov.tender.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import ru.perminov.tender.dto.typecompany.TypeCompanyDtoNew;
import ru.perminov.tender.dto.typecompany.TypeCompanyDtoUpdate;
import ru.perminov.tender.model.TypeCompany;
import ru.perminov.tender.service.TypeCompanyService;

import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/type-companies")
@RequiredArgsConstructor
@Validated
public class TypeCompanyController {

    private final TypeCompanyService typeCompanyService;

    @PostMapping
    public ResponseEntity<TypeCompany> create(@RequestBody @Valid TypeCompanyDtoNew typeCompanyDtoNew) {
        log.info("Пришел POST запрос на создание типа компании: {}", typeCompanyDtoNew);
        return ResponseEntity.ok(typeCompanyService.create(typeCompanyDtoNew));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<TypeCompany> update(@PathVariable UUID id, @RequestBody @Valid TypeCompanyDtoUpdate typeCompanyDtoUpdate) {
        log.info("Пришел PATCH запрос на изменение типа компании uuid: {} содержимое: {}", id, typeCompanyDtoUpdate);
        return ResponseEntity.ok(typeCompanyService.update(id, typeCompanyDtoUpdate));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        log.info("Пришел DELETE запрос на удаление типа компании uuid: {}", id);
        typeCompanyService.delete(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<TypeCompany> getById(@PathVariable UUID id) {
        log.info("Пришел GET запрос на получение типа компании uuid: {}", id);
        return ResponseEntity.ok(typeCompanyService.getById(id));
    }

    @GetMapping
    public ResponseEntity<List<TypeCompany>> getAll() {
        log.info("Пришел GET запрос на получение всех типов компаний");
        return ResponseEntity.ok(typeCompanyService.getAll());
    }
} 