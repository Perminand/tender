package ru.perminov.tender.service.company;

import ru.perminov.tender.dto.typecompany.TypeCompanyDtoNew;
import ru.perminov.tender.dto.typecompany.TypeCompanyDtoUpdate;
import ru.perminov.tender.model.company.TypeCompany;

import java.util.List;
import java.util.UUID;

public interface TypeCompanyService {

    TypeCompany create(TypeCompanyDtoNew typeCompanyDtoNew);

    TypeCompany update(UUID id, TypeCompanyDtoUpdate typeCompanyDtoUpdate);

    void delete(UUID id);

    TypeCompany getById(UUID id);

    List<TypeCompany> getAll();

} 