package ru.perminov.tender.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import ru.perminov.tender.dto.company.CompanyDto;
import ru.perminov.tender.dto.company.CompanyDtoForUpdate;
import ru.perminov.tender.dto.company.CompanyDtoNew;
import ru.perminov.tender.dto.company.CompanyDtoUpdate;
import ru.perminov.tender.service.company.CompanyService;

import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/companies")
@RequiredArgsConstructor
@Validated
public class CompanyController {

    private final CompanyService companyService;

    @PostMapping
    public ResponseEntity<CompanyDto> create(@RequestBody @Valid CompanyDtoNew companyDtoNew) {
        log.info("Пришел POST запрос на создание компании: {}", companyDtoNew);
        return ResponseEntity.ok(companyService.create(companyDtoNew));
    }

    @PostMapping("/{id}")
    public ResponseEntity<CompanyDto> update(@PathVariable String id, @RequestBody @Valid CompanyDtoUpdate companyDtoUpdate) {
        log.info("Пришел POST запрос на изменение компании uuid: {} содержимое: {}", id, companyDtoUpdate);
        return ResponseEntity.ok(companyService.update(UUID.fromString(id), companyDtoUpdate));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        log.info("Пришел DELETE запрос на удаление компании uuid: {}", id);
        companyService.delete(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<CompanyDtoForUpdate> getById(@PathVariable String id) {
        log.info("Пришел GET запрос на получение компании uuid: {}", id);
        return ResponseEntity.ok(companyService.getById(UUID.fromString(id)));
    }

    @GetMapping
    public ResponseEntity<List<CompanyDto>> getAll() {
        log.info("Пришел GET запрос на получение всех компаний");
        return ResponseEntity.ok(companyService.getAll());
    }
}