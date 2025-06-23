package ru.perminov.tender.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import ru.perminov.tender.dto.company.CompanyDto;
import ru.perminov.tender.dto.company.CompanyDtoForUpdate;
import ru.perminov.tender.dto.company.CompanyDtoNew;
import ru.perminov.tender.dto.company.CompanyDtoUpdate;
import ru.perminov.tender.service.ExcelService;
import ru.perminov.tender.service.company.CompanyService;

import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/companies")
@RequiredArgsConstructor
@Validated
@CrossOrigin(origins = {"http://127.0.0.1:5173", "http://localhost:5173", "http://localhost:3000"})
public class CompanyController {

    private final CompanyService companyService;
    private final ExcelService excelService;

    @PostMapping
    public ResponseEntity<CompanyDto> create(@RequestBody @Valid CompanyDtoNew companyDtoNew) {
        log.info("Пришел POST запрос на создание компании: {}", companyDtoNew);
        return ResponseEntity.ok(companyService.create(companyDtoNew));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CompanyDto> update(@PathVariable String id, @RequestBody @Valid CompanyDtoUpdate companyDtoUpdate) {
        log.info("Пришел PUT запрос на изменение компании uuid: {} содержимое: {}", id, companyDtoUpdate);
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

    @GetMapping("/export")
    public ResponseEntity<Resource> exportCompanies() {
        String filename = "companies.xlsx";
        List<CompanyDto> companies = companyService.getAll();
        InputStreamResource file = new InputStreamResource(excelService.exportCompaniesToExcel(companies));

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(file);
    }
}