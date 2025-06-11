package ru.perminov.tender.service.company;

import ru.perminov.tender.dto.company.CompanyDtoNew;
import ru.perminov.tender.dto.company.CompanyDtoUpdate;
import ru.perminov.tender.model.company.Company;

import java.util.List;
import java.util.UUID;

public interface CompanyService {

    Company create(CompanyDtoNew companyDtoNew);

    void update(UUID id, CompanyDtoUpdate companyDtoUpdate);

    void delete(UUID id);

    Company getById(UUID id);

    List<Company> getAll();

}
