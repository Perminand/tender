package ru.perminov.tender.mapper.company;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import ru.perminov.tender.dto.company.contact.ContactDtoNew;
import ru.perminov.tender.dto.company.contact.ContactDtoUpdate;
import ru.perminov.tender.model.company.Contact;

@Mapper(componentModel = "spring")
public interface ContactMapper {
    @Mapping(target = "contactType", ignore = true)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "value", source = "value")
    Contact toContact(ContactDtoNew dto);

    @Mapping(target = "contactType", ignore = true)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "value", source = "value")
    void updateContactFromDto(ContactDtoUpdate dto, @MappingTarget Contact contact);
} 