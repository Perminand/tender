package ru.perminov.tender.mapper.company;

import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import ru.perminov.tender.dto.typecompany.CompanyTypeDtoNew;
import ru.perminov.tender.dto.typecompany.CompanyTypeDtoUpdate;
import ru.perminov.tender.model.company.CompanyType;

@Mapper(componentModel = "spring")
public interface CompanyTypeMapper {

    CompanyType toCompanyType(CompanyTypeDtoNew dto);

    void updateCompanyTypeFromDto(CompanyTypeDtoUpdate dto, @MappingTarget CompanyType companyType);

} 