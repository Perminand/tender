package ru.perminov.tender.service.company.impl;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.perminov.tender.dto.company.CompanyDtoNew;
import ru.perminov.tender.dto.company.CompanyDtoUpdate;
import ru.perminov.tender.dto.company.contact.ContactDtoUpdate;
import ru.perminov.tender.dto.company.contact.ContactPersonDtoNew;
import ru.perminov.tender.dto.company.contact.ContactPersonDtoUpdate;
import ru.perminov.tender.mapper.company.CompanyMapper;
import ru.perminov.tender.mapper.company.ContactMapper;
import ru.perminov.tender.mapper.company.ContactPersonMapper;
import ru.perminov.tender.model.company.Company;
import ru.perminov.tender.model.company.CompanyType;
import ru.perminov.tender.model.company.Contact;
import ru.perminov.tender.model.company.ContactPerson;
import ru.perminov.tender.model.company.ContactType;
import ru.perminov.tender.repository.company.CompanyRepository;
import ru.perminov.tender.repository.company.CompanyTypeRepository;
import ru.perminov.tender.repository.company.ContactPersonRepository;
import ru.perminov.tender.repository.company.ContactRepository;
import ru.perminov.tender.repository.company.ContactTypeRepository;
import ru.perminov.tender.service.company.CompanyService;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CompanyServiceImpl implements CompanyService {

    private final CompanyRepository companyRepository;
    private final CompanyTypeRepository typeCompanyRepository;
    private final ContactTypeRepository contactTypeRepository;
    private final CompanyMapper companyMapper;
    private final ContactRepository contactRepository;
    private final ContactPersonMapper contactPersonMapper;
    private final ContactPersonRepository contactPersonRepository;

    @Override
    @Transactional
    public void create(CompanyDtoNew companyDtoNew) {
        // Создаем и сохраняем компанию
        Company company = companyMapper.toCompany(companyDtoNew);
        company.setType(createOrUpdateType(companyDtoNew));


        // Обработка контактных лиц и их контактов
        if (companyDtoNew.contactPersons() != null && !companyDtoNew.contactPersons().isEmpty()) {
            for (ContactPersonDtoNew contactPersonDto : companyDtoNew.contactPersons()) {
                // Создаем контактное лицо
                ContactPerson contactPerson = contactPersonMapper.newContactPersonFromDto(company, contactPersonDto);
                contactPerson.setCompany(company);

                // Обрабатываем контакты
                if (contactPersonDto.contacts() != null && !contactPersonDto.contacts().isEmpty()) {
                    for (var contactDto : contactPersonDto.contacts()) {
                        Contact contact = new Contact();
                        contact.setContactPerson(contactPerson);
                        contact.setValue(contactDto.value());

                        String contactCode = contactDto.typeName().toUpperCase().replaceAll("\\s+", "_");
                        // Устанавливаем тип контакта
                        if (contactDto.contactTypeUuid() != null) {
                            ContactType contactType = contactTypeRepository.findById(contactDto.contactTypeUuid())
                                    .orElseThrow(() -> new RuntimeException("Тип контакта не найден: " + contactDto.contactTypeUuid()));
                            contact.setType(contactType);
                        } else if (!contactDto.typeName().isBlank()) {
                            if (!contactTypeRepository.existsByCode(contactCode)) {
                                ContactType newType = new ContactType();
                                newType.setName(contactDto.typeName());
                                newType.setCode(contactCode);
                                newType = contactTypeRepository.save(newType);
                                contact.setType(newType);
                            }
                            else {
                                throw new DuplicateKeyException("Имя типа контакта уже используется в базе: "
                                        + contactDto.typeName());
                            }
                        }
                        // Добавляем контакт в коллекцию контактного лица

                        contactPerson.getContacts().add(contact);
                    }
                }

                // Сохраняем контактное лицо (каскадно сохранятся и контакты)
                contactPersonRepository.save(contactPerson);
            }
        }
        companyRepository.save(company);
    }

    @Override
    @Transactional
    public void update(UUID id, CompanyDtoUpdate companyDtoUpdate) {
        Company existingCompany = getById(id);
        companyMapper.updateCompanyFromDto(companyDtoUpdate, existingCompany);
        CompanyType type;
        if (companyDtoUpdate.typeId() != null) {
            if (!companyDtoUpdate.typeId().equals("new")) {
                type = typeCompanyRepository.findById(UUID.fromString(companyDtoUpdate.typeId()))
                        .orElseGet(() -> {
                            CompanyType newType = new CompanyType(null, companyDtoUpdate.typeName());
                            return typeCompanyRepository.save(newType);
                        });
            } else {
                type = new CompanyType(null, companyDtoUpdate.typeName());
                typeCompanyRepository.save(type);
            }
            existingCompany.setType(type);
        }
        companyRepository.save(existingCompany);
    }

    @Override
    @Transactional
    public void delete(UUID id) {
        companyRepository.deleteById(id);
    }

    @Override
    public Company getById(UUID id) {
        return companyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Company not found with id: " + id));
    }

    @Override
    public List<Company> getAll() {
        return companyRepository.findAll();
    }

    private CompanyType createOrUpdateType(CompanyDtoNew dto) {
        if (dto.typeId().equals("new")) {
            return typeCompanyRepository.save(new CompanyType(null, dto.typeName()));
        } else {
            return typeCompanyRepository.findById(UUID.fromString(dto.typeId()))
                    .orElseGet(() -> {
                        CompanyType newType = new CompanyType(null, dto.typeName());
                        return typeCompanyRepository.save(newType);
                    });
        }
    }
} 