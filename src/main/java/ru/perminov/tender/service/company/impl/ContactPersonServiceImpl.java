package ru.perminov.tender.service.company.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.perminov.tender.dto.company.contact.ContactPersonDtoNew;
import ru.perminov.tender.dto.company.contact.ContactPersonDtoUpdate;
import ru.perminov.tender.mapper.company.ContactPersonMapper;
import ru.perminov.tender.model.company.Company;
import ru.perminov.tender.model.company.Contact;
import ru.perminov.tender.model.company.ContactPerson;
import ru.perminov.tender.model.company.ContactType;
import ru.perminov.tender.repository.company.CompanyRepository;
import ru.perminov.tender.repository.company.ContactPersonRepository;
import ru.perminov.tender.repository.company.ContactTypeRepository;
import ru.perminov.tender.service.company.ContactPersonService;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ContactPersonServiceImpl implements ContactPersonService {

    private final ContactPersonRepository contactPersonRepository;
    private final CompanyRepository companyRepository;
    private final ContactTypeRepository contactTypeRepository;
    private final ContactPersonMapper contactPersonMapper;

    @Override
    @Transactional
    public ContactPerson create(ContactPersonDtoNew contactPersonDtoNew) {
        Company company = companyRepository.findById(contactPersonDtoNew.companyUuid())
                .orElseThrow(() -> new RuntimeException("Компания не найдена с id: " + contactPersonDtoNew.companyUuid()));

        ContactPerson contactPerson = contactPersonMapper.toContactPerson(contactPersonDtoNew);
        contactPerson.setCompany(company);

        // Создаем контакт с телефоном
        ContactType phoneType = contactTypeRepository.findByCode("PHONE")
                .orElseThrow(() -> new RuntimeException("Тип контакта PHONE не найден"));
        Contact phoneContact = new Contact();
        phoneContact.setType(phoneType);
        phoneContact.setValue(contactPersonDtoNew.phone());
        phoneContact.setContactPerson(contactPerson);
        contactPerson.getContacts().add(phoneContact);

        // Создаем контакт с email, если он указан
        if (contactPersonDtoNew.email() != null) {
            ContactType emailType = contactTypeRepository.findByCode("EMAIL")
                    .orElseThrow(() -> new RuntimeException("Тип контакта EMAIL не найден"));
            Contact emailContact = new Contact();
            emailContact.setType(emailType);
            emailContact.setValue(contactPersonDtoNew.email());
            emailContact.setContactPerson(contactPerson);
            contactPerson.getContacts().add(emailContact);
        }

        return contactPersonRepository.save(contactPerson);
    }

    @Override
    @Transactional
    public ContactPerson update(UUID id, ContactPersonDtoUpdate contactPersonDtoUpdate) {
        ContactPerson existingContactPerson = getById(id);
        contactPersonMapper.updateContactPersonFromDto(contactPersonDtoUpdate, existingContactPerson);

        // Обновляем контакты
        if (contactPersonDtoUpdate.phone() != null) {
            updateOrCreateContact(existingContactPerson, "PHONE", contactPersonDtoUpdate.phone());
        }
        if (contactPersonDtoUpdate.email() != null) {
            updateOrCreateContact(existingContactPerson, "EMAIL", contactPersonDtoUpdate.email());
        }

        return contactPersonRepository.save(existingContactPerson);
    }

    private void updateOrCreateContact(ContactPerson contactPerson, String typeCode, String value) {
        ContactType contactType = contactTypeRepository.findByCode(typeCode)
                .orElseThrow(() -> new RuntimeException("Тип контакта " + typeCode + " не найден"));

        contactPerson.getContacts().stream()
                .filter(contact -> contact.getType().getCode().equals(typeCode))
                .findFirst()
                .ifPresentOrElse(
                        contact -> contact.setValue(value),
                        () -> {
                            Contact newContact = new Contact();
                            newContact.setType(contactType);
                            newContact.setValue(value);
                            newContact.setContactPerson(contactPerson);
                            contactPerson.getContacts().add(newContact);
                        }
                );
    }

    @Override
    @Transactional
    public void delete(UUID id) {
        contactPersonRepository.deleteById(id);
    }

    @Override
    public ContactPerson getById(UUID id) {
        return contactPersonRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Контактное лицо не найдено с id: " + id));
    }

    @Override
    public List<ContactPerson> getAll() {
        return contactPersonRepository.findAll();
    }

    @Override
    public List<ContactPerson> getByCompanyUuid(UUID companyUuid) {
        return contactPersonRepository.findByCompanyUuid(companyUuid);
    }
} 