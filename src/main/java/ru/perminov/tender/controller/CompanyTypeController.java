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
@CrossOrigin(origins = {"http://127.0.0.1:5173", "http://localhost:5173", "http://localhost:3000"})
public class CompanyTypeController {

    private final CompanyTypeService companyTypeService;

    @PostMapping
    public ResponseEntity<CompanyType> create(@RequestBody CompanyTypeDtoNew dto) {
        log.info("Получен POST-запрос: создать тип компании. Данные: {}", dto);
        CompanyType created = companyTypeService.create(dto);
        log.info("Создан тип компании с id={}", created.getId());
        return ResponseEntity.ok(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CompanyType> update(@PathVariable UUID id, @RequestBody CompanyTypeDtoUpdate dto) {
        log.info("Получен PUT-запрос: обновить тип компании. id={}, данные: {}", id, dto);
        CompanyType updated = companyTypeService.update(id, dto);
        log.info("Обновлен тип компании с id={}", updated.getId());
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        log.info("Получен DELETE-запрос: удалить тип компании. id={}", id);
        companyTypeService.delete(id);
        log.info("Удален тип компании с id={}", id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<CompanyType> getById(@PathVariable UUID id) {
        log.info("Получен GET-запрос: получить тип компании по id={}", id);
        CompanyType companyType = companyTypeService.getById(id);
        log.info("Найден тип компании: {}", companyType);
        return ResponseEntity.ok(companyType);
    }

    @GetMapping
    public ResponseEntity<List<CompanyType>> getAll() {
        log.info("Получен GET-запрос: получить все типы компаний");
        List<CompanyType> companyTypes = companyTypeService.getAll();
        log.info("Возвращено типов компаний: {}", companyTypes.size());
        return ResponseEntity.ok(companyTypes);
    }
} 