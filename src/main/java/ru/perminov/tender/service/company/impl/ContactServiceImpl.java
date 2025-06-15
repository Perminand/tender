package ru.perminov.tender.service.company.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.perminov.tender.dto.company.contact.ContactDtoNew;
import ru.perminov.tender.dto.company.contact.ContactDtoUpdate;
import ru.perminov.tender.mapper.company.ContactMapper;
import ru.perminov.tender.model.company.Contact;
import ru.perminov.tender.model.company.ContactPerson;
import ru.perminov.tender.model.company.ContactType;
import ru.perminov.tender.repository.company.ContactPersonRepository;
import ru.perminov.tender.repository.company.ContactRepository;
import ru.perminov.tender.repository.company.ContactTypeRepository;
import ru.perminov.tender.service.company.ContactService;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ContactServiceImpl implements ContactService {

    private final ContactRepository contactRepository;
    private final ContactPersonRepository contactPersonRepository;
    private final ContactTypeRepository contactTypeRepository;
    private final ContactMapper contactMapper;

    @Override
    @Transactional
    public Contact create(ContactDtoNew dto, UUID contactPersonUuid) {
        Contact contact = contactMapper.toContact(dto);
        
        ContactPerson contactPerson = contactPersonRepository.findById(contactPersonUuid)
                .orElseThrow(() -> new RuntimeException("Контактное лицо не найдено с id: " + contactPersonUuid));
        contact.setContactPerson(contactPerson);

        // Если выбран существующий тип контакта
        if (dto.contactTypeUuid() != null) {
            ContactType contactType = contactTypeRepository.findById(dto.contactTypeUuid())
                    .orElseThrow(() -> new RuntimeException("Тип контакта не найден с id: " + dto.contactTypeUuid()));
            contact.setType(contactType);
        }
        // Если создается новый тип контакта
        else if (dto.typeName() != null && !dto.typeName().isBlank()) {
            ContactType newType = new ContactType();
            newType.setName(dto.typeName());
            contactTypeRepository.save(newType);
            contact.setType(newType);
        }

        return contactRepository.save(contact);
    }

    @Override
    @Transactional
    public Contact update(UUID id, ContactDtoUpdate contactDtoUpdate) {
        Contact existingContact = getById(id);
        contactMapper.updateContactFromDto(contactDtoUpdate, existingContact);

        if (contactDtoUpdate.uuid() != null) {
            ContactPerson contactPerson = contactPersonRepository.findById(contactDtoUpdate.uuid())
                    .orElseThrow(() -> new RuntimeException("Контактное лицо не найдено с id: " + contactDtoUpdate.uuid()));
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