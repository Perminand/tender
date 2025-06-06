package ru.perminov.tender.service.company;

import ru.perminov.tender.dto.company.contact.ContactDtoNew;
import ru.perminov.tender.dto.company.contact.ContactDtoUpdate;
import ru.perminov.tender.model.company.Contact;

import java.util.List;
import java.util.UUID;

public interface ContactService {

    Contact update(UUID id, ContactDtoUpdate contactDtoUpdate);

    void delete(UUID id);

    Contact getById(UUID id);

    List<Contact> getAll();

    List<Contact> getByContactPersonUuid(UUID contactPersonUuid);
    
} 