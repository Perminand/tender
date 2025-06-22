package ru.perminov.tender.mapper.company;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import ru.perminov.tender.dto.company.contact.ContactTypeDto;
import ru.perminov.tender.dto.company.contact.ContactTypeDtoNew;
import ru.perminov.tender.model.company.ContactType;

@Mapper(componentModel = "spring")
public interface ContactTypeMapper {
    ContactTypeDto toContactTypeDto(ContactType contactType);
    
    @Mapping(target = "id", ignore = true)
    ContactType toContactType(ContactTypeDtoNew contactTypeDtoNew);
} 