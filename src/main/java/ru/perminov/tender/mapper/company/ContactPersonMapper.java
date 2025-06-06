package ru.perminov.tender.mapper.company;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import ru.perminov.tender.dto.company.contact.ContactPersonDtoNew;
import ru.perminov.tender.dto.company.contact.ContactPersonDtoUpdate;
import ru.perminov.tender.model.company.ContactPerson;

@Mapper(componentModel = "spring")
public interface ContactPersonMapper {
    @Mapping(target = "company", ignore = true)
    @Mapping(target = "contacts", ignore = true)
    @Mapping(target = "uuid", ignore = true)
    ContactPerson toContactPerson(ContactPersonDtoNew dto);

    @Mapping(target = "company", ignore = true)
    @Mapping(target = "contacts", ignore = true)
    @Mapping(target = "uuid", ignore = true)
    void updateContactPersonFromDto(ContactPersonDtoUpdate dto, @MappingTarget ContactPerson contactPerson);
} 