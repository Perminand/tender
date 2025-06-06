package ru.perminov.tender.service;

import ru.perminov.tender.dto.company.CompanyDtoNew;
import ru.perminov.tender.dto.company.CompanyDtoUpdate;
import ru.perminov.tender.model.Company;

import java.util.List;
import java.util.UUID;

public interface CompanyService {
    Company create(CompanyDtoNew companyDtoNew);
    Company update(UUID id, CompanyDtoUpdate companyDtoUpdate);
    void delete(UUID id);
    Company getById(UUID id);
    List<Company> getAll();
} 