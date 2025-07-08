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
import org.springframework.web.multipart.MultipartFile;
import ru.perminov.tender.dto.company.CompanyDto;
import ru.perminov.tender.dto.company.CompanyDtoForUpdate;
import ru.perminov.tender.dto.company.CompanyDtoNew;
import ru.perminov.tender.dto.company.CompanyDtoUpdate;
import ru.perminov.tender.service.ExcelService;
import ru.perminov.tender.service.company.CompanyService;
import ru.perminov.tender.service.company.impl.CompanyServiceImpl.ImportResult;

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
        log.info("Получен POST-запрос: создать компанию. Данные: {}", companyDtoNew);
        CompanyDto created = companyService.create(companyDtoNew);
        log.info("Создана компания с id={}", created.id());
        return ResponseEntity.ok(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CompanyDto> update(@PathVariable String id, @RequestBody @Valid CompanyDtoUpdate companyDtoUpdate) {
        log.info("Получен PUT-запрос: обновить компанию. id={}, данные: {}", id, companyDtoUpdate);
        CompanyDto updated = companyService.update(UUID.fromString(id), companyDtoUpdate);
        log.info("Обновлена компания с id={}", updated.id());
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        log.info("Получен DELETE-запрос: удалить компанию. id={}", id);
        companyService.delete(id);
        log.info("Удалена компания с id={}", id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<CompanyDtoForUpdate> getById(@PathVariable String id) {
        log.info("Получен GET-запрос: получить компанию по id={}", id);
        return ResponseEntity.ok(companyService.getById(UUID.fromString(id)));
    }

    @GetMapping
    public ResponseEntity<List<CompanyDto>> getAll(@RequestParam(required = false) String role) {
        log.info("Получен GET-запрос: получить компании. role={}", role);
        List<CompanyDto> companies = companyService.getAll(role);
        log.info("Возвращено компаний: {}", companies.size());
        return ResponseEntity.ok(companies);
    }

    @GetMapping("/by-short-name/{shortName}")
    public ResponseEntity<CompanyDto> getByShortName(@PathVariable String shortName) {
        log.info("Получен GET-запрос: найти компанию по короткому наименованию. shortName={}", shortName);
        return ResponseEntity.ok(companyService.getByShortName(shortName));
    }

    @GetMapping("/export")
    public ResponseEntity<Resource> exportCompanies() {
        log.info("Получен GET-запрос: экспортировать компании в Excel");
        String filename = "companies.xlsx";
        List<CompanyDto> companies = companyService.getAll(null);
        InputStreamResource file = new InputStreamResource(excelService.exportCompaniesToExcel(companies));

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(file);
    }

    @PostMapping("/import")
    public ResponseEntity<ImportResult> importFromExcel(@RequestParam("file") MultipartFile file) {
        log.info("Получен POST-запрос: импортировать компании из Excel");
        ImportResult result = companyService.importFromExcel(file);
        return ResponseEntity.ok(result);
    }
}