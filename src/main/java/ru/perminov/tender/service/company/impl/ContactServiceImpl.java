package ru.perminov.tender.service.company.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.perminov.tender.model.company.Contact;
import ru.perminov.tender.repository.company.ContactPersonRepository;
import ru.perminov.tender.repository.company.ContactRepository;
import ru.perminov.tender.service.company.ContactService;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ContactServiceImpl implements ContactService {

    private final ContactRepository contactRepository;
    private final ContactPersonRepository contactPersonRepository;

    @Override
    @Transactional
    public void delete(UUID id) {
        contactRepository.deleteById(id);
    }

    @Override
    public Contact getById(UUID id) {
        return contactRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Контакт не найден с id: " + id));
    }

    @Override
    public List<Contact> getAll() {
        return contactRepository.findAll();
    }

    @Override
    public List<Contact> getByContactPersonUuid(UUID contactPersonUuid) {
        return null;
    }
} 