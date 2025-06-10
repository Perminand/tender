package ru.perminov.tender.service.company;

import ru.perminov.tender.dto.typecompany.CompanyTypeDtoNew;
import ru.perminov.tender.dto.typecompany.CompanyTypeDtoUpdate;
import ru.perminov.tender.model.company.CompanyType;

import java.util.List;
import java.util.UUID;

public interface CompanyTypeService {

    CompanyType create(CompanyTypeDtoNew companyTypeDtoNew);

    CompanyType update(UUID id, CompanyTypeDtoUpdate companyTypeDtoUpdate);

    void delete(UUID id);

    CompanyType getById(UUID id);

    List<CompanyType> getAll();

} 