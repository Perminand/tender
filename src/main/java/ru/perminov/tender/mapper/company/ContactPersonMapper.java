package ru.perminov.tender.mapper.company;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import ru.perminov.tender.dto.company.contact.ContactPersonDtoNew;
import ru.perminov.tender.dto.company.contact.ContactPersonDtoUpdate;
import ru.perminov.tender.model.company.Company;
import ru.perminov.tender.model.company.ContactPerson;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ContactPersonMapper {
    
    @Mapping(target = "contacts", ignore = true)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "lastName", source = "lastName")
    @Mapping(target = "firstName", source = "firstName")
    @Mapping(target = "position", source = "position")
    ContactPerson toContactPerson(ContactPersonDtoNew dto);

    @Mapping(target = "company", ignore = true)
    @Mapping(target = "contacts", ignore = true)
    ContactPerson toContactPerson(ContactPersonDtoUpdate dto);

    @Mapping(target = "contacts", ignore = true)
    List<ContactPerson> toContactPersonList(List<ContactPersonDtoUpdate> dtos);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "company", ignore = true)
    @Mapping(target = "contacts", ignore = true)
    void updateContactPersonFromDto(ContactPersonDtoUpdate dto, @MappingTarget ContactPerson contactPerson);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "company", ignore = true)
    @Mapping(target = "lastName", source = "contactPersonDto.lastName")
    @Mapping(target = "firstName", source = "contactPersonDto.firstName")
    @Mapping(target = "position", source = "contactPersonDto.position")
    @Mapping(target = "contacts", ignore = true)
    ContactPerson newContactPersonFromDto(Company company, ContactPersonDtoNew contactPersonDto);
}