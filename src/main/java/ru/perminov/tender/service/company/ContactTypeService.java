package ru.perminov.tender.service.company;

import ru.perminov.tender.dto.company.contact.ContactTypeDto;
import ru.perminov.tender.dto.company.contact.ContactTypeDtoNew;

import java.util.List;
import java.util.UUID;

public interface ContactTypeService {
    ContactTypeDto create(ContactTypeDtoNew contactTypeDtoNew);
    void delete(UUID id);
    ContactTypeDto getById(UUID id);
    List<ContactTypeDto> getAll();
} 