package ru.perminov.tender.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ru.perminov.tender.dto.company.contact.ContactTypeDto;
import ru.perminov.tender.dto.company.contact.ContactTypeDtoNew;
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

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        log.info("Получен запрос на удаление типа контакта с id {}", id);
        contactTypeService.delete(id);
        return ResponseEntity.noContent().build();
    }
} 