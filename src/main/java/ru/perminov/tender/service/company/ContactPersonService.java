package ru.perminov.tender.service.company;

import ru.perminov.tender.dto.company.contact.ContactPersonDtoNew;
import ru.perminov.tender.dto.company.contact.ContactPersonDtoUpdate;
import ru.perminov.tender.model.company.ContactPerson;

import java.util.List;
import java.util.UUID;

public interface ContactPersonService {

    ContactPerson create(ContactPersonDtoNew contactPersonDtoNew);

    ContactPerson update(UUID id, ContactPersonDtoUpdate contactPersonDtoUpdate);

    void delete(UUID id);

    List<ContactPerson> getAll();

    List<ContactPerson> getByCompanyUuid(UUID companyUuid);

    ContactPerson findByUuid(UUID uuid);

} 