package ru.perminov.tender.dto.company.contact;

import ru.perminov.tender.dto.companyType.CompanyTypeDto;

import java.util.UUID;

public record ContactDto(

    UUID id,

    ContactTypeDto contactType,

    String value

) {} 