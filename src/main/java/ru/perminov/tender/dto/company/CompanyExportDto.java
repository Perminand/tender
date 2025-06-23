package ru.perminov.tender.dto.company;

import ru.perminov.tender.dto.company.contact.ContactPersonDto;

import java.util.List;
import java.util.UUID;

public record CompanyExportDto(
        UUID id,
        String inn,
        String kpp,
        String ogrn,
        String name,
        String legalName,
        String address,
        String typeId,
        String typeName,
        String director,
        String phone,
        String email,
        List<BankAccountDto> bankDetails,
        List<ContactPersonDto> contactPersons
) {
} 