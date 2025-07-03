package ru.perminov.tender.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import ru.perminov.tender.dto.ImportResultDto;
import ru.perminov.tender.dto.company.contact.ContactTypeDto;
import ru.perminov.tender.dto.company.contact.ContactTypeDtoNew;
import ru.perminov.tender.dto.company.contact.ContactTypeDtoUpdate;
import ru.perminov.tender.service.ExcelService;
import ru.perminov.tender.service.company.ContactTypeService;

import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/contact-types")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://127.0.0.1:5173", "http://localhost:5173", "http://localhost:3000"})
public class ContactTypeController {

    private final ContactTypeService contactTypeService;
    private final ExcelService excelService;

    @GetMapping
    public ResponseEntity<List<ContactTypeDto>> getAll() {
        log.info("Получен GET-запрос: получить все типы контактов");
        List<ContactTypeDto> contactTypes = contactTypeService.getAll();
        log.info("Возвращено типов контактов: {}", contactTypes.size());
        return ResponseEntity.ok(contactTypes);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ContactTypeDto> getById(@PathVariable UUID id) {
        log.info("Получен GET-запрос: получить тип контакта по id={}", id);
        ContactTypeDto contactType = contactTypeService.getById(id);
        log.info("Найден тип контакта: {}", contactType);
        return ResponseEntity.ok(contactType);
    }

    @PostMapping
    public ResponseEntity<ContactTypeDto> create(@Valid @RequestBody ContactTypeDtoNew contactTypeDtoNew) {
        log.info("Получен POST-запрос: создать тип контакта. Данные: {}", contactTypeDtoNew);
        ContactTypeDto created = contactTypeService.create(contactTypeDtoNew);
        log.info("Создан тип контакта с id={}", created.id());
        return ResponseEntity.ok(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ContactTypeDto> update(@PathVariable UUID id, @Valid @RequestBody ContactTypeDtoUpdate contactTypeDtoUpdate) {
        log.info("Получен PUT-запрос: обновить тип контакта. id={}, данные: {}", id, contactTypeDtoUpdate);
        ContactTypeDto updated = contactTypeService.update(id, contactTypeDtoUpdate);
        log.info("Обновлен тип контакта с id={}", updated.id());
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        log.info("Получен DELETE-запрос: удалить тип контакта. id={}", id);
        contactTypeService.delete(id);
        log.info("Удален тип контакта с id={}", id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/export")
    public ResponseEntity<Resource> exportContactTypes() {
        log.info("Получен GET-запрос: экспортировать типы контактов в Excel");
        String filename = "contact_types.xlsx";
        List<ContactTypeDto> contactTypes = contactTypeService.getAll();
        InputStreamResource file = new InputStreamResource(excelService.exportContactTypesToExcel(contactTypes));

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(file);
    }

    @PostMapping("/import")
    public ResponseEntity<ImportResultDto> importFromExcel(@RequestParam("file") MultipartFile file) {
        log.info("Получен POST-запрос: импортировать типы контактов из Excel");
        ImportResultDto result = contactTypeService.importFromExcel(file);
        return ResponseEntity.ok(result);
    }
} 