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
        log.info("Получен запрос на получение всех типов контактов");
        return ResponseEntity.ok(contactTypeService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ContactTypeDto> getById(@PathVariable UUID id) {
        log.info("Получен запрос на получение типа контакта с id {}", id);
        return ResponseEntity.ok(contactTypeService.getById(id));
    }

    @PostMapping
    public ResponseEntity<ContactTypeDto> create(@Valid @RequestBody ContactTypeDtoNew contactTypeDtoNew) {
        log.info("Получен запрос на создание типа контакта: {}", contactTypeDtoNew);
        return ResponseEntity.ok(contactTypeService.create(contactTypeDtoNew));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ContactTypeDto> update(@PathVariable UUID id, @Valid @RequestBody ContactTypeDtoUpdate contactTypeDtoUpdate) {
        log.info("Получен запрос на обновление типа контакта с id {}: {}", id, contactTypeDtoUpdate);
        return ResponseEntity.ok(contactTypeService.update(id, contactTypeDtoUpdate));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        log.info("Получен запрос на удаление типа контакта с id {}", id);
        contactTypeService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/export")
    public ResponseEntity<Resource> exportContactTypes() {
        String filename = "contact_types.xlsx";
        List<ContactTypeDto> contactTypes = contactTypeService.getAll();
        InputStreamResource file = new InputStreamResource(excelService.exportContactTypesToExcel(contactTypes));

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(file);
    }
} 