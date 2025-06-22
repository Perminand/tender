package ru.perminov.tender.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ru.perminov.tender.model.company.Contact;
import ru.perminov.tender.service.company.ContactService;

import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/companies/contacts")
public class ContactController {

    private final ContactService contactService;

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        log.info("Получен запрос на удаление контакта с id {}", id);
        contactService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Contact> getById(@PathVariable UUID id) {
        log.info("Получен запрос на получение контакта с id {}", id);
        Contact contact = contactService.getById(id);
        return ResponseEntity.ok(contact);
    }

    @GetMapping
    public ResponseEntity<List<Contact>> getAll() {
        log.info("Получен запрос на получение всех контактов");
        List<Contact> contacts = contactService.getAll();
        return ResponseEntity.ok(contacts);
    }

    @GetMapping("/contact-person/{contactPersonUuid}")
    public ResponseEntity<List<Contact>> getByContactPersonUuid(@PathVariable UUID contactPersonUuid) {
        log.info("Получен запрос на получение контактов для контактного лица с id {}", contactPersonUuid);
        List<Contact> contacts = contactService.getByContactPersonUuid(contactPersonUuid);
        return ResponseEntity.ok(contacts);
    }
}