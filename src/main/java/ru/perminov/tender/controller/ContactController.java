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
@CrossOrigin(origins = {"http://127.0.0.1:5173", "http://localhost:5173", "http://localhost:3000"})
public class ContactController {

    private final ContactService contactService;

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        log.info("Получен DELETE-запрос: удалить контакт. id={}", id);
        contactService.delete(id);
        log.info("Удален контакт с id={}", id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Contact> getById(@PathVariable UUID id) {
        log.info("Получен GET-запрос: получить контакт по id={}", id);
        Contact contact = contactService.getById(id);
        log.info("Найден контакт: {}", contact);
        return ResponseEntity.ok(contact);
    }

    @GetMapping
    public ResponseEntity<List<Contact>> getAll() {
        log.info("Получен GET-запрос: получить все контакты");
        List<Contact> contacts = contactService.getAll();
        log.info("Возвращено контактов: {}", contacts.size());
        return ResponseEntity.ok(contacts);
    }

    @GetMapping("/contact-person/{contactPersonUuid}")
    public ResponseEntity<List<Contact>> getByContactPersonUuid(@PathVariable UUID contactPersonUuid) {
        log.info("Получен GET-запрос: получить контакты для контактного лица. contactPersonUuid={}", contactPersonUuid);
        List<Contact> contacts = contactService.getByContactPersonUuid(contactPersonUuid);
        log.info("Найдено контактов для контактного лица {}: {}", contactPersonUuid, contacts.size());
        return ResponseEntity.ok(contacts);
    }
}