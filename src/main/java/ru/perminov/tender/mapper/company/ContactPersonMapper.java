package ru.perminov.tender.mapper.company;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import ru.perminov.tender.dto.company.contact.ContactPersonDtoNew;
import ru.perminov.tender.dto.company.contact.ContactPersonDtoUpdate;
import ru.perminov.tender.model.company.ContactPerson;

@Mapper(componentModel = "spring", uses = {ContactMapper.class})
public interface ContactPersonMapper {
    
    @Mapping(target = "company", ignore = true)
    @Mapping(target = "contacts", ignore = true)
    @Mapping(target = "uuid", ignore = true)
    @Mapping(target = "lastName", source = "lastName")
    @Mapping(target = "firstName", source = "firstName")
    @Mapping(target = "position", source = "position")
    ContactPerson toContactPerson(ContactPersonDtoNew dto);

    @Mapping(target = "company", ignore = true)
    @Mapping(target = "contacts", ignore = true)
    @Mapping(target = "uuid", ignore = true)
    @Mapping(target = "lastName", source = "lastName")
    @Mapping(target = "firstName", source = "firstName")
    @Mapping(target = "position", source = "position")
    void updateContactPersonFromDto(ContactPersonDtoUpdate dto, @MappingTarget ContactPerson contactPerson);
} 