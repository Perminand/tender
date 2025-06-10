package ru.perminov.tender.service.company.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.perminov.tender.dto.company.CompanyDtoNew;
import ru.perminov.tender.dto.company.CompanyDtoUpdate;
import ru.perminov.tender.mapper.company.CompanyMapper;
import ru.perminov.tender.model.company.Company;
import ru.perminov.tender.model.company.CompanyType;
import ru.perminov.tender.model.company.ContactType;
import ru.perminov.tender.repository.company.CompanyRepository;
import ru.perminov.tender.repository.company.CompanyTypeRepository;
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

    @Override
    @Transactional
    public Company create(CompanyDtoNew companyDtoNew) {
        Company company = companyMapper.toCompany(companyDtoNew);
        CompanyType type = typeCompanyRepository.findById(UUID.fromString(companyDtoNew.typeId()))
                .orElseThrow(() -> new RuntimeException("TypeCompany not found with id: " + companyDtoNew.typeId()));
        company.setType(type);

        // Обработка контактных лиц и их контактов
        if (company.getContactPersons() != null) {
            for (var contactPerson : company.getContactPersons()) {
                contactPerson.setCompany(company);
                if (contactPerson.getContacts() != null) {
                    for (var contact : contactPerson.getContacts()) {
                        contact.setContactPerson(contactPerson);
                        if (contact.getType() == null && contact.getNewTypeName() != null && !contact.getNewTypeName().isBlank()) {
                            // Создаем новый тип контакта
                            ContactType newType = new ContactType();
                            newType.setName(contact.getNewTypeName());
                            newType.setCode(contact.getNewTypeName().toUpperCase().replaceAll("\\s+", "_"));
                            newType = contactTypeRepository.save(newType);
                            contact.setType(newType);
                        }
                    }
                }
            }
        }

        return companyRepository.save(company);
    }

    @Override
    @Transactional
    public Company update(UUID id, CompanyDtoUpdate companyDtoUpdate) {
        Company existingCompany = getById(id);
        companyMapper.updateCompanyFromDto(companyDtoUpdate, existingCompany);
        if (companyDtoUpdate.typeId() != null) {
            CompanyType type = typeCompanyRepository.findById(UUID.fromString(companyDtoUpdate.typeId()))
                    .orElseThrow(() -> new RuntimeException("TypeCompany not found with id: " + companyDtoUpdate.typeId()));
            existingCompany.setType(type);
        }

        // Обработка контактных лиц и их контактов
        if (existingCompany.getContactPersons() != null) {
            for (var contactPerson : existingCompany.getContactPersons()) {
                contactPerson.setCompany(existingCompany);
                if (contactPerson.getContacts() != null) {
                    for (var contact : contactPerson.getContacts()) {
                        contact.setContactPerson(contactPerson);
                        if (contact.getType() == null && contact.getNewTypeName() != null && !contact.getNewTypeName().isBlank()) {
                            // Создаем новый тип контакта
                            ContactType newType = new ContactType();
                            newType.setName(contact.getNewTypeName());
                            newType.setCode(contact.getNewTypeName().toUpperCase().replaceAll("\\s+", "_"));
                            newType = contactTypeRepository.save(newType);
                            contact.setType(newType);
                        }
                    }
                }
            }
        }
        
        return companyRepository.save(existingCompany);
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
} 