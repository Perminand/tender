package ru.perminov.tender.mapper.company;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import ru.perminov.tender.dto.company.CompanyDto;
import ru.perminov.tender.dto.company.CompanyDtoForUpdate;
import ru.perminov.tender.dto.company.CompanyDtoNew;
import ru.perminov.tender.dto.company.CompanyDtoUpdate;
import ru.perminov.tender.model.company.Company;

@Mapper(componentModel = "spring", uses = {ContactPersonMapper.class})
public interface CompanyMapper {
    
    @Mapping(target = "companyType", ignore = true)
    @Mapping(target = "contactPersons", ignore = true)
    Company toCompany(CompanyDtoNew dto);

    @Mapping(target = "companyType", ignore = true)
    @Mapping(target = "contactPersons", source = "contactPersons")
    @Mapping(target = "id", ignore = true)
    void updateCompanyFromDto(CompanyDtoUpdate dto, @MappingTarget Company company);

    CompanyDto toCompanyDto(Company company);

    CompanyDtoForUpdate toCompanyDtoForUpdate(Company company);
}