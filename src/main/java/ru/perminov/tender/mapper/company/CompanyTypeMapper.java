package ru.perminov.tender.mapper.company;

import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import ru.perminov.tender.dto.companyType.CompanyTypeDto;
import ru.perminov.tender.dto.companyType.CompanyTypeDtoNew;
import ru.perminov.tender.dto.companyType.CompanyTypeDtoUpdate;
import ru.perminov.tender.model.company.CompanyType;

@Mapper(componentModel = "spring")
public interface CompanyTypeMapper {

    CompanyType toCompanyType(CompanyTypeDtoNew dto);

    CompanyTypeDto toCompanyTypeDto(CompanyType companyType);

    void updateCompanyTypeFromDto(CompanyTypeDtoUpdate dto, @MappingTarget CompanyType companyType);

} 