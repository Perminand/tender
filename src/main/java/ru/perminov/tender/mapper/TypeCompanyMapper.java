package ru.perminov.tender.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import ru.perminov.tender.dto.typecompany.TypeCompanyDtoNew;
import ru.perminov.tender.dto.typecompany.TypeCompanyDtoUpdate;
import ru.perminov.tender.model.TypeCompany;

@Mapper(componentModel = "spring")
public interface TypeCompanyMapper {

    TypeCompany toTypeCompany(TypeCompanyDtoNew dto);

    void updateTypeCompanyFromDto(TypeCompanyDtoUpdate dto, @MappingTarget TypeCompany typeCompany);

} 