package ru.perminov.tender.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ru.perminov.tender.dto.companyType.CompanyTypeDtoNew;
import ru.perminov.tender.dto.companyType.CompanyTypeDtoUpdate;
import ru.perminov.tender.model.company.CompanyType;
import ru.perminov.tender.service.company.CompanyTypeService;

import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/company/type-companies")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class CompanyTypeController {

    private final CompanyTypeService companyTypeService;

    @PostMapping
    public ResponseEntity<CompanyType> create(@RequestBody CompanyTypeDtoNew dto) {
        log.info("Пришел POST запрос на создание типа компании: {}", dto);
        return ResponseEntity.ok(companyTypeService.create(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CompanyType> update(@PathVariable UUID id, @RequestBody CompanyTypeDtoUpdate dto) {
        log.info("Пришел PUT запрос на изменение типа компании uuid: {} содержимое: {}", id, dto);
        return ResponseEntity.ok(companyTypeService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        log.info("Пришел DELETE запрос на удаление типа компании uuid: {}", id);

        companyTypeService.delete(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<CompanyType> getById(@PathVariable UUID id) {
        log.info("Пришел GET запрос на получение типа компании uuid: {}", id);
        return ResponseEntity.ok(companyTypeService.getById(id));
    }

    @GetMapping
    public ResponseEntity<List<CompanyType>> getAll() {
        log.info("Пришел GET запрос на получение всех типов компаний");
        return ResponseEntity.ok(companyTypeService.getAll());
    }
} 