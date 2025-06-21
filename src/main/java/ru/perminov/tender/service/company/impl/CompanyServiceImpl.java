package ru.perminov.tender.service.company.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.perminov.tender.dto.company.CompanyDto;
import ru.perminov.tender.dto.company.CompanyDtoForUpdate;
import ru.perminov.tender.dto.company.CompanyDtoNew;
import ru.perminov.tender.dto.company.CompanyDtoUpdate;
import ru.perminov.tender.mapper.company.CompanyMapper;
import ru.perminov.tender.mapper.company.ContactPersonMapper;
import ru.perminov.tender.model.company.BankDetails;
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
    private final ContactPersonMapper contactPersonMapper;
    private final ContactPersonRepository contactPersonRepository;
    private final ContactRepository contactRepository;

    @Override
    @Transactional
    public CompanyDto create(CompanyDtoNew companyDtoNew) {
        Company company = companyMapper.toCompany(companyDtoNew);

        // Устанавливаем тип компании
        CompanyType companyType = typeCompanyRepository.findById(UUID.fromString(companyDtoNew.typeId()))
                .orElseThrow(() -> new IllegalArgumentException("CompanyType not found with id: " + companyDtoNew.typeId()));
        company.setCompanyType(companyType);

        // Устанавливаем банковские реквизиты
        if (companyDtoNew.bankDetails() != null && !companyDtoNew.bankDetails().isEmpty()) {
            company.setBankDetails(companyMapper.toBankDetailsList(companyDtoNew.bankDetails()));
        }

        // Устанавливаем контактных лиц
        if (companyDtoNew.contactPersons() != null && !companyDtoNew.contactPersons().isEmpty()) {
            // Маппинг контактных лиц должен быть настроен в CompanyMapper
        }

        return companyMapper.toCompanyDto(companyRepository.save(company));
    }

    @Override
    @Transactional
    public CompanyDto update(UUID id, CompanyDtoUpdate companyDtoUpdate) {
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Company not found with id: " + id));

        companyMapper.updateCompanyFromDto(companyDtoUpdate, company);

        if (companyDtoUpdate.bankDetails() != null) {
            company.getBankDetails().clear();
            List<BankDetails> newBankDetails = companyMapper.toBankDetailsList(companyDtoUpdate.bankDetails());
            newBankDetails.forEach(bd -> bd.setCompany(company));
            company.getBankDetails().addAll(newBankDetails);
        }

        if (companyDtoUpdate.contactPersons() != null) {
            company.getContactPersons().clear();
            List<ContactPerson> newContactPersons = contactPersonMapper.toContactPersonList(companyDtoUpdate.contactPersons());
            newContactPersons.forEach(cp -> {
                cp.setCompany(company);
                for (Contact c : cp.getContacts()) {
                    ContactType contactType = contactTypeRepository.findByName(c.getContactType().getName()).orElse(
                                new ContactType(null,c.getContactType().getName())
                    );
                    c.setContactType(contactType);
                    c.setContactPerson(cp);
                }
            });
            company.getContactPersons().addAll(newContactPersons);
        }

        return companyMapper.toCompanyDto(companyRepository.save(company));
    }

    @Override
    @Transactional
    public void delete(UUID id) {
        companyRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public CompanyDtoForUpdate getById(UUID id) {
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Company not found with id: " + id));
        return companyMapper.toCompanyDtoForUpdate(company);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CompanyDto> getAll() {
        return companyRepository.findAll().stream()
                .map(companyMapper::toCompanyDto)
                .toList();
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