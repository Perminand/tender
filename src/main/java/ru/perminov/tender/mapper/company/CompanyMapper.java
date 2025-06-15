package ru.perminov.tender.mapper.company;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import ru.perminov.tender.dto.company.CompanyDtoNew;
import ru.perminov.tender.dto.company.CompanyDtoUpdate;
import ru.perminov.tender.model.company.Company;

@Mapper(componentModel = "spring", uses = {ContactPersonMapper.class})
public interface CompanyMapper {
    
    @Mapping(target = "type", ignore = true)
    @Mapping(target = "contactPersons", ignore = true)
    Company toCompany(CompanyDtoNew dto);

    @Mapping(target = "type", ignore = true)
    @Mapping(target = "contactPersons", source = "contactPersons")
    @Mapping(target = "uuid", ignore = true)
    void updateCompanyFromDto(CompanyDtoUpdate dto, @MappingTarget Company company);

    @Mapping(target = "typeId", source = "type.uuid")
    @Mapping(target = "uuid", source = "uuid")
    CompanyDtoUpdate toCompanyDtoUpdate(Company company);
} 