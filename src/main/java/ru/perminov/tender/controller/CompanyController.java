package ru.perminov.tender.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import ru.perminov.tender.dto.company.CompanyDtoNew;
import ru.perminov.tender.dto.company.CompanyDtoUpdate;
import ru.perminov.tender.model.company.Company;
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
    public ResponseEntity<Void> create(@RequestBody @Valid CompanyDtoNew companyDtoNew) {
        log.info("Пришел POST запрос на создание компании: {}", companyDtoNew);
        companyService.create(companyDtoNew);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}")
    public ResponseEntity<Void> update(@PathVariable UUID id, @RequestBody @Valid CompanyDtoUpdate companyDtoUpdate) {
        log.info("Пришел POST запрос на изменение компании uuid: {} содержимое: {}", id, companyDtoUpdate);
        companyService.update(id, companyDtoUpdate);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        log.info("Пришел DELETE запрос на удаление компании uuid: {}", id);
        companyService.delete(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Company> getById(@PathVariable UUID id) {
        log.info("Пришел GET запрос на получение компании uuid: {}", id);
        return ResponseEntity.ok(companyService.getById(id));
    }

    @GetMapping
    public ResponseEntity<List<Company>> getAll() {
        log.info("Пришел GET запрос на получение всех компаний");
        return ResponseEntity.ok(companyService.getAll());
    }
}