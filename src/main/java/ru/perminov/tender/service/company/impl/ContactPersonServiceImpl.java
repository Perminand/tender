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

        // Новая логика: обработка списка contacts

        return contactPersonRepository.save(contactPerson);
    }

    @Override
    @Transactional
    public ContactPerson update(UUID id, ContactPersonDtoUpdate contactPersonDtoUpdate) {
        ContactPerson existingContactPerson = findByUuid(id);
        contactPersonMapper.updateContactPersonFromDto(contactPersonDtoUpdate, existingContactPerson);

        return contactPersonRepository.save(existingContactPerson);
    }

    @Override
    @Transactional
    public void delete(UUID id) {
        contactPersonRepository.deleteById(id);
    }

    @Override
    public List<ContactPerson> getAll() {
        return contactPersonRepository.findAll();
    }

    @Override
    public List<ContactPerson> getByCompanyUuid(UUID companyUuid) {
        return null;
//        return contactPersonRepository.findByCompanyId(companyUuid);
    }

    @Override
    public ContactPerson findByUuid(UUID uuid) {
        return contactPersonRepository.findById(uuid)
                .orElseThrow(() -> new RuntimeException("Контактное лицо не найдено с uuid: " + uuid));
    }
} 