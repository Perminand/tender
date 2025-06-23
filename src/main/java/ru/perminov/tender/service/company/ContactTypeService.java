package ru.perminov.tender.service.company;

import ru.perminov.tender.dto.ImportResultDto;
import ru.perminov.tender.dto.company.contact.ContactTypeDto;
import ru.perminov.tender.dto.company.contact.ContactTypeDtoNew;
import ru.perminov.tender.dto.company.contact.ContactTypeDtoUpdate;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

public interface ContactTypeService {
    ContactTypeDto create(ContactTypeDtoNew contactTypeDtoNew);
    ContactTypeDto update(UUID id, ContactTypeDtoUpdate contactTypeDtoUpdate);
    void delete(UUID id);
    ContactTypeDto getById(UUID id);
    List<ContactTypeDto> getAll();
    ImportResultDto importFromExcel(MultipartFile file);
} 