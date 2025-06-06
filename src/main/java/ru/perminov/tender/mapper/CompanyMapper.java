package ru.perminov.tender.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import ru.perminov.tender.dto.company.CompanyDtoNew;
import ru.perminov.tender.dto.company.CompanyDtoUpdate;
import ru.perminov.tender.model.Company;

@Mapper(componentModel = "spring")
public interface CompanyMapper {
    
    @Mapping(target = "type", ignore = true)
    Company toCompany(CompanyDtoNew dto);

    @Mapping(target = "type", ignore = true)
    void updateCompanyFromDto(CompanyDtoUpdate dto, @MappingTarget Company company);
} 