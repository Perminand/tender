package ru.perminov.tender.service.company.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.perminov.tender.dto.company.contact.ContactDtoNew;
import ru.perminov.tender.dto.company.contact.ContactDtoUpdate;
import ru.perminov.tender.mapper.company.ContactMapper;
import ru.perminov.tender.model.company.Contact;
import ru.perminov.tender.model.company.ContactPerson;
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
    private final ContactMapper contactMapper;

    @Override
    @Transactional
    public Contact update(UUID id, ContactDtoUpdate contactDtoUpdate) {
        Contact existingContact = getById(id);
        contactMapper.updateContactFromDto(contactDtoUpdate, existingContact);

        if (contactDtoUpdate.contactPersonId() != null) {
            ContactPerson contactPerson = contactPersonRepository.findById(contactDtoUpdate.contactPersonId())
                    .orElseThrow(() -> new RuntimeException("Контактное лицо не найдено с id: " + contactDtoUpdate.contactPersonId()));
            existingContact.setContactPerson(contactPerson);
        }

        return contactRepository.save(existingContact);
    }

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
        return contactRepository.findByContactPersonUuid(contactPersonUuid);
    }
} 