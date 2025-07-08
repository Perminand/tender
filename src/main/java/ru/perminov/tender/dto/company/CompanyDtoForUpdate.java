package ru.perminov.tender.dto.company;

import ru.perminov.tender.dto.company.contact.ContactPersonDto;
import ru.perminov.tender.dto.companyType.CompanyTypeDto;

import java.util.List;
import java.util.UUID;

public record CompanyDtoForUpdate(
        UUID id,

        String inn,

        String kpp,

        String ogrn,

        String name,

        String legalName,

        String shortName,

        String address,

        CompanyTypeDto companyType,

        String role,

        List<ContactPersonDto> contactPersons,

        String director,

        String phone,

        String email,

        List<BankAccountDto> bankDetails
) {
}
