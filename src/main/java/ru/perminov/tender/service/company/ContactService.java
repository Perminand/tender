package ru.perminov.tender.service.company;

import ru.perminov.tender.model.company.Contact;

import java.util.List;
import java.util.UUID;

public interface ContactService {

    void delete(UUID id);

    Contact getById(UUID id);

    List<Contact> getAll();

    List<Contact> getByContactPersonUuid(UUID contactPersonUuid);
    
} 