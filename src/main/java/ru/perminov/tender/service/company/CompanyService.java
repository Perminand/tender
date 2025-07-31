package ru.perminov.tender.service.company;

import ru.perminov.tender.dto.company.CompanyDto;
import ru.perminov.tender.dto.company.CompanyDtoForUpdate;
import ru.perminov.tender.dto.company.CompanyDtoNew;
import ru.perminov.tender.dto.company.CompanyDtoUpdate;
import ru.perminov.tender.dto.CompanyRelatedEntitiesDto;
import ru.perminov.tender.service.company.impl.CompanyServiceImpl.ImportResult;

import java.util.List;
import java.util.UUID;

public interface CompanyService {

    CompanyDto create(CompanyDtoNew companyDtoNew);

    CompanyDto update(UUID id, CompanyDtoUpdate companyDtoUpdate);

    void delete(UUID id);

    CompanyDtoForUpdate getById(UUID id);

    List<CompanyDto> getAll(String role);

    CompanyDto getByShortName(String shortName);

    ImportResult importFromExcel(org.springframework.web.multipart.MultipartFile file);
    
    CompanyRelatedEntitiesDto getRelatedEntities(UUID companyId);
}
