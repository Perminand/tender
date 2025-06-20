package ru.perminov.tender.service.company.impl;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.perminov.tender.dto.company.CompanyDto;
import ru.perminov.tender.dto.company.CompanyDtoForUpdate;
import ru.perminov.tender.dto.company.CompanyDtoNew;
import ru.perminov.tender.dto.company.CompanyDtoUpdate;
import ru.perminov.tender.dto.company.contact.ContactDtoNew;
import ru.perminov.tender.dto.company.contact.ContactPersonDtoNew;
import ru.perminov.tender.mapper.company.CompanyMapper;
import ru.perminov.tender.mapper.company.ContactPersonMapper;
import ru.perminov.tender.model.company.Company;
import ru.perminov.tender.model.company.CompanyType;
import ru.perminov.tender.model.company.Contact;
import ru.perminov.tender.model.company.ContactPerson;
import ru.perminov.tender.model.company.ContactType;
import ru.perminov.tender.repository.company.CompanyRepository;
import ru.perminov.tender.repository.company.CompanyTypeRepository;
import ru.perminov.tender.repository.company.ContactPersonRepository;
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
    private final ContactPersonMapper contactPersonMapper;
    private final ContactPersonRepository contactPersonRepository;

    @Override
    @Transactional
    public CompanyDto create(CompanyDtoNew companyDtoNew) {
        // Создаем и сохраняем компанию
        Company company = companyMapper.toCompany(companyDtoNew);
        company.setCompanyType(createOrUpdateType(companyDtoNew));
        company = companyRepository.save(company);

        // Обработка контактных лиц и их контактов
        if (companyDtoNew.contactPersons() != null && !companyDtoNew.contactPersons().isEmpty()) {
            for (ContactPersonDtoNew contactPersonDto : companyDtoNew.contactPersons()) {
                ContactPerson contactPerson = contactPersonMapper.newContactPersonFromDto(company, contactPersonDto);
                contactPerson.setCompany(company);
                contactPersonRepository.save(contactPerson);

                // Обрабатываем контакты
                if (contactPersonDto.contacts() != null && !contactPersonDto.contacts().isEmpty()) {
                    for (ContactDtoNew contactDto : contactPersonDto.contacts()) {
                        Contact contact = new Contact();
                        contact.setContactPerson(contactPerson);
                        contact.setValue(contactDto.value());

                        // Устанавливаем тип контакта
                        if (contactDto.contactTypeUuid() != null) {
                            ContactType contactType = contactTypeRepository.findById(contactDto.contactTypeUuid())
                                    .orElseThrow(() -> new RuntimeException("Тип контакта не найден: " + contactDto.contactTypeUuid()));
                            contact.setContactType(contactType);
                        } else if (!contactDto.typeName().isBlank()) {
                            String contactCode = contactDto.typeName().toUpperCase().replaceAll("\\s+", "_");
                            if (!contactTypeRepository.existsByCode(contactCode)) {
                                ContactType newType = new ContactType();
                                newType.setName(contactDto.typeName());
                                newType.setCode(contactCode);
                                newType = contactTypeRepository.save(newType);
                                contact.setContactType(newType);
                            } else {
                                throw new DuplicateKeyException("Имя типа контакта уже используется в базе: "
                                        + contactDto.typeName());
                            }
                        }
                        contactPerson.getContacts().add(contact);
                    }
                }
                company.getContactPersons().add(contactPerson);
            }
        }
        company = companyRepository.save(company);
        return companyMapper.toCompanyDto(company);
    }

    @Override
    @Transactional
    public CompanyDto update(UUID id, CompanyDtoUpdate companyDtoUpdate) {
        Company existingCompany = companyRepository.findById(id).orElseThrow(()-> new EntityNotFoundException("Нет компании с id: "+ id));
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
            existingCompany.setCompanyType(type);
        }
        companyRepository.save(existingCompany);
        return companyMapper.toCompanyDto(existingCompany);
    }

    @Override
    @Transactional
    public void delete(UUID id) {
        companyRepository.deleteById(id);
    }

    @Override
    public CompanyDtoForUpdate getById(UUID id) {
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Company not found with id: " + id));
        return companyMapper.toCompanyDtoForUpdate(company);
    }

    @Override
    public List<CompanyDto> getAll() {
        return companyRepository.findAll().stream().map(companyMapper::toCompanyDto).toList();
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