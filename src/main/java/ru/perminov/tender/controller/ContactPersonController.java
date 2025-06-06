package ru.perminov.tender.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ru.perminov.tender.dto.company.contact.ContactPersonDtoNew;
import ru.perminov.tender.dto.company.contact.ContactPersonDtoUpdate;
import ru.perminov.tender.model.company.ContactPerson;
import ru.perminov.tender.service.company.ContactPersonService;

import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/companies/contact-persons")
public class ContactPersonController {

    private final ContactPersonService contactPersonService;

    @PostMapping
    public ResponseEntity<ContactPerson> create(@Valid @RequestBody ContactPersonDtoNew contactPersonDtoNew) {
        log.info("Получен запрос на создание контактного лица: {}", contactPersonDtoNew);
        ContactPerson contactPerson = contactPersonService.create(contactPersonDtoNew);
        return ResponseEntity.status(HttpStatus.CREATED).body(contactPerson);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ContactPerson> update(@PathVariable UUID id, @Valid @RequestBody ContactPersonDtoUpdate contactPersonDtoUpdate) {
        log.info("Получен запрос на обновление контактного лица с id {}: {}", id, contactPersonDtoUpdate);
        ContactPerson contactPerson = contactPersonService.update(id, contactPersonDtoUpdate);
        return ResponseEntity.ok(contactPerson);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        log.info("Получен запрос на удаление контактного лица с id {}", id);
        contactPersonService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<ContactPerson> getById(@PathVariable UUID id) {
        log.info("Получен запрос на получение контактного лица с id {}", id);
        ContactPerson contactPerson = contactPersonService.getById(id);
        return ResponseEntity.ok(contactPerson);
    }

    @GetMapping
    public ResponseEntity<List<ContactPerson>> getAll() {
        log.info("Получен запрос на получение всех контактных лиц");
        List<ContactPerson> contactPersons = contactPersonService.getAll();
        return ResponseEntity.ok(contactPersons);
    }

    @GetMapping("/company/{companyUuid}")
    public ResponseEntity<List<ContactPerson>> getByCompanyUuid(@PathVariable UUID companyUuid) {
        log.info("Получен запрос на получение контактных лиц для компании с id {}", companyUuid);
        List<ContactPerson> contactPersons = contactPersonService.getByCompanyUuid(companyUuid);
        return ResponseEntity.ok(contactPersons);
    }
} 